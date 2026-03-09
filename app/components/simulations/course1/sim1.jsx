'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course1Sim1({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const canvasRef = useRef(null);
  const initialized = useRef(false);
  
  // Timings - Made faster as requested
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2000; // Reduced from 2500
  const ANIMATION_DURATION = 2000; // Reduced from 6000
  const EXTRA_WAIT = 500; // Reduced from 2000

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
      if (isMounted) setPhase(2);
    }, SIM_IN_TIME);

    // 3. Unlock Next Button (Animation keeps playing)
    setTimeout(() => {
      if (isMounted) {
        setPhase(3);
        if (onComplete) onComplete(); // Enables Next button
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
      // 1. DAY/NIGHT CYCLE (Left) - Sun, Earth, Moon
      // ==========================================
      const sunX = leftCx;
      const sunY = cy;
      
      const earthOrbitR = 60;
      const earthAngle = dt * 1.0; // Earth orbits the Sun
      const earthX = sunX + Math.cos(earthAngle) * earthOrbitR;
      const earthY = sunY + Math.sin(earthAngle) * earthOrbitR;

      const moonOrbitR = 20;
      const moonAngle = dt * 4.0; // Moon orbits the Earth
      const moonX = earthX + Math.cos(moonAngle) * moonOrbitR;
      const moonY = earthY + Math.sin(moonAngle) * moonOrbitR;

      // Earth Orbit path
      ctx.beginPath();
      ctx.arc(sunX, sunY, earthOrbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Moon Orbit path (faint)
      ctx.beginPath();
      ctx.arc(earthX, earthY, moonOrbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();

      // Sun
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24'; // Yellow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Earth
      ctx.beginPath();
      ctx.arc(earthX, earthY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6'; // Blue
      ctx.fill();

      // Moon
      ctx.beginPath();
      ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0'; // White/Gray
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("Cycles", leftCx, cy + 100);

      // ==========================================
      // 2. THE SAND CLOCK / HOURGLASS (Middle)
      // ==========================================
      const hgW = 40;
      const hgH = 60;
      
      const tWait = 0.5;   // wait with sand at bottom
      const tFlip = 1.0;   // time to rotate 180 degrees
      const tFall = 4.0;   // time for sand to fall
      const totalCycle = tWait + tFlip + tFall;
      
      const tLocal = dt % totalCycle;
      
      let flipAngle = 0;
      let topFill = 0;
      let botFill = 1;
      let isFalling = false;

      // State Machine for seamless looping without snapping
      if (tLocal < tWait) {
        // Phase 1: Resting at bottom
        flipAngle = 0;
        topFill = 0;
        botFill = 1;
      } else if (tLocal < tWait + tFlip) {
        // Phase 2: Flipping
        const t = (tLocal - tWait) / tFlip;
        // Ease in-out calculation for smooth rotation
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        flipAngle = easeT * Math.PI;
        topFill = 0;
        botFill = 1; // Sand stays visually in the bottom chamber as it flips up
      } else {
        // Phase 3: Falling 
        // We reset the angle back to 0. A 180 deg (PI) rotated symmetric glass 
        // is visually identical to a 0 deg glass. We then move the sand to top.
        flipAngle = 0; 
        isFalling = true;
        const f = (tLocal - (tWait + tFlip)) / tFall;
        topFill = 1 - f;
        botFill = f;
      }

      // Isolate the hourglass transform so it spins from its center
      ctx.save();
      ctx.translate(midCx, cy);
      ctx.rotate(flipAngle);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      
      // Top Triangle Glass (relative to 0,0)
      ctx.beginPath();
      ctx.moveTo(-hgW, -hgH);
      ctx.lineTo(hgW, -hgH);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.stroke();

      // Bottom Triangle Glass (relative to 0,0)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-hgW, hgH);
      ctx.lineTo(hgW, hgH);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      
      // Draw Top Sand (pools towards the central hole)
      if (topFill > 0) {
        const topSandH = hgH * topFill;
        const topSandW = hgW * topFill;
        ctx.beginPath();
        ctx.moveTo(-topSandW, -topSandH);
        ctx.lineTo(topSandW, -topSandH);
        ctx.lineTo(0, 0);
        ctx.fill();
      }

      // Draw Bottom Sand (piles up from the bottom)
      if (botFill > 0) {
        const botSandH = hgH * botFill;
        const botSandW = hgW * botFill;
        ctx.beginPath();
        ctx.moveTo(-botSandW, hgH);
        ctx.lineTo(botSandW, hgH);
        ctx.lineTo(0, hgH - botSandH);
        ctx.fill();
      }

      // Draw falling sand stream
      if (isFalling) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Stream connects center hole down to the peak of the bottom pile
        ctx.lineTo(0, hgH - (hgH * botFill));
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
      }

      // Restore canvas context to draw everything else straight
      ctx.restore();

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

      // Draw trail effect
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

      {/* PHASE 1 & 2: The Quote - centered then moves to top without shrinking */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-8 translate-y-0' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "Physics is a knowledge to know how things were and how things will be."
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
