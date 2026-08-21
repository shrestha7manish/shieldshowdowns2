import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Search,
  Trash2,
  Eye,
  ShieldAlert,
  AlertTriangle,
  Trophy,
  Clock,
  Save,
  RefreshCw,
  CheckCircle2,
  Upload,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Copy,
  Check,
  X,
  User,
  Shield,
  Award,
  Camera,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ImageModal from '../components/ImageModal';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'today', '5players', 'withProofs'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name_asc', 'name_desc'
  const [search, setSearch] = useState('');

  // Dashboard Stats & Lists
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ totalRegistrations: 0, registrationsToday: 0, totalTeams: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Modals State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteLogoId, setDeleteLogoId] = useState(null);
  const [logoDeleteLoading, setLogoDeleteLoading] = useState(false);
  const [logoDeleteSuccess, setLogoDeleteSuccess] = useState(false);

  // Quick Proof Review Modal State
  const [quickReviewIndex, setQuickReviewIndex] = useState(null); // index in filtered list
  const [copiedRoster, setCopiedRoster] = useState(false);

  // Image Zoom Lightbox
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Timer Settings State
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerTargetDate, setTimerTargetDate] = useState('');
  const [timerTitle, setTimerTitle] = useState('Registration Closes In');
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [timerSaving, setTimerSaving] = useState(false);
  const [timerMessage, setTimerMessage] = useState({ text: '', type: '' });

  // Invited Teams State
  const [invitedTeams, setInvitedTeams] = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoMessage, setLogoMessage] = useState({ text: '', type: '' });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '/uploads') : 'http://localhost:5000/uploads');

  const getImageUrl = (proof) => {
    if (!proof) return '';
    if (proof.startsWith('http://') || proof.startsWith('https://')) {
      return proof;
    }
    return `${IMAGE_BASE_URL}/${proof}`;
  };

  function handleLoginSubmit(e) {
    e.preventDefault();
    if (loginUser === 'admin' && loginPass === 'admin123') {
      setIsLoggedIn(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
      fetchRegistrations();
      fetchTimerSettings();
      fetchInvitedTeams();
    }
  }, [isLoggedIn]);

  // Debounced search fetch
  useEffect(() => {
    if (isLoggedIn) {
      const delayDebounceFn = setTimeout(() => {
        fetchRegistrations();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, isLoggedIn]);

  async function fetchTimerSettings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/timer`);
      if (response.data && response.data.value) {
        const { isEnabled, targetDate, title, isClosed } = response.data.value;
        setTimerEnabled(isEnabled);
        setTimerTitle(title || 'Registration Closes In');
        setRegistrationClosed(!!isClosed);
        if (targetDate) {
          const dateObj = new Date(targetDate);
          if (!isNaN(dateObj.getTime())) {
            const tzoffset = dateObj.getTimezoneOffset() * 60000;
            const localISOTime = new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 16);
            setTimerTargetDate(localISOTime);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching timer settings:', error);
    }
  }

  async function fetchInvitedTeams() {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/invited_teams`);
      if (response.data && response.data.value) {
        setInvitedTeams(response.data.value);
      }
    } catch (error) {
      console.error('Error fetching invited teams:', error);
    }
  }

  async function fetchStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }

  async function fetchRegistrations() {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations`, {
        params: { search }
      });
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setErrorMsg('Failed to load registration data.');
    } finally {
      setLoading(false);
    }
  }

  // Compute duplicate email frequency map
  const { emailCounts, duplicateEmailCount } = useMemo(() => {
    const eMap = {};
    registrations.forEach(r => {
      if (r.email) {
        const cleanEmail = r.email.trim().toLowerCase();
        eMap[cleanEmail] = (eMap[cleanEmail] || 0) + 1;
      }
    });

    const dupEmailEntries = registrations.filter(r => r.email && eMap[r.email.trim().toLowerCase()] > 1);

    return {
      emailCounts: eMap,
      duplicateEmailCount: dupEmailEntries.length
    };
  }, [registrations]);

  // Filter & Sort Logic
  const filteredAndSortedRegistrations = useMemo(() => {
    let list = [...registrations];

    // Quick filter tabs
    if (filterTab === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      list = list.filter(r => new Date(r.submittedAt) >= today);
    } else if (filterTab === 'duplicateEmail') {
      list = list.filter(r => r.email && emailCounts[r.email.trim().toLowerCase()] > 1);
    }

    // Sorting
    list.sort((a, b) => {
      // If filtering by duplicate emails, group same emails together first
      if (filterTab === 'duplicateEmail') {
        const emailCompare = (a.email || '').localeCompare(b.email || '');
        if (emailCompare !== 0) return emailCompare;
      }

      if (sortBy === 'newest') {
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      }
      if (sortBy === 'name_asc') {
        return (a.teamName || '').localeCompare(b.teamName || '');
      }
      if (sortBy === 'name_desc') {
        return (b.teamName || '').localeCompare(a.teamName || '');
      }
      return 0;
    });

    return list;
  }, [registrations, filterTab, sortBy, emailCounts]);

  // Counts for quick filter pills
  const filterCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      all: registrations.length,
      today: registrations.filter(r => new Date(r.submittedAt) >= today).length,
      duplicateEmails: duplicateEmailCount
    };
  }, [registrations, duplicateEmailCount]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRegistrations.length / itemsPerPage));
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRegistrations.slice(start, start + itemsPerPage);
  }, [filteredAndSortedRegistrations, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTab, sortBy, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Keyboard navigation for Quick Proof Review modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (quickReviewIndex === null) return;
      if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        if (quickReviewIndex > 0) setQuickReviewIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        if (quickReviewIndex < filteredAndSortedRegistrations.length - 1) setQuickReviewIndex(prev => prev + 1);
      } else if (e.key === 'Escape' && !modalOpen) {
        setQuickReviewIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickReviewIndex, filteredAndSortedRegistrations.length, modalOpen]);

  const activeReviewItem = quickReviewIndex !== null ? filteredAndSortedRegistrations[quickReviewIndex] : null;

  const openImageZoom = (filename, title) => {
    setModalImageSrc(getImageUrl(filename));
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleCopyRoster = (reg) => {
    if (!reg) return;
    const rosterText = `🏆 Team: ${reg.teamName} (ID: ${reg.registrationId})
👑 Leader: ${reg.teamLeaderName} (${reg.email})
👥 Squad:
${(reg.players || []).map((p, i) => `${i + 1}. ${p.playerName} (UID: ${p.playerUID}) - [${p.role}]`).join('\n')}`;

    navigator.clipboard.writeText(rosterText);
    setCopiedRoster(true);
    setTimeout(() => setCopiedRoster(false), 2000);
  };

  const handleExportToExcel = () => {
    if (filteredAndSortedRegistrations.length === 0) return;

    const dataToExport = filteredAndSortedRegistrations.map((reg) => {
      const row = {
        'Registration ID': reg.registrationId || '',
        'Team Name': reg.teamName || '',
        'Team Leader': reg.teamLeaderName || '',
        'Email': reg.email || '',
        'Submission Date': reg.submittedAt ? new Date(reg.submittedAt).toLocaleString() : '',
        'Total Players': reg.players ? reg.players.length : 0,
        'TikTok Proofs Count': (reg.tiktokProofs || reg.youtubeProofs) ? (reg.tiktokProofs || reg.youtubeProofs).length : 0,
        'Instagram Proofs Count': reg.instagramProofs ? reg.instagramProofs.length : 0
      };

      for (let i = 0; i < 5; i++) {
        const player = reg.players && reg.players[i];
        row[`Player ${i + 1} Name`] = player ? player.playerName : '';
        row[`Player ${i + 1} UID`] = player ? player.playerUID : '';
        row[`Player ${i + 1} Role`] = player ? player.role : '';
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    XLSX.writeFile(workbook, `Shield_Showdown_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  function handleDeleteClick(id) {
    setDeleteId(id);
    setDeleteLoading(false);
    setDeleteSuccess(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteSuccess(false);
    try {
      await axios.delete(`${API_BASE_URL}/registrations/${deleteId}`);
      setRegistrations(prev => prev.filter(r => r._id !== deleteId));
      fetchStats();
      setDeleteSuccess(true);
      if (quickReviewIndex !== null) setQuickReviewIndex(null);
      setTimeout(() => {
        setDeleteId(null);
        setDeleteSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error deleting registration:', error);
      setErrorMsg('Failed to delete registration record.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLogoUploading(true);
    setLogoMessage({ text: '', type: '' });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setLogoMessage({ text: 'Only JPEG, JPG, PNG, and WEBP images are allowed.', type: 'error' });
      setLogoUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoMessage({ text: 'Image size cannot exceed 5MB.', type: 'error' });
      setLogoUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const uploadRes = await axios.post(`${API_BASE_URL}/settings/upload-logo`, formData);

      if (uploadRes.data && uploadRes.data.url) {
        const newLogoUrl = uploadRes.data.url;
        const updatedTeams = [...invitedTeams, { id: Date.now().toString(), logoUrl: newLogoUrl }];
        setInvitedTeams(updatedTeams);
        setLogoSaving(true);
        const saveRes = await axios.post(`${API_BASE_URL}/settings/invited_teams`, { value: updatedTeams });
        if (saveRes.status === 200) {
          setLogoMessage({ text: 'Logo uploaded and saved successfully!', type: 'success' });
        }
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setLogoMessage({ text: error.response?.data?.message || 'Failed to upload logo.', type: 'error' });
    } finally {
      setLogoUploading(false);
      setLogoSaving(false);
      e.target.value = '';
      setTimeout(() => {
        setLogoMessage({ text: '', type: '' });
      }, 5000);
    }
  }

  function handleLogoDelete(id) {
    setDeleteLogoId(id);
    setLogoDeleteLoading(false);
    setLogoDeleteSuccess(false);
  }

  async function confirmLogoDelete() {
    if (!deleteLogoId) return;
    setLogoDeleteLoading(true);
    setLogoDeleteSuccess(false);
    const updatedTeams = invitedTeams.filter(team => team.id !== deleteLogoId);
    try {
      await axios.post(`${API_BASE_URL}/settings/invited_teams`, { value: updatedTeams });
      setInvitedTeams(updatedTeams);
      setLogoDeleteSuccess(true);
      setTimeout(() => {
        setDeleteLogoId(null);
        setLogoDeleteSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error deleting logo:', error);
      setLogoMessage({ text: 'Failed to delete logo setting from database.', type: 'error' });
      setDeleteLogoId(null);
    } finally {
      setLogoDeleteLoading(false);
    }
  }

  async function handleSaveTimerSettings(e) {
    e.preventDefault();
    setTimerSaving(true);
    setTimerMessage({ text: '', type: '' });
    try {
      const targetDateISO = new Date(timerTargetDate).toISOString();
      const payload = {
        value: {
          isEnabled: timerEnabled,
          targetDate: targetDateISO,
          title: timerTitle,
          isClosed: registrationClosed
        }
      };
      await axios.post(`${API_BASE_URL}/settings/timer`, payload);
      setTimerMessage({ text: 'Timer settings updated successfully!', type: 'success' });
      setTimeout(() => {
        setTimerMessage({ text: '', type: '' });
      }, 5000);
    } catch (error) {
      console.error('Error saving timer settings:', error);
      setTimerMessage({ text: error.response?.data?.message || 'Failed to save timer settings.', type: 'error' });
    } finally {
      setTimerSaving(false);
    }
  }

  // Login View Wrapper
  if (!isLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#060608]/95 border-2 border-gold/40 rounded-xl p-8 shadow-2xl relative overflow-hidden font-sans">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />

          <div className="text-center mb-6">
            <Trophy className="w-12 h-12 text-gold-bright mx-auto filter drop-shadow-[0_0_12px_rgba(255,215,0,0.5)] mb-3" />
            <h2 className="font-gaming font-black text-xl text-white tracking-widest uppercase">
              ADMIN PANEL ACCESS
            </h2>
            <p className="text-[10px] text-gray-500 font-gaming uppercase tracking-widest mt-1">
              The Shield Showdown
            </p>
          </div>

          {loginError && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 p-3 rounded mb-5 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-[#141416] border border-gold/20 rounded p-3 text-white text-sm focus:outline-none focus:border-gold-bright transition-all placeholder-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#141416] border border-gold/20 rounded p-3 text-white text-sm focus:outline-none focus:border-gold-bright transition-all placeholder-slate-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gold-gradient hover:brightness-110 font-gaming font-black text-black uppercase tracking-widest py-3.5 rounded shadow-gold-glow hover:shadow-gold-glow-btn transition-all duration-300 flex items-center justify-center cursor-pointer font-bold"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-gaming font-black text-2xl md:text-3xl text-white tracking-wider uppercase flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-gold-bright" /> Admin <span className="text-gold-bright">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-sans mt-1">
            Manage registrations, quickly inspect screenshot proofs, and configure tournament controls.
          </p>
        </div>

        {/* Exports & Logout Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportToExcel}
            disabled={filteredAndSortedRegistrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-gaming text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 rounded font-bold transition-all cursor-pointer shadow-lg disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-white" /> Export to Excel ({filteredAndSortedRegistrations.length})
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-gaming text-white bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded font-bold transition-all cursor-pointer shadow-lg"
          >
            Registration Form
          </Link>
          <button
            onClick={() => {
              setIsLoggedIn(false);
              sessionStorage.removeItem('admin_logged_in');
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-gaming text-white bg-red-600 hover:bg-red-500 rounded font-bold transition-all cursor-pointer shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* TOTAL REGISTRATIONS */}
        <div className="bg-[#0b0c10]/95 border border-gold/15 rounded-xl p-6 relative overflow-hidden flex items-center gap-4 shadow-xl">
          <div className="absolute top-0 left-0 w-1 bg-gold h-full" />
          <div className="bg-gold/10 p-3 rounded-lg border border-gold/20">
            <Users className="w-6 h-6 text-gold-bright" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-gaming text-gray-400 tracking-wider">Total Registrations</span>
            <span className="font-gaming font-black text-3xl text-white mt-0.5 block">{stats.totalRegistrations}</span>
          </div>
        </div>

        {/* REGISTRATIONS TODAY */}
        <div className="bg-[#0b0c10]/95 border border-gold/15 rounded-xl p-6 relative overflow-hidden flex items-center gap-4 shadow-xl">
          <div className="absolute top-0 left-0 w-1 bg-gold h-full" />
          <div className="bg-gold/10 p-3 rounded-lg border border-gold/20">
            <Calendar className="w-6 h-6 text-gold-bright" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-gaming text-gray-400 tracking-wider">Registrations Today</span>
            <span className="font-gaming font-black text-3xl text-white mt-0.5 block">{stats.registrationsToday}</span>
          </div>
        </div>

        {/* TOTAL UNIQUE TEAMS */}
        <div className="bg-[#0b0c10]/95 border border-gold/15 rounded-xl p-6 relative overflow-hidden flex items-center gap-4 shadow-xl">
          <div className="absolute top-0 left-0 w-1 bg-gold h-full" />
          <div className="bg-gold/10 p-3 rounded-lg border border-gold/20">
            <Trophy className="w-6 h-6 text-gold-bright" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-gaming text-gray-400 tracking-wider">Unique Teams</span>
            <span className="font-gaming font-black text-3xl text-white mt-0.5 block">{stats.totalTeams}</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mb-8">

        {/* Left 3/4 columns: Search, Filters + Table */}
        <div className="lg:col-span-3 space-y-6">

          {/* FILTER SEARCH & CONTROLS BAR */}
          <div className="bg-[#0b0c10]/95 border border-gold/20 rounded-xl p-5 shadow-xl space-y-4">
            {/* Search + Sort + Rows Per Page */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, Team, Leader, Email, Player Name, or UID..."
                  className="w-full bg-[#121318] border border-slate-700 hover:border-gold/30 focus:border-gold-bright focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-white text-xs md:text-sm transition-all placeholder-slate-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-[#121318] border border-slate-700 rounded-lg px-3 py-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gold-bright shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="newest" className="bg-[#121318] text-white">Newest First</option>
                    <option value="oldest" className="bg-[#121318] text-white">Oldest First</option>
                    <option value="name_asc" className="bg-[#121318] text-white">Team Name (A-Z)</option>
                    <option value="name_desc" className="bg-[#121318] text-white">Team Name (Z-A)</option>
                  </select>
                </div>

                {/* Items Per Page */}
                <div className="flex items-center gap-1 bg-[#121318] border border-slate-700 rounded-lg px-2.5 py-2 text-xs">
                  <span className="text-gray-400 text-[11px]">Rows:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-transparent text-gold-bright font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value={10} className="bg-[#121318] text-white">10</option>
                    <option value={25} className="bg-[#121318] text-white">25</option>
                    <option value={50} className="bg-[#121318] text-white">50</option>
                    <option value={100} className="bg-[#121318] text-white">100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-gaming text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-gold" /> Filter:
              </span>

              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'all'
                    ? 'bg-gold-gradient text-black font-bold shadow-gold-glow'
                    : 'bg-[#14151c] text-gray-300 hover:bg-[#1e202a] border border-slate-750'
                }`}
              >
                All Teams <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'all' ? 'bg-black text-gold' : 'bg-slate-800 text-gray-400'}`}>{filterCounts.all}</span>
              </button>

              <button
                onClick={() => setFilterTab('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'today'
                    ? 'bg-gold-gradient text-black font-bold shadow-gold-glow'
                    : 'bg-[#14151c] text-gray-300 hover:bg-[#1e202a] border border-slate-750'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Today Only <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'today' ? 'bg-black text-gold' : 'bg-slate-800 text-gray-400'}`}>{filterCounts.today}</span>
              </button>

              {/* DUPLICATE EMAILS FILTER PILL */}
              <button
                onClick={() => setFilterTab('duplicateEmail')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'duplicateEmail'
                    ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : filterCounts.duplicateEmails > 0
                      ? 'bg-amber-950/35 text-amber-300 hover:bg-amber-900/50 border border-amber-500/40'
                      : 'bg-[#14151c] text-gray-400 hover:bg-[#1e202a] border border-slate-750'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${filterTab === 'duplicateEmail' ? 'text-black' : 'text-amber-400'}`} />
                Duplicate Emails <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'duplicateEmail' ? 'bg-black text-amber-400' : 'bg-amber-900/60 text-amber-300'}`}>{filterCounts.duplicateEmails}</span>
              </button>
              {/* Reset Filters shortcut */}
              {(filterTab !== 'all' || search || sortBy !== 'newest') && (
                <button
                  onClick={() => {
                    setFilterTab('all');
                    setSearch('');
                    setSortBy('newest');
                  }}
                  className="ml-auto text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* REGISTRATIONS LIST TABLE */}
          <div className="bg-[#0b0c10]/95 border border-gold/20 rounded-xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-4 border-gold/30 border-t-gold-bright rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-gaming text-sm">Querying Database...</p>
              </div>
            ) : errorMsg ? (
              <div className="py-16 text-center text-red-400">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-500" />
                <p className="font-medium">{errorMsg}</p>
              </div>
            ) : filteredAndSortedRegistrations.length === 0 ? (
              <div className="py-20 text-center text-gray-500 font-sans">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm">No tournament registrations found matching your filters.</p>
                <button
                  onClick={() => { setFilterTab('all'); setSearch(''); }}
                  className="mt-3 text-xs text-gold-bright hover:underline cursor-pointer"
                >
                  Clear search and filters
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/70 border-b border-gold/20 text-[11px] font-gaming text-gold-bright uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-bold">ID</th>
                        <th className="py-3.5 px-4 font-bold">Team Name</th>
                        <th className="py-3.5 px-4 font-bold">Leader</th>
                        <th className="py-3.5 px-4 font-bold">Date</th>
                        <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-xs">
                      {paginatedRegistrations.map((reg, rowIdx) => {
                        const globalIdx = (currentPage - 1) * itemsPerPage + rowIdx;

                        return (
                          <tr
                            key={reg._id}
                            className="hover:bg-[#161720] transition-colors group"
                          >
                            {/* ID */}
                            <td className="py-3.5 px-4 font-gaming font-bold text-white tracking-wider whitespace-nowrap">
                              <span className="text-gold-bright">{reg.registrationId}</span>
                            </td>

                            {/* Team Name & Email */}
                            <td className="py-3.5 px-4 font-semibold text-white">
                              <div className="font-gaming font-bold text-sm tracking-wide group-hover:text-gold transition-colors">
                                {reg.teamName}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-gray-400 font-sans truncate max-w-[180px]">
                                  {reg.email}
                                </span>
                                {reg.email && emailCounts[reg.email.trim().toLowerCase()] > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearch(reg.email);
                                      setFilterTab('all');
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black font-bold transition-all cursor-pointer select-none"
                                    title={`Duplicate Email Detected (${emailCounts[reg.email.trim().toLowerCase()]} entries)! Click to filter all entries with this email`}
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                                    Duplicate ({emailCounts[reg.email.trim().toLowerCase()]}x)
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Team Leader */}
                            <td className="py-3.5 px-4 text-gray-300 font-medium whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-500" />
                                {reg.teamLeaderName}
                              </div>
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                              {new Date(reg.submittedAt).toLocaleDateString()}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex justify-end items-center gap-2">
                                <button
                                  onClick={() => setQuickReviewIndex(globalIdx)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gold/15 hover:bg-gold text-gold-bright hover:text-black border border-gold/30 rounded text-xs transition-all cursor-pointer font-bold"
                                  title="Quick Proof & Roster Inspector"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Check Proofs
                                </button>

                                <Link
                                  to={`/admin/registration/${reg._id}`}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-650 rounded text-xs transition-all cursor-pointer"
                                  title="Full Details Page"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  onClick={() => handleDeleteClick(reg._id)}
                                  className="p-1.5 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/30 rounded text-xs transition-all cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredAndSortedRegistrations.length > 0 && (
                  <div className="bg-black/60 border-t border-gold/15 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans text-gray-400">
                    <div>
                      Showing{' '}
                      <span className="font-semibold text-white">
                        {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedRegistrations.length)}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold text-white">
                        {Math.min(currentPage * itemsPerPage, filteredAndSortedRegistrations.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-white">
                        {filteredAndSortedRegistrations.length}
                      </span>{' '}
                      filtered teams
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 text-white font-bold transition-all cursor-pointer select-none flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            Math.abs(pageNum - currentPage) <= 1
                          ) {
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 rounded font-gaming font-black border transition-all cursor-pointer ${
                                  currentPage === pageNum
                                    ? 'bg-gold-gradient text-black border-gold font-bold'
                                    : 'bg-slate-900/50 hover:bg-slate-800 text-white border-slate-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }

                          if (
                            pageNum === 2 ||
                            pageNum === totalPages - 1
                          ) {
                            return <span key={pageNum} className="px-1 text-gray-600 select-none">...</span>;
                          }

                          return null;
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 text-white font-bold transition-all cursor-pointer select-none flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right 1/4 column: Timer & Logo Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Registration Control Card */}
          <div className="bg-[#0b0c10]/95 border border-gold/15 rounded-xl p-5 shadow-xl relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
            <h3 className="font-gaming font-bold text-sm text-gold-bright uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" /> Registration Control
            </h3>

            {timerMessage.text && (
              <div className={`p-3 rounded mb-4 text-xs flex items-center gap-2 border ${
                timerMessage.type === 'success'
                  ? 'bg-emerald-950/45 border-emerald-500/35 text-emerald-200'
                  : 'bg-red-950/45 border-red-500/35 text-red-200'
              }`}>
                {timerMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <span className="text-[11px] font-sans">{timerMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveTimerSettings} className="space-y-4">
              {/* Form Status Switch */}
              <div className="border-b border-gold/10 pb-3 mb-3">
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registration Form Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="registration-status"
                    checked={!registrationClosed}
                    onChange={(e) => setRegistrationClosed(!e.target.checked)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor="registration-status"
                    className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative ${
                      !registrationClosed ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-black rounded-full shadow-md transition-transform duration-200 transform ${
                      !registrationClosed ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </label>
                  <span className={`text-xs font-bold transition-colors duration-200 ${
                    !registrationClosed ? 'text-emerald-400' : 'text-red-500'
                  }`}>
                    {!registrationClosed ? 'OPEN (Accepting)' : 'CLOSED'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Timer Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="timer-status"
                    checked={timerEnabled}
                    onChange={(e) => setTimerEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor="timer-status"
                    className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative ${
                      timerEnabled ? 'bg-[#D4AF37]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-black rounded-full shadow-md transition-transform duration-200 transform ${
                      timerEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </label>
                  <span className="text-xs text-gray-300 font-medium">
                    {timerEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Timer Label
                </label>
                <input
                  type="text"
                  required
                  value={timerTitle}
                  onChange={(e) => setTimerTitle(e.target.value)}
                  placeholder="e.g., Registration Closes In"
                  className="w-full bg-[#121214] border border-slate-700 hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:outline-none rounded-lg p-2.5 text-white text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={timerTargetDate}
                  onChange={(e) => setTimerTargetDate(e.target.value)}
                  className="w-full bg-[#121214] border border-slate-700 hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:outline-none rounded-lg p-2.5 text-white text-xs transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={timerSaving}
                className="w-full bg-gold-gradient hover:brightness-110 disabled:opacity-50 text-black font-gaming font-black text-xs uppercase tracking-widest py-3 rounded shadow-gold-glow hover:shadow-gold-glow-btn transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                {timerSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-black" />
                    Save Settings
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Invited Team Logos Setup Card */}
          <div className="bg-[#0b0c10]/95 border border-gold/15 rounded-xl p-5 shadow-xl relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
            <h3 className="font-gaming font-bold text-sm text-gold-bright uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" /> Invited Team Logos
            </h3>

            {logoMessage.text && (
              <div className={`p-3 rounded mb-4 text-xs flex items-center gap-2 border ${
                logoMessage.type === 'success'
                  ? 'bg-emerald-950/45 border-emerald-500/35 text-emerald-200'
                  : 'bg-red-950/45 border-red-500/35 text-red-200'
              }`}>
                {logoMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <span className="text-[11px] font-sans">{logoMessage.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Upload Logo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="invited-logo-file"
                    disabled={logoUploading || logoSaving}
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="invited-logo-file"
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-gold/50 rounded-lg p-3.5 cursor-pointer text-xs text-gray-400 hover:text-white transition-all bg-[#121214]"
                  >
                    {logoUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-gold" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gold" />
                        Choose Logo
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* List of current logos */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Current Logos ({invitedTeams.length})
                </label>
                {invitedTeams.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">No team logos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {invitedTeams.map((team) => (
                      <div key={team.id} className="relative group aspect-square bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
                        <img src={team.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />

                        <button
                          type="button"
                          disabled={logoSaving}
                          onClick={() => handleLogoDelete(team.id)}
                          className="absolute inset-0 bg-red-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-none"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK PROOF REVIEW MODAL (EFFORTLESS PROOF CHECKING) */}
      {activeReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
          <div className="bg-[#0e0f14] border-2 border-gold/40 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn font-sans">

            {/* Modal Header */}
            <div className="bg-[#08090c] border-b border-gold/20 px-6 py-4 flex items-center justify-between gap-4 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-gaming font-black text-xl text-gold-bright tracking-wider">
                  {activeReviewItem.registrationId}
                </span>
                <span className="text-gray-500 font-mono">|</span>
                <span className="font-gaming font-bold text-lg text-white">
                  {activeReviewItem.teamName}
                </span>
              </div>

              {/* Navigation controls & Close */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 mr-2 text-xs font-mono text-gray-400 bg-black/50 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span>Team {quickReviewIndex + 1} of {filteredAndSortedRegistrations.length}</span>
                  <span className="text-gray-600 ml-1">(← / → keys)</span>
                </div>

                <button
                  type="button"
                  disabled={quickReviewIndex === 0}
                  onClick={() => setQuickReviewIndex(prev => prev - 1)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  title="Previous Team (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={quickReviewIndex === filteredAndSortedRegistrations.length - 1}
                  onClick={() => setQuickReviewIndex(prev => prev + 1)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  title="Next Team (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setQuickReviewIndex(null)}
                  className="p-2 bg-slate-800 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">

              {/* Duplicate Email Warning Alert (if any) */}
              {activeReviewItem.email && emailCounts[activeReviewItem.email.trim().toLowerCase()] > 1 && (
                <div className="bg-amber-950/45 border border-amber-500/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-gaming font-bold text-amber-300 block">DUPLICATE EMAIL DETECTED</span>
                      <span>
                        This email address (<strong>{activeReviewItem.email}</strong>) has been used in <strong>{emailCounts[activeReviewItem.email.trim().toLowerCase()]}</strong> different registrations.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch(activeReviewItem.email);
                      setFilterTab('all');
                      setQuickReviewIndex(null);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-gaming font-bold text-[11px] rounded-lg transition-all shadow cursor-pointer shrink-0"
                  >
                    View All ({emailCounts[activeReviewItem.email.trim().toLowerCase()]}) Entries
                  </button>
                </div>
              )}

              {/* Quick Info Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#13141c] border border-gold/15 rounded-xl p-4 text-xs">
                <div>
                  <span className="text-gray-500 uppercase font-gaming text-[10px] block">Team Leader</span>
                  <span className="text-white font-bold text-sm">{activeReviewItem.teamLeaderName}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-gaming text-[10px] block">Email</span>
                  <span className="text-white font-sans text-sm truncate block">{activeReviewItem.email}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <div>
                    <span className="text-gray-500 uppercase font-gaming text-[10px] block">Date</span>
                    <span className="text-gray-300">{new Date(activeReviewItem.submittedAt).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleCopyRoster(activeReviewItem)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gold-bright border border-gold/20 rounded font-gaming font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    {copiedRoster ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedRoster ? 'Copied!' : 'Copy Roster'}
                  </button>
                </div>
              </div>

              {/* Squad Roster Bar */}
              <div className="bg-[#13141c] border border-gold/15 rounded-xl p-4">
                <h4 className="font-gaming font-bold text-xs text-gold-bright uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Squad Roster ({activeReviewItem.players?.length || 0} Players)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {(activeReviewItem.players || []).map((player, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0b0c10] border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-gaming font-bold text-[10px] text-gray-400">P{idx + 1}</span>
                        <span className="px-1.5 py-0.5 bg-slate-800 text-gold font-gaming text-[9px] font-bold rounded">
                          {player.role}
                        </span>
                      </div>
                      <div className="font-bold text-white truncate">{player.playerName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">UID: {player.playerUID}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROOF SCREENSHOTS INSPECTOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* YOUTUBE PROOFS */}
                {/* TIKTOK PROOFS */}
                <div className="bg-[#13141c] border border-gold/15 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-black border border-slate-750 rounded flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.27 6.27 0 0 0 1.96-4.52V8.92a8.28 8.28 0 0 0 4.81 1.52v-3.45a4.85 4.85 0 0 1-1-.3z" />
                        </svg>
                      </div>
                      <h4 className="font-gaming font-bold text-xs text-white uppercase tracking-wider">
                        TikTok Proofs ({(activeReviewItem.tiktokProofs || activeReviewItem.youtubeProofs)?.length || 0})
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-sans">Click screenshot to zoom</span>
                  </div>

                  {(!(activeReviewItem.tiktokProofs || activeReviewItem.youtubeProofs) || (activeReviewItem.tiktokProofs || activeReviewItem.youtubeProofs).length === 0) ? (
                    <p className="text-xs text-red-400 italic py-4 text-center">No TikTok proof uploaded.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeReviewItem.tiktokProofs || activeReviewItem.youtubeProofs).map((proof, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0b0c10] border border-slate-800 hover:border-gold/40 rounded-lg p-2 space-y-1.5 transition-all group/card"
                        >
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span className="font-gaming font-bold text-gold-bright">Player {idx + 1}</span>
                            <button
                              onClick={() => openImageZoom(proof, `${activeReviewItem.teamName} - TikTok Proof ${idx + 1}`)}
                              className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <ZoomIn className="w-3 h-3" /> Zoom
                            </button>
                          </div>
                          <div
                            onClick={() => openImageZoom(proof, `${activeReviewItem.teamName} - TikTok Proof ${idx + 1}`)}
                            className="aspect-video bg-black rounded overflow-hidden relative cursor-zoom-in border border-slate-850"
                          >
                            <img
                              src={getImageUrl(proof)}
                              alt="TikTok Proof"
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* INSTAGRAM PROOFS */}
                <div className="bg-[#13141c] border border-gold/15 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      </div>
                      <h4 className="font-gaming font-bold text-xs text-white uppercase tracking-wider">
                        Instagram Proofs ({activeReviewItem.instagramProofs?.length || 0})
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-sans">Click screenshot to zoom</span>
                  </div>

                  {(!activeReviewItem.instagramProofs || activeReviewItem.instagramProofs.length === 0) ? (
                    <p className="text-xs text-red-400 italic py-4 text-center">No Instagram proof uploaded.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeReviewItem.instagramProofs.map((proof, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0b0c10] border border-slate-800 hover:border-gold/40 rounded-lg p-2 space-y-1.5 transition-all group/card"
                        >
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span className="font-gaming font-bold text-gold-bright">Player {idx + 1}</span>
                            <button
                              onClick={() => openImageZoom(proof, `${activeReviewItem.teamName} - IG Proof ${idx + 1}`)}
                              className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <ZoomIn className="w-3 h-3" /> Zoom
                            </button>
                          </div>
                          <div
                            onClick={() => openImageZoom(proof, `${activeReviewItem.teamName} - IG Proof ${idx + 1}`)}
                            className="aspect-video bg-black rounded overflow-hidden relative cursor-zoom-in border border-slate-850"
                          >
                            <img
                              src={getImageUrl(proof)}
                              alt="Instagram Proof"
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#08090c] border-t border-gold/20 px-6 py-4 flex flex-wrap justify-between items-center gap-3 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Link
                  to={`/admin/registration/${activeReviewItem._id}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full Page
                </Link>
                <button
                  onClick={() => handleDeleteClick(activeReviewItem._id)}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold border border-red-900/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Team
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={quickReviewIndex === 0}
                  onClick={() => setQuickReviewIndex(prev => prev - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={quickReviewIndex === filteredAndSortedRegistrations.length - 1}
                  onClick={() => setQuickReviewIndex(prev => prev + 1)}
                  className="px-5 py-2 bg-gold-gradient hover:brightness-110 disabled:opacity-30 text-black font-gaming font-black text-xs rounded-lg transition-all cursor-pointer shadow-gold-glow flex items-center gap-1"
                >
                  Next Team <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN ZOOM/PAN LIGHTBOX */}
      <ImageModal
        isOpen={modalOpen}
        src={modalImageSrc}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`bg-[#0e0f14] border rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            deleteSuccess ? 'border-emerald-500/30' : 'border-red-500/30'
          }`}>
            <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-300 ${
              deleteSuccess ? 'bg-emerald-500' : 'bg-red-600'
            }`} />

            {deleteSuccess ? (
              <div className="text-center py-6 animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-bounce" />
                <h3 className="font-gaming font-black text-lg text-white uppercase tracking-wider mb-2">
                  DELETE SUCCESSFUL
                </h3>
                <p className="text-gray-400 text-xs font-sans">
                  The registration record has been permanently deleted from the database.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-gaming font-bold text-base md:text-lg text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Confirm Deletion
                </h3>
                <p className="text-gray-300 text-sm font-sans mb-6">
                  Are you sure you want to delete this registration? This will permanently erase the database record and delete screenshot upload files off the server. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    disabled={deleteLoading}
                    onClick={() => setDeleteId(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-650 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteLoading}
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Record'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* LOGO DELETE CONFIRMATION MODAL */}
      {deleteLogoId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`bg-[#0e0f14] border rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            logoDeleteSuccess ? 'border-emerald-500/30' : 'border-red-500/30'
          }`}>
            <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-300 ${
              logoDeleteSuccess ? 'bg-emerald-500' : 'bg-red-600'
            }`} />

            {logoDeleteSuccess ? (
              <div className="text-center py-6 animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-bounce" />
                <h3 className="font-gaming font-black text-lg text-white uppercase tracking-wider mb-2">
                  LOGO DELETED
                </h3>
                <p className="text-gray-400 text-xs font-sans">
                  The invited team logo has been successfully deleted from the database.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-gaming font-bold text-base md:text-lg text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Confirm Logo Deletion
                </h3>
                <p className="text-gray-300 text-sm font-sans mb-6">
                  Are you sure you want to delete this invited team logo? This will remove it from the homepage marquee carousel. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    disabled={logoDeleteLoading}
                    onClick={() => setDeleteLogoId(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-650 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={logoDeleteLoading}
                    onClick={confirmLogoDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center gap-2"
                  >
                    {logoDeleteLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Logo'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
