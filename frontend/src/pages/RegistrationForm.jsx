import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Shield, Upload, CheckCircle2, AlertTriangle, Users, Award, Camera, User, Check, RefreshCw, Trophy, Trash2, Eye, ExternalLink, Clock } from 'lucide-react';

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
  const [ytFiles, setYtFiles] = useState([null, null, null, null, null]);
  const [ytPreviews, setYtPreviews] = useState([null, null, null, null, null]);
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
  const proofRequiredCount = 2;
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
      setYtFiles(prev => {
        const next = [...prev];
        next[4] = null;
        return next;
      });
      setYtPreviews(prev => {
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
      if (type === 'youtube') {
        setYtFiles(prev => {
          const next = [...prev];
          next[idx] = file;
          return next;
        });
        setYtPreviews(prev => {
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
    if (type === 'youtube') {
      setYtFiles(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      setYtPreviews(prev => {
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

    const activeYtFiles = ytFiles.slice(0, proofRequiredCount);
    const activeIgFiles = igFiles.slice(0, proofRequiredCount);

    const firstMissingYtIdx = activeYtFiles.findIndex(f => !f);
    const firstMissingIgIdx = activeIgFiles.findIndex(f => !f);

    if (firstMissingYtIdx !== -1 || firstMissingIgIdx !== -1) {
      setErrorMsg(`Please upload screenshot proofs for Player 1 and Player 2.`);
      setShowUploadErrors(true);

      let elementToScroll = null;
      if (firstMissingYtIdx !== -1) {
        elementToScroll = document.getElementById(`yt-file-container-${firstMissingYtIdx}`);
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
      activeYtFiles.forEach(file => {
        formData.append('youtubeProofs', file);
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
        setYtFiles([null, null, null, null, null]);
        setYtPreviews([null, null, null, null, null]);
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
  const activeYtFiles = ytFiles.slice(0, proofRequiredCount);
  const activeIgFiles = igFiles.slice(0, proofRequiredCount);
  const isSubmitDisabled = loading || isFormDisabled;
  const allProofsUploaded = activeYtFiles.every(Boolean) && activeIgFiles.every(Boolean);



  if (successData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-sans">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#E8C766]/30 blur-2xl rounded-full" />
          <CheckCircle2 className="w-24 h-24 text-[#E8C766] mx-auto relative filter drop-shadow-[0_4px_12px_rgba(232,199,102,0.4)]" />
        </div>
        <h1 className="font-gaming font-black text-3xl md:text-5xl text-[#243B53] tracking-wider mb-2 uppercase italic">
          REGISTRATION <span className="text-[#4F7CAC] font-black">SUBMITTED</span>
        </h1>
        <p className="text-[#243B53]/80 font-sans text-base md:text-lg mb-6">
          Registration Submitted Successfully. Glory Awaits Your Team!
        </p>

        {/* Success Card */}
        <div className="bg-[#EEF5FA] border-2 border-[#E8C766] rounded-2xl p-8 max-w-md mx-auto mb-10 shadow-lg">
          <div className="text-xs uppercase tracking-widest text-[#4F7CAC] font-gaming mb-1 font-bold">Your Registration ID</div>
          <div className="font-gaming font-black text-4xl text-[#243B53] tracking-widest mb-4">
            {successData.registrationId}
          </div>
          <div className="h-px bg-[#E5E7EB] w-3/4 mx-auto my-3" />
          <div className="text-sm text-[#243B53] font-sans mb-4">
            Team: <span className="font-bold text-[#4F7CAC] font-gaming">{successData.teamName}</span>
          </div>
          <div className="p-3 bg-[#FAF8F2] border border-[#E8C766] text-[#8C6B14] rounded-xl text-xs font-sans leading-relaxed text-center shadow-sm">
            <span className="font-gaming font-black tracking-wider block mb-1 text-[#8C6B14]">⚠️ ACTION REQUIRED</span>
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
            className="px-8 py-3 bg-[#4F7CAC] hover:bg-[#3D638D] font-gaming text-white font-bold tracking-wider rounded-xl transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer"
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
      <div className="w-full max-w-5xl bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(232,199,102,0.15)]">

        {/* HEADER SECTION (Banner Image) */}
        <div className="relative border-b border-[#E5E7EB] overflow-hidden">
          <img
            src="/banner.jpg"
            alt="The Shield Showdown Banner"
            className="w-full h-auto block object-cover"
          />
        </div>

        {/* TIMER BAR (If enabled) */}
        {timerConfig.isEnabled && (
          <div className="border-b border-[#E5E7EB] bg-[#EEF5FA] p-5 font-sans relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-gaming font-bold text-xs text-[#4F7CAC] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E8C766]" /> {timerConfig.title || 'Registration Closes In'}
              </h3>

              {isExpired || timerConfig.isClosed ? (
                <div className="px-4 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 font-gaming font-black text-xs tracking-wider uppercase">
                  CLOSED
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="grid grid-cols-4 gap-2 text-center min-w-[220px]">
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 min-w-[50px] shadow-sm">
                      <span className="block font-gaming font-black text-lg text-[#243B53] leading-none">{timeLeft.days}</span>
                      <span className="text-[8px] uppercase tracking-wider text-[#4F7CAC] font-bold">Days</span>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 min-w-[50px] shadow-sm">
                      <span className="block font-gaming font-black text-lg text-[#243B53] leading-none">{timeLeft.hours}</span>
                      <span className="text-[8px] uppercase tracking-wider text-[#4F7CAC] font-bold">Hours</span>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 min-w-[50px] shadow-sm">
                      <span className="block font-gaming font-black text-lg text-[#243B53] leading-none">{timeLeft.minutes}</span>
                      <span className="text-[8px] uppercase tracking-wider text-[#4F7CAC] font-bold">Min</span>
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 min-w-[50px] shadow-sm">
                      <span className="block font-gaming font-black text-lg text-[#243B53] leading-none">{timeLeft.seconds}</span>
                      <span className="text-[8px] uppercase tracking-wider text-[#4F7CAC] font-bold">Sec</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#243B53]/70 font-sans font-mono whitespace-nowrap">
                    Deadline: {new Date(timerConfig.targetDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INVITED TEAMS MARQUEE (If any exist) */}
        {invitedTeams.length > 0 && (
          <div className="border-b border-[#E5E7EB] bg-[#F7F9FB] p-6 font-sans relative overflow-hidden">
            <h3 className="font-gaming font-black text-xs text-[#4F7CAC] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-[#E8C766] animate-pulse" /> CHAMPIONS & INVITED TEAMS
            </h3>

            <div className="marquee-container marquee-container-light">
              <div className="marquee-content">
                {marqueeItems.map((team, idx) => (
                  <div
                    key={`${team.id}-${idx}`}
                    className="flex-shrink-0 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-xl p-3 w-28 h-20 shadow-sm hover:border-[#4F7CAC] hover:shadow-md hover:scale-105 transition-all duration-300"
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

        {/* FORM FIELDS */}
        {isFormDisabled ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="relative mb-8">
              {/* Subtle Glowing Aura */}
              <div className="absolute inset-0 bg-[#E8C766]/20 blur-3xl rounded-full scale-125" />

              {/* Inner Shield frame */}
              <div className="relative bg-[#EEF5FA] border-2 border-[#E8C766] rounded-full p-8 shadow-lg flex items-center justify-center">
                <Shield className="w-20 h-20 text-[#E8C766] animate-pulse" strokeWidth={1.5} />
                <div className="absolute -bottom-1 -right-1 bg-[#4F7CAC] border-2 border-white rounded-full p-2.5 shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-gaming font-black text-3xl md:text-5xl text-[#243B53] tracking-widest uppercase italic mb-3">
              REGISTRATION <span className="text-[#4F7CAC]">CLOSED</span>
            </h2>

            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#E8C766] to-transparent w-48 mx-auto mb-6" />

            {/* Message */}
            <p className="max-w-xl text-[#243B53]/80 font-sans text-sm md:text-base leading-relaxed mb-8">
              The battle lines are drawn and the arenas are set. Sign-ups for <span className="text-[#243B53] font-bold font-gaming tracking-wide">The Shield Showdown</span> have officially ended. We want to thank all of the competitive teams who stepped up to register!
            </p>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-10 font-sans text-left">
              <div className="bg-[#EEF5FA] border border-[#E5E7EB] rounded-xl p-5 hover:border-[#4F7CAC]/40 transition-all duration-300 shadow-sm">
                <h4 className="font-gaming font-bold text-xs text-[#4F7CAC] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#E8C766]" /> Registered Teams
                </h4>
                <p className="text-xs text-[#243B53]/70 leading-relaxed">
                  All submitted registrations are currently undergoing database verification. Verified team brackets will be published soon.
                </p>
              </div>
              <div className="bg-[#EEF5FA] border border-[#E5E7EB] rounded-xl p-5 hover:border-[#4F7CAC]/40 transition-all duration-300 shadow-sm">
                <h4 className="font-gaming font-bold text-xs text-[#4F7CAC] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#E8C766]" /> Discord Verification
                </h4>
                <p className="text-xs text-[#243B53]/70 leading-relaxed">
                  If you submitted your registration, please check your email and make sure your team leader has submitted verification in our Discord channel.
                </p>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
              <a
                href="https://discord.gg/MK7eQZayxd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#4F7CAC] hover:bg-[#3D638D] font-gaming text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 text-center cursor-pointer"
              >
                Join Discord Server
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="p-6 md:p-10 space-y-8 bg-white">

            {/* Expired Warning Banner */}
            {isFormDisabled && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 font-sans text-sm shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
                <div className="flex-grow text-left">
                  <span className="font-gaming font-black tracking-wider block text-rose-900 text-base mb-1">REGISTRATION HAS ENDED</span>
                  <span>The tournament registration window has officially closed. Submissions are no longer accepted.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 font-sans text-sm shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECTION 1: TEAM DETAILS */}
            <div className="bg-[#F7F9FB] border border-[#E5E7EB] rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
                <h2 className="font-gaming font-bold text-base md:text-lg text-[#4F7CAC] uppercase tracking-wider">
                  TEAM DETAILS
                </h2>
                <div className="text-[#E8C766] font-mono tracking-widest text-sm font-bold">////</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                {/* Team Name */}
                <div>
                  <label className="block text-xs font-bold text-[#243B53] uppercase tracking-wider mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isFormDisabled}
                    {...register('teamName', { required: 'Team Name is required' })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'Your team name'}
                    className={`w-full form-input-light ${errors.teamName ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                  />
                  {errors.teamName && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.teamName.message}
                    </p>
                  )}
                </div>

                {/* Team Leader Name */}
                <div>
                  <label className="block text-xs font-bold text-[#243B53] uppercase tracking-wider mb-2">
                    Team Leader Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isFormDisabled}
                    {...register('teamLeaderName', { required: 'Team Leader Name is required' })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'Team leader full name'}
                    className={`w-full form-input-light ${errors.teamLeaderName ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                  />
                  {errors.teamLeaderName && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.teamLeaderName.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#243B53] uppercase tracking-wider mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={isFormDisabled}
                    {...register('email', {
                      required: 'Email Address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    placeholder={isFormDisabled ? 'Registration Closed' : 'official@team.com'}
                    className={`w-full form-input-light ${errors.email ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: PLAYER DETAILS (5 PLAYERS) */}
            <div className="bg-[#F7F9FB] border border-[#E5E7EB] rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
                <h2 className="font-gaming font-bold text-base md:text-lg text-[#4F7CAC] uppercase tracking-wider">
                  PLAYER DETAILS (5 PLAYERS)
                </h2>
                <div className="text-[#E8C766] font-mono tracking-widest text-sm font-bold">////</div>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[0, 1, 2, 3, 4].map((index) => {
                  const isOptional = index === 4;
                  return (
                    <div
                      key={index}
                      className={`bg-[#EEF5FA] border rounded-xl p-4 space-y-4 shadow-sm transition-all duration-300 ${isOptional
                          ? 'border-[#E5E7EB] hover:border-[#E8C766]'
                          : 'border-[#E5E7EB] hover:border-[#4F7CAC]/60'
                        }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                        <h3 className="font-gaming font-black text-xs text-[#243B53] tracking-widest">
                          PLAYER {index + 1}
                        </h3>
                        {isOptional ? (
                          <span className="text-[9px] bg-[#FAF8F2] text-[#8C6B14] border border-[#E8C766] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-gaming shadow-xs">
                            Optional
                          </span>
                        ) : (
                          <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-gaming shadow-xs">
                            Required
                          </span>
                        )}
                      </div>

                      {/* Player Name */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-[#243B53] mb-1 font-bold">
                          Name In-Game
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          {...register(`players.${index}.playerName`, { required: (index < 4 || isP5Active) ? 'Name In-Game is required' : false })}
                          placeholder={isFormDisabled ? 'Closed' : 'IGN'}
                          className={`w-full form-input-light-sm ${errors.players?.[index]?.playerName ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                        />
                        {errors.players?.[index]?.playerName && (
                          <p className="text-red-600 text-[10px] mt-1 font-sans font-medium">Required</p>
                        )}
                      </div>

                      {/* Player ID */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-[#243B53] mb-1 font-bold">
                          Player ID (UID)
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          {...register(`players.${index}.playerUID`, {
                            required: (index < 4 || isP5Active) ? 'Player ID is required' : false,
                            pattern: {
                              value: (index < 4 || isP5Active) ? /^[0-9]+$/ : /^(|[0-9]+)$/,
                              message: 'Numbers only'
                            }
                          })}
                          placeholder={isFormDisabled ? 'Closed' : '12345678'}
                          className={`w-full form-input-light-sm ${errors.players?.[index]?.playerUID ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                        />
                        {errors.players?.[index]?.playerUID && (
                          <p className="text-red-600 text-[10px] mt-1 font-sans font-medium">
                            {errors.players[index].playerUID.message || 'Required'}
                          </p>
                        )}
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-[10px] uppercase font-gaming text-[#243B53] mb-1 font-bold">
                          Player Role
                        </label>
                        <select
                          disabled={isFormDisabled}
                          {...register(`players.${index}.role`, { required: (index < 4 || isP5Active) ? 'Role is required' : false })}
                          className={`w-full form-input-light-sm cursor-pointer ${errors.players?.[index]?.role ? '!border-red-500 focus:!ring-red-500/20' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                        >
                          <option value="">Select Role</option>
                          <option value="IGL">IGL</option>
                          <option value="Rusher">Rusher</option>
                          <option value="Sniper">Sniper</option>
                          <option value="Support">Support</option>
                        </select>
                        {errors.players?.[index]?.role && (
                          <p className="text-red-600 text-[10px] mt-1 font-sans font-medium">Required</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: SOCIAL MEDIA FOLLOW PROOFS */}
            <div className="bg-[#F7F9FB] border border-[#E5E7EB] rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
                <h2 className="font-gaming font-bold text-base md:text-lg text-[#4F7CAC] uppercase tracking-wider">
                  SOCIAL MEDIA FOLLOW PROOFS (MANDATORY)
                </h2>
                <div className="text-[#E8C766] font-mono tracking-widest text-sm font-bold">////</div>
              </div>

              <p className="text-[#243B53]/80 text-xs md:text-sm font-sans">
                Your team must follow our YouTube and Instagram. Upload screenshots verifying follow/subscription for Player 1 and Player 2.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">

                {/* YOUTUBE PROOF */}
                <div className="bg-[#EEF5FA] border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-5 pb-3 border-b border-[#E5E7EB]">
                      <div className="flex items-start gap-3">
                        {/* YouTube Icon */}
                        <div className="w-9 h-9 bg-[#FF0000] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0-9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-gaming font-bold text-xs text-[#243B53] uppercase tracking-wider flex items-center gap-1.5">
                            YOUTUBE PROOFS <span className="text-red-500">*</span>
                          </h3>
                          <p className="text-[#243B53]/60 text-[10px] leading-relaxed mt-1">
                            Channel name & Subscribed must be visible.
                          </p>
                        </div>
                      </div>

                      {/* REDIRECT YT BUTTON */}
                      <a
                        href="https://youtu.be/YzaBVJJIxhE?is=kn_qD24OIbDlbKYq"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000] hover:bg-[#D90000] rounded-lg text-xs font-bold text-white transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        Subscribe Channel <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Individual Upload Fields Grid */}
                    <div className="space-y-3">
                      {[...Array(proofRequiredCount)].map((_, idx) => {
                        const file = ytFiles[idx];
                        const preview = ytPreviews[idx];
                        const playerName = watch(`players.${idx}.playerName`) || "";
                        const playerRole = watch(`players.${idx}.role`) || "";
                        const isReady = watch(`players.${idx}.playerName`)?.trim() &&
                          watch(`players.${idx}.playerUID`)?.trim() &&
                          watch(`players.${idx}.role`);

                        return (
                          <div
                            key={idx}
                            id={`yt-file-container-${idx}`}
                            className={`bg-white border rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors shadow-xs ${showUploadErrors && !file
                                ? 'border-red-500 bg-rose-50/50'
                                : 'border-[#E5E7EB]'
                              }`}
                          >
                            <div className="flex items-center gap-2 flex-grow min-w-0">
                              <User className="w-4 h-4 text-[#4F7CAC] shrink-0" />
                              <div className="flex-grow flex items-center gap-1.5">
                                <input
                                  type="text"
                                  disabled={isFormDisabled}
                                  value={playerName}
                                  onChange={(e) => setValue(`players.${idx}.playerName`, e.target.value, { shouldValidate: true })}
                                  placeholder={isFormDisabled ? 'Closed' : `Player ${idx + 1} Name`}
                                  className={`form-input-light-sm !py-1 !px-2 ${errors.players?.[idx]?.playerName ? '!border-red-500' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                                />
                                {playerRole && (
                                  <span className="text-[9px] bg-[#DCEAF4] text-[#243B53] border border-[#4F7CAC]/25 px-1.5 py-0.5 rounded font-mono shrink-0 font-bold">
                                    {playerRole}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {file ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative w-8 h-8 rounded border border-[#E5E7EB] overflow-hidden bg-slate-100 shadow-inner">
                                    <img src={preview} alt="Youtube Proof" className="w-full h-full object-cover" />
                                  </div>
                                  <button
                                    type="button"
                                    disabled={isFormDisabled}
                                    onClick={() => removeSlotFile(idx, 'youtube')}
                                    className={`p-1 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer transition-colors ${isFormDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title="Remove File"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-emerald-600 font-bold flex items-center gap-0.5 font-gaming text-[9px] uppercase tracking-wider">
                                    <Check className="w-3.5 h-3.5 stroke-[3.5]" /> Done
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <label
                                    htmlFor={`yt-file-${idx}`}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${isReady && !isFormDisabled
                                        ? 'bg-[#DCEAF4] hover:bg-[#C9E0EF] border-[#4F7CAC]/30 text-[#243B53] cursor-pointer shadow-xs'
                                        : 'bg-slate-100 border-[#E5E7EB] text-slate-400 opacity-50 cursor-not-allowed pointer-events-none'
                                      }`}
                                  >
                                    <Upload className="w-3 h-3 text-[#4F7CAC]" /> Upload
                                  </label>
                                  <input
                                    id={`yt-file-${idx}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSlotFileChange(e, idx, 'youtube')}
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

                {/* INSTAGRAM PROOF */}
                <div className="bg-[#EEF5FA] border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-5 pb-3 border-b border-[#E5E7EB]">
                      <div className="flex items-start gap-3">
                        {/* Instagram Icon */}
                        <div className="w-9 h-9 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5 text-white stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-gaming font-bold text-xs text-[#243B53] uppercase tracking-wider flex items-center gap-1.5">
                            INSTAGRAM PROOFS <span className="text-red-500">*</span>
                          </h3>
                          <p className="text-[#243B53]/60 text-[10px] leading-relaxed mt-1">
                            Username & Followed status must be visible.
                          </p>
                        </div>
                      </div>

                      {/* REDIRECT INSTA BUTTON */}
                      <a
                        href="https://www.instagram.com/theshieldesports10/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        Follow Instagram <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Individual Upload Fields Grid */}
                    <div className="space-y-3">
                      {[...Array(proofRequiredCount)].map((_, idx) => {
                        const file = igFiles[idx];
                        const preview = igPreviews[idx];
                        const playerName = watch(`players.${idx}.playerName`) || "";
                        const playerRole = watch(`players.${idx}.role`) || "";
                        const isReady = watch(`players.${idx}.playerName`)?.trim() &&
                          watch(`players.${idx}.playerUID`)?.trim() &&
                          watch(`players.${idx}.role`);

                        return (
                          <div
                            key={idx}
                            id={`ig-file-container-${idx}`}
                            className={`bg-white border rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors shadow-xs ${showUploadErrors && !file
                                ? 'border-red-500 bg-rose-50/50'
                                : 'border-[#E5E7EB]'
                              }`}
                          >
                            <div className="flex items-center gap-2 flex-grow min-w-0">
                              <User className="w-4 h-4 text-[#4F7CAC] shrink-0" />
                              <div className="flex-grow flex items-center gap-1.5">
                                <input
                                  type="text"
                                  disabled={isFormDisabled}
                                  value={playerName}
                                  onChange={(e) => setValue(`players.${idx}.playerName`, e.target.value, { shouldValidate: true })}
                                  placeholder={isFormDisabled ? 'Closed' : `Player ${idx + 1} Name`}
                                  className={`form-input-light-sm !py-1 !px-2 ${errors.players?.[idx]?.playerName ? '!border-red-500' : ''} ${isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                                />
                                {playerRole && (
                                  <span className="text-[9px] bg-[#DCEAF4] text-[#243B53] border border-[#4F7CAC]/25 px-1.5 py-0.5 rounded font-mono shrink-0 font-bold">
                                    {playerRole}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {file ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative w-8 h-8 rounded border border-[#E5E7EB] overflow-hidden bg-slate-100 shadow-inner">
                                    <img src={preview} alt="Instagram Proof" className="w-full h-full object-cover" />
                                  </div>
                                  <button
                                    type="button"
                                    disabled={isFormDisabled}
                                    onClick={() => removeSlotFile(idx, 'instagram')}
                                    className={`p-1 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer transition-colors ${isFormDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title="Remove File"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-emerald-600 font-bold flex items-center gap-0.5 font-gaming text-[9px] uppercase tracking-wider">
                                    <Check className="w-3.5 h-3.5 stroke-[3.5]" /> Done
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <label
                                    htmlFor={`ig-file-${idx}`}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${isReady && !isFormDisabled
                                        ? 'bg-[#DCEAF4] hover:bg-[#C9E0EF] border-[#4F7CAC]/30 text-[#243B53] cursor-pointer shadow-xs'
                                        : 'bg-slate-100 border-[#E5E7EB] text-slate-400 opacity-50 cursor-not-allowed pointer-events-none'
                                      }`}
                                  >
                                    <Upload className="w-3 h-3 text-[#4F7CAC]" /> Upload
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
              </div>

              {/* Warning Banner */}
              <div className="bg-[#FAF8F2] border border-[#E8C766] rounded-xl p-3.5 text-center shadow-xs">
                <p className="text-[#8C6B14] text-xs md:text-sm font-gaming font-bold tracking-widest flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#8C6B14] animate-pulse" />
                  WITHOUT PROOFS, YOUR TEAM WILL NOT BE REGISTERED.
                </p>
              </div>
            </div>

            {/* SECTION 4: TERMS & CONDITIONS */}
            <div className="bg-[#F7F9FB] border border-[#E5E7EB] rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
                <h2 className="font-gaming font-bold text-base md:text-lg text-[#4F7CAC] uppercase tracking-wider">
                  TERMS & CONDITIONS
                </h2>
                <div className="text-[#E8C766] font-mono tracking-widest text-sm font-bold">////</div>
              </div>

              <div id="terms-container" className="flex items-start gap-3 cursor-pointer select-none font-sans">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    {...register('termsAccepted', { required: 'You must accept the terms and conditions' })}
                    className="sr-only peer"
                    id="terms-check"
                    disabled={isFormDisabled}
                  />
                  <label
                    htmlFor="terms-check"
                    className={`w-5 h-5 bg-white border-2 rounded-md flex items-center justify-center transition-all ${isFormDisabled ? 'border-[#E5E7EB] cursor-not-allowed opacity-55' : 'cursor-pointer'
                      } ${watchTerms && !isFormDisabled ? 'border-[#4F7CAC] bg-[#4F7CAC] shadow-sm' : 'border-[#E5E7EB] hover:border-[#4F7CAC]'
                      }`}
                  >
                    {watchTerms && !isFormDisabled && <Check className="w-3.5 h-3.5 text-white font-black stroke-[3.5]" />}
                  </label>
                </div>
                <label htmlFor="terms-check" className={`text-xs md:text-sm transition-colors leading-relaxed ${isFormDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-[#243B53] hover:text-[#4F7CAC] cursor-pointer'
                  }`}>
                  I agree to all the rules and regulations of The Shield Showdown. All details provided are correct and my team is ready to participate.
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-600 text-xs flex items-center gap-1 font-medium -mt-2 pl-8 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.termsAccepted.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex flex-col items-center pt-2">
              {/* Submit Requirements State message */}
              {!allProofsUploaded && !loading && !isFormDisabled && (
                <p className="text-[#243B53]/70 text-[11px] md:text-xs font-gaming uppercase tracking-wide text-center mb-4 leading-relaxed max-w-md animate-pulse">
                  <span className="text-[#4F7CAC] font-black">Upload Proof Status:</span> YouTube ({activeYtFiles.filter(Boolean).length}/{proofRequiredCount}) &bull; Instagram ({activeIgFiles.filter(Boolean).length}/{proofRequiredCount})<br />
                  <span className="text-rose-600 text-[10px] font-sans lowercase font-medium">(please upload follow screenshots for Player 1 and Player 2 before submitting)</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full max-w-sm font-gaming font-black uppercase text-sm md:text-base tracking-widest py-3.5 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-md ${isSubmitDisabled
                    ? 'bg-slate-200 text-slate-400 border border-[#E5E7EB] opacity-60 cursor-not-allowed'
                    : 'bg-softgold-gradient hover:brightness-105 text-[#243B53] cursor-pointer transform hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(232,199,102,0.4)] hover:shadow-[0_6px_20px_rgba(232,199,102,0.6)]'
                  }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-[#243B53] animate-spin" />
                    Submitting...
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
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INSTRUCTIONS CARD */}
        <div className="bg-[#EEF5FA]/95 backdrop-blur-md border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.35)] relative overflow-hidden font-sans">
          <h3 className="font-gaming font-bold text-xs text-[#4F7CAC] uppercase tracking-wider mb-4 border-b border-[#E5E7EB] pb-2">
            REGISTRATION GUIDE
          </h3>
          <ul className="text-xs text-[#243B53] space-y-3 list-none pl-0">
            <li className="flex gap-2">
              <span className="text-[#E8C766] font-gaming font-black text-sm">01.</span>
              <span>Input your Team Name, Leader Name, Leader UID and Discord.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#E8C766] font-gaming font-black text-sm">02.</span>
              <span>Provide information for at least 4 squad members (Player 5 is optional).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#E8C766] font-gaming font-black text-sm">03.</span>
              <span>Upload social screenshots verifying subscription/follows for each player.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#E8C766] font-gaming font-black text-sm">04.</span>
              <span>Check "Agree" to the terms, click Submit and wait for confirmation.</span>
            </li>
          </ul>
        </div>

        {/* JOIN DISCORD CARD */}
        <div className="bg-[#EEF5FA]/95 backdrop-blur-md border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.35)] text-center flex flex-col justify-between relative overflow-hidden font-sans">
          <div>
            <h4 className="font-gaming font-black text-xs text-[#4F7CAC] uppercase tracking-wider mb-2">
              GLORY AWAITS
            </h4>
            <p className="text-xs text-[#243B53]/80 mb-4 font-sans leading-relaxed">
              Need support or have tournament questions? Connect with our administration team directly.
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
    </div>
  );
}
