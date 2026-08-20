import React from 'react';
import { Shield, Sparkles, ExternalLink } from 'lucide-react';
import sponsorsData from '../data/sponsorsData';

export default function SponsorsSection() {
  if (!sponsorsData || sponsorsData.length === 0) return null;

  return (
    <section 
      aria-label="Sponsors and Official Partners"
      className="w-full max-w-5xl my-2 relative z-10"
    >
      {/* Main Section Card (Light Mode - Matching Website Design Language) */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(232,199,102,0.15)] relative overflow-hidden font-sans">
        
        {/* Subtle Top Gold Highlight Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E8C766] to-transparent" />

        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF5FA] border border-[#DCEAF4] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#E8C766]" />
            <span className="font-gaming font-bold text-[10px] sm:text-xs text-[#4F7CAC] uppercase tracking-widest">
              OUR OFFICIAL PARTNERS
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="font-gaming font-black text-2xl sm:text-3xl md:text-4xl text-[#243B53] tracking-wider uppercase mb-2">
            POWERED BY <span className="text-[#4F7CAC]">THE BEST</span>
          </h2>

          {/* Clean Divider */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#E8C766] to-transparent w-40 mx-auto my-3" />

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm text-[#243B53]/80 font-sans leading-relaxed">
            The Shield Showdown Season 2 is proudly supported by our official sponsors and partners.
          </p>
        </div>

        {/* SPONSORS GRID (Clean centered layout for 1 sponsor, multi-column for more) */}
        <div className={sponsorsData.length === 1 ? "max-w-md mx-auto w-full" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
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
                className="group flex flex-col justify-between items-center text-center p-6 sm:p-8 rounded-2xl bg-[#EEF5FA] border border-[#E5E7EB] hover:border-[#4F7CAC] transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {/* Top Category Badge */}
                <div className="w-full flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#E5E7EB]">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-gaming font-bold tracking-wider uppercase text-[#4F7CAC] px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] shadow-xs">
                    <Shield className="w-3 h-3 text-[#E8C766]" />
                    {sponsor.category}
                  </span>

                  {isClickable && (
                    <span className="text-[#4F7CAC]/60 group-hover:text-[#4F7CAC] transition-colors duration-200">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Sponsor Logo Container */}
                <div className="w-full h-32 sm:h-36 flex items-center justify-center p-2.5 my-2 bg-black rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Sponsor Name & Tagline */}
                <div className="w-full mt-4 pt-3 border-t border-[#E5E7EB]">
                  <h3 className="font-gaming font-bold text-sm sm:text-base text-[#243B53] group-hover:text-[#4F7CAC] tracking-wider transition-colors duration-200 uppercase">
                    {sponsor.name}
                  </h3>
                  {sponsor.tagline && (
                    <p className="text-xs text-[#243B53]/70 font-sans mt-0.5">
                      {sponsor.tagline}
                    </p>
                  )}
                </div>
              </CardTag>
            );
          })}
        </div>

        {/* Bottom Partnership Row */}
        <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#243B53]/70 font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E8C766]" />
            <span>Interested in partnering with The Shield Showdown?</span>
          </div>
          <a
            href="https://discord.gg/MK7eQZayxd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4F7CAC] hover:text-[#243B53] font-gaming font-bold text-xs tracking-wider uppercase flex items-center gap-1 transition-colors duration-200"
          >
            Connect on Discord &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
