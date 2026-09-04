import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

// Project-specific Cyber Security Stickers
import cyberShieldSticker from '../assets/images/cyber_shield_sticker_1788458125347.jpg';
import bugHunterSticker from '../assets/images/bug_hunter_sticker_1788458147008.jpg';
import codeVaultSticker from '../assets/images/code_vault_sticker_1788458171268.jpg';
import malwareAlertSticker from '../assets/images/malware_alert_sticker_1788458187665.jpg';
import astSentinelSticker from '../assets/images/ast_sentinel_sticker_1788458208965.jpg';

interface LandingPageProps {
  onEnterApp: (tab?: string) => void;
  onLoadDemo: () => void;
}

// Asset URLs
const VIDEO_URL_1 = "https://stream.mux.com/W2NRcV6MrewS7QyWWqAWZvJR9jrnPU5rxymlPg01gRzk.m3u8";
const VIDEO_URL_2 = "https://stream.mux.com/aypDi1exkKgYKEbWme9Csi47zxIim0101hw3ghmSzQIyw.m3u8";

// Project-specific Stickers
const STICKER_TOP_LEFT = cyberShieldSticker;
const STICKER_BOTTOM_RIGHT = bugHunterSticker;
const HERO_STICKER_1 = malwareAlertSticker;
const HERO_STICKER_2 = codeVaultSticker;

// Cyber Holographic Sticker Metadata for Interactive Touch/Trail
const CYBER_STICKERS_META = [
  {
    img: cyberShieldSticker,
    title: 'CYBER SHIELD',
    badge: 'AST-V2',
    status: 'HARDENED'
  },
  {
    img: bugHunterSticker,
    title: 'BUG HUNTER',
    badge: 'CVE-SCAN',
    status: 'TRACKING'
  },
  {
    img: codeVaultSticker,
    title: 'CODE VAULT',
    badge: 'RSA-4096',
    status: 'ENCRYPTED'
  },
  {
    img: malwareAlertSticker,
    title: 'EXPLOIT SHIELD',
    badge: 'ZERO-DAY',
    status: 'MITIGATED'
  },
  {
    img: astSentinelSticker,
    title: 'AST RADAR',
    badge: 'SENTINEL',
    status: 'ACTIVE'
  }
];

interface TrailStickerItem {
  id: number;
  x: number;
  y: number;
  img: string;
  title: string;
  badge: string;
  status: string;
  rot: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLoadDemo }) => {
  // Video Elements & Durations
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const v1DurationRef = useRef<number>(0);
  const v2DurationRef = useRef<number>(0);

  // Time lerp tracking
  const currTime1Ref = useRef<number>(0);
  const currTime2Ref = useRef<number>(0);

  // Scroll Progress State
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [v1Opacity, setV1Opacity] = useState<number>(1);
  const [v2Opacity, setV2Opacity] = useState<number>(0);

  // Top First Section Awareness (Stickers ONLY active here!)
  const [inTopSection, setInTopSection] = useState<boolean>(true);
  const inTopSectionRef = useRef<boolean>(true);

  // Touch / Mouse Trail Stickers State
  const [stickers, setStickers] = useState<TrailStickerItem[]>([]);
  const lastTouchPos = useRef<{ x: number; y: number }>({ x: -999, y: -999 });
  const trailCounter = useRef<number>(0);
  const hasInteractedRef = useRef<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Form State
  const [formClosed, setFormClosed] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // 1. Initialize HLS on both video streams
  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    let hls1: Hls | null = null;
    let hls2: Hls | null = null;

    const setupHls = (video: HTMLVideoElement, url: string, isV1: boolean) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 60 });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Warm decoder immediately then pause
          video.play().then(() => video.pause()).catch(() => {});
        });
        if (isV1) hls1 = hls;
        else hls2 = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().then(() => video.pause()).catch(() => {});
        });
      }
    };

    setupHls(v1, VIDEO_URL_1, true);
    setupHls(v2, VIDEO_URL_2, false);

    const onMeta1 = () => {
      if (v1.duration && isFinite(v1.duration)) {
        v1DurationRef.current = v1.duration;
      }
    };
    const onMeta2 = () => {
      if (v2.duration && isFinite(v2.duration)) {
        v2DurationRef.current = v2.duration;
      }
    };

    v1.addEventListener('loadedmetadata', onMeta1);
    v2.addEventListener('loadedmetadata', onMeta2);

    return () => {
      v1.removeEventListener('loadedmetadata', onMeta1);
      v2.removeEventListener('loadedmetadata', onMeta2);
      if (hls1) hls1.destroy();
      if (hls2) hls2.destroy();
    };
  }, []);

  // 2. Continuous RequestAnimationFrame Scroll-Scrub Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const rawProgress = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Avoid unnecessary re-renders via threshold check
      setScrollProgress(prev => (Math.abs(prev - rawProgress) > 0.0005 ? rawProgress : prev));

      // Top First Section check (threshold: 0.08 of full scroll)
      // When scroll down starts, strictly disable images and clear existing ones
      const isTop = rawProgress < 0.08;
      if (inTopSectionRef.current !== isTop) {
        inTopSectionRef.current = isTop;
        setInTopSection(isTop);
        if (!isTop) {
          // Clear any active stickers as scroll effect begins
          setStickers([]);
        }
      }

      const v1 = video1Ref.current;
      const v2 = video2Ref.current;

      // Video 1 scrub: maps [0, 0.5] to full duration
      if (v1 && v1DurationRef.current > 0) {
        const p1 = Math.min(rawProgress, 0.5) / 0.5;
        const target1 = p1 * v1DurationRef.current;

        if (scrollY <= 10) {
          v1.currentTime = 0;
          currTime1Ref.current = 0;
        } else if (!v1.seeking) {
          currTime1Ref.current += (target1 - currTime1Ref.current) * 0.3;
          if (Math.abs(v1.currentTime - currTime1Ref.current) > 0.03) {
            v1.currentTime = currTime1Ref.current;
          }
        }
      }

      // Video 2 scrub: maps [0.5, 1.0] to full duration
      if (v2 && v2DurationRef.current > 0) {
        const p2 = Math.max(0, rawProgress - 0.5) / 0.5;
        const target2 = p2 * v2DurationRef.current;

        if (rawProgress >= 0.999) {
          v2.currentTime = v2DurationRef.current;
          currTime2Ref.current = v2DurationRef.current;
        } else if (!v2.seeking) {
          currTime2Ref.current += (target2 - currTime2Ref.current) * 0.3;
          if (Math.abs(v2.currentTime - currTime2Ref.current) > 0.03) {
            v2.currentTime = currTime2Ref.current;
          }
        }
      }

      // Crossfade logic (no dim)
      let op1 = 1;
      let op2 = 0;

      if (rawProgress < 0.45) {
        op1 = 1;
        op2 = 0;
      } else if (rawProgress <= 0.5) {
        op1 = 1;
        op2 = (rawProgress - 0.45) / 0.05;
      } else {
        op1 = 0;
        op2 = 1;
      }

      setV1Opacity(prev => (Math.abs(prev - op1) > 0.01 ? op1 : prev));
      setV2Opacity(prev => (Math.abs(prev - op2) > 0.01 ? op2 : prev));

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 3. Touch & Mouse Spawning: ONLY in Top First Section
  const spawnCyberSticker = (clientX: number, clientY: number) => {
    // Strictly verify we are in the top first section before scroll starts
    if (!inTopSectionRef.current) return;

    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setHasInteracted(true);
    }

    lastTouchPos.current = { x: clientX, y: clientY };

    const meta = CYBER_STICKERS_META[trailCounter.current % CYBER_STICKERS_META.length];
    trailCounter.current += 1;

    const rot = Math.random() * 32 - 16;
    const newSticker: TrailStickerItem = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      img: meta.img,
      title: meta.title,
      badge: meta.badge,
      status: meta.status,
      rot
    };

    setStickers(prev => [...prev.slice(-3), newSticker]);

    // Auto remove after 2200ms
    setTimeout(() => {
      setStickers(prev => prev.filter(s => s.id !== newSticker.id));
    }, 2200);
  };

  useEffect(() => {
    // Touchscreen touch-start (tap)
    const handleTouchStart = (e: TouchEvent) => {
      if (!inTopSectionRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, textarea')) return;

      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        spawnCyberSticker(touch.clientX, touch.clientY);
      }
    };

    // Touchscreen swipe / drag
    const handleTouchMove = (e: TouchEvent) => {
      if (!inTopSectionRef.current) return;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - lastTouchPos.current.x, touch.clientY - lastTouchPos.current.y);
        if (dist > 110) {
          spawnCyberSticker(touch.clientX, touch.clientY);
        }
      }
    };

    // Desktop mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!inTopSectionRef.current) return;
      const dist = Math.hypot(e.clientX - lastTouchPos.current.x, e.clientY - lastTouchPos.current.y);
      if (dist > 130) {
        spawnCyberSticker(e.clientX, e.clientY);
      }
    };

    // Desktop mouse click / tap
    const handleClick = (e: MouseEvent) => {
      if (!inTopSectionRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, textarea')) return;

      spawnCyberSticker(e.clientX, e.clientY);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // 4. Hero Typewriter Deletion Logic
  // Total 22 characters:
  // Line 1: "PROBLEM" (indices 1-7)
  // Line 2: "WITH" (indices 8-11) + HERO_STICKER_1 (index 12) + HERO_STICKER_2 (index 13)
  // Line 3: "SECURITY?" (indices 14-22)
  const activeDeletionProgress = Math.min(scrollProgress, 0.25) / 0.25;
  const visibleCount = Math.round((1 - activeDeletionProgress) * 22);

  const line1Chars = ['P', 'R', 'O', 'B', 'L', 'E', 'M']; // 1..7
  const line2Chars = ['W', 'I', 'T', 'H']; // 8..11
  const line3Chars = ['S', 'E', 'C', 'U', 'R', 'I', 'T', 'Y', '?']; // 14..22

  // 5. Vertically-Scrolling Manifesto Logic
  const maxScrollDist = typeof window !== 'undefined' 
    ? Math.max(1, document.documentElement.scrollHeight - window.innerHeight) 
    : 10000;
  const manifestoStartProgress = 0.25 + (200 / maxScrollDist);

  let manifestoAlpha = 0;
  if (scrollProgress > manifestoStartProgress) {
    manifestoAlpha = Math.min(1, Math.max(0, (scrollProgress - manifestoStartProgress) / (1 - manifestoStartProgress)));
  }
  const manifestoOpacity = Math.min(1, manifestoAlpha / 0.05);
  const manifestoTranslateY = 100 - (manifestoAlpha * 450); // scrolls +100vh to -350vh

  // 6. Floating Edge Stickers Opacity (fades out as scroll down effect starts)
  const floatingStickersOpacity = Math.max(0, 1 - (scrollProgress / 0.12));

  // 7. Feedback Form Visibility (scrollProgress >= 0.95)
  const isFormTriggered = scrollProgress >= 0.95 && !formClosed;

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormClosed(false);
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="relative w-full bg-slate-950 min-h-[1200vh] select-none text-white font-sans">
      {/* 1. FULL-SCREEN VIDEO BACKGROUND (fixed, z-0) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={video1Ref}
          muted
          playsInline
          autoPlay={false}
          preload="auto"
          crossOrigin="anonymous"
          style={{ opacity: v1Opacity }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
        />
        <video
          ref={video2Ref}
          muted
          playsInline
          autoPlay={false}
          preload="auto"
          crossOrigin="anonymous"
          style={{ opacity: v2Opacity }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
        />
        {/* Subtle dark cyber tint */}
        <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />

        {/* Cyber Security HUD Overlay on Video */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 sm:p-10 opacity-60">
          {/* Top telemetry line */}
          <div className="flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-[#85D743] tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#85D743] animate-ping" />
              <span>[ SAST AST_ENGINE: ACTIVE ]</span>
              <span className="hidden md:inline text-white/40">//</span>
              <span className="hidden md:inline">[ RULES: 18 SIGNATURES LOADED ]</span>
            </div>
            <div className="text-right">
              <span>[ SCAN PROGRESS: {(scrollProgress * 100).toFixed(0)}% ]</span>
            </div>
          </div>

          {/* Bottom telemetry line */}
          <div className="flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-[#85D743]/80 tracking-widest uppercase">
            <div>
              <span>[ TARGET: REPOSITORY SOURCE TREE ]</span>
            </div>
            <div className="hidden sm:block">
              <span>[ SECURITY CLASSIFICATION: TOP SECRET // SAST ]</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIAGONAL MARQUEE BANNER (fixed, z-50) */}
      <div className="fixed top-14 left-[-170px] w-[680px] -rotate-[30deg] z-50 bg-[#0033FF] py-[18px] overflow-hidden select-none pointer-events-none shadow-2xl border-y-2 border-[#85D743]">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="font-press-start text-[15px] text-[#85D743] tracking-widest px-4">
            WARNING! ZERO-DAY DEFENSE ACTIVE // AST STATIC CODE SCANNER // MITRE & OWASP HARDENED // CODESENTINEL ACTIVE //&nbsp;
          </span>
          <span className="font-press-start text-[15px] text-[#85D743] tracking-widest px-4">
            WARNING! ZERO-DAY DEFENSE ACTIVE // AST STATIC CODE SCANNER // MITRE & OWASP HARDENED // CODESENTINEL ACTIVE //&nbsp;
          </span>
        </div>
      </div>

      {/* 3. DESIGNED FLOATING CYBER BADGE - TOP LEFT (Only in top section, fades out cleanly on scroll) */}
      {floatingStickersOpacity > 0 && (
        <div
          style={{
            top: '210px',
            left: '60px',
            transform: 'rotate(18deg)',
            opacity: floatingStickersOpacity,
            transition: 'opacity 0.25s ease-out'
          }}
          className="fixed z-40 select-none pointer-events-none hidden sm:flex flex-col items-center"
        >
          <div className="relative group p-2 rounded-2xl bg-slate-950/90 border-2 border-[#85D743] shadow-[0_0_20px_rgba(133,215,67,0.3),_6px_6px_0px_#0033FF] backdrop-blur-md flex flex-col items-center gap-1.5 w-[130px] sm:w-[145px]">
            {/* Header pill */}
            <div className="w-full flex items-center justify-between px-1">
              <span className="font-press-start text-[6px] text-[#85D743] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#85D743] animate-pulse" />
                SEC_PATCH
              </span>
              <span className="text-[6px] font-mono text-white/40">#01</span>
            </div>

            {/* Image card with holographic reflection */}
            <div className="relative w-full h-[95px] sm:h-[110px] rounded-xl overflow-hidden border border-[#85D743]/40 bg-black">
              <img
                src={STICKER_TOP_LEFT}
                alt="CodeSentinel Cyber Shield Badge"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              <div className="absolute top-1 left-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
              <div className="absolute top-1 right-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
              <div className="absolute bottom-1 left-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
              <div className="absolute bottom-1 right-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
            </div>

            {/* Footer status */}
            <div className="w-full flex items-center justify-between px-1">
              <span className="font-press-start text-[6px] text-white tracking-tight">SHIELD V2</span>
              <span className="font-mono text-[6px] text-[#85D743] bg-[#85D743]/15 px-1 py-0.5 rounded border border-[#85D743]/40">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. DESIGNED FLOATING CYBER BADGE - BOTTOM RIGHT (Only in top section, fades out cleanly on scroll) */}
      {floatingStickersOpacity > 0 && (
        <div
          style={{
            bottom: '24px',
            right: '24px',
            opacity: floatingStickersOpacity,
            transition: 'opacity 0.25s ease-out'
          }}
          className="fixed z-40 select-none pointer-events-none flex flex-col items-center"
        >
          <div className="relative group p-2 rounded-2xl bg-slate-950/90 border-2 border-[#0033FF] shadow-[0_0_20px_rgba(0,51,255,0.4),_6px_6px_0px_#85D743] backdrop-blur-md flex flex-col items-center gap-1.5 w-[130px] sm:w-[155px]">
            {/* Header pill */}
            <div className="w-full flex items-center justify-between px-1">
              <span className="font-press-start text-[6px] text-[#85D743] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0033FF] animate-ping" />
                CVE_SCAN
              </span>
              <span className="text-[6px] font-mono text-white/40">LIVE</span>
            </div>

            {/* Image card with holographic reflection */}
            <div className="relative w-full h-[95px] sm:h-[115px] rounded-xl overflow-hidden border border-[#0033FF]/60 bg-black">
              <img
                src={STICKER_BOTTOM_RIGHT}
                alt="CodeSentinel Vulnerability Hunter Badge"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              <div className="absolute top-1 left-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
              <div className="absolute top-1 right-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
              <div className="absolute bottom-1 left-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
              <div className="absolute bottom-1 right-1 text-[#85D743] font-mono text-[7px] leading-none">+</div>
            </div>

            {/* Footer status */}
            <div className="w-full flex items-center justify-between px-1">
              <span className="font-press-start text-[6px] text-white tracking-tight">BUG HUNTER</span>
              <span className="font-mono text-[6px] text-[#85D743] bg-[#85D743]/15 px-1 py-0.5 rounded border border-[#85D743]/40">
                TRACKING
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. NAVIGATION (fixed, z-50) */}
      <nav className="fixed top-8 right-6 md:right-14 z-50 flex items-center gap-3 sm:gap-6 md:gap-8 font-press-start text-[9px] sm:text-xs md:text-sm text-white select-auto bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#85D743]/30 shadow-[4px_4px_0px_#0033FF]">
        <button
          onClick={() => onEnterApp('overview')}
          className="hover:text-[#85D743] transition-colors duration-200 cursor-pointer uppercase bg-transparent border-none p-0 text-white font-press-start"
        >
          WORKSTATION
        </button>
        <button
          onClick={() => onEnterApp('scanner')}
          className="hover:text-[#85D743] transition-colors duration-200 cursor-pointer uppercase bg-transparent border-none p-0 text-white font-press-start"
        >
          SCANNER
        </button>
        <button
          onClick={() => onEnterApp('rules')}
          className="hidden sm:inline-block hover:text-[#85D743] transition-colors duration-200 cursor-pointer uppercase bg-transparent border-none p-0 text-white font-press-start"
        >
          RULES
        </button>
        <button
          onClick={onLoadDemo}
          className="hidden md:inline-block hover:text-[#85D743] transition-colors duration-200 cursor-pointer uppercase bg-transparent border-none p-0 text-white font-press-start"
        >
          DEMO
        </button>
        <a
          href="#contact"
          onClick={handleContactClick}
          className="hover:text-[#85D743] transition-colors duration-200 cursor-pointer uppercase text-white"
        >
          CONTACT
        </a>
      </nav>

      {/* 6. HERO TEXT - TYPEWRITER DELETION (fixed, z-30) */}
      <div className="fixed top-0 left-0 w-full h-screen z-30 pointer-events-none flex flex-col justify-end p-8 md:p-16 pb-16 sm:pb-24">
        <h1 className="font-press-start text-[#85D743] text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.2] tracking-tight uppercase select-none max-w-5xl">
          {/* Line 1: "PROBLEM" (indices 1-7) */}
          <div className="mb-2 sm:mb-4">
            {line1Chars.map((char, i) => {
              const charIndex = i + 1;
              if (charIndex > visibleCount) return null;
              return (
                <span key={`l1-${i}`} className="inline-block relative">
                  {char}
                </span>
              );
            })}
            {visibleCount >= 1 && visibleCount <= 7 && (
              <span className="inline-block w-[0.14em] h-[0.8em] bg-[#85D743] ml-1 select-none animate-pulse align-middle" />
            )}
          </div>

          {/* Line 2: "WITH" + 2 project stickers (indices 8-13) */}
          {visibleCount >= 8 && (
            <div className="mb-2 sm:mb-4 inline-flex items-center gap-3 sm:gap-5 md:gap-7 align-middle flex-wrap">
              <div className="inline-flex items-center gap-[0.06em] sm:gap-[0.08em] md:gap-[0.1em]">
                {line2Chars.map((char, i) => {
                  const charIndex = 8 + i;
                  if (charIndex > visibleCount) return null;
                  return (
                    <span key={`l2-${i}`} className="inline-block relative">
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Project Sticker 1: Malware Alert / Glitch Skull (index 12) */}
              {visibleCount >= 12 && (
                <div className="inline-block h-[0.9em] w-[0.9em] rounded-md overflow-hidden border-2 border-[#85D743] shadow-[2px_2px_0px_#0033FF] bg-black -rotate-[8deg] align-middle">
                  <img
                    src={HERO_STICKER_1}
                    alt="Malware Alert Sticker"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Project Sticker 2: Encrypted Code Vault Padlock (index 13) */}
              {visibleCount >= 13 && (
                <div className="inline-block h-[0.9em] w-[0.9em] rounded-md overflow-hidden border-2 border-[#0033FF] shadow-[2px_2px_0px_#85D743] bg-black rotate-[6deg] align-middle">
                  <img
                    src={HERO_STICKER_2}
                    alt="Encrypted Code Vault Sticker"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {visibleCount >= 8 && visibleCount <= 13 && (
                <span className="inline-block w-[0.14em] h-[0.8em] bg-[#85D743] ml-1 select-none animate-pulse align-middle" />
              )}
            </div>
          )}

          {/* Line 3: "SECURITY?" (indices 14-22) */}
          {visibleCount >= 14 && (
            <div>
              {line3Chars.map((char, i) => {
                const charIndex = 14 + i;
                if (charIndex > visibleCount) return null;
                return (
                  <span key={`l3-${i}`} className="inline-block relative">
                    {char}
                  </span>
                );
              })}
              {visibleCount >= 14 && (
                <span className="inline-block w-[0.14em] h-[0.8em] bg-[#85D743] ml-1 select-none animate-pulse align-middle" />
              )}
            </div>
          )}

          {visibleCount === 0 && (
            <span className="inline-block w-[0.14em] h-[0.8em] bg-[#85D743] ml-1 select-none animate-pulse align-middle" />
          )}
        </h1>

        {/* Interactive hint in Top Section: Guides touch/mouse exploration */}
        {inTopSection && scrollProgress < 0.04 && !hasInteracted && (
          <div className="mt-6 flex items-center gap-2.5 font-mono text-[9px] sm:text-xs text-[#85D743] bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-[#85D743]/40 shadow-[2px_2px_0px_#0033FF] backdrop-blur-sm w-fit animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-[#85D743] animate-ping" />
            <span className="font-press-start text-[7px] sm:text-[8px] uppercase tracking-wider">
              TOUCH OR CLICK SCREEN FOR CYBER ARTIFACTS
            </span>
          </div>
        )}
      </div>

      {/* 7. MANIFESTO - ROLLING CREDITS (fixed, z-25) */}
      <div
        style={{
          opacity: manifestoOpacity,
          transform: `translateY(${manifestoTranslateY}vh)`,
          display: scrollProgress > 0.24 ? 'flex' : 'none'
        }}
        className="fixed top-0 left-0 w-full md:w-[70%] h-screen z-25 pointer-events-none flex-col justify-start p-8 md:p-16 pt-[12vh] pb-16 select-none transition-none"
      >
        <div className="font-press-start text-[#85D743] text-[18px] sm:text-[24px] md:text-[30px] leading-[1.4] tracking-tight uppercase text-left whitespace-pre-line select-none drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
{`ZERO EXPLOITS OR
SHALLOW REGEX
TEMPLATE
SCANNERS. THIS IS
A HIGH-ASSURANCE
ENVIRONMENT
ENGINEERED FOR
DEVSECOPS TEAMS,
APPLICATION SECURITY
LEADS, AND ZERO-DAY
RESEARCHERS WHO
AUDIT AT THE
ABSOLUTE LIMITS OF
SECURE CODE
INTELLIGENCE. OUR
FRAMEWORK IS

---

WHY CODESENTINEL?
1. REAL AST & PATTERN
ANALYSIS — ZERO NOISE.
2. SUB-SECOND SCANS —
ZERO WASTED TIME.
3. MITRE CWE & OWASP
SECURITY COMPLIANCE.
4. AI REPAIR COPILOT —
ONE-CLICK REMEDIATION.

---

WE REJECT
BLIND COMMITS.
WE REJECT
EXPLOITABLE CODE.

CHOOSE ABSOLUTE
SECURITY EDGE.

YOUR CODEBASE IS
NOW SECURED.`}
        </div>
      </div>

      {/* 8. INTERACTIVE DESIGNED CYBER BADGES (ONLY active in top first section, fixed, z-[60]) */}
      {inTopSection && (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
          {stickers.map(sticker => (
            <div
              key={sticker.id}
              className="absolute select-none pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${sticker.x}px`,
                top: `${sticker.y}px`,
                transform: `translate(-50%, -50%) rotate(${sticker.rot}deg)`,
                // @ts-ignore
                '--rot': `${sticker.rot}deg`,
                animation: 'sticker-fade-out 2.2s forwards cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Designer Cyber Holographic Badge Card */}
              <div className="relative group p-2 rounded-2xl bg-slate-950/95 border-2 border-[#85D743] shadow-[0_0_24px_rgba(133,215,67,0.35),_6px_6px_0px_#0033FF] backdrop-blur-xl flex flex-col items-center gap-1.5 min-w-[130px] sm:min-w-[155px]">
                {/* Micro Header */}
                <div className="w-full flex items-center justify-between px-1 text-[8px] font-mono tracking-wider">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85D743] animate-pulse" />
                    <span className="text-[#85D743] font-press-start text-[6px] sm:text-[7px]">
                      {sticker.badge}
                    </span>
                  </div>
                  <span className="text-[7px] text-white/50 font-mono tracking-widest">
                    SEC//OK
                  </span>
                </div>

                {/* Holographic Badge Image */}
                <div className="relative w-[110px] sm:w-[135px] h-[110px] sm:h-[135px] rounded-xl overflow-hidden border border-[#85D743]/40 bg-black">
                  <img
                    src={sticker.img}
                    alt={sticker.title}
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Holographic light reflection sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  {/* Corner Target Reticles */}
                  <div className="absolute top-1 left-1 text-[#85D743] font-mono text-[7px] leading-none opacity-80">+</div>
                  <div className="absolute top-1 right-1 text-[#85D743] font-mono text-[7px] leading-none opacity-80">+</div>
                  <div className="absolute bottom-1 left-1 text-[#85D743] font-mono text-[7px] leading-none opacity-80">+</div>
                  <div className="absolute bottom-1 right-1 text-[#85D743] font-mono text-[7px] leading-none opacity-80">+</div>
                </div>

                {/* Micro Footer */}
                <div className="w-full flex items-center justify-between px-1 pt-0.5">
                  <span className="font-press-start text-[6px] sm:text-[7px] text-white tracking-tight">
                    {sticker.title}
                  </span>
                  <span className="text-[6px] sm:text-[7px] font-mono font-bold text-[#85D743] bg-[#85D743]/15 px-1.5 py-0.5 rounded border border-[#85D743]/30">
                    {sticker.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 9. FEEDBACK / AUDIT DISPATCH FORM (fixed, z-[55]) */}
      <div
        style={{
          bottom: '50%',
          transform: isFormTriggered
            ? 'translate(-50%, 50%) rotate(0deg)'
            : 'translate(-50%, 150vh) rotate(15deg)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="fixed left-1/2 z-[55] w-[92%] max-w-[460px] p-6 sm:p-8 bg-slate-950/95 border-4 border-[#0033FF] shadow-[10px_10px_0px_#85D743] select-auto transition-all duration-[900ms] pointer-events-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => setFormClosed(true)}
          className="absolute top-4 right-4 font-press-start text-[14px] text-slate-500 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none border-none bg-transparent"
        >
          [X]
        </button>

        {!formSubmitted ? (
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 sm:gap-5">
            <h2 className="font-press-start text-xs sm:text-sm text-[#85D743] tracking-widest uppercase text-center mb-1">
              SECURITY DISPATCH // AUDIT INTAKE
            </h2>

            <div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="YOUR NAME / SECURITY HANDLE"
                className="font-mono text-xs text-white bg-slate-900 border-2 border-slate-700 focus:border-[#85D743] hover:border-slate-500 focus:outline-none p-2.5 w-full uppercase transition-all placeholder-slate-600"
              />
            </div>

            <div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="SECURITY@DOMAIN.COM"
                className="font-mono text-xs text-white bg-slate-900 border-2 border-slate-700 focus:border-[#85D743] hover:border-slate-500 focus:outline-none p-2.5 w-full transition-all placeholder-slate-600"
              />
            </div>

            <div>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="TARGET REPO OR ARCHITECTURE REQUEST..."
                className="font-mono text-xs text-white bg-slate-900 border-2 border-slate-700 focus:border-[#85D743] hover:border-slate-500 focus:outline-none p-2.5 w-full resize-none transition-all placeholder-slate-600"
              />
            </div>

            <button
              type="submit"
              className="font-press-start text-[8px] sm:text-[9px] text-black bg-[#85D743] hover:bg-[#9bfb4e] active:translate-y-0.5 active:shadow-none border-2 border-black py-3 px-6 shadow-[4px_4px_0px_#0033FF] w-full font-bold uppercase tracking-widest cursor-pointer select-none transition-all mt-1"
            >
              LAUNCH SECURITY TRANSMISSION
            </button>

            {/* Direct Workstation Quick-Access */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={() => onEnterApp('scanner')}
                className="font-press-start text-[7px] sm:text-[8px] text-[#85D743] bg-slate-900 hover:bg-slate-800 border border-[#85D743]/50 py-2 px-3 w-1/2 uppercase transition-all cursor-pointer"
              >
                [ OPEN SCANNER ]
              </button>
              <button
                type="button"
                onClick={onLoadDemo}
                className="font-press-start text-[7px] sm:text-[8px] text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 py-2 px-3 w-1/2 uppercase transition-all cursor-pointer"
              >
                [ BENCHMARK DEMO ]
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center py-4">
            <div className="font-press-start text-[32px] text-[#85D743] mb-4 animate-bounce">
              ✦
            </div>
            <h3 className="font-press-start text-xs sm:text-sm text-[#85D743] mb-3 tracking-widest uppercase">
              TRANSMISSION SECURED
            </h3>
            <p className="font-mono text-[10px] sm:text-xs text-slate-400 max-w-sm mb-6 uppercase leading-relaxed">
              Your security assessment request is secured in our neural network database.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={() => onEnterApp('overview')}
                className="font-press-start text-[8px] sm:text-[9px] text-black bg-[#85D743] hover:bg-[#9eff5c] border-2 border-black py-3 px-5 font-bold uppercase tracking-wider shadow-[3px_3px_0px_#0033FF] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                [ ENTER LIVE WORKSTATION ]
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ name: '', email: '', message: '' });
                }}
                className="font-press-start text-[8px] text-slate-400 hover:text-white bg-transparent border-none py-1 uppercase tracking-wider cursor-pointer"
              >
                [ NEW TRANSMISSION ]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
