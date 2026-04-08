'use client';

import { useEffect, useRef } from 'react';

export default function Course4Sim2({ simId, onComplete }) {
  const canvasRef = useRef(null);

  // Instantly unlock the 'Next' button for this placeholder
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;

    function render(timestamp) {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
      }
      
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      // Single Particle Floating in Center
      const cy = ch / 2 + Math.sin(timestamp / 500) * 10;
      const cx = cw / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.fill();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#10b981';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Single Particle Overview", cx, cy + 70);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="mb-6 relative z-10">
        <h3 className="text-2xl font-bold text-white">Momentum Dynamics</h3>
        <p className="text-emerald-400 text-sm font-mono mt-1">Free body isolation</p>
      </div>

      <div className="w-full flex-grow relative z-10 flex flex-col">
        <canvas ref={canvasRef} className="w-full flex-grow block min-h-[300px] bg-slate-900/30 rounded-xl border border-white/10"></canvas>
      </div>

    </div>
  );
}
