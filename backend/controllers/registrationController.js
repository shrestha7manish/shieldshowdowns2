const Registration = require('../models/Registration');
const Counter = require('../models/Counter');
const Setting = require('../models/Setting');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Helper to get formatted registration ID (TSS-0001, TSS-0002, etc.)
const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seqNum = sequenceDocument.seq;
  return `TSS-${String(seqNum).padStart(4, '0')}`;
};

// Create a new registration
// Helper to delete a file from Cloudinary based on its URL
const deleteCloudinaryFile = async (imageUrl) => {
  try {
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      const parts = imageUrl.split('/');
      const lastPart = parts.pop();
      const folderPart = parts.pop(); // e.g. "shield_showdown_proofs"
      const publicIdWithExtension = `${folderPart}/${lastPart}`;
      const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

exports.createRegistration = async (req, res) => {
  const cleanUploadedFiles = async (files) => {
    if (files) {
      let fileList = [];
      if (Array.isArray(files)) {
        fileList = files;
      } else {
        const allFileArrays = [files.tiktokProofs, files.youtubeProofs, files.instagramProofs].filter(Boolean);
        fileList = allFileArrays.flat();
      }
      for (const f of fileList) {
        if (f && f.path) {
          if (f.path.includes('cloudinary.com')) {
            await deleteCloudinaryFile(f.path);
          } else {
            fs.unlink(f.path, () => {});
          }
        }
      }
    }
  };

  try {
    // Check if registration is explicitly closed or deadline has passed
    const timerSetting = await Setting.findOne({ key: 'timer' });
    if (timerSetting && timerSetting.value) {
      if (timerSetting.value.isClosed) {
        await cleanUploadedFiles(req.files);
        return res.status(400).json({ message: 'Registration is currently closed by the administrator.' });
      }
      if (timerSetting.value.isEnabled) {
        const deadline = new Date(timerSetting.value.targetDate);
        if (deadline < new Date()) {
          await cleanUploadedFiles(req.files);
          return res.status(400).json({ message: 'Registration has closed as the deadline has passed.' });
        }
      }
    }

    // Normalize uploaded files whether coming from upload.any() or upload.fields()
    let tiktokProofs = [];
    let instagramProofs = [];
    let youtubeProofs = [];

    if (Array.isArray(req.files)) {
      tiktokProofs = req.files.filter(f => f.fieldname && f.fieldname.toLowerCase().includes('tiktok'));
      instagramProofs = req.files.filter(f => f.fieldname && (f.fieldname.toLowerCase().includes('instagram') || f.fieldname.toLowerCase().includes('ig')));
      youtubeProofs = req.files.filter(f => f.fieldname && f.fieldname.toLowerCase().includes('youtube'));
      
      // Fallback: If field names don't match keywords but files exist, split into two equal batches
      if (tiktokProofs.length === 0 && instagramProofs.length === 0 && req.files.length >= 2) {
        const half = Math.floor(req.files.length / 2);
        tiktokProofs = req.files.slice(0, half);
        instagramProofs = req.files.slice(half);
      }
    } else if (req.files) {
      tiktokProofs = req.files.tiktokProofs || req.files.tiktokProof || req.files.tiktok || [];
      instagramProofs = req.files.instagramProofs || req.files.instagramProof || req.files.instagram || req.files.igProofs || req.files.igProof || [];
      youtubeProofs = req.files.youtubeProofs || req.files.youtubeProof || req.files.youtube || [];
    }

    // Determine primary video platform proof array (tiktokProofs or youtubeProofs)
    const primaryVideoProofs = tiktokProofs.length > 0 ? tiktokProofs : youtubeProofs;

    // If files are missing, clean up any uploaded files and return error
    if (!req.files || primaryVideoProofs.length === 0 || instagramProofs.length === 0) {
      await cleanUploadedFiles(req.files);
      return res.status(400).json({ message: 'Both TikTok and Instagram follow screenshots are required.' });
    }

    const { teamName, teamLeaderName, email, discordUsername, players } = req.body;

    // Parse players
    let parsedPlayers = [];
    try {
      parsedPlayers = typeof players === 'string' ? JSON.parse(players) : players;
    } catch (e) {
      await cleanUploadedFiles(req.files);
      return res.status(400).json({ message: 'Invalid players data format. Must be JSON array.' });
    }

    if (!Array.isArray(parsedPlayers) || parsedPlayers.length < 4 || parsedPlayers.length > 5) {
      await cleanUploadedFiles(req.files);
      return res.status(400).json({ message: 'Between 4 and 5 players are required.' });
    }

    // Handle optional Player 5
    if (parsedPlayers.length === 5) {
      const p5 = parsedPlayers[4];
      const isP5Empty = !p5.playerName && !p5.playerUID && !p5.role;
      if (isP5Empty) {
        parsedPlayers = parsedPlayers.slice(0, 4);
      } else {
        // If partially filled, validate it
        if (!p5.playerName || !p5.playerUID || !p5.role) {
          await cleanUploadedFiles(req.files);
          return res.status(400).json({ message: 'Player 5 is incomplete. Please fill all fields (Name, UID, and Role) or leave them completely blank.' });
        }
      }
    }

    // Validate required players (1 to 4) and verify numeric playerUID
    for (let i = 0; i < parsedPlayers.length; i++) {
      const p = parsedPlayers[i];
      if (!p.playerName || !p.playerUID || !p.role) {
        await cleanUploadedFiles(req.files);
        return res.status(400).json({ message: `Player ${i + 1} is missing required fields (Name, UID, and Role).` });
      }
      if (!/^[0-9]+$/.test(p.playerUID)) {
        await cleanUploadedFiles(req.files);
        return res.status(400).json({ message: `Player ${i + 1} ID (UID) must contain numbers only.` });
      }
    }

    // Validate required proof count: requires 3 screenshots each (accepts >= 2 up to 5)
    if (primaryVideoProofs.length < 2 || instagramProofs.length < 2) {
      await cleanUploadedFiles(req.files);
      return res.status(400).json({
        message: 'Upload mismatch: You must upload 3 TikTok follow screenshots and 3 Instagram follow screenshots.'
      });
    }

    // Auto-generate sequential ID
    const registrationId = await getNextSequenceValue('registrationId');

    const videoProofPaths = primaryVideoProofs.map(f => f.path);
    const igProofPaths = instagramProofs.map(f => f.path);

    const registration = new Registration({
      registrationId,
      teamName,
      teamLeaderName,
      email,
      discordUsername,
      players: parsedPlayers,
      tiktokProofs: videoProofPaths,
      youtubeProofs: videoProofPaths,
      instagramProofs: igProofPaths
    });

    const saved = await registration.save();
    res.status(201).json({
      success: true,
      message: 'Registration Submitted Successfully',
      registrationId: saved.registrationId,
      data: saved
    });
  } catch (error) {
    await cleanUploadedFiles(req.files);
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error occurred during registration.' });
  }
};

// Get all registrations with optional search
exports.getRegistrations = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { registrationId: searchRegex },
          { teamName: searchRegex },
          { teamLeaderName: searchRegex },
          { email: searchRegex },
          { 'players.playerName': searchRegex },
          { 'players.playerUID': searchRegex }
        ]
      };
    }

    const registrations = await Registration.find(query).sort({ submittedAt: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error retrieving registrations.' });
  }
};

// Get registration statistics
exports.getStats = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    
    // Start of today in server local time
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const registrationsToday = await Registration.countDocuments({
      submittedAt: { $gte: startOfToday }
    });

    // Find count of unique team names (case-insensitive group check or simple distinct group)
    const uniqueTeamsResult = await Registration.aggregate([
      { $group: { _id: { $toLower: '$teamName' } } },
      { $count: 'count' }
    ]);
    const totalTeams = uniqueTeamsResult.length > 0 ? uniqueTeamsResult[0].count : 0;

    res.status(200).json({
      totalRegistrations,
      registrationsToday,
      totalTeams
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error generating statistics.' });
  }
};

// Get single registration by MongoDB ID or custom ID
exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    let registration;

    // Check if ID matches MongoDB ObjectId type
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      registration = await Registration.findById(id);
    } else {
      registration = await Registration.findOne({ registrationId: id });
    }

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.status(200).json(registration);
  } catch (error) {
    console.error('Fetch by ID error:', error);
    res.status(500).json({ message: 'Error retrieving registration details.' });
  }
};

// Delete registration (and clean files from server storage)
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Delete static screenshot files if they exist
    const uploadsDir = path.join(__dirname, '../uploads');
    
    const videoProofs = registration.tiktokProofs || registration.youtubeProofs;
    if (Array.isArray(videoProofs)) {
      for (const proof of videoProofs) {
        if (proof.includes('cloudinary.com')) {
          await deleteCloudinaryFile(proof);
        } else {
          const filePath = path.join(uploadsDir, proof);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting video screenshot file:', err);
            });
          }
        }
      }
    }

    if (Array.isArray(registration.instagramProofs)) {
      for (const proof of registration.instagramProofs) {
        if (proof.includes('cloudinary.com')) {
          await deleteCloudinaryFile(proof);
        } else {
          const filePath = path.join(uploadsDir, proof);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting instagram screenshot file:', err);
            });
          }
        }
      }
    }

    await Registration.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Registration and file proofs deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting registration.' });
  }
};
