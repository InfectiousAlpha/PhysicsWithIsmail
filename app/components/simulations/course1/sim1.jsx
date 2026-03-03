'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course1Sim1({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); // 0: Start, 1: Quote Fade In, 2: Sim Fade In, 3: Unlocked
  const canvasRef = useRef(null);
  
  // Timings
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500; 
  const ANIMATION_DURATION = 6000; // How long the canvas animates before unlocking
  const EXTRA_WAIT = 2000;

  useEffect(() => {
    let isMounted = true;

    // 1. Show Quote
    setTimeout(() => {
      if (isMounted) setPhase(1);
    }, QUOTE_IN_TIME);

    // 2. Show Simulation Objects (Quote remains)
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
      
      // Move the centers down to accommodate the quote at the top
      const cy = ch / 2 + 10;

      // ==========================================
      // 1. DAY/NIGHT CYCLE (Left)
      // ==========================================
      const orbitR = 60;
      const dnAngle = dt * 1.5;
      const sunX = leftCx + Math.cos(dnAngle) * orbitR;
      const sunY = cy + Math.sin(dnAngle) * orbitR;
      const moonX = leftCx + Math.cos(dnAngle + Math.PI) * orbitR;
      const moonY = cy + Math.sin(dnAngle + Math.PI) * orbitR;

      // Orbit path
      ctx.beginPath();
      ctx.arc(leftCx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Earth
      ctx.beginPath();
      ctx.arc(leftCx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      // Sun
      ctx.beginPath();
      ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Moon
      ctx.beginPath();
      ctx.arc(moonX, moonY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#e2e8f0';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Cycles", leftCx, cy + 100);

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
      ctx.fillText("Entropy", midCx, cy + 100);

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
      ctx.fillText("Dynamics", rightCx, cy + 100);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-indigo-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1: The Quote */}
      <div 
        className={`w-full flex flex-col items-center justify-center px-4 md:px-12 text-center transition-all duration-1000 transform z-10 pt-4 pb-8 shrink-0
          ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-white leading-relaxed tracking-wide drop-shadow-lg max-w-4xl">
          "Physics is a knowledge to know how things were and how things will be."
        </h2>
      </div>

      {/* PHASE 2 & 3: The Simulation Objects */}
      <div 
        className={`w-full flex-grow relative transition-all duration-1000 flex flex-col z-10
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <canvas ref={canvasRef} className="w-full flex-grow block min-h-[300px]"></canvas>
      </div>

    </div>
  );
}
