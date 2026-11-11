import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function PharaonicSplashScreen({
  duration = 8500,
  onComplete,
}: {
  duration?: number;
  onComplete?: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { lang, dir, c } = useLang();

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const current = Date.now() - startTime;
      setElapsed(current);

      // Trigger door opening 2.2 seconds before the splash screen finishes
      if (current >= duration - 2200 && !isOpening) {
        setIsOpening(true);
      }

      if (current >= duration) {
        clearInterval(timer);
        handleFinish();
      }
    }, 25);

    return () => clearInterval(timer);
  }, [duration, isOpening]);

  const handleFinish = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsDone(true);
      if (onComplete) onComplete();
    }, 2200);
  };

  if (isDone) return null;

  const progress = Math.min(100, (elapsed / duration) * 100);

  // Extended lock rotation phases (+2 seconds longer for enjoyable mechanism view)
  const ring1Locked = elapsed >= 2800;
  const ring2Locked = elapsed >= 4400;
  const ring3Locked = elapsed >= 5800;
  const coreUnlocked = elapsed >= 6000;

  // Status text based on language & unlock progress
  const getStatusText = () => {
    if (lang === "ar") {
      if (coreUnlocked) return "تم فتح الختم الملكي — جاري فتح بوابات المعبد...";
      if (ring2Locked) return "محاذاة حلقات النيل المقدسة...";
      if (ring1Locked) return "مزامنة الرموز الفرعونية القديمة...";
      return "فك شفرة القفل الفرعوني الملكي...";
    }
    if (lang === "ru") {
      if (coreUnlocked) return "Печать снята — открываются врата храма...";
      if (ring2Locked) return "Выравнивание священных колец Нила...";
      if (ring1Locked) return "Синхронизация древних глифов...";
      return "Расшифровка механизма печати фараонов...";
    }
    if (lang === "fr") {
      if (coreUnlocked) return "Sceau Déverrouillé — Ouverture des Portes du Sanctuaire...";
      if (ring2Locked) return "Alignement de l'Anneau Sacré du Nil...";
      if (ring1Locked) return "Synchronisation des Hiéroglyphes...";
      return "Déchiffrement du Mécanisme Pharaonique...";
    }
    if (coreUnlocked) return "Vault Unlocked — Opening Tomb Doors...";
    if (ring2Locked) return "Aligning Sacred Nile Rings...";
    if (ring1Locked) return "Synchronizing Ancient Glyphs...";
    return "Decoding Pharaonic Lock Mechanism...";
  };

  const skipLabel =
    lang === "ar"
      ? "تخطي إلى الموقع"
      : lang === "ru"
        ? "Перейти на сайт"
        : lang === "fr"
          ? "Ouvrir Directement"
          : "Skip to Site";

  const sealLabel =
    lang === "ar"
      ? "ختم البوابة الملكية"
      : lang === "ru"
        ? "Царская печать"
        : lang === "fr"
          ? "Sceau du Sanctuaire"
          : "Tomb Chamber Seal";

  return (
    <div
      dir={dir}
      aria-label="Ancient Egyptian Tomb Lock"
      className={`fixed inset-0 z-[99999] overflow-hidden select-none ${
        isOpening ? "pointer-events-none" : "bg-[#050806]"
      }`}
    >
      {/* LEFT TOMB DOOR (Grand 2-second slide to the left) */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#090e0b] border-r-2 border-gold/50 transition-transform duration-[2000ms] ease-in-out z-20 ${
          isOpening ? "-translate-x-full shadow-[0_0_100px_rgba(212,175,55,0.6)]" : "translate-x-0"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 100% 50%, rgba(212,175,55,0.12) 0%, transparent 60%), url('/pharaonic-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundBlendMode: "overlay",
        }}
      />

      {/* RIGHT TOMB DOOR (Grand 2-second slide to the right) */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#090e0b] border-l-2 border-gold/50 transition-transform duration-[2000ms] ease-in-out z-20 ${
          isOpening ? "translate-x-full shadow-[0_0_100px_rgba(212,175,55,0.6)]" : "translate-x-0"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 0% 50%, rgba(212,175,55,0.12) 0%, transparent 60%), url('/pharaonic-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundBlendMode: "overlay",
        }}
      />

      {/* Skip Button */}
      <button
        onClick={handleFinish}
        className={`absolute top-6 end-6 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-black/80 px-4 py-2 text-xs font-semibold text-gold-foreground/90 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-gold hover:bg-gold hover:text-black sm:top-8 sm:end-8 sm:px-5 sm:py-2.5 sm:text-sm ${
          isOpening ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span>{skipLabel}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {/* CENTER MECHANISM CONTAINER (Fades smoothly when doors part) */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 transition-all duration-700 ${
          isOpening ? "opacity-0 scale-110 filter blur-md pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Golden Light Beam Emitter */}
        <div
          className={`absolute h-[480px] w-[480px] sm:h-[620px] sm:w-[620px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.25)_0%,rgba(34,197,94,0.12)_35%,transparent_70%)] pointer-events-none transition-all duration-700 ${
            coreUnlocked ? "scale-150 opacity-100" : "scale-100 opacity-60 animate-pulse"
          }`}
        />

        {/* ============================================================ */}
        {/* THE ANCIENT ROTATING CRYPTEX RINGS                           */}
        {/* ============================================================ */}
        <div className="relative flex items-center justify-center h-72 w-72 sm:h-96 sm:w-96">
          
          {/* Laser Alignment Ray from Top to Center */}
          <div className="absolute top-0 bottom-1/2 w-0.5 bg-gradient-to-b from-transparent via-gold to-amber-200 z-30 shadow-[0_0_12px_rgba(212,175,55,1)]" />

          {/* Alignment Notch Indicators */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <div className="h-3 w-3 rotate-45 border-b-2 border-r-2 border-gold bg-amber-400 shadow-[0_0_15px_gold]" />
          </div>

          {/* 1. OUTER RING (Celestial Calendar & Pharaonic Glyphs) */}
          <div
            className={`absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full border-2 transition-all duration-1000 ${
              ring1Locked
                ? "border-gold shadow-[0_0_30px_rgba(212,175,55,0.6)]"
                : "border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            }`}
            style={{
              transform: ring1Locked ? "rotate(0deg)" : `rotate(${(elapsed / 16) % 360}deg)`,
              transition: ring1Locked ? "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.4s" : "none",
            }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              {/* Outer decorative tracks */}
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" strokeDasharray="4 6" />
              <circle cx="200" cy="200" r="175" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1" />
              
              {/* Hieroglyphic ticks & sacred stars */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                return (
                  <g key={i} transform={`rotate(${angle} 200 200)`}>
                    <line x1="200" y1="10" x2="200" y2="25" stroke="#d4af37" strokeWidth="2.5" />
                    <circle cx="200" cy="30" r="3" fill="#d4af37" />
                    <text x="200" y="44" fill="#d4af37" fontSize="11" textAnchor="middle" fontWeight="bold">
                      {["𓇳", "𓆣", "𓃭", "𓋹", "𓊹", "𓇯", "𓈖", "𓍯", "𓅓", "𓏏", "𓌢", "𓌂"][i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 2. MIDDLE RING (Sacred Lotus & Nile Irrigation Glyphs) */}
          <div
            className={`absolute h-52 w-52 sm:h-72 sm:w-72 rounded-full border-2 transition-all duration-1000 ${
              ring2Locked
                ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.7)]"
                : "border-gold/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
            }`}
            style={{
              transform: ring2Locked ? "rotate(0deg)" : `rotate(-${(elapsed / 12) % 360}deg)`,
              transition: ring2Locked ? "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.4s" : "none",
            }}
          >
            <svg viewBox="0 0 300 300" className="h-full w-full">
              <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeDasharray="3 4" />
              <circle cx="150" cy="150" r="125" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1" />
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 360) / 8;
                return (
                  <g key={i} transform={`rotate(${angle} 150 150)`}>
                    <line x1="150" y1="10" x2="150" y2="24" stroke="#f59e0b" strokeWidth="2" />
                    <polygon points="150,26 146,32 154,32" fill="#f59e0b" />
                    <text x="150" y="44" fill="#fbbf24" fontSize="12" textAnchor="middle" fontWeight="bold">
                      {["𓆸", "𓆰", "𓆱", "𓇌", "𓈗", "𓇽", "𓆭", "𓇠"][i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 3. INNER RING (Eye of Horus & Key of Life Ankh) */}
          <div
            className={`absolute h-36 w-36 sm:h-48 sm:w-48 rounded-full border-2 transition-all duration-1000 ${
              ring3Locked
                ? "border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.8)]"
                : "border-gold/60"
            }`}
            style={{
              transform: ring3Locked ? "rotate(0deg)" : `rotate(${(elapsed / 8) % 360}deg)`,
              transition: ring3Locked ? "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.4s" : "none",
            }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 360) / 6;
                return (
                  <g key={i} transform={`rotate(${angle} 100 100)`}>
                    <circle cx="100" cy="14" r="3" fill="#34d399" />
                    <text x="100" y="30" fill="#34d399" fontSize="13" textAnchor="middle">
                      {["𓋹", "𓂀", "𓊽", "𓌀", "𓎛", "𓇯"][i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 4. CENTER SACRED SEAL & LOGO REVEAL */}
          <div className="relative z-20 flex items-center justify-center">
            {/* Pulsing Sun Aura */}
            <div
              className={`absolute h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gold/25 blur-xl transition-all duration-700 ${
                coreUnlocked ? "scale-150 opacity-100 bg-amber-400/40" : "scale-90 opacity-40 animate-pulse"
              }`}
            />

            {/* Core Golden Disc */}
            <div
              className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 bg-white p-2 transition-all duration-700 ${
                coreUnlocked
                  ? "border-amber-300 scale-110 shadow-[0_0_45px_rgba(251,191,36,0.9)]"
                  : "border-gold/80 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              }`}
            >
              {coreUnlocked ? (
                <img
                  src="/logo.png"
                  alt="BucharestEgyAgro"
                  className="h-full w-full object-contain animate-in fade-in zoom-in-75 duration-700 filter drop-shadow-[0_0_10px_gold]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gold">
                  <KeyRound className="h-7 w-7 sm:h-8 sm:w-8 animate-pulse text-gold" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-gold/80 mt-0.5">BUCHARESTEGYAGRO</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BRAND & STATUS TEXT */}
        <div className="mt-8 text-center space-y-2 max-w-md">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-gold/90">
            <Sparkles className="h-3 w-3 text-gold animate-spin" style={{ animationDuration: "5s" }} />
            <span>BUCHARESTEGYAGRO • {c.ui.importExportLabel}</span>
            <Sparkles className="h-3 w-3 text-gold animate-spin" style={{ animationDuration: "5s" }} />
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-wider text-white">
            <span className="text-gradient-gold">BUCHARESTEGYAGRO</span>
          </h2>

          <p className="text-xs sm:text-sm font-medium text-amber-200/90 h-5 transition-all duration-300">
            {getStatusText()}
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-6 w-56 sm:w-72">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 border border-gold/30">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-gold to-amber-300 transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(212,175,55,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-gold/70 tracking-widest uppercase">
            <span>{sealLabel}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
