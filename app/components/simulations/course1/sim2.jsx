'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course1Sim2({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [activeConcept, setActiveConcept] = useState(0); // 0 = Velocity, 1 = Snapping
  
  const canvasRef = useRef(null);
  const conceptRef = useRef(0);
  const conceptStartTimeRef = useRef(Date.now());
  const initialized = useRef(false);
  
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 3500; 
  const ANIMATION_DURATION = 6000; 
  const EXTRA_WAIT = 1000;

  // Handles Phase Progression
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let isMounted = true;

    setTimeout(() => { if (isMounted) setPhase(1); }, QUOTE_IN_TIME);
    setTimeout(() => { if (isMounted) setPhase(2); }, SIM_IN_TIME);
    setTimeout(() => {
      if (isMounted) {
        setPhase(3);
        if (onComplete) onComplete(); 
      }
    }, SIM_IN_TIME + ANIMATION_DURATION + EXTRA_WAIT);

    return () => { isMounted = false; };
  }, [onComplete]);

  // Alternates concepts every 6 seconds once simulation reveals
  const isSimRevealed = phase >= 2;
  useEffect(() => {
    if (!isSimRevealed) return;
    
    conceptStartTimeRef.current = Date.now();
    
    const interval = setInterval(() => {
      setActiveConcept(prev => {
        const nextConcept = prev === 0 ? 1 : 0;
        conceptRef.current = nextConcept;
        conceptStartTimeRef.current = Date.now();
        return nextConcept;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isSimRevealed]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (phase < 2) return; 

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let offset = 0; 

    function render() {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
      }
      
      const cw = canvas.width;
      const ch = canvas.height;
      const concept = conceptRef.current;
      const timeInConcept = Date.now() - conceptStartTimeRef.current;

      ctx.clearRect(0, 0, cw, ch);

      if (concept === 0) {
        // ==========================================
        // CONCEPT 0: VELOCITY & MOVING BOX
        // ==========================================
        const groundY = ch - 80;
        const speed = 3; 

        // Update ground offset (moving left to simulate box moving right)
        offset = (offset + speed) % 60; 

        // Draw Ground
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(cw, groundY);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#334155';
        for (let i = -60; i < cw + 60; i += 60) {
          ctx.beginPath();
          ctx.moveTo(i - offset, groundY);
          ctx.lineTo(i - offset - 30, groundY + 30);
          ctx.stroke();
        }

        // Draw Box
        const boxSize = 100;
        const boxX = cw / 2 - boxSize / 2;
        const boxY = groundY - boxSize;

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(boxX, boxY, boxSize, boxSize);
        
        ctx.strokeStyle = '#60a5fa'; 
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        ctx.beginPath();
        ctx.moveTo(boxX, boxY);
        ctx.lineTo(boxX + boxSize, boxY + boxSize);
        ctx.moveTo(boxX + boxSize, boxY);
        ctx.lineTo(boxX, boxY + boxSize);
        ctx.stroke();

        // Draw Velocity Arrow
        const arrowStartX = boxX + boxSize / 2;
        const arrowStartY = boxY - 30;
        const arrowLength = 80;

        ctx.strokeStyle = '#fbbf24'; 
        ctx.fillStyle = '#fbbf24';
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.lineTo(arrowStartX + arrowLength, arrowStartY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowStartX + arrowLength + 10, arrowStartY);
        ctx.lineTo(arrowStartX + arrowLength - 10, arrowStartY - 10);
        ctx.lineTo(arrowStartX + arrowLength - 10, arrowStartY + 10);
        ctx.fill();

        ctx.font = 'italic 20px serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('v', arrowStartX + arrowLength / 2 - 5, arrowStartY - 10);

      } else {
        // ==========================================
        // CONCEPT 1: STRESS, FATIGUE & SNAPPING
        // ==========================================
        const isSnapped = timeInConcept > 4500; // Snaps at 4.5 seconds
        
        const beamY = ch / 2;
        const leftX = cw * 0.2;
        const rightX = cw * 0.8;
        const midX = cw / 2;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (isSnapped) {
          // Draw Snapped Beam (Left)
          ctx.beginPath();
          ctx.moveTo(leftX, beamY);
          ctx.lineTo(midX - 15, beamY + 30); 
          ctx.strokeStyle = '#64748b'; // Turns grey when dead
          ctx.lineWidth = 8;
          ctx.stroke();

          // Draw Snapped Beam (Right)
          ctx.beginPath();
          ctx.moveTo(rightX, beamY);
          ctx.lineTo(midX + 15, beamY + 30);
          ctx.stroke();

          // Explosion / Snap Text
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💥 SNAP!', midX, beamY - 20);
        } else {
          // Calculate increasing amplitude over time
          let amplitude = Math.min((timeInConcept / 4500) * 45, 45); 
          let bendY = Math.sin(timeInConcept / 50) * amplitude; 

          // Draw Bending Beam
          ctx.beginPath();
          ctx.moveTo(leftX, beamY);
          ctx.quadraticCurveTo(midX, beamY + bendY, rightX, beamY);

          // Beam gets redder and slightly thinner right before snap
          const redAmount = Math.floor((timeInConcept / 4500) * 255);
          ctx.strokeStyle = `rgb(${redAmount}, 148, 163)`; 
          ctx.lineWidth = 10 - (timeInConcept / 4500) * 4;
          ctx.stroke();

          // Draw Downward Force Arrow
          const arrowY = beamY + bendY - 60;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(midX - 3, arrowY, 6, 40);
          ctx.beginPath();
          ctx.moveTo(midX - 15, arrowY + 40);
          ctx.lineTo(midX + 15, arrowY + 40);
          ctx.lineTo(midX, arrowY + 60);
          ctx.fill();
        }
        
        // Draw Anchor Points
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.arc(leftX, beamY, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rightX, beamY, 12, 0, Math.PI * 2); ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  return (
    <div className="glass-panel rounded-2xl border-l-4 border-l-sky-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote - Moves up but no longer shrinks in size */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2 scale-95' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2 scale-100' : ''}
          ${phase >= 2 ? 'opacity-100 top-8 scale-100' : ''}
        `}
      >
        <h2 className={`font-serif italic text-center drop-shadow-lg tracking-wide transition-colors duration-1000 text-3xl md:text-4xl
          ${phase >= 2 ? 'text-sky-200' : 'text-white'}
        `}>
          "Time is the most crucial aspect in physics"
        </h2>
      </div>

      {/* PHASE 2 & 3: The Alternating Concepts */}
      <div 
        className={`w-full h-full mt-24 flex-grow flex flex-col md:flex-row relative z-10 transition-all duration-1000 delay-300
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Left Object: The Alternating Texts */}
        <div className="w-full md:w-1/2 relative flex items-center justify-center p-8 md:p-12 min-h-[250px]">
          
          <div className={`absolute transition-opacity duration-700 w-full flex justify-center md:justify-start px-8 md:px-12 ${activeConcept === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-300 drop-shadow-sm text-center md:text-left">
              Velocity <span className="text-emerald-400">+</span> time <br />
              will get us <br />
              <span className="text-amber-400 border-b-4 border-amber-400 pb-1">where</span> a thing is.
            </h3>
          </div>

          <div className={`absolute transition-opacity duration-700 w-full flex justify-center md:justify-start px-8 md:px-12 ${activeConcept === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-rose-300 drop-shadow-sm text-center md:text-left">
              Stress <span className="text-rose-400">+</span> time <br />
              will tell us if <br />
              a material will <span className="text-rose-400 border-b-4 border-rose-400 pb-1">snap</span>.
            </h3>
          </div>

        </div>

        {/* Right Object: The Alternating Canvas Illustrations */}
        <div className="w-full md:w-1/2 relative min-h-[300px] flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full absolute inset-0"></canvas>
          
          {/* Concept 0 Overlay */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 backdrop-blur-sm text-xs text-slate-400 font-mono text-center transition-opacity duration-500 ${activeConcept === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            Relative Motion Engine Active <br/>
            <span className="text-sky-400 font-bold">Δx = v × Δt</span>
          </div>

          {/* Concept 1 Overlay */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 backdrop-blur-sm text-xs text-slate-400 font-mono text-center transition-opacity duration-500 ${activeConcept === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            Material Fatigue Engine Active <br/>
            <span className="text-rose-400 font-bold">Stress × Cycles = Rupture</span>
          </div>
        </div>

      </div>

    </div>
  );
}