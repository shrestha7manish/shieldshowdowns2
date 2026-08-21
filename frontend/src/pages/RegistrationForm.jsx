import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Shield, Upload, CheckCircle2, AlertTriangle, Users, Award, Camera, User, Check, RefreshCw, Trophy, Trash2, Eye, ExternalLink, Clock } from 'lucide-react';
import SponsorsSection from '../components/SponsorsSection';
import Season1WinnerBanner from '../components/Season1WinnerBanner';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Timer Configuration and Countdown State
  const [timerConfig, setTimerConfig] = useState({ isEnabled: false, targetDate: null, title: 'Registration Closes In' });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

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

  const getNestedError = (errors, path) => {
    const parts = path.split('.');
    let current = errors;
    for (const part of parts) {
      if (!current) return undefined;
      current = current[part];
    }
    return current;
  };

  const scrollToFirstError = (errors) => {
    for (const path of formFieldOrder) {
      if (getNestedError(errors, path)) {
        const element = document.querySelector(`[name="${path}"]`);
        if (element) {
          if (path === 'termsAccepted') {
            const termsContainer = document.getElementById('terms-container');
            if (termsContainer) {
              termsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
          }
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          try {
            element.focus({ preventScroll: true });
          } catch (e) {
            console.error(e);
          }
          return;
        }
      }
    }
  };

  const onSubmit = async (data) => {
    setErrorMsg('');

    const activeTiktokFiles = tiktokFiles.slice(0, proofRequiredCount);
    const activeIgFiles = igFiles.slice(0, proofRequiredCount);

    const firstMissingTiktokIdx = activeTiktokFiles.findIndex(f => !f);
    const firstMissingIgIdx = activeIgFiles.findIndex(f => !f);

    if (firstMissingTiktokIdx !== -1 || firstMissingIgIdx !== -1) {
      setErrorMsg(`Please upload follow screenshot proofs for Player 1, Player 2, and Player 3.`);
      setShowUploadErrors(true);

      let elementToScroll = null;
      if (firstMissingTiktokIdx !== -1) {
        elementToScroll = document.getElementById(`tiktok-file-container-${firstMissingTiktokIdx}`);
      } else if (firstMissingIgIdx !== -1) {
        elementToScroll = document.getElementById(`ig-file-container-${firstMissingIgIdx}`);
      }

      if (elementToScroll) {
        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      }
    } catch (err) {
      console.error('Registration error:', err);
      const backendMsg = err.response?.data?.message;
      const networkErr = err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (networkErr) {
        setErrorMsg('Network error: Cannot reach the server. Please check your internet connection and try again.');
      } else {
        setErrorMsg(backendMsg || `Server error (${err.response?.status || 'unknown'}). Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onInvalidSubmit = (errors) => {
    console.error("Form Validation Errors:", errors);
    setErrorMsg("Form submission failed. Please fill out all required fields (highlighted in red) and accept the terms.");
    scrollToFirstError(errors);
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

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-950/60 border border-rose-800/60 text-rose-200 p-4 rounded-xl flex items-center gap-3 font-sans text-sm shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span className="text-xs">{errorMsg}</span>
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
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Team Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isFormDisabled}
                    {...register('teamName', { required: 'Team Name is required' })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'e.g. Team Phoenix'}
                    className={`w-full form-input ${errors.teamName ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                  />
                  {errors.teamName && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.teamName.message}
                    </p>
                  )}
                </div>

                {/* Team Leader Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Team Captain / Leader Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isFormDisabled}
                    {...register('teamLeaderName', { required: 'Team Leader Name is required' })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'e.g. John Doe'}
                    className={`w-full form-input ${errors.teamLeaderName ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                  />
                  {errors.teamLeaderName && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.teamLeaderName.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Official Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={isFormDisabled}
                    {...register('email', {
                      required: 'Email Address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'captain@team.com'}
                    className={`w-full form-input ${errors.email ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.email.message}
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
                  return (
                    <div
                      key={index}
                      className="bg-[#1a1a20] border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3.5 shadow-sm transition-all duration-200"
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
                          type="text"
                          disabled={isFormDisabled}
                          {...register(`players.${index}.playerName`, { required: 'IGN is required' })}
                          placeholder={isFormDisabled ? 'Closed' : 'e.g. Shadow7'}
                          className={`w-full form-input-sm ${errors.players?.[index]?.playerName ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                        />
                        {errors.players?.[index]?.playerName && (
                          <p className="text-red-400 text-[10px] mt-1 font-sans">IGN required</p>
                        )}
                      </div>

                      {/* Player UID */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                          Free Fire UID <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          {...register(`players.${index}.playerUID`, {
                            required: 'UID is required',
                            pattern: {
                              value: /^[0-9]+$/,
                              message: 'Numbers only'
                            }
                          })}
                          placeholder={isFormDisabled ? 'Closed' : 'e.g. 192837465'}
                          className={`w-full form-input-sm ${errors.players?.[index]?.playerUID ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                        />
                        {errors.players?.[index]?.playerUID && (
                          <p className="text-red-400 text-[10px] mt-1 font-sans">
                            {errors.players[index].playerUID.message || 'UID required'}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                          Player Role <span className="text-rose-400">*</span>
                        </label>
                        <select
                          disabled={isFormDisabled}
                          {...register(`players.${index}.role`, { required: 'Role is required' })}
                          className={`w-full form-input-sm cursor-pointer ${errors.players?.[index]?.role ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                        >
                          <option value="" className="bg-[#16161a] text-slate-400">Select Role</option>
                          <option value="IGL" className="bg-[#16161a] text-slate-100">IGL (In-Game Leader)</option>
                          <option value="Rusher" className="bg-[#16161a] text-slate-100">Rusher (Entry Fragger)</option>
                          <option value="Sniper" className="bg-[#16161a] text-slate-100">Sniper</option>
                          <option value="Support" className="bg-[#16161a] text-slate-100">Support / Flanker</option>
                        </select>
                        {errors.players?.[index]?.role && (
                          <p className="text-red-400 text-[10px] mt-1 font-sans">Role required</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Substitute Player 5 Card (Spacious & Clearly Identified) */}
              <div className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                isP5Active 
                  ? 'bg-[#1a1a20] border-gold/40 shadow-sm' 
                  : 'bg-[#141418] border-slate-800/80 hover:border-slate-700'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <h3 className="font-gaming font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                        Player 5 — Substitute Roster
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Optional reserve player who can substitute during matches.
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
                      type="text"
                      disabled={isFormDisabled}
                      {...register('players.4.playerName', { required: isP5Active ? 'IGN required if substitute is added' : false })}
                      placeholder={isFormDisabled ? 'Closed' : 'Optional IGN'}
                      className={`w-full form-input-sm ${errors.players?.[4]?.playerName ? '!border-red-500' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                    />
                    {errors.players?.[4]?.playerName && (
                      <p className="text-red-400 text-[10px] mt-1 font-sans">Required</p>
                    )}
                  </div>

                  {/* P5 UID */}
                  <div>
                    <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                      Substitute UID
                    </label>
                    <input
                      type="text"
                      disabled={isFormDisabled}
                      {...register('players.4.playerUID', {
                        required: isP5Active ? 'UID required if substitute is added' : false,
                        pattern: {
                          value: /^(|[0-9]+)$/,
                          message: 'Numbers only'
                        }
                      })}
                      placeholder={isFormDisabled ? 'Closed' : 'Optional UID'}
                      className={`w-full form-input-sm ${errors.players?.[4]?.playerUID ? '!border-red-500' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                    />
                    {errors.players?.[4]?.playerUID && (
                      <p className="text-red-400 text-[10px] mt-1 font-sans">
                        {errors.players[4].playerUID.message || 'Required'}
                      </p>
                    )}
                  </div>

                  {/* P5 Role */}
                  <div>
                    <label className="block text-[10px] uppercase font-gaming text-slate-400 mb-1 font-bold">
                      Substitute Role
                    </label>
                    <select
                      disabled={isFormDisabled}
                      {...register('players.4.role', { required: isP5Active ? 'Role required if substitute is added' : false })}
                      className={`w-full form-input-sm cursor-pointer ${errors.players?.[4]?.role ? '!border-red-500' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
                    >
                      <option value="" className="bg-[#16161a] text-slate-400">Select Role (Optional)</option>
                      <option value="Substitute" className="bg-[#16161a] text-slate-100">Substitute (All-Rounder)</option>
                      <option value="Rusher" className="bg-[#16161a] text-slate-100">Rusher</option>
                      <option value="Sniper" className="bg-[#16161a] text-slate-100">Sniper</option>
                      <option value="Support" className="bg-[#16161a] text-slate-100">Support</option>
                    </select>
                    {errors.players?.[4]?.role && (
                      <p className="text-red-400 text-[10px] mt-1 font-sans">Required</p>
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

                      return (
                        <div
                          key={idx}
                          id={`tiktok-file-container-${idx}`}
                          className={`bg-[#121214] border rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                            showUploadErrors && !file ? 'border-rose-500/70 bg-rose-950/20' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-gaming font-bold text-[10px] flex items-center justify-center shrink-0">
                              P{idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 font-medium truncate">
                              {playerName}
                            </span>
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
                                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer'
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

                      return (
                        <div
                          key={idx}
                          id={`ig-file-container-${idx}`}
                          className={`bg-[#121214] border rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                            showUploadErrors && !file ? 'border-rose-500/70 bg-rose-950/20' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-gaming font-bold text-[10px] flex items-center justify-center shrink-0">
                              P{idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 font-medium truncate">
                              {playerName}
                            </span>
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
                                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer'
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
            <div className="bg-[#16161a] border border-slate-800 rounded-2xl p-5 md:p-7 space-y-4 shadow-sm">
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

              <div id="terms-container" className="flex items-start gap-3 cursor-pointer select-none font-sans pt-1">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    {...register('termsAccepted', { required: 'You must accept the terms to participate' })}
                    className="sr-only peer"
                    id="terms-check"
                    disabled={isFormDisabled}
                  />
                  <label
                    htmlFor="terms-check"
                    className={`w-5 h-5 bg-[#1a1a20] border-2 rounded-md flex items-center justify-center transition-all ${
                      isFormDisabled ? 'border-slate-800 cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${watchTerms && !isFormDisabled ? 'border-gold bg-gold text-black shadow-gold-glow' : 'border-slate-600 hover:border-gold'}`}
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
                <p className="text-red-400 text-xs flex items-center gap-1 font-medium pl-8 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.termsAccepted.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex flex-col items-center pt-2 space-y-4">
              {!allProofsUploaded && !loading && !isFormDisabled && (
                <div className="px-4 py-2 rounded-full bg-[#16161a] border border-slate-800 text-[11px] text-slate-400 font-gaming uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span>Upload Status: TikTok ({activeTiktokFiles.filter(Boolean).length}/{proofRequiredCount}) &bull; Instagram ({activeIgFiles.filter(Boolean).length}/{proofRequiredCount})</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full max-w-sm font-gaming font-black uppercase text-xs md:text-sm tracking-widest py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-md ${
                  isSubmitDisabled
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
                    : 'bg-softgold-gradient hover:brightness-110 text-black cursor-pointer transform hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(232,199,102,0.35)] hover:shadow-[0_6px_25px_rgba(232,199,102,0.5)]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-black animate-spin" />
                    Submitting Registration...
                  </>
                ) : isFormDisabled ? (
                  'REGISTRATION CLOSED'
                ) : (
                  'SUBMIT REGISTRATION'
                )}
              </button>
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
              <span>Upload TikTok & Instagram screenshots for Player 1, Player 2, and Player 3.</span>
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
