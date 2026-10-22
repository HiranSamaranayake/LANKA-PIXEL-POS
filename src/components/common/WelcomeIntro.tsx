import React, { useEffect, useState, useRef } from 'react';

interface WelcomeIntroProps {
  onComplete: () => void;
}

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      sessionStorage.setItem('lp_welcome_intro_shown', 'true');
      onComplete();
      return;
    }

    // Sequence timing:
    // 0ms - 2500ms: Entrance and showcase
    // 2500ms: Start graceful fade-out
    // 3050ms: Complete transition and unmount
    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    completeTimerRef.current = setTimeout(() => {
      sessionStorage.setItem('lp_welcome_intro_shown', 'true');
      onComplete();
    }, 3050);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    sessionStorage.setItem('lp_welcome_intro_shown', 'true');
    onComplete();
  };

  return (
    <div
      role="dialog"
      aria-label="Welcome Introduction"
      aria-modal="true"
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-[1.01] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Lighting & Subtle Geometric Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none animate-intro-glow" />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-100/40 blur-3xl pointer-events-none animate-intro-glow"
        style={{ animationDelay: '1.5s' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Top Bar with Skip Option */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-10">
        <button
          onClick={handleSkip}
          type="button"
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 bg-gray-50/80 hover:bg-gray-100 border border-gray-200/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          title="Skip Intro"
        >
          Skip Intro &rarr;
        </button>
      </div>

      {/* Main Intro Composition */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4">
        {/* 1. Authentic Company Logo */}
        <div className="animate-intro-logo mb-6 sm:mb-8">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 transition-transform hover:scale-105 duration-300">
            <img
              src="/logo.png"
              alt="Lanka Pixel Creations"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-xl"
            />
          </div>
        </div>

        {/* 2. Primary Prominent Text: "WELCOME" */}
        <div className="animate-intro-welcome overflow-hidden">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.2em] sm:tracking-[0.25em] text-[#0F172A] uppercase select-none drop-shadow-xs">
            WELCOME
          </h1>
        </div>

        {/* 3. Company Legal Brand: "LANKA PIXEL CREATIONS" */}
        <div className="animate-intro-brand mt-4 sm:mt-5 flex items-center justify-center gap-2.5 sm:gap-4 w-full">
          <span className="animate-intro-line h-0.5 bg-gradient-to-r from-transparent to-[#2563EB] rounded-full hidden sm:block" />
          <h2 className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-[#2563EB] whitespace-nowrap">
            LANKA PIXEL CREATIONS
          </h2>
          <span className="animate-intro-line h-0.5 bg-gradient-to-l from-transparent to-[#2563EB] rounded-full hidden sm:block" />
        </div>

        {/* 4. Product Subtitle: "Management System" */}
        <div className="animate-intro-system mt-2 sm:mt-2.5">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-gray-500">
            Management System
          </p>
        </div>

        {/* Subtle, sleek auto-progress indicator line */}
        <div className="mt-8 sm:mt-10 w-28 sm:w-36 h-0.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB] rounded-full transition-all duration-[2400ms] ease-out"
            style={{ width: isExiting ? '100%' : '85%' }}
          />
        </div>
      </div>
    </div>
  );
};
