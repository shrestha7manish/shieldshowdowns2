const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const registrationController = require('../controllers/registrationController');

// Multer middleware wrapper that catches errors and guarantees no unhandled multer exception
const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || (err.message && err.message.includes('Unexpected field'))) {
        return res.status(400).json({ 
          message: 'Upload field mismatch. Please ensure you are uploading valid JPG or PNG screenshots for TikTok and Instagram proofs.' 
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum file size allowed is 5MB per screenshot.' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed.' });
    }
    next();
  });
};

router.post('/', handleUpload, registrationController.createRegistration);
router.get('/', registrationController.getRegistrations);
router.get('/stats', registrationController.getStats);
router.get('/:id', registrationController.getRegistrationById);
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;

