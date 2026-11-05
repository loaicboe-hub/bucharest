export function PharaonicDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 opacity-60 ${className}`} aria-hidden>
      <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-gold to-gold/80" />
      {/* Pharaonic Lotus / Sun Emblem */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-5 w-5 text-gold"
        strokeWidth="1.5"
      >
        {/* Lotus & Sun Petals */}
        <path d="M12 3v6" strokeLinecap="round" />
        <path d="M12 21c-4.5 0-7.5-3.5-7.5-8 0-3 2-6 7.5-10 5.5 4 7.5 7 7.5 10 0 4.5-3 8-7.5 8z" />
        <path d="M12 21c-2-2-4-5-4-8 0-2.5 1.5-5 4-7 2.5 2 4 4.5 4 7 0 3-2 6-4 8z" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
      </svg>
      <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-gold to-gold/80" />
    </div>
  );
}
