import React from 'react';
import { Shield, Sparkles, ExternalLink } from 'lucide-react';
import sponsorsData from '../data/sponsorsData';

export default function SponsorsSection() {
  if (!sponsorsData || sponsorsData.length === 0) return null;

  const isSingle = sponsorsData.length === 1;

  return (
    <section 
      aria-label="Sponsors and Official Partners"
      className="w-full max-w-5xl my-2 relative z-10 font-sans"
    >
      {/* Main Section Card */}
      <div className="bg-[#121214]/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">

        {/* SECTION HEADER (Compact & Elegant) */}
        <div className="text-center max-w-xl mx-auto mb-5 sm:mb-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#1a1a20] border border-slate-800 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8C766]" />
            <span className="font-gaming font-bold text-[9px] sm:text-[10px] text-gold uppercase tracking-widest">
              OUR OFFICIAL PARTNERS
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="font-gaming font-black text-xl sm:text-2xl md:text-3xl text-white tracking-wider uppercase mb-1">
            POWERED BY <span className="text-gold">THE BEST</span>
          </h2>

          {/* Supporting Text */}
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">
            The Shield Showdown Season 2 is proudly supported by our official sponsors and partners.
          </p>
        </div>

        {/* SPONSORS DISPLAY */}
        {isSingle ? (
          /* Single Sponsor: Sleek Horizontal Showcase Banner */
          (() => {
            const sponsor = sponsorsData[0];
            const isClickable = Boolean(sponsor.website && sponsor.website !== '#');
            const CardTag = isClickable ? 'a' : 'div';
            const cardProps = isClickable ? {
              href: sponsor.website,
              target: "_blank",
              rel: "noopener noreferrer",
              title: `Visit ${sponsor.name}`
            } : {};

            return (
              <CardTag
                {...cardProps}
                className="group relative flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-7 p-4 sm:p-5 rounded-xl bg-[#16161a] border border-slate-800 hover:border-gold/60 transition-all duration-300 shadow-md hover:shadow-gold-glow hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Subtle side glow highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block" />

                {/* Left: Sponsor Logo Box */}
                <div className="w-full sm:w-56 md:w-64 h-24 sm:h-28 flex-shrink-0 bg-black/90 rounded-lg border border-slate-800 flex items-center justify-center p-3 shadow-inner">
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className="max-w-full max-h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Middle: Sponsor Information */}
                <div className="flex-grow text-center sm:text-left space-y-1.5 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-gaming font-bold tracking-wider uppercase text-gold px-2.5 py-0.5 rounded-md bg-[#1a1a20] border border-slate-800">
                    <Shield className="w-3 h-3 text-[#E8C766]" />
                    {sponsor.category}
                  </div>
                  <h3 className="font-gaming font-black text-base sm:text-lg text-white group-hover:text-gold tracking-wide uppercase transition-colors">
                    {sponsor.name}
                  </h3>
                  {sponsor.tagline && (
                    <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md">
                      {sponsor.tagline}
                    </p>
                  )}
                </div>

                {/* Right: Visit Partner CTA Action */}
                {isClickable && (
                  <div className="shrink-0 w-full sm:w-auto">
                    <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1a20] group-hover:bg-gold text-gold group-hover:text-black border border-slate-700 group-hover:border-gold font-gaming font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer">
                      Visit Partner <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </CardTag>
            );
          })()
        ) : (
          /* Multi-Sponsor: Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsorsData.map((sponsor, index) => {
              const isClickable = Boolean(sponsor.website && sponsor.website !== '#');
              const CardTag = isClickable ? 'a' : 'div';
              const cardProps = isClickable ? {
                href: sponsor.website,
                target: "_blank",
                rel: "noopener noreferrer",
                title: `Visit ${sponsor.name}`
              } : {};

              return (
                <CardTag
                  key={sponsor.id || index}
                  {...cardProps}
                  className="group flex flex-col justify-between items-center text-center p-4 sm:p-5 rounded-xl bg-[#16161a] border border-slate-800 hover:border-gold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Top Category Badge */}
                  <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-gaming font-bold tracking-wider uppercase text-gold px-2 py-0.5 rounded-md bg-[#121214] border border-slate-800 shadow-xs">
                      <Shield className="w-3 h-3 text-[#E8C766]" />
                      {sponsor.category}
                    </span>

                    {isClickable && (
                      <span className="text-slate-400 group-hover:text-gold transition-colors duration-200">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Sponsor Logo */}
                  <div className="w-full h-24 sm:h-28 flex items-center justify-center p-2 my-1.5 bg-black/90 rounded-lg border border-slate-800 shadow-inner overflow-hidden">
                    <img
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      className="max-w-full max-h-full object-contain rounded transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Name & Tagline */}
                  <div className="w-full mt-3 pt-2.5 border-t border-slate-800">
                    <h3 className="font-gaming font-bold text-xs sm:text-sm text-white group-hover:text-gold tracking-wider transition-colors duration-200 uppercase">
                      {sponsor.name}
                    </h3>
                    {sponsor.tagline && (
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {sponsor.tagline}
                      </p>
                    )}
                  </div>
                </CardTag>
              );
            })}
          </div>
        )}

        {/* Bottom Partnership Row (Tightly integrated) */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] sm:text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E8C766]" />
            <span>Interested in partnering with The Shield Showdown?</span>
          </div>
          <a
            href="https://discord.gg/MK7eQZayxd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-glow font-gaming font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-1 transition-colors duration-200"
          >
            Connect on Discord &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
