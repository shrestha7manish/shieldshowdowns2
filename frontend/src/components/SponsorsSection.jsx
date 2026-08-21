import React from 'react';
import { Shield, ExternalLink, Sparkles } from 'lucide-react';
import sponsorsData from '../data/sponsorsData';

export default function SponsorsSection() {
  if (!sponsorsData || sponsorsData.length === 0) return null;

  const sponsor = sponsorsData[0];
  const isClickable = Boolean(sponsor.website && sponsor.website !== '#');

  return (
    <div 
      aria-label="Official Tournament Partners"
      className="w-full bg-[#16161a]/95 border border-slate-800/90 hover:border-gold/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 shadow-sm font-sans"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Shield className="w-3 h-3 text-gold" />
          </span>
          <span className="font-gaming font-bold text-[10px] sm:text-[11px] text-gold uppercase tracking-wider">
            OFFICIAL TOURNAMENT PARTNER
          </span>
        </div>

        <a
          href="https://discord.gg/MK7eQZayxd"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-400 hover:text-gold font-gaming font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-2.5 h-2.5 text-gold" />
          <span>Partner with us</span>
        </a>
      </div>

      {/* Main Sponsor Content (Compact Horizontal Bar) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-5">
        {/* Left: Sponsor Logo Box */}
        <div className="w-full sm:w-36 md:w-44 h-14 sm:h-16 flex-shrink-0 bg-black/90 rounded-xl border border-slate-800 flex items-center justify-center p-2 shadow-inner group">
          <img
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            className="max-w-full max-h-full object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Middle: Sponsor Information */}
        <div className="flex-grow text-center sm:text-left min-w-0 space-y-0.5">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h3 className="font-gaming font-black text-xs sm:text-sm text-white tracking-wider uppercase">
              {sponsor.name}
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#1a1a20] border border-slate-800 text-gold font-gaming font-bold uppercase tracking-wider">
              {sponsor.category || 'Official Partner'}
            </span>
          </div>
          {sponsor.tagline && (
            <p className="text-[11px] text-slate-400 font-sans leading-tight truncate sm:whitespace-normal">
              {sponsor.tagline}
            </p>
          )}
        </div>

        {/* Right: Visit Partner CTA Action */}
        {isClickable && (
          <div className="shrink-0 w-full sm:w-auto">
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1a1a20] hover:bg-gold text-gold hover:text-black border border-slate-700 hover:border-gold font-gaming font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
            >
              <span>Visit Partner</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

