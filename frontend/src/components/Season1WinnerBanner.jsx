import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Crown, Sparkles, Maximize2, X, Shield } from 'lucide-react';
import season1WinnerData from '../data/season1WinnerData';

export default function Season1WinnerBanner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(season1WinnerData.bannerImage);

  const handleImageError = () => {
    // If /s1_winner.jpg is not yet found, gracefully fallback to /banner.jpg
    if (imgSrc !== season1WinnerData.fallbackImage) {
      setImgSrc(season1WinnerData.fallbackImage);
    }
  };

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!modalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  return (
    <>
      {/* ========================================================================= */}
      {/* OPTION 1: INLINE TOP SPOTLIGHT BANNER (Under Header / Marquee)            */}
      {/* ========================================================================= */}
      <div className="w-full border-b border-slate-800 bg-[#141418] p-4 sm:p-6 font-sans relative overflow-hidden">
        {/* Subtle background gold ambient glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gold/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          {/* Section Eyebrow & Title */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center shadow-xs">
                <Trophy className="w-4 h-4 text-gold animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-gaming font-black text-xs sm:text-sm text-gold tracking-widest uppercase">
                    {season1WinnerData.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {season1WinnerData.subtitle}
                </p>
              </div>
            </div>

            {/* Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a20] hover:bg-gold text-gold hover:text-black border border-slate-700 hover:border-gold font-gaming font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer shrink-0 group"
            >
              <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Expand Poster</span>
            </button>
          </div>

          {/* Banner Graphic Card (Clickable to open Option 4 Modal) */}
          <div
            onClick={() => setModalOpen(true)}
            className="group relative w-full rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl cursor-pointer bg-[#0c0c10]"
          >
            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden flex items-center justify-center bg-black">
              {/* Blurred atmospheric background */}
              <img
                src={imgSrc}
                onError={handleImageError}
                alt="Season 1 Winner Ambient Backdrop"
                className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-40 scale-125 pointer-events-none"
              />

              {/* Darkening vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none z-10" />

              {/* Crisp Centered Champion Poster */}
              <img
                src={imgSrc}
                onError={handleImageError}
                alt="Season 1 Winner Banner"
                className="relative z-10 max-w-full max-h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] group-hover:scale-[1.03] transition-transform duration-500 rounded-lg"
              />

              {/* Hover overlay with zoom hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
                <span className="px-4 py-2 rounded-xl bg-black/85 border border-gold/60 text-gold font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-glow backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Maximize2 className="w-4 h-4" /> Click to Expand Poster
                </span>
              </div>

              {/* Bottom Champion Name Badge */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
                <span className="px-3 py-1.5 rounded-lg bg-black/85 border border-gold/40 text-white font-gaming font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md flex items-center gap-2 shadow-md">
                  <Crown className="w-4 h-4 text-gold animate-pulse" />
                  {season1WinnerData.teamName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OPTION 4: EXPANDABLE POP-UP CHAMPIONS MODAL (Rendered via React Portal)   */}
      {/* ========================================================================= */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          {/* Click Backdrop to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-xl md:max-w-2xl bg-[#121214] border border-gold/40 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(232,199,102,0.25)] flex flex-col max-h-[92vh] z-10 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-[#16161a] border-b border-slate-800 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-gold" />
                <div>
                  <h3 className="font-gaming font-black text-xs sm:text-sm text-white tracking-wider uppercase">
                    {season1WinnerData.title}
                  </h3>
                  <p className="text-[11px] text-gold font-gaming font-bold uppercase tracking-wider">
                    {season1WinnerData.teamName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="p-3 sm:p-5 overflow-y-auto space-y-3 bg-black/80 flex flex-col items-center">
              <div className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center p-2">
                <img
                  src={imgSrc}
                  onError={handleImageError}
                  alt="Season 1 Winner Full Banner"
                  className="max-w-full h-auto max-h-[62vh] object-contain rounded-lg drop-shadow-2xl"
                />
              </div>

              {/* Description box & close */}
              <div className="w-full p-3 rounded-xl bg-[#16161a] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-sans">
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 hidden sm:block" />
                  <span className="text-[11px] sm:text-xs leading-relaxed">{season1WinnerData.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gold-gradient text-black font-gaming font-bold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shrink-0"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

