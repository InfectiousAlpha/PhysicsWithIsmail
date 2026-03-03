'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course1Sim1({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); // 0: Start, 1: Quote Fade In, 2: Sim Fade In, 3: Unlocked
  const canvasRef = useRef(null);
  
  // Timings
  const QUOTE_IN_TIME = 1000;
  const SIM_IN_TIME = 5000;
  const ANIMATION_DURATION = 6000; // How long the canvas animates before unlocking
  const EXTRA_WAIT = 2000;

  useEffect(() => {
    let isMounted = true;

    // 1. Show Quote
    setTimeout(() => {
      if (isMounted) setPhase(1);
    }, QUOTE_IN_TIME);

    // 2. Hide Quote, Show Simulation Objects
    setTimeout(() => {
      if (isMounted) setPhase(2);
    }, SIM_IN_TIME);

    // 3. Unlock Next Button (Animation + 2 seconds)
    setTimeout(() => {
      if (isMounted) {
        setPhase(3);
        if (onComplete) onComplete(); // This tells SimulationCarousel to enable the Next button!
      }
    }, SIM_IN_TIME + ANIMATION_DURATION + EXTRA_WAIT);

    return () => { isMounted = false; };
  }, [onComplete]);

  useEffect(() => {
    if (phase < 2) return; // Don't draw until we reach phase 2

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let startTime = performance.now();

    // Bouncing Ball State
    let ball = { x: 0, y: 0, vx: 150, vy: -120, r: 10 };

    function render(timestamp) {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
      }
      
      const dt = (timestamp - startTime) / 1000; // time in seconds
      const cw = canvas.width;
      const ch = canvas.height;

      ctx.clearRect(0, 0, cw, ch);

      // We divide the canvas into 3 horizontal sections
      const leftCx = cw * (1/6);
      const midCx = cw * (1/2);
      const rightCx = cw * (5/6);
      const cy = ch / 2;

      // ==========================================
      // 1. THE PENDULUM (Left)
      // ==========================================
      const pendLen = 80;
      const angle = Math.sin(dt * 3) * (Math.PI / 3); // Oscillate
      const pivotX = leftCx;
      const pivotY = cy - 40;
      const bobX = pivotX + Math.sin(angle) * pendLen;
      const bobY = pivotY + Math.cos(angle) * pendLen;

      // String
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pivot
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();

      // Bob
      ctx.beginPath();
      ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#3b82f6';
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Rhythm", leftCx, cy + 80);

      // ==========================================
      // 2. THE SAND CLOCK / HOURGLASS (Middle)
      // ==========================================
      const hgW = 40;
      const hgH = 60;
      
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      
      // Top Triangle
      ctx.beginPath();
      ctx.moveTo(midCx - hgW, cy - hgH);
      ctx.lineTo(midCx + hgW, cy - hgH);
      ctx.lineTo(midCx, cy);
      ctx.closePath();
      ctx.stroke();

      // Bottom Triangle
      ctx.beginPath();
      ctx.moveTo(midCx, cy);
      ctx.lineTo(midCx - hgW, cy + hgH);
      ctx.lineTo(midCx + hgW, cy + hgH);
      ctx.closePath();
      ctx.stroke();

      // Sand Logic (fills bottom, empties top over 10 seconds)
      const fillRatio = Math.min(dt / 10, 1); 
      
      ctx.fillStyle = '#fbbf24';
      // Top Sand
      if (fillRatio < 1) {
        const topSandH = hgH * (1 - fillRatio);
        const topSandW = hgW * (1 - fillRatio);
        ctx.beginPath();
        ctx.moveTo(midCx - topSandW, cy - topSandH);
        ctx.lineTo(midCx + topSandW, cy - topSandH);
        ctx.lineTo(midCx, cy);
        ctx.fill();
        
        // Falling sand stream
        ctx.beginPath();
        ctx.moveTo(midCx, cy);
        ctx.lineTo(midCx, cy + hgH);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
      }

      // Bottom Sand
      const botSandH = hgH * fillRatio;
      const botSandW = hgW * fillRatio;
      ctx.beginPath();
      ctx.moveTo(midCx - botSandW, cy + hgH);
      ctx.lineTo(midCx + botSandW, cy + hgH);
      ctx.lineTo(midCx, cy + hgH - botSandH);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Entropy", midCx, cy + 90);

      // ==========================================
      // 3. BOUNCING BALL IN BOX (Right)
      // ==========================================
      const boxSize = 100;
      const boxLeft = rightCx - boxSize / 2;
      const boxTop = cy - boxSize / 2;

      // Initialize ball pos if first frame
      if (ball.x === 0 && ball.y === 0) {
        ball.x = rightCx;
        ball.y = cy;
      }

      // Physics step for ball (delta time approx 0.016 for 60fps)
      const step = 0.016; 
      ball.x += ball.vx * step;
      ball.y += ball.vy * step;

      // Bounce Logic
      if (ball.x - ball.r < boxLeft) { ball.x = boxLeft + ball.r; ball.vx *= -1; }
      if (ball.x + ball.r > boxLeft + boxSize) { ball.x = boxLeft + boxSize - ball.r; ball.vx *= -1; }
      if (ball.y - ball.r < boxTop) { ball.y = boxTop + ball.r; ball.vy *= -1; }
      if (ball.y + ball.r > boxTop + boxSize) { ball.y = boxTop + boxSize - ball.r; ball.vy *= -1; }

      // Draw Box
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxLeft, boxTop, boxSize, boxSize);

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899'; // pink
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ec4899';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw trail effect (simple)
      ctx.beginPath();
      ctx.arc(ball.x - ball.vx*step*3, ball.y - ball.vy*step*3, ball.r*0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Dynamics", rightCx, cy + 80);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-indigo-500 overflow-hidden text-white mb-8 flex flex-col items-center justify-center min-h-[500px] relative">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* PHASE 1: The Quote */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-1000 transform
          ${phase === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          ${phase > 1 ? '-translate-y-10' : ''}
        `}
      >
        <h2 className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed tracking-wide drop-shadow-lg">
          "Physics is a knowledge to know how things were and how things will be."
        </h2>
      </div>

      {/* PHASE 2 & 3: The Simulation Objects */}
      <div 
        className={`w-full flex-grow relative transition-all duration-1000 
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <div className="absolute top-0 left-0 w-full text-center mt-4">
          <h3 className="text-2xl font-bold text-indigo-300 tracking-widest uppercase text-sm mb-2">The Faces of Time</h3>
          {phase < 3 ? (
            <p className="text-slate-400 animate-pulse text-xs font-mono">Observing the timeline... Please wait.</p>
          ) : (
            <p className="text-emerald-400 text-xs font-mono font-bold">Timeline synchronized. You may proceed.</p>
          )}
        </div>
        
        <canvas ref={canvasRef} className="w-full h-full block min-h-[400px]"></canvas>
      </div>

    </div>
  );
}
