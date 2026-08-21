import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { 
  Shield, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  XCircle,
  Users, 
  Award, 
  Camera, 
  User, 
  Check, 
  RefreshCw, 
  Trophy, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Clock,
  ChevronRight,
  ArrowRight,
  X,
  Info,
  ShieldAlert
} from 'lucide-react';
import SponsorsSection from '../components/SponsorsSection';
import Season1WinnerBanner from '../components/Season1WinnerBanner';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [submitElapsedSec, setSubmitElapsedSec] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Timer Configuration and Countdown State
  const [timerConfig, setTimerConfig] = useState({ isEnabled: false, targetDate: null, title: 'Registration Closes In' });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  // Track submission elapsed time (seconds)
  useEffect(() => {
    let timer;
    if (loading) {
      setSubmitElapsedSec(0);
      timer = setInterval(() => {
        setSubmitElapsedSec(prev => prev + 1);
      }, 1000);
    } else {
      setSubmitElapsedSec(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  // Invited Teams State
  const [invitedTeams, setInvitedTeams] = useState([]);

  useEffect(() => {
    const fetchTimerConfig = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_BASE_URL}/settings/timer`);
        if (response.data && response.data.value) {
          setTimerConfig(response.data.value);
        }
      } catch (error) {
        console.error('Error fetching timer configuration:', error);
      }
    };
    const fetchInvitedTeams = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_BASE_URL}/settings/invited_teams`);
        if (response.data && response.data.value) {
          setInvitedTeams(response.data.value);
        }
      } catch (error) {
        console.error('Error fetching invited teams:', error);
      }
    };
    fetchTimerConfig();
    fetchInvitedTeams();
  }, []);

  useEffect(() => {
    if (!timerConfig.isEnabled || !timerConfig.targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(timerConfig.targetDate) - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      let expired = false;

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        expired = true;
      }

      setTimeLeft(newTimeLeft);
      setIsExpired(expired);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [timerConfig]);

  // File uploads & previews state arrays (pre-allocated to size 5 for dynamic player slots)
  const [tiktokFiles, setTiktokFiles] = useState([null, null, null, null, null]);
  const [tiktokPreviews, setTiktokPreviews] = useState([null, null, null, null, null]);
  const [igFiles, setIgFiles] = useState([null, null, null, null, null]);
  const [igPreviews, setIgPreviews] = useState([null, null, null, null, null]);

  const [showUploadErrors, setShowUploadErrors] = useState(false);

  // React Hook Form
  const getSavedValues = () => {
    try {
      const saved = localStorage.getItem('shield_showdown_reg_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    return {
      teamName: '',
      teamLeaderName: '',
      email: '',
      players: [
        { playerName: '', playerUID: '', role: '' },
        { playerName: '', playerUID: '', role: '' },
        { playerName: '', playerUID: '', role: '' },
        { playerName: '', playerUID: '', role: '' },
        { playerName: '', playerUID: '', role: '' }
      ],
      termsAccepted: false
    };
  };

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: getSavedValues()
  });

  // Dynamically watch 5th player inputs to determine required count
  const watchP5Name = watch('players.4.playerName');
  const watchP5Uid = watch('players.4.playerUID');
  const watchP5Role = watch('players.4.role');

  const isP5Active = !!((watchP5Name && watchP5Name.trim() !== '') ||
    (watchP5Uid && watchP5Uid.trim() !== ''));

  const requiredCount = isP5Active ? 5 : 4;
  const proofRequiredCount = 3;
  const watchTerms = watch('termsAccepted');

  const formValues = watch();

  // Persist form data on reload
  useEffect(() => {
    if (formValues) {
      localStorage.setItem('shield_showdown_reg_data', JSON.stringify(formValues));
    }
  }, [formValues]);

  // Clean 5th player upload slot files if player 5 details are cleared
  useEffect(() => {
    if (!isP5Active) {
      setTiktokFiles(prev => {
        const next = [...prev];
        next[4] = null;
        return next;
      });
      setTiktokPreviews(prev => {
        const next = [...prev];
        next[4] = null;
        return next;
      });
      setIgFiles(prev => {
        const next = [...prev];
        next[4] = null;
        return next;
      });
      setIgPreviews(prev => {
        const next = [...prev];
        next[4] = null;
        return next;
      });
    }
  }, [isP5Active]);

  const handleSlotFileChange = (e, idx, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Only JPEG, JPG, and PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size cannot exceed 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'tiktok' || type === 'youtube') {
        setTiktokFiles(prev => {
          const next = [...prev];
          next[idx] = file;
          return next;
        });
        setTiktokPreviews(prev => {
          const next = [...prev];
          next[idx] = reader.result;
          return next;
        });
      } else {
        setIgFiles(prev => {
          const next = [...prev];
          next[idx] = file;
          return next;
        });
        setIgPreviews(prev => {
          const next = [...prev];
          next[idx] = reader.result;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeSlotFile = (idx, type) => {
    if (type === 'tiktok' || type === 'youtube') {
      setTiktokFiles(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      setTiktokPreviews(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
    } else {
      setIgFiles(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      setIgPreviews(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
    }
  };

  const [formAttempted, setFormAttempted] = useState(false);
  const [serverError, setServerError] = useState(null);

  const formFieldOrder = [
    'teamName',
    'teamLeaderName',
    'email',
    ...[0, 1, 2, 3, 4].flatMap(idx => [
      `players.${idx}.playerName`,
      `players.${idx}.playerUID`,
      `players.${idx}.role`
    ]),
    'termsAccepted'
  ];

  const getNestedError = (formErrors, path) => {
    const parts = path.split('.');
    let current = formErrors;
    for (const part of parts) {
      if (!current) return undefined;
      current = current[part];
    }
    return current;
  };

  const focusAndHighlightElement = (targetId, focusName) => {
    let el = null;
    if (targetId) {
      el = document.getElementById(targetId);
    }
    if (!el && focusName) {
      el = document.querySelector(`[name="${focusName}"]`);
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('error-highlight-pulse');
      // Trigger reflow to restart animation if already applied
      void el.offsetWidth;
      el.classList.add('error-highlight-pulse');
      setTimeout(() => {
        el.classList.remove('error-highlight-pulse');
      }, 3800);

      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'BUTTON') {
        try {
          el.focus({ preventScroll: true });
        } catch (e) {}
      } else {
        const innerInput = el.querySelector('input, select, button');
        if (innerInput) {
          try {
            innerInput.focus({ preventScroll: true });
          } catch (e) {}
        }
      }
    }
  };

  // Compile detailed, structured list of all active errors
  const getActiveErrorsList = (formErrors) => {
    const list = [];

    // 1. Team Info
    if (formErrors.teamName) {
      list.push({
        id: 'teamName',
        section: 'Team Info',
        field: 'Team Name',
        message: formErrors.teamName.message || 'Team Name is required',
        targetId: 'input-teamName',
        focusName: 'teamName'
      });
    }
    if (formErrors.teamLeaderName) {
      list.push({
        id: 'teamLeaderName',
        section: 'Team Info',
        field: 'Captain Name',
        message: formErrors.teamLeaderName.message || 'Team Captain / Leader Name is required',
        targetId: 'input-teamLeaderName',
        focusName: 'teamLeaderName'
      });
    }
    if (formErrors.email) {
      list.push({
        id: 'email',
        section: 'Team Info',
        field: 'Email',
        message: formErrors.email.message || 'Valid Contact Email is required',
        targetId: 'input-email',
        focusName: 'email'
      });
    }

    // 2. Squad Roster (Starters 1 to 4)
    for (let i = 0; i < 4; i++) {
      const playerErrors = formErrors.players?.[i];
      const roleLabel = i === 0 ? 'Captain' : `Starter`;
      if (playerErrors?.playerName) {
        list.push({
          id: `players.${i}.playerName`,
          section: `Player ${i + 1} (${roleLabel})`,
          field: `Player ${i + 1} IGN`,
          message: 'In-Game Name (IGN) is required',
          targetId: `input-player-${i}-name`,
          focusName: `players.${i}.playerName`
        });
      }
      if (playerErrors?.playerUID) {
        list.push({
          id: `players.${i}.playerUID`,
          section: `Player ${i + 1} (${roleLabel})`,
          field: `Player ${i + 1} UID`,
          message: playerErrors.playerUID.message || 'Free Fire UID is required (Numbers only)',
          targetId: `input-player-${i}-uid`,
          focusName: `players.${i}.playerUID`
        });
      }
      if (playerErrors?.role) {
        list.push({
          id: `players.${i}.role`,
          section: `Player ${i + 1} (${roleLabel})`,
          field: `Player ${i + 1} Role`,
          message: 'Player Role must be selected',
          targetId: `input-player-${i}-role`,
          focusName: `players.${i}.role`
        });
      }
    }

    // 3. Player 5 (Substitute)
    if (isP5Active) {
      const p5Errors = formErrors.players?.[4];
      if (p5Errors?.playerName) {
        list.push({
          id: 'players.4.playerName',
          section: 'Player 5 (Substitute)',
          field: 'Substitute IGN',
          message: 'Substitute IGN is required when substitute details are entered',
          targetId: 'input-player-4-name',
          focusName: 'players.4.playerName'
        });
      }
      if (p5Errors?.playerUID) {
        list.push({
          id: 'players.4.playerUID',
          section: 'Player 5 (Substitute)',
          field: 'Substitute UID',
          message: p5Errors.playerUID.message || 'Substitute UID must contain numbers only',
          targetId: 'input-player-4-uid',
          focusName: 'players.4.playerUID'
        });
      }
      if (p5Errors?.role) {
        list.push({
          id: 'players.4.role',
          section: 'Player 5 (Substitute)',
          field: 'Substitute Role',
          message: 'Substitute Role must be selected',
          targetId: 'input-player-4-role',
          focusName: 'players.4.role'
        });
      }
    }

    // 4. Social Proofs Uploads (Checked if showUploadErrors is true)
    if (showUploadErrors) {
      for (let i = 0; i < proofRequiredCount; i++) {
        const playerName = watch(`players.${i}.playerName`) || `Player ${i + 1}`;
        if (!tiktokFiles[i]) {
          list.push({
            id: `tiktok-${i}`,
            section: 'TikTok Verification',
            field: `P${i + 1} TikTok Proof`,
            message: `Missing TikTok follow screenshot for ${playerName} (Player ${i + 1})`,
            targetId: `tiktok-file-container-${i}`
          });
        }
        if (!igFiles[i]) {
          list.push({
            id: `ig-${i}`,
            section: 'Instagram Verification',
            field: `P${i + 1} Instagram Proof`,
            message: `Missing Instagram follow screenshot for ${playerName} (Player ${i + 1})`,
            targetId: `ig-file-container-${i}`
          });
        }
      }
    }

    // 5. Terms
    if (formErrors.termsAccepted) {
      list.push({
        id: 'termsAccepted',
        section: 'Tournament Agreement',
        field: 'Terms & Agreement',
        message: 'You must confirm and accept the tournament rules & terms',
        targetId: 'terms-container',
        focusName: 'termsAccepted'
      });
    }

    return list;
  };

  const activeErrorsList = getActiveErrorsList(errors);

  const parseBackendError = (err) => {
    const backendMsg = err.response?.data?.message || err.message || '';
    const status = err.response?.status;
    const isNetwork = err.code === 'ERR_NETWORK' || err.message === 'Network Error';

    if (isNetwork) {
      return {
        status: null,
        title: 'Network Connection Failed',
        reason: 'The browser cannot reach the tournament API server. This usually happens if your internet connection dropped or the server is temporarily offline.',
        solution: 'Check your internet connection, verify the backend server is running, and click "Try Again".',
        raw: err.message
      };
    }

    // 1. Multer / Upload field errors
    if (backendMsg.includes('Unexpected field') || backendMsg.includes('LIMIT_UNEXPECTED_FILE')) {
      return {
        status: 400,
        title: 'Screenshot Upload Error (Field Mismatch)',
        reason: 'The backend upload handler rejected the submitted image fields (Unexpected field). This occurs if the server expected different field names or if the server process needs to be restarted with the latest update.',
        solution: 'Re-select your 3 TikTok and 3 Instagram follow screenshots (PNG/JPG only), ensure all files are under 5MB, and restart the backend server if running locally.',
        raw: backendMsg
      };
    }

    // 2. File size errors
    if (backendMsg.includes('LIMIT_FILE_SIZE') || backendMsg.toLowerCase().includes('too large') || backendMsg.toLowerCase().includes('file size')) {
      return {
        status: 400,
        title: 'File Size Exceeded (Max 5MB)',
        reason: 'One or more of your follow screenshot images exceeds the maximum allowable file size limit of 5MB.',
        solution: 'Please compress your screenshots or select smaller JPG/PNG images and click "Try Again".',
        raw: backendMsg
      };
    }

    // 3. Duplicate entries
    if (backendMsg.toLowerCase().includes('duplicate') || backendMsg.includes('E11000') || backendMsg.toLowerCase().includes('already registered') || backendMsg.toLowerCase().includes('already exists')) {
      return {
        status: 400,
        title: 'Duplicate Team / Contact Detected',
        reason: 'A squad with this Team Name or Contact Email has already been registered for Season 2.',
        solution: 'Please choose a unique team name or reach out in Discord support if you need your team roster updated.',
        raw: backendMsg
      };
    }

    // 4. Registration closed / deadline
    if (backendMsg.toLowerCase().includes('closed') || backendMsg.toLowerCase().includes('deadline')) {
      return {
        status: 400,
        title: 'Registration Window Closed',
        reason: 'Tournament sign-ups are currently closed by tournament administrators.',
        solution: 'Join our official Discord server for upcoming tournament bracket releases and Season 3 announcements.',
        raw: backendMsg
      };
    }

    // 5. Verification proofs count mismatch
    if (backendMsg.toLowerCase().includes('mismatch') || backendMsg.toLowerCase().includes('screenshot') || backendMsg.toLowerCase().includes('proof')) {
      return {
        status: 400,
        title: 'Verification Proofs Incomplete',
        reason: backendMsg,
        solution: 'Ensure you have uploaded exactly 3 TikTok screenshots and 3 Instagram screenshots (for Player 1, Player 2, and Player 3).',
        raw: backendMsg
      };
    }

    // 6. Player data incomplete
    if (backendMsg.toLowerCase().includes('player')) {
      return {
        status: 400,
        title: 'Squad Roster Validation Failed',
        reason: backendMsg,
        solution: 'Check that all starter players have valid In-Game Names (IGN), numeric Free Fire UIDs, and selected roles.',
        raw: backendMsg
      };
    }

    // 7. Internal server error 500
    if (status === 500) {
      return {
        status: 500,
        title: 'Internal Server Error',
        reason: backendMsg || 'A server-side processing error occurred while saving your squad registration to the database.',
        solution: 'Please wait a moment and click "Try Again". If this continues, notify tournament admins on Discord.',
        raw: backendMsg
      };
    }

    // Default general fallback
    return {
      status: status || 400,
      title: status === 400 ? 'Registration Validation Rejection' : 'Submission Error',
      reason: backendMsg || 'The server could not process the registration request.',
      solution: 'Please review all form fields, ensure your screenshots are uploaded, and try submitting again.',
      raw: backendMsg
    };
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    setServerError(null);
    setFormAttempted(true);

    const activeTiktokFiles = tiktokFiles.slice(0, proofRequiredCount);
    const activeIgFiles = igFiles.slice(0, proofRequiredCount);

    const firstMissingTiktokIdx = activeTiktokFiles.findIndex(f => !f);
    const firstMissingIgIdx = activeIgFiles.findIndex(f => !f);

    if (firstMissingTiktokIdx !== -1 || firstMissingIgIdx !== -1) {
      setShowUploadErrors(true);
      setErrorMsg(`Missing screenshot verification proofs. Please upload follow proofs for Player 1, Player 2, and Player 3.`);

      let targetContainerId = null;
      if (firstMissingTiktokIdx !== -1) {
        targetContainerId = `tiktok-file-container-${firstMissingTiktokIdx}`;
      } else if (firstMissingIgIdx !== -1) {
        targetContainerId = `ig-file-container-${firstMissingIgIdx}`;
      }

      if (targetContainerId) {
        focusAndHighlightElement(targetContainerId);
      }
      return;
    }

    setLoading(true);

    try {
      // Clean players array: only include first 4 always, add 5th only if fully filled
      let cleanPlayers = data.players.slice(0, 4);
      const p5 = data.players[4];
      if (p5 && p5.playerName?.trim() && p5.playerUID?.trim() && p5.role) {
        cleanPlayers.push(p5);
      }

      const formData = new FormData();
      formData.append('teamName', data.teamName);
      formData.append('teamLeaderName', data.teamLeaderName);
      formData.append('email', data.email);
      formData.append('players', JSON.stringify(cleanPlayers));

      // Append arrays of files to the correct fields
      activeTiktokFiles.forEach(file => {
        formData.append('tiktokProofs', file);
      });
      activeIgFiles.forEach(file => {
        formData.append('instagramProofs', file);
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_BASE_URL}/registrations`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessData({
          registrationId: response.data.registrationId,
          teamName: response.data.data.teamName
        });
        localStorage.removeItem('shield_showdown_reg_data');
        reset({
          teamName: '',
          teamLeaderName: '',
          email: '',
          players: [
            { playerName: '', playerUID: '', role: '' },
            { playerName: '', playerUID: '', role: '' },
            { playerName: '', playerUID: '', role: '' },
            { playerName: '', playerUID: '', role: '' },
            { playerName: '', playerUID: '', role: '' }
          ],
          termsAccepted: false
        });
        setTiktokFiles([null, null, null, null, null]);
        setTiktokPreviews([null, null, null, null, null]);
        setIgFiles([null, null, null, null, null]);
        setIgPreviews([null, null, null, null, null]);
        setShowUploadErrors(false);
        setFormAttempted(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const parsed = parseBackendError(err);
      
      setServerError(parsed);
      setErrorMsg(parsed.reason);
      
      // Smoothly scroll up to the server error card
      const errBanner = document.getElementById('server-error-banner') || document.getElementById('form-error-summary');
      if (errBanner) {
        errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  const onInvalidSubmit = (formErrors) => {
    console.error("Form Validation Errors:", formErrors);
    setFormAttempted(true);
    setServerError(null);

    // Also check uploads
    const activeTiktokFiles = tiktokFiles.slice(0, proofRequiredCount);
    const activeIgFiles = igFiles.slice(0, proofRequiredCount);
    const hasMissingUploads = activeTiktokFiles.some(f => !f) || activeIgFiles.some(f => !f);

    if (hasMissingUploads) {
      setShowUploadErrors(true);
    }

    const currentErrors = getActiveErrorsList(formErrors);
    const errorCount = currentErrors.length;

    setErrorMsg(`Please resolve ${errorCount} highlighted issue${errorCount > 1 ? 's' : ''} in the form before submitting.`);

    // Scroll to the first problematic field
    for (const path of formFieldOrder) {
      if (getNestedError(formErrors, path)) {
        if (path === 'termsAccepted') {
          focusAndHighlightElement('terms-container', 'termsAccepted');
          return;
        }
        focusAndHighlightElement(null, path);
        return;
      }
    }

    // If no form input error but upload error exists
    if (hasMissingUploads) {
      const firstMissingTiktokIdx = activeTiktokFiles.findIndex(f => !f);
      const firstMissingIgIdx = activeIgFiles.findIndex(f => !f);
      if (firstMissingTiktokIdx !== -1) {
        focusAndHighlightElement(`tiktok-file-container-${firstMissingTiktokIdx}`);
      } else if (firstMissingIgIdx !== -1) {
        focusAndHighlightElement(`ig-file-container-${firstMissingIgIdx}`);
      }
    }
  };

  const isFormDisabled = timerConfig.isClosed || (timerConfig.isEnabled && isExpired);

  // Submit button active state rule
  const activeTiktokFiles = tiktokFiles.slice(0, proofRequiredCount);
  const activeIgFiles = igFiles.slice(0, proofRequiredCount);
  const isSubmitDisabled = loading || isFormDisabled;
  const allProofsUploaded = activeTiktokFiles.every(Boolean) && activeIgFiles.every(Boolean);




  if (successData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-sans">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#E8C766]/30 blur-2xl rounded-full" />
          <CheckCircle2 className="w-24 h-24 text-gold mx-auto relative filter drop-shadow-[0_4px_12px_rgba(232,199,102,0.4)]" />
        </div>
        <h1 className="font-gaming font-black text-3xl md:text-5xl text-white tracking-wider mb-2 uppercase italic">
          REGISTRATION <span className="text-gold font-black">SUBMITTED</span>
        </h1>
        <p className="text-slate-300 font-sans text-base md:text-lg mb-6">
          Registration Submitted Successfully. Glory Awaits Your Team!
        </p>

        {/* Success Card */}
        <div className="bg-[#121214] border-2 border-gold rounded-2xl p-8 max-w-md mx-auto mb-10 shadow-[0_0_30px_rgba(232,199,102,0.2)]">
          <div className="text-xs uppercase tracking-widest text-gold font-gaming mb-1 font-bold">Your Registration ID</div>
          <div className="font-gaming font-black text-4xl text-white tracking-widest mb-4">
            {successData.registrationId}
          </div>
          <div className="h-px bg-slate-800 w-3/4 mx-auto my-3" />
          <div className="text-sm text-slate-300 font-sans mb-4">
            Team: <span className="font-bold text-gold font-gaming">{successData.teamName}</span>
          </div>
          <div className="p-3 bg-[#1a170d] border border-gold/40 text-gold rounded-xl text-xs font-sans leading-relaxed text-center shadow-sm">
            <span className="font-gaming font-black tracking-wider block mb-1 text-gold">⚠️ ACTION REQUIRED</span>
            Please screenshot this registration card and submit it in our Discord server for verification.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://discord.gg/MK7eQZayxd"
            className="px-8 py-3 bg-[#5865F2] hover:bg-[#4752C4] font-gaming text-white font-bold tracking-wider rounded-xl transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.89-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,72.9,0c.82.71,1.69,1.4,2.58,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,48.12,122.56,25.29,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.72,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96,53,91,65.69,84.69,65.69Z" />
            </svg>
            Join Discord
          </a>

          <button
            onClick={() => {
              setSuccessData(null);
            }}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 font-gaming text-white font-bold tracking-wider rounded-xl transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer"
          >
            Register Another Team
          </button>
        </div>
      </div>
    );
  }

  // Duplicate logos dynamically to guarantee enough items exist for seamless scrolling marquee
  const getMarqueeItems = () => {
    if (invitedTeams.length === 0) return [];
    let items = [...invitedTeams];
    while (items.length < 15) {
      items = [...items, ...invitedTeams];
    }
    return [...items, ...items];
  };
  const marqueeItems = getMarqueeItems();

  return (
    <div className="w-full min-h-screen py-8 px-4 flex flex-col items-center gap-6 font-sans relative z-10">
      {/* Main Form Container */}
      <div className="w-full max-w-5xl bg-[#121214]/95 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">

        {/* HEADER SECTION (Banner Image) */}
        <div className="relative border-b border-slate-800 overflow-hidden">
          <img
            src="/banner.jpg"
            alt="The Shield Showdown Banner"
            className="w-full h-auto block object-cover"
          />
        </div>

        {/* TIMER BAR (If enabled) */}
        {timerConfig.isEnabled && (
          <div className="border-b border-slate-800 bg-[#16161a] p-5 sm:p-6 font-sans relative overflow-hidden text-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <h3 className="font-gaming font-bold text-xs sm:text-sm text-gold uppercase tracking-wider flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-gold" /> {timerConfig.title || 'Registration Closes In'}
              </h3>

              {isExpired || timerConfig.isClosed ? (
                <div className="px-4 py-1.5 bg-rose-950/70 border border-rose-800/60 text-rose-400 font-gaming font-black text-xs tracking-wider uppercase rounded-lg">
                  CLOSED
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 w-full">
                  <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-xs">
                    <div className="bg-[#1a1a20] border border-slate-700/80 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="block font-gaming font-black text-lg sm:text-xl text-white leading-tight">{timeLeft.days}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gold font-bold font-gaming">Days</span>
                    </div>
                    <div className="bg-[#1a1a20] border border-slate-700/80 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="block font-gaming font-black text-lg sm:text-xl text-white leading-tight">{timeLeft.hours}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gold font-bold font-gaming">Hours</span>
                    </div>
                    <div className="bg-[#1a1a20] border border-slate-700/80 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="block font-gaming font-black text-lg sm:text-xl text-white leading-tight">{timeLeft.minutes}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gold font-bold font-gaming">Min</span>
                    </div>
                    <div className="bg-[#1a1a20] border border-slate-700/80 rounded-xl p-2.5 shadow-sm text-center">
                      <span className="block font-gaming font-black text-lg sm:text-xl text-white leading-tight">{timeLeft.seconds}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gold font-bold font-gaming">Sec</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans font-mono">
                    Deadline: {new Date(timerConfig.targetDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INVITED TEAMS MARQUEE (If any exist) */}
        {invitedTeams.length > 0 && (
          <div className="border-b border-slate-800 bg-[#16161a] p-6 font-sans relative overflow-hidden">
            <h3 className="font-gaming font-black text-xs text-gold uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-gold animate-pulse" /> TOP 6 INVITED FROM SEASON 1
            </h3>

            <div className="marquee-container">
              <div className="marquee-content">
                {marqueeItems.map((team, idx) => (
                  <div
                    key={`${team.id}-${idx}`}
                    className="flex-shrink-0 flex items-center justify-center bg-[#1a1a20] border border-slate-800 rounded-xl p-3 w-28 h-20 shadow-sm hover:border-gold hover:shadow-gold-glow hover:scale-105 transition-all duration-300"
                  >
                    <img
                      src={team.logoUrl}
                      alt="Invited Team Logo"
                      className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEASON 1 WINNER BANNER (Option 1 Inline Top Banner + Option 4 Expandable Modal) */}
        <Season1WinnerBanner />

        {/* FORM FIELDS */}
        {isFormDisabled ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="relative mb-8">
              {/* Subtle Glowing Aura */}
              <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full scale-125" />

              {/* Inner Shield frame */}
              <div className="relative bg-[#16161a] border-2 border-gold rounded-full p-8 shadow-lg flex items-center justify-center">
                <Shield className="w-20 h-20 text-gold" strokeWidth={1.5} />
                <div className="absolute -bottom-1 -right-1 bg-gold border-2 border-black rounded-full p-2.5 shadow-md">
                  <Clock className="w-5 h-5 text-black" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-gaming font-black text-3xl md:text-4xl text-white tracking-wider uppercase italic mb-3">
              REGISTRATION <span className="text-gold">CLOSED</span>
            </h2>

            {/* Message */}
            <p className="max-w-xl text-slate-300 font-sans text-sm md:text-base leading-relaxed mb-8">
              The sign-up window for <span className="text-gold font-bold font-gaming tracking-wide">The Shield Showdown</span> is currently closed. Thank you to all registered teams!
            </p>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-10 font-sans text-left">
              <div className="bg-[#16161a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 shadow-sm">
                <h4 className="font-gaming font-bold text-xs text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" /> Registered Teams
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All submitted registrations are currently undergoing database verification. Verified team brackets will be published soon.
                </p>
              </div>
              <div className="bg-[#16161a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 shadow-sm">
                <h4 className="font-gaming font-bold text-xs text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold" /> Discord Verification
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Make sure your team captain is present in our official Discord server for match room credentials and bracket updates.
                </p>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
              <a
                href="https://discord.gg/MK7eQZayxd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-gold-gradient hover:brightness-110 text-black font-gaming font-black text-xs uppercase tracking-widest rounded-xl shadow-gold-glow transition-all duration-300 text-center cursor-pointer"
              >
                Join Discord Server
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="p-6 md:p-10 space-y-8 bg-[#121214]">

            {/* Expired Warning Banner */}
            {isFormDisabled && (
              <div className="bg-rose-950/60 border border-rose-800/60 text-rose-200 p-4 rounded-xl flex items-center gap-3 font-sans text-sm shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div className="flex-grow text-left">
                  <span className="font-gaming font-black tracking-wider block text-rose-100 text-sm mb-0.5">REGISTRATION WINDOW CLOSED</span>
                  <span className="text-xs text-rose-300/90">Submissions are currently closed. Check Discord for tournament announcements.</span>
                </div>
              </div>
            )}

            {/* SERVER / NETWORK ERROR ALERT WITH DETAILED REASON & GUIDANCE */}
            {serverError && (
              <div
                id="server-error-banner"
                className="p-5 md:p-7 rounded-2xl bg-gradient-to-b from-[#2a0e14] via-[#1f0a0f] to-[#16080b] border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.35)] font-sans space-y-4 animate-in fade-in duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-gaming font-black text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                          {serverError.status ? `HTTP ${serverError.status} ERROR` : 'CONNECTION ERROR'}
                        </span>
                        <span className="text-[11px] font-gaming font-bold text-rose-300 uppercase tracking-wider">
                          REGISTRATION SUBMISSION FAILED
                        </span>
                      </div>
                      <h3 className="font-gaming font-black text-base md:text-lg text-white uppercase tracking-wider">
                        {serverError.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setServerError(null)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-white transition-colors cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* EXPLANATION & ACTIONABLE SOLUTIONS BOX */}
                <div className="bg-[#120709]/90 border border-rose-500/30 rounded-xl p-4 space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-gaming font-bold text-rose-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Why this submission was not successful:
                    </span>
                    <p className="text-rose-100/90 font-sans leading-relaxed pl-5">
                      {serverError.reason}
                    </p>
                  </div>

                  {serverError.solution && (
                    <div className="space-y-1 border-t border-rose-500/20 pt-2.5">
                      <span className="font-gaming font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Recommended Action / Fix:
                      </span>
                      <p className="text-slate-300 font-sans leading-relaxed pl-5">
                        {serverError.solution}
                      </p>
                    </div>
                  )}

                  {serverError.raw && serverError.raw !== serverError.reason && (
                    <div className="border-t border-rose-500/20 pt-2 text-[10px] text-slate-500 font-mono pl-5">
                      Server error message: <span className="text-rose-400/90 font-sans">{serverError.raw}</span>
                    </div>
                  )}
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit, onInvalidSubmit)}
                    disabled={loading}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-gaming font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServerError(null)}
                    className="px-4 py-2.5 bg-[#14080a] hover:bg-slate-800 border border-slate-700 text-slate-300 font-gaming font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* TOP VALIDATION ERROR SUMMARY (Shows when submit was clicked with errors) */}
            {formAttempted && activeErrorsList.length > 0 && (
              <div
                id="form-error-summary"
                className="p-5 md:p-6 rounded-2xl bg-gradient-to-b from-[#240f14] via-[#1a0a0e] to-[#14080a] border-2 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.25)] font-sans space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-gaming font-black text-sm md:text-base text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Form Submission Incomplete</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] border border-rose-700 font-gaming font-bold">
                          {activeErrorsList.length} {activeErrorsList.length === 1 ? 'Error' : 'Errors'}
                        </span>
                      </h3>
                      <p className="text-xs text-rose-200/80 font-sans mt-0.5">
                        Please resolve the highlighted item{activeErrorsList.length > 1 ? 's' : ''} below. Click any item to jump straight to that field:
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => focusAndHighlightElement(activeErrorsList[0].targetId, activeErrorsList[0].focusName)}
                    className="self-start sm:self-auto px-3.5 py-1.5 bg-rose-900/70 hover:bg-rose-800 border border-rose-500/60 text-white font-gaming text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                  >
                    <span>Jump to First Issue</span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-300" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {activeErrorsList.map((err, idx) => (
                    <button
                      key={err.id || idx}
                      type="button"
                      onClick={() => focusAndHighlightElement(err.targetId, err.focusName)}
                      className="flex items-center justify-between text-left p-3 rounded-xl bg-[#160a0d]/90 hover:bg-[#251016] border border-rose-500/30 hover:border-rose-400 transition-all text-xs group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-gaming font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                          {err.section}
                        </span>
                        <span className="font-sans font-medium text-rose-200 group-hover:text-white transition-colors truncate">
                          {err.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-400 group-hover:text-rose-200 font-gaming font-bold text-[10px] uppercase tracking-wider shrink-0 pl-1">
                        <span>Fix</span>
                        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform text-rose-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 1: TEAM INFORMATION */}
            <div className="bg-[#16161a] border border-slate-800 rounded-2xl p-5 md:p-7 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center font-gaming font-black text-xs text-gold">
                    01
                  </span>
                  <div>
                    <h2 className="font-gaming font-bold text-sm md:text-base text-white tracking-wider uppercase">
                      Team Information
                    </h2>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Enter your official team name and captain contact details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                {/* Team Name */}
                <div id="container-teamName">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Team Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-teamName"
                    type="text"
                    disabled={isFormDisabled}
                    {...register('teamName', { 
                      required: 'Official Team Name is required',
                      minLength: { value: 2, message: 'Team Name must be at least 2 characters' }
                    })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'e.g. Team Phoenix'}
                    className={`w-full form-input transition-all ${
                      errors.teamName 
                        ? '!border-red-500 !bg-red-950/20 focus:!ring-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                        : ''
                    } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                  />
                  {errors.teamName && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" /> {errors.teamName.message}
                    </p>
                  )}
                </div>

                {/* Team Leader Name */}
                <div id="container-teamLeaderName">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Team Captain / Leader Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-teamLeaderName"
                    type="text"
                    disabled={isFormDisabled}
                    {...register('teamLeaderName', { required: 'Team Captain / Leader Name is required' })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'e.g. John Doe'}
                    className={`w-full form-input transition-all ${
                      errors.teamLeaderName 
                        ? '!border-red-500 !bg-red-950/20 focus:!ring-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                        : ''
                    } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                  />
                  {errors.teamLeaderName && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" /> {errors.teamLeaderName.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div id="container-email" className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Official Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    disabled={isFormDisabled}
                    {...register('email', {
                      required: 'Official Contact Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address (e.g. captain@gmail.com)'
                      }
                    })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'captain@team.com'}
                    className={`w-full form-input transition-all ${
                      errors.email 
                        ? '!border-red-500 !bg-red-950/20 focus:!ring-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                        : ''
                    } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" /> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: SQUAD ROSTER (4 Starters + 1 Optional Substitute) */}
            <div className="bg-[#16161a] border border-slate-800 rounded-2xl p-5 md:p-7 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center font-gaming font-black text-xs text-gold">
                    02
                  </span>
                  <div>
                    <h2 className="font-gaming font-bold text-sm md:text-base text-white tracking-wider uppercase">
                      Squad Roster
                    </h2>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      4 Core Starters required. 5th player is optional as a substitute.
                    </p>
                  </div>
                </div>
              </div>

              {/* Starters Grid: 4 Core Players */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const isCaptain = index === 0;
                  const hasPlayerError = !!(errors.players?.[index]?.playerName || errors.players?.[index]?.playerUID || errors.players?.[index]?.role);
                  return (
                    <div
                      key={index}
                      id={`container-player-${index}`}
                      className={`bg-[#1a1a20] border rounded-xl p-4 space-y-3.5 shadow-sm transition-all duration-200 ${
                        hasPlayerError 
                          ? 'border-rose-500/60 bg-[#1e1518]' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gold" />
                          <h3 className="font-gaming font-bold text-xs text-white tracking-wider uppercase">
                            Player {index + 1}
                          </h3>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-gaming font-bold uppercase tracking-wider ${
                          isCaptain
                            ? 'bg-gold/15 text-gold border border-gold/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {isCaptain ? 'Captain' : 'Starter'}
                        </span>
                      </div>

                      {/* Player IGN */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                          In-Game Name (IGN) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id={`input-player-${index}-name`}
                          type="text"
                          disabled={isFormDisabled}
                          {...register(`players.${index}.playerName`, { required: 'IGN is required' })}
                          placeholder={isFormDisabled ? 'Closed' : 'e.g. Shadow7'}
                          className={`w-full form-input-sm transition-all ${
                            errors.players?.[index]?.playerName 
                              ? '!border-red-500 !bg-red-950/20 focus:!ring-red-500/30' 
                              : ''
                          } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                        />
                        {errors.players?.[index]?.playerName && (
                          <p className="text-red-400 text-[10px] mt-1 font-sans flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> IGN is required
                          </p>
                        )}
                      </div>

                      {/* Player UID */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                          Free Fire UID <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id={`input-player-${index}-uid`}
                          type="text"
                          disabled={isFormDisabled}
                          {...register(`players.${index}.playerUID`, {
                            required: 'Free Fire UID is required',
                            pattern: {
                              value: /^[0-9]+$/,
                              message: 'Numbers only'
                            }
                          })}
                          placeholder={isFormDisabled ? 'Closed' : 'e.g. 192837465'}
                          className={`w-full form-input-sm transition-all ${
                            errors.players?.[index]?.playerUID 
                              ? '!border-red-500 !bg-red-950/20 focus:!ring-red-500/30' 
                              : ''
                          } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                        />
                        {errors.players?.[index]?.playerUID && (
                          <p className="text-red-400 text-[10px] mt-1 font-sans flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.players[index].playerUID.message || 'UID required'}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                          Player Role <span className="text-rose-400">*</span>
                        </label>
                        <select
                          id={`input-player-${index}-role`}
                          disabled={isFormDisabled}
                          {...register(`players.${index}.role`, { required: 'Please select a role' })}
                          className={`w-full form-input-sm cursor-pointer transition-all ${
                            errors.players?.[index]?.role 
                              ? '!border-red-500 !bg-red-950/20 focus:!ring-red-500/30' 
                              : ''
                          } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                        >
                          <option value="" className="bg-[#16161a] text-slate-400">Select Role</option>
                          <option value="IGL" className="bg-[#16161a] text-slate-100">IGL (In-Game Leader)</option>
                          <option value="Rusher" className="bg-[#16161a] text-slate-100">Rusher (Entry Fragger)</option>
                          <option value="Sniper" className="bg-[#16161a] text-slate-100">Sniper</option>
                          <option value="Support" className="bg-[#16161a] text-slate-100">Support / Flanker</option>
                        </select>
                        {errors.players?.[index]?.role && (
                          <p className="text-red-400 text-[10px] mt-1 font-sans flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> Role required
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Substitute Player 5 Card (Spacious & Clearly Identified) */}
              <div 
                id="container-player-4"
                className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                  errors.players?.[4]?.playerName || errors.players?.[4]?.playerUID || errors.players?.[4]?.role
                    ? 'bg-[#1e1518] border-rose-500/60 shadow-sm'
                    : isP5Active 
                    ? 'bg-[#1a1a20] border-gold/40 shadow-sm' 
                    : 'bg-[#141418] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <h3 className="font-gaming font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                        Player 5 — Substitute Roster
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Optional reserve player. If filled, IGN, numeric UID, and Role are required.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-gaming font-bold uppercase tracking-wider">
                    Optional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* P5 IGN */}
                  <div>
                    <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                      Substitute IGN
                    </label>
                    <input
                      id="input-player-4-name"
                      type="text"
                      disabled={isFormDisabled}
                      {...register('players.4.playerName', { required: isP5Active ? 'Substitute IGN required' : false })}
                      placeholder={isFormDisabled ? 'Closed' : 'Optional IGN'}
                      className={`w-full form-input-sm transition-all ${
                        errors.players?.[4]?.playerName 
                          ? '!border-red-500 !bg-red-950/20' 
                          : ''
                      } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                    />
                    {errors.players?.[4]?.playerName && (
                      <p className="text-red-400 text-[10px] mt-1 font-sans flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.players[4].playerName.message || 'IGN required'}
                      </p>
                    )}
                  </div>

                  {/* P5 UID */}
                  <div>
                    <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                      Substitute UID
                    </label>
                    <input
                      id="input-player-4-uid"
                      type="text"
                      disabled={isFormDisabled}
                      {...register('players.4.playerUID', {
                        required: isP5Active ? 'Substitute UID required' : false,
                        pattern: {
                          value: /^(|[0-9]+)$/,
                          message: 'Numbers only'
                        }
                      })}
                      placeholder={isFormDisabled ? 'Closed' : 'Optional UID'}
                      className={`w-full form-input-sm transition-all ${
                        errors.players?.[4]?.playerUID 
                          ? '!border-red-500 !bg-red-950/20' 
                          : ''
                      } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                    />
                    {errors.players?.[4]?.playerUID && (
                      <p className="text-red-400 text-[10px] mt-1 font-sans flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.players[4].playerUID.message || 'UID required'}
                      </p>
                    )}
                  </div>

                  {/* P5 Role */}
                  <div>
                    <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                      Substitute Role
                    </label>
                    <select
                      id="input-player-4-role"
                      disabled={isFormDisabled}
                      {...register('players.4.role', { required: isP5Active ? 'Substitute Role required' : false })}
                      className={`w-full form-input-sm cursor-pointer transition-all ${
                        errors.players?.[4]?.role 
                          ? '!border-red-500 !bg-red-950/20' 
                          : ''
                      } ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                    >
                      <option value="" className="bg-[#16161a] text-slate-400">Select Role (Optional)</option>
                      <option value="Substitute" className="bg-[#16161a] text-slate-100">Substitute (All-Rounder)</option>
                      <option value="Rusher" className="bg-[#16161a] text-slate-100">Rusher</option>
                      <option value="Sniper" className="bg-[#16161a] text-slate-100">Sniper</option>
                      <option value="Support" className="bg-[#16161a] text-slate-100">Support</option>
                    </select>
                    {errors.players?.[4]?.role && (
                      <p className="text-red-400 text-[10px] mt-1 font-sans flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" /> Role required
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: SOCIAL MEDIA VERIFICATION */}
            <div className="bg-[#16161a] border border-slate-800 rounded-2xl p-5 md:p-7 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center font-gaming font-black text-xs text-gold">
                    03
                  </span>
                  <div>
                    <h2 className="font-gaming font-bold text-sm md:text-base text-white tracking-wider uppercase">
                      Social Verification
                    </h2>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Upload proof of follow for Player 1, Player 2 & Player 3 (3 screenshots per platform).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">

                {/* TIKTOK PROOFS CARD */}
                <div className="bg-[#1a1a20] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-black border border-slate-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        {/* TikTok Icon */}
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.27 6.27 0 0 0 1.96-4.52V8.92a8.28 8.28 0 0 0 4.81 1.52v-3.45a4.85 4.85 0 0 1-1-.3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-gaming font-bold text-xs text-white uppercase tracking-wider">
                          TikTok Page
                        </h3>
                        <p className="text-[10px] text-slate-400">Follow & take screenshot</p>
                      </div>
                    </div>

                    <a
                      href="https://www.tiktok.com/@theshieldesportsofficial?_r=1&_t=ZP-993bGn6qdUU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#010101] hover:bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      Follow TikTok <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Upload Rows */}
                  <div className="space-y-2.5">
                    {[...Array(proofRequiredCount)].map((_, idx) => {
                      const file = tiktokFiles[idx];
                      const preview = tiktokPreviews[idx];
                      const playerName = watch(`players.${idx}.playerName`) || `Player ${idx + 1}`;
                      const isReady = watch(`players.${idx}.playerName`)?.trim();
                      const isMissing = showUploadErrors && !file;

                      return (
                        <div
                          key={idx}
                          id={`tiktok-file-container-${idx}`}
                          className={`bg-[#121214] border rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-all ${
                            isMissing 
                              ? 'border-rose-500 bg-rose-950/30 ring-1 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]' 
                              : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-gaming font-bold text-[10px] flex items-center justify-center shrink-0">
                              P{idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 font-medium truncate">
                              {playerName}
                            </span>
                            {isMissing && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-300 font-gaming font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-300" /> Missing
                              </span>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {file ? (
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded border border-slate-700 overflow-hidden bg-black shadow-inner">
                                  <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                                <button
                                  type="button"
                                  disabled={isFormDisabled}
                                  onClick={() => removeSlotFile(idx, 'tiktok')}
                                  className="p-1 bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-red-200 rounded cursor-pointer transition-colors"
                                  title="Remove File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 font-gaming text-[9px] uppercase tracking-wider">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
                                </span>
                              </div>
                            ) : (
                              <div>
                                <label
                                  htmlFor={`tiktok-file-${idx}`}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                                    isReady && !isFormDisabled
                                      ? isMissing
                                        ? 'bg-rose-900 hover:bg-rose-800 border-rose-500 text-white cursor-pointer animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer'
                                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
                                  }`}
                                >
                                  <Upload className="w-3 h-3 text-gold" /> Upload
                                </label>
                                <input
                                  id={`tiktok-file-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSlotFileChange(e, idx, 'tiktok')}
                                  className="hidden"
                                  disabled={!isReady || isFormDisabled}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INSTAGRAM PROOFS CARD */}
                <div className="bg-[#1a1a20] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-white stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-gaming font-bold text-xs text-white uppercase tracking-wider">
                          Instagram Page
                        </h3>
                        <p className="text-[10px] text-slate-400">Follow & take screenshot</p>
                      </div>
                    </div>

                    <a
                      href="https://www.instagram.com/theshieldesports10/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      Follow <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Upload Rows */}
                  <div className="space-y-2.5">
                    {[...Array(proofRequiredCount)].map((_, idx) => {
                      const file = igFiles[idx];
                      const preview = igPreviews[idx];
                      const playerName = watch(`players.${idx}.playerName`) || `Player ${idx + 1}`;
                      const isReady = watch(`players.${idx}.playerName`)?.trim();
                      const isMissing = showUploadErrors && !file;

                      return (
                        <div
                          key={idx}
                          id={`ig-file-container-${idx}`}
                          className={`bg-[#121214] border rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-all ${
                            isMissing 
                              ? 'border-rose-500 bg-rose-950/30 ring-1 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]' 
                              : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-gaming font-bold text-[10px] flex items-center justify-center shrink-0">
                              P{idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 font-medium truncate">
                              {playerName}
                            </span>
                            {isMissing && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-300 font-gaming font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-300" /> Missing
                              </span>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {file ? (
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded border border-slate-700 overflow-hidden bg-black shadow-inner">
                                  <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                                <button
                                  type="button"
                                  disabled={isFormDisabled}
                                  onClick={() => removeSlotFile(idx, 'instagram')}
                                  className="p-1 bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-red-200 rounded cursor-pointer transition-colors"
                                  title="Remove File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 font-gaming text-[9px] uppercase tracking-wider">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
                                </span>
                              </div>
                            ) : (
                              <div>
                                <label
                                  htmlFor={`ig-file-${idx}`}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                                    isReady && !isFormDisabled
                                      ? isMissing
                                        ? 'bg-rose-900 hover:bg-rose-800 border-rose-500 text-white cursor-pointer animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer'
                                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed pointer-events-none'
                                  }`}
                                >
                                  <Upload className="w-3 h-3 text-gold" /> Upload
                                </label>
                                <input
                                  id={`ig-file-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSlotFileChange(e, idx, 'instagram')}
                                  className="hidden"
                                  disabled={!isReady || isFormDisabled}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-sans">
                Verification screenshots are checked by admins before bracket seeding.
              </div>
            </div>

            {/* SECTION 4: TERMS & CONDITIONS */}
            <div 
              id="terms-container" 
              className={`bg-[#16161a] border rounded-2xl p-5 md:p-7 space-y-4 shadow-sm transition-all duration-200 ${
                errors.termsAccepted ? 'border-rose-500/70 bg-[#1e1417]' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center font-gaming font-black text-xs text-gold">
                    04
                  </span>
                  <div>
                    <h2 className="font-gaming font-bold text-sm md:text-base text-white tracking-wider uppercase">
                      Tournament Agreement
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 cursor-pointer select-none font-sans pt-1">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    {...register('termsAccepted', { required: 'You must agree to official tournament rules to register' })}
                    className="sr-only peer"
                    id="terms-check"
                    disabled={isFormDisabled}
                  />
                  <label
                    htmlFor="terms-check"
                    className={`w-5 h-5 bg-[#1a1a20] border-2 rounded-md flex items-center justify-center transition-all ${
                      isFormDisabled ? 'border-slate-800 cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${
                      errors.termsAccepted && !watchTerms 
                        ? 'border-rose-500 ring-2 ring-rose-500/30' 
                        : watchTerms && !isFormDisabled 
                        ? 'border-gold bg-gold text-black shadow-gold-glow' 
                        : 'border-slate-600 hover:border-gold'
                    }`}
                  >
                    {watchTerms && !isFormDisabled && <Check className="w-3.5 h-3.5 text-black font-black stroke-[3.5]" />}
                  </label>
                </div>
                <label htmlFor="terms-check" className={`text-xs md:text-sm transition-colors leading-relaxed ${
                  isFormDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-slate-300 hover:text-white cursor-pointer'
                }`}>
                  I confirm that all team and player details provided are accurate. Our squad agrees to follow all official tournament rules and attend scheduled match lobbies on time.
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-400 text-xs flex items-center gap-1.5 font-medium pl-8 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" /> {errors.termsAccepted.message}
                </p>
              )}
            </div>

            {/* BOTTOM ERROR SUMMARY BOX (Before Submit Button) */}
            {formAttempted && activeErrorsList.length > 0 && (
              <div className="p-4 md:p-5 rounded-xl bg-gradient-to-b from-[#220d11] to-[#160a0d] border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)] font-sans space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-rose-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="font-gaming font-bold text-xs text-rose-200 uppercase tracking-wider">
                      {activeErrorsList.length} Missing / Incomplete {activeErrorsList.length === 1 ? 'Field' : 'Fields'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => focusAndHighlightElement(activeErrorsList[0].targetId, activeErrorsList[0].focusName)}
                    className="text-[11px] text-rose-300 hover:text-white font-gaming font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Fix First Issue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeErrorsList.map((err, idx) => (
                    <button
                      key={err.id || idx}
                      type="button"
                      onClick={() => focusAndHighlightElement(err.targetId, err.focusName)}
                      className="px-2.5 py-1 rounded-lg bg-[#2d1117] hover:bg-rose-900/80 border border-rose-500/40 hover:border-rose-400 text-[11px] text-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      <span className="font-semibold">{err.field || err.section}:</span>
                      <span className="text-rose-300/90">{err.message}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON SECTION */}
            <div className="flex flex-col items-center pt-2 space-y-3">
              {!allProofsUploaded && !loading && !isFormDisabled && (
                <div className="px-4 py-2 rounded-full bg-[#16161a] border border-slate-800 text-[11px] text-slate-400 font-gaming uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span>Upload Status: TikTok ({activeTiktokFiles.filter(Boolean).length}/{proofRequiredCount}) &bull; Instagram ({activeIgFiles.filter(Boolean).length}/{proofRequiredCount})</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full max-w-sm font-gaming font-black uppercase text-xs md:text-sm tracking-widest py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 group shadow-md ${
                  isSubmitDisabled
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
                    : 'bg-softgold-gradient hover:brightness-110 text-black cursor-pointer transform hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(232,199,102,0.35)] hover:shadow-[0_6px_25px_rgba(232,199,102,0.5)]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-black animate-spin shrink-0" />
                    <span>SUBMITTING REGISTRATION... ({submitElapsedSec}s)</span>
                  </>
                ) : isFormDisabled ? (
                  'REGISTRATION CLOSED'
                ) : (
                  'SUBMIT REGISTRATION'
                )}
              </button>

              {loading && (
                <div className="px-4 py-1.5 rounded-full bg-[#16161a] border border-gold/30 text-[11px] text-gold font-gaming uppercase tracking-wider flex items-center gap-2 animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>Uploading screenshots & verifying squad... ({submitElapsedSec}s)</span>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Bottom widgets row */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {/* INSTRUCTIONS CARD */}
        <div className="bg-[#121214]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <h3 className="font-gaming font-bold text-xs text-gold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            REGISTRATION GUIDE
          </h3>
          <ul className="text-xs text-slate-300 space-y-3 list-none pl-0">
            <li className="flex gap-2.5 items-start">
              <span className="text-gold font-gaming font-bold text-xs shrink-0 mt-0.5">01.</span>
              <span>Provide your Team Name, Team Captain Name, and Contact Email.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-gold font-gaming font-bold text-xs shrink-0 mt-0.5">02.</span>
              <span>Fill in player IGN, UID, and Roles for 4 starters (5th substitute optional).</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-gold font-gaming font-bold text-xs shrink-0 mt-0.5">03.</span>
              <span>Upload TikTok & Instagram follow screenshots for all registered squad members.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-gold font-gaming font-bold text-xs shrink-0 mt-0.5">04.</span>
              <span>Accept the tournament terms and submit to receive your Registration ID.</span>
            </li>
          </ul>
        </div>

        {/* JOIN DISCORD CARD */}
        <div className="bg-[#121214]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-center flex flex-col justify-between relative overflow-hidden">
          <div>
            <h4 className="font-gaming font-black text-xs text-gold uppercase tracking-wider mb-2">
              TOURNAMENT COMMUNITY
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Have questions regarding brackets, schedules, or need help? Connect with the tournament administration team on Discord.
            </p>
          </div>
          <a
            href="https://discord.gg/MK7eQZayxd"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-[#5865F2] hover:bg-[#4752C4] font-gaming text-white font-bold text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-sm transform hover:-translate-y-0.5"
          >
            Join Discord Community
          </a>
        </div>
      </div>

      {/* DEDICATED SPONSORS & PARTNERS SECTION */}
      <SponsorsSection />
    </div>
  );
}
