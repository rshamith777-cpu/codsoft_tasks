import React from 'react';

export const BackgroundCanvas: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep black background */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* Atmospheric subtle radial light gradients */}
      <div 
        className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-[0.14] blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(200,210,230,0.2) 50%, rgba(0,0,0,0) 80%)' }}
      />
      
      <div 
        className="absolute -bottom-[20%] right-[-10%] w-[800px] h-[600px] rounded-full opacity-[0.06] blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,140,220,0.6) 0%, rgba(0,0,0,0) 70%)' }}
      />

      {/* Subtle technical grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};
