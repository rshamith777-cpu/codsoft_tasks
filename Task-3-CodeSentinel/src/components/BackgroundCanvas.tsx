import React from 'react';

export const BackgroundCanvas: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Deep true-black foundation */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Atmospheric technical radial gradients matching homepage ambient mood */}
      <div 
        className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-[0.16] blur-[140px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(133, 215, 67, 0.35) 0%, rgba(0, 51, 255, 0.2) 50%, rgba(0,0,0,0) 75%)' 
        }}
      />
      
      <div 
        className="absolute -bottom-[20%] right-[-10%] w-[900px] h-[650px] rounded-full opacity-[0.12] blur-[160px] pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(0, 51, 255, 0.15) 50%, rgba(0,0,0,0) 75%)' 
        }}
      />

      {/* Subtle technical grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Sleek cinematic vignette preserving high-contrast center */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.1) 0%, rgba(2, 6, 23, 0.4) 65%, rgba(2, 6, 23, 0.85) 100%)'
        }}
      />

      {/* Micro-sharp cyber scanline texture for unified display continuity */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)'
        }}
      />
    </div>
  );
};
