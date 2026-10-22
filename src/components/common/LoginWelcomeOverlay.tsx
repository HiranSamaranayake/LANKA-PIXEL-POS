import React, { useEffect, useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export const getWelcomeName = (
  role?: string | null,
  fullName?: string | null
): string => {
  if (role === 'Admin') {
    return 'ADMIN';
  }

  const trimmed = fullName?.trim();
  if (trimmed) {
    const firstName = trimmed.split(/\s+/)[0];
    if (firstName) {
      return firstName.toUpperCase();
    }
  }

  if (role) {
    return role.toUpperCase();
  }

  return 'STAFF';
};

interface LoginWelcomeOverlayProps {
  userName: string;
  onComplete: () => void;
}

export const LoginWelcomeOverlay: React.FC<LoginWelcomeOverlayProps> = ({
  userName,
  onComplete,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      completeTimerRef.current = setTimeout(() => {
        onComplete();
      }, 1800);
      return;
    }

    // Sequence Timing:
    // 0ms - 2400ms: Grand full-screen entrance and hold
    // 2400ms: Smooth fade out
    // 2900ms: Complete and unmount (total duration ~2.9 seconds)
    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true);
    }, 2400);

    completeTimerRef.current = setTimeout(() => {
      onComplete();
    }, 2900);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Welcome ${userName}`}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden pointer-events-none transition-all duration-500 ease-out ${
        isExiting ? 'animate-overlay-out' : 'animate-overlay-in'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.94) 0%, rgba(240, 247, 255, 0.88) 55%, rgba(234, 244, 255, 0.82) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* =========================================================================
          ANIMATED PASTEL GRAPHIC ARTWORK BACKGROUND (CSS + SVG)
          Palette: Soft Sky Blue, Pale Lavender, White, Pale Cyan, Accent Blue
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Glowing Circular Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full bg-gradient-to-tr from-[#EAF4FF]/80 via-[#DBEAFE]/50 to-[#F0ECFF]/60 blur-3xl opacity-75 animate-overlay-orb-1" />
        <div className="absolute top-1/4 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#E8FBFF]/70 blur-3xl opacity-60 animate-overlay-orb-2" />
        <div className="absolute bottom-1/4 left-1/4 w-72 sm:w-88 h-72 sm:h-88 rounded-full bg-[#F0ECFF]/70 blur-3xl opacity-60 animate-overlay-orb-1" />

        {/* SVG Flowing Curved Ribbons & Orbital Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1600 1000"
        >
          <defs>
            {/* Flowing Ribbon Gradients */}
            <linearGradient id="overlayRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="overlayRibbon2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.1" />
            </linearGradient>

            {/* Subtle Dot Grid */}
            <pattern id="overlayDotPattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#2563EB" opacity="0.06" />
            </pattern>
          </defs>

          {/* Dot Matrix Layer */}
          <rect width="100%" height="100%" fill="url(#overlayDotPattern)" />

          {/* Flowing Curved Ribbons */}
          <g className="animate-lp-wave opacity-80">
            <path
              d="M-80,320 C260,180 500,440 840,310 C1180,180 1420,410 1700,280"
              fill="none"
              stroke="url(#overlayRibbon1)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M-60,370 C280,240 520,490 860,360 C1200,230 1440,460 1720,330"
              fill="none"
              stroke="url(#overlayRibbon1)"
              strokeWidth="1.2"
              strokeDasharray="6 8"
              opacity="0.6"
            />
          </g>

          <path
            d="M-100,680 C240,540 620,780 1060,630 C1400,500 1660,700 1900,580"
            fill="none"
            stroke="url(#overlayRibbon2)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Centerpiece Orbital Outlines */}
          <g opacity="0.45">
            <circle
              cx="800"
              cy="500"
              r="240"
              stroke="#93C5FD"
              strokeWidth="1"
              strokeDasharray="5 7"
              fill="none"
              className="animate-lp-spin-slow"
            />
            <circle
              cx="800"
              cy="500"
              r="170"
              stroke="#C4B5FD"
              strokeWidth="0.8"
              strokeDasharray="3 5"
              fill="none"
            />
            <circle cx="800" cy="260" r="4" fill="#2563EB" opacity="0.6" />
            <circle cx="970" cy="500" r="3" fill="#60A5FA" opacity="0.5" />
            <circle cx="630" cy="500" r="3" fill="#818CF8" opacity="0.5" />
            <path d="M 794 500 H 806 M 800 494 V 506" stroke="#2563EB" strokeWidth="1.2" />
          </g>
        </svg>

        {/* Floating Delicate Sparkles / Accents */}
        <div className="absolute top-1/3 left-1/4 p-2 text-blue-400 opacity-60 animate-sparkle-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <div
          className="absolute top-1/4 right-1/3 p-2 text-indigo-400 opacity-50 animate-sparkle-pulse"
          style={{ animationDelay: '1s' }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div
          className="absolute bottom-1/3 right-1/4 p-2 text-sky-400 opacity-60 animate-sparkle-pulse"
          style={{ animationDelay: '1.5s' }}
        >
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* =========================================================================
          CENTERPIECE: LARGE, BOLD, MODERN WELCOME GRAPHIC COMPOSITION
         ========================================================================= */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 py-10 animate-overlay-art">
        {/* Authentic Company Logo */}
        <div className="mb-6 sm:mb-8">
          <div className="p-3.5 bg-white/95 rounded-3xl shadow-lg shadow-blue-500/10 border border-blue-100/90 backdrop-blur-md transition-transform hover:scale-105 duration-300">
            <img
              src="/logo.png"
              alt="Lanka Pixel Creations"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Primary Centered Welcome Text */}
        <div className="animate-overlay-text">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#0F172A] uppercase select-none leading-none drop-shadow-xs">
            HELLO{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-blue-600 to-[#1D4ED8]">
              {userName}
            </span>
          </h1>
        </div>

        {/* Sleek Professional Blue Gradient Divider Line */}
        <div className="w-32 sm:w-48 h-1 sm:h-1.5 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent rounded-full mt-6 sm:mt-8 animate-overlay-line" />
      </div>
    </div>
  );
};
