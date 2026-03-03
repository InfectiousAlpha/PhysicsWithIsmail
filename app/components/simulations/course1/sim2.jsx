'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course1Sim2({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  // Phases: 
  // 0: Start (Blank)
  // 1: Quote fades in at the center
  // 2: Quote moves up, 2 objects (text + canvas) fade in
  // 3: Animation complete, unlocks next button
  
  const canvasRef = useRef(null);
  
  // Timings
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 3500; 
  const ANIMATION_DURATION = 6000; // Time user watches the animation before unlock
  const EXTRA_WAIT = 1000;

  useEffect(() => {
    let isMounted = true;

    // 1. Show Quote in the middle
    setTimeout(() => {
      if (isMounted) setPhase(1);
    }, QUOTE_IN_TIME);

    // 2. Move quote up & Show Simulation Objects
    setTimeout(() => {
      if (isMounted) setPhase(2);
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
    if (phase < 2) return; // Wait for phase 2 to start drawing

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let offset = 0; // For moving the ground

    function render() {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
      }
      
      const cw = canvas.width;
      const ch = canvas.height;

      ctx.clearRect(0, 0, cw, ch);

      const groundY = ch - 80;
      const speed = 3; // Speed of the moving ground

      // Update ground offset (moving left to simulate box moving right)
      offset = (offset + speed) % 60; 

      // ==========================================
      // 1. DRAW MOVING GROUND
      // ==========================================
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(cw, groundY);
      ctx.stroke();

      // Draw sliding floor lines to create the illusion of movement
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#334155';
      for (let i = -60; i < cw + 60; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i - offset, groundY);
        ctx.lineTo(i - offset - 30, groundY + 30);
        ctx.stroke();
      }

      // ==========================================
      // 2. DRAW THE BOX (Stationary on canvas, looks like moving)
      // ==========================================
      const boxSize = 100;
      const boxX = cw / 2 - boxSize / 2;
      const boxY = groundY - boxSize;

      // Box Body
      ctx.fillStyle = '#3b82f6'; // primary blue
      ctx.fillRect(boxX, boxY, boxSize, boxSize);
      
      // Box Inner Lines (Crate texture)
      ctx.strokeStyle = '#60a5fa'; // lighter blue
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxSize, boxSize);
      ctx.beginPath();
      ctx.moveTo(boxX, boxY);
      ctx.lineTo(boxX + boxSize, boxY + boxSize);
      ctx.moveTo(boxX + boxSize, boxY);
      ctx.lineTo(boxX, boxY + boxSize);
      ctx.stroke();

      // ==========================================
      // 3. DRAW VELOCITY ARROW
      // ==========================================
      const arrowStartX = boxX + boxSize / 2;
      const arrowStartY = boxY - 30;
      const arrowLength = 80;

      ctx.strokeStyle = '#fbbf24'; // amber
      ctx.fillStyle = '#fbbf24';
      ctx.lineWidth = 4;

      // Line
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowStartX + arrowLength, arrowStartY);
      ctx.stroke();

      // Arrow Head
      ctx.beginPath();
      ctx.moveTo(arrowStartX + arrowLength + 10, arrowStartY);
      ctx.lineTo(arrowStartX + arrowLength - 10, arrowStartY - 10);
      ctx.lineTo(arrowStartX + arrowLength - 10, arrowStartY + 10);
      ctx.fill();

      // Velocity Text ('v')
      ctx.font = 'italic 20px serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('v', arrowStartX + arrowLength / 2 - 5, arrowStartY - 10);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  return (
    <div className="glass-panel rounded-2xl border-l-4 border-l-sky-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2 scale-95' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2 scale-100' : ''}
          ${phase >= 2 ? 'opacity-100 top-8 scale-90' : ''}
        `}
      >
        <h2 className={`font-serif italic text-center drop-shadow-lg tracking-wide transition-all duration-1000
          ${phase >= 2 ? 'text-2xl text-sky-200' : 'text-3xl md:text-4xl text-white'}
        `}>
          "Time is the most crucial aspect in physics"
        </h2>
      </div>

      {/* PHASE 2 & 3: The Simulation Objects (Text + Canvas) */}
      <div 
        className={`w-full h-full mt-24 flex-grow flex flex-col md:flex-row relative z-10 transition-all duration-1000 delay-300
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Left Object: The Text */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
          <h3 className="text-3xl md:text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-300 drop-shadow-sm text-center md:text-left">
            Velocity <span className="text-emerald-400">+</span> time <br />
            will get us <br />
            <span className="text-amber-400 border-b-4 border-amber-400 pb-1">where</span> a thing is.
          </h3>
        </div>

        {/* Right Object: The Canvas Illustration */}
        <div className="w-full md:w-1/2 relative min-h-[300px] flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full absolute inset-0"></canvas>
          
          {/* Overlay to describe relativity */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 backdrop-blur-sm text-xs text-slate-400 font-mono text-center">
            Relative Motion Engine Active <br/>
            <span className="text-sky-400 font-bold">Δx = v × Δt</span>
          </div>
        </div>

      </div>

    </div>
  );
}
