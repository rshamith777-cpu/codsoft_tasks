import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VIDEO_URL = "https://stream.mux.com/W2NRcV6MrewS7QyWWqAWZvJR9jrnPU5rxymlPg01gRzk.m3u8";

export const BackgroundCanvas: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: false,
      });

      hls.loadSource(VIDEO_URL);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls && hls.levels && hls.levels.length > 0) {
          hls.currentLevel = hls.levels.length - 1; // Highest quality
        }
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VIDEO_URL;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Deep slate true-black foundation */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* REAL HOMEPAGE HLS STREAMING VIDEO (ambient background loop) */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        crossOrigin="anonymous"
        className="video-sharp-smooth absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40"
      />

      {/* Atmospheric technical radial gradients matching homepage ambient mood */}
      <div 
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1400px] h-[800px] rounded-full opacity-[0.22] blur-[160px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(133, 215, 67, 0.4) 0%, rgba(0, 51, 255, 0.25) 50%, rgba(0,0,0,0) 75%)' 
        }}
      />
      
      <div 
        className="absolute -bottom-[20%] right-[-10%] w-[1100px] h-[750px] rounded-full opacity-[0.16] blur-[180px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(0, 51, 255, 0.2) 50%, rgba(0,0,0,0) 75%)' 
        }}
      />

      {/* Subtle technical grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Cinematic vignette to guarantee 100% crisp foreground contrast */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.55) 0%, rgba(2, 6, 23, 0.78) 60%, rgba(2, 6, 23, 0.95) 100%)'
        }}
      />

      {/* Micro-sharp cyber scanline texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)'
        }}
      />

      {/* Ambient Cyber Telemetry Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 sm:p-12 opacity-35">
        <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-[#85D743] tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#85D743] animate-pulse" />
            <span>[ SAST AST_ENGINE: ACTIVE ]</span>
            <span className="hidden md:inline text-white/40">//</span>
            <span className="hidden md:inline">[ RULES: 18 SIGNATURES LOADED ]</span>
          </div>
          <div className="text-right font-press-start text-[7px] text-[#85D743]/80">
            CODESENTINEL V2.4
          </div>
        </div>

        <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-[#85D743]/70 tracking-widest uppercase">
          <div>
            <span>[ TARGET: REPOSITORY SOURCE TREE ]</span>
          </div>
          <div className="hidden sm:block">
            <span>[ SECURITY CLASSIFICATION: TOP SECRET // SAST ]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
