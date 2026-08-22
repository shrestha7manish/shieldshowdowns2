import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#09090c] border-t border-slate-800/60 py-6 px-4 mt-auto font-sans relative z-10">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-500 text-center">
        <span>&copy; {new Date().getFullYear()} The Shield Showdown. All Rights Reserved.</span>
        <span className="text-zinc-700 hidden sm:inline">&bull;</span>
        <span className="inline-flex items-center gap-1 text-zinc-500">
          Powered by{' '}
          <a
            href="https://www.facebook.com/profile.php?id=61563629297035"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-gold transition-colors duration-200 inline-flex items-center gap-0.5 font-medium hover:underline cursor-pointer"
          >
            <span>Dynamatrix Solutions</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </span>
      </div>
    </footer>
  );
}

