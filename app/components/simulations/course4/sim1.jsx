'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course4Sim1({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);
  const initialized = useRef(false);
  
  // Timing variables matching Course 1 style
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500; 
  const ANIMATION_DURATION = 2000; 
  const EXTRA_WAIT = 500; 

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let isMounted = true;

    // 1. Show Quote centered
    setTimeout(() => {
      if (isMounted) setPhase(1);
    }, QUOTE_IN_TIME);

    // 2. Move Quote to Top & Show Simulation Objects
    setTimeout(() => {
      if (isMounted) {
        setPhase(2);
        setIsAnimating(true);
      }
    }, SIM_IN_TIME);

    // 3. Unlock Next Button
    setTimeout(() => {
      if (isMounted) {
        setPhase(3);
        if (onComplete) onComplete(); 
      }
    }, SIM_IN_TIME + ANIMATION_DURATION + EXTRA_WAIT);

    return () => { isMounted = false; };
  }, [onComplete]);

  useEffect(() => {
    if (!isAnimating) return; 

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let startTime = performance.now();

    function drawArrow(context, startX, startY, angle, magnitude, color) {
      if (Math.abs(magnitude) < 0.1) return;
      const len = magnitude;
      const endX = startX + Math.cos(angle) * len;
      const endY = startY + Math.sin(angle) * len;

      context.strokeStyle = color; 
      context.fillStyle = color; 
      context.lineWidth = 4;
      
      // Draw Line
      context.beginPath(); 
      context.moveTo(startX, startY); 
      context.lineTo(endX, endY); 
      context.stroke();
      
      // Draw Head
      const arrowAngle = Math.atan2(endY - startY, endX - startX);
      const headLen = 12;
      context.beginPath(); 
      context.moveTo(endX, endY);
      context.lineTo(endX - headLen * Math.cos(arrowAngle - Math.PI/6), endY - headLen * Math.sin(arrowAngle - Math.PI/6));
      context.lineTo(endX - headLen * Math.cos(arrowAngle + Math.PI/6), endY - headLen * Math.sin(arrowAngle + Math.PI/6));
      context.fill();
    }

    function render(timestamp) {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
      }
      
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const redX = cw / 2 - 120;
      const blueX = cw / 2 + 120;
      const cy = ch / 2 + 20;

      // Draw Particles
      ctx.beginPath();
      ctx.arc(redX, cy, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Red
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(blueX, cy, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6'; // Blue
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Animation Cycle Math (5000ms loop for slow, understandable demonstration)
      // 0-1000: Wait on top
      // 1000-2000: Move to center
      // 2000-3000: Wait on center
      // 3000-4000: Move back to top
      // 4000-5000: Wait
      const cycleTime = (timestamp - startTime) % 5000;
      let t = 0;
      
      if (cycleTime < 1000) {
        t = 0;
      } else if (cycleTime < 2000) {
        t = (cycleTime - 1000) / 1000; // 0 to 1
      } else if (cycleTime < 3000) {
        t = 1;
      } else if (cycleTime < 4000) {
        t = 1 - ((cycleTime - 3000) / 1000); // 1 to 0
      } else {
        t = 0;
      }

      // Smooth easing function (easeInOutQuad)
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // RED ARROW (Force from Red applied to Blue)
      // Points right (0 rad)
      // The tail (startX) starts above the Red particle, and moves exactly to the center of the Blue particle
      const rStart = { x: redX, y: cy - 70 };
      const rEnd = { x: blueX, y: cy };
      
      const rCurrentX = rStart.x + (rEnd.x - rStart.x) * easeT;
      const rCurrentY = rStart.y + (rEnd.y - rStart.y) * easeT;
      
      drawArrow(ctx, rCurrentX, rCurrentY, 0, 50, '#ef4444');

      // BLUE ARROW (Force from Blue applied to Red)
      // Points left (PI rad)
      // The tail (startX) starts above the Blue particle, and moves exactly to the center of the Red particle
      const bStart = { x: blueX, y: cy - 70 };
      const bEnd = { x: redX, y: cy };
      
      const bCurrentX = bStart.x + (bEnd.x - bStart.x) * easeT;
      const bCurrentY = bStart.y + (bEnd.y - bStart.y) * easeT;

      drawArrow(ctx, bCurrentX, bCurrentY, Math.PI, 50, '#3b82f6');

      // Labels 
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      
      if (t > 0.8) {
         ctx.fillText("F_blue_on_red", redX, cy + 60);
         ctx.fillText("F_red_on_blue", blueX, cy + 60);
      } else if (t < 0.2) {
         ctx.fillText("Force Vector", redX, cy - 90);
         ctx.fillText("Force Vector", blueX, cy - 90);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isAnimating]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-8 translate-y-0' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "For every action, there is an equal and opposite reaction."
        </h2>
      </div>

      {/* PHASE 2 & 3: The Simulation Objects */}
      <div 
        className={`w-full flex-grow relative transition-all duration-1000 flex flex-col z-10 mt-24
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <canvas ref={canvasRef} className="w-full flex-grow block min-h-[300px]"></canvas>
      </div>

    </div>
  );
}
