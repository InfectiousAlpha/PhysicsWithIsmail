'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course4Sim5({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [isSimReady, setIsSimReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // User Inputs
  const [m1Input, setM1Input] = useState('2');
  const [u1Input, setU1Input] = useState('5.0');
  const [m2Input, setM2Input] = useState('3');
  const [u2Input, setU2Input] = useState('-2.0');
  
  // Collision Type: 1 = Fully Elastic, 0.5 = Half/Partial, 0 = Perfectly Inelastic
  const [eInput, setEInput] = useState('1.0'); 

  // Pre-calculated Math states to show on UI
  const [mathBreakdown, setMathBreakdown] = useState(null);

  const canvasRef = useRef(null);
  const initialized = useRef(false);
  const isPausedRef = useRef(false);
  
  // Physics state kept in a mutable ref for the animation loop
  const physicsState = useRef({
    x1: 100,
    v1: 5,
    m1: 2,
    x2: 500,
    v2: -2,
    m2: 3,
    finalV1: 0,
    finalV2: 0,
    isRunning: false,
    hasCollided: false,
    lastTime: 0
  });

  // Timing variables
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500; 
  const EXTRA_WAIT = 500; 

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Setup initial phase progression
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    let isMounted = true;

    setTimeout(() => { if (isMounted) setPhase(1); }, QUOTE_IN_TIME);
    setTimeout(() => { if (isMounted) { setPhase(2); setIsSimReady(true); } }, SIM_IN_TIME);
    setTimeout(() => { if (isMounted) { setPhase(3); if (onComplete) onComplete(); } }, SIM_IN_TIME + EXTRA_WAIT);

    return () => { isMounted = false; };
  }, [onComplete]);

  // Main Canvas Loop
  useEffect(() => {
    if (!isSimReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    const PARTICLE_RADIUS = 25;

    function drawArrow(context, startX, startY, angle, magnitude, color) {
      if (Math.abs(magnitude) < 0.1) return;
      const endX = startX + Math.cos(angle) * magnitude;
      const endY = startY + Math.sin(angle) * magnitude;

      context.strokeStyle = color; 
      context.fillStyle = color; 
      context.lineWidth = 4;
      
      context.beginPath(); 
      context.moveTo(startX, startY); 
      context.lineTo(endX, endY); 
      context.stroke();
      
      const arrowAngle = Math.atan2(endY - startY, endX - startX);
      const headLen = 10;
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
        if (!physicsState.current.isRunning) {
          physicsState.current.x1 = 100;
          physicsState.current.x2 = canvas.width - 100;
        }
      }
      
      const cw = canvas.width;
      const ch = canvas.height;
      const state = physicsState.current;
      
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;

      // --- PHYSICS UPDATE ---
      if (state.isRunning && !isPausedRef.current) {
        if (!state.hasCollided) {
            // Check for collision
            if (state.x2 - state.x1 <= PARTICLE_RADIUS * 2) {
                state.hasCollided = true;
                // Snap to touching exactly to prevent overlapping glitches
                const centerDist = (state.x1 + state.x2) / 2;
                state.x1 = centerDist - PARTICLE_RADIUS;
                state.x2 = centerDist + PARTICLE_RADIUS;
                
                // Swap velocities to calculated final velocities
                state.v1 = state.finalV1;
                state.v2 = state.finalV2;
            }
        }

        // Move particles (scaled by 20 for visual speed)
        state.x1 += state.v1 * 20 * dt;
        state.x2 += state.v2 * 20 * dt;

        // Keep them on screen (wrap or bounce if they go way off)
        if (state.x1 < -50 || state.x2 > cw + 50 || state.x1 > cw + 50 || state.x2 < -50) {
           // Let them drift off screen
        }
      }

      // --- RENDER ---
      ctx.clearRect(0, 0, cw, ch);
      const cy = ch / 2 - 20;

      // Draw Floor line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, cy + PARTICLE_RADIUS);
      ctx.lineTo(cw, cy + PARTICLE_RADIUS);
      ctx.stroke();

      const drawParticle = (x, color, m, v, label) => {
        ctx.beginPath();
        ctx.arc(x, cy, PARTICLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m}kg`, x, cy);
        
        if (Math.abs(v) > 0.1) {
          const vMag = Math.min(Math.abs(v) * 10, 80);
          const vAng = v > 0 ? 0 : Math.PI;
          drawArrow(ctx, x, cy - 35, vAng, vMag, color);
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(label, x, cy - 65);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`v: ${v.toFixed(2)} m/s`, x, cy - 50);
      };

      drawParticle(state.x1, '#ef4444', state.m1, state.v1, 'm1');
      drawParticle(state.x2, '#3b82f6', state.m2, state.v2, 'm2');

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimReady]);

  // --- MATH & CONTROLS ---
  const calculateCollision = () => {
    const m1 = Math.max(0.1, Number(m1Input) || 1);
    const u1 = Number(u1Input) || 0;
    const m2 = Math.max(0.1, Number(m2Input) || 1);
    const u2 = Number(u2Input) || 0;
    const e = Math.max(0, Math.min(1, Number(eInput) || 0));

    if (u1 <= u2) {
       alert("Particle 1 must be faster than Particle 2 to collide!");
       return;
    }

    // Equations using coefficient of restitution (e)
    // v1 = [m1*u1 + m2*u2 + m2*e*(u2 - u1)] / (m1 + m2)
    // v2 = [m1*u1 + m2*u2 + m1*e*(u1 - u2)] / (m1 + m2)
    
    const momentumInitial = (m1 * u1) + (m2 * u2);
    const totalMass = m1 + m2;
    
    const v1 = (momentumInitial + m2 * e * (u2 - u1)) / totalMass;
    const v2 = (momentumInitial + m1 * e * (u1 - u2)) / totalMass;

    setMathBreakdown({
        m1, u1, m2, u2, e, totalMass, momentumInitial, v1, v2
    });

    physicsState.current.m1 = m1;
    physicsState.current.v1 = u1; // Starts at initial velocity
    physicsState.current.m2 = m2;
    physicsState.current.v2 = u2;
    physicsState.current.finalV1 = v1;
    physicsState.current.finalV2 = v2;
    
    const canvas = canvasRef.current;
    physicsState.current.x1 = 100;
    physicsState.current.x2 = canvas ? canvas.width - 100 : 500;
    
    physicsState.current.hasCollided = false;
    physicsState.current.isRunning = true;
    physicsState.current.lastTime = 0;
    
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    physicsState.current.isRunning = false;
    const canvas = canvasRef.current;
    if (canvas) {
      physicsState.current.x1 = 100;
      physicsState.current.x2 = canvas.width - 100;
    }
    physicsState.current.v1 = Number(u1Input);
    physicsState.current.v2 = Number(u2Input);
    setIsPlaying(false);
    setIsPaused(false);
    setMathBreakdown(null);
  };

  const getCollisionName = (e) => {
      if (e === 1) return "Fully Elastic";
      if (e === 0) return "Perfectly Inelastic";
      return "Partially Inelastic";
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-amber-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-4 translate-y-0' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "The mathematics of momentum."
        </h2>
      </div>

      {/* PHASE 2 & 3: The Simulation & Controls */}
      <div 
        className={`w-full flex-grow relative transition-all duration-1000 flex flex-col z-10 mt-16 gap-4
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Instruction UI */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 shadow-lg text-center">
           <p className="text-white text-sm">Learn how to calculate the final speed of particles for different collision types using the Coefficient of Restitution (e).</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-grow min-h-[300px]">
          {/* Canvas Area */}
          <div className="w-full lg:w-1/2 flex-grow bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden min-h-[250px]">
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0"></canvas>
          </div>

          {/* Math Breakdown Panel */}
          <div className="w-full lg:w-1/2 bg-slate-800/80 rounded-xl border border-slate-600 p-6 overflow-y-auto max-h-[300px] custom-scrollbar shadow-inner">
            <h3 className="text-amber-400 font-bold mb-4 border-b border-slate-600 pb-2 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
              Calculations
            </h3>
            
            {!mathBreakdown ? (
               <div className="text-slate-400 text-sm italic text-center mt-10">
                   Set your parameters and press "CALCULATE & RUN" to see the step-by-step breakdown.
               </div>
            ) : (
               <div className="text-sm font-mono space-y-4">
                  <div className="bg-slate-900 p-3 rounded text-slate-300">
                    <div className="text-sky-300 mb-1">Step 1: Initial Momentum (P_initial)</div>
                    <div className="text-white">P_initial = (m1 × u1) + (m2 × u2)</div>
                    <div>= ({mathBreakdown.m1} × {mathBreakdown.u1}) + ({mathBreakdown.m2} × {mathBreakdown.u2})</div>
                    <div>= {mathBreakdown.momentumInitial.toFixed(2)} kg·m/s</div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded text-slate-300">
                    <div className="text-emerald-300 mb-1">Step 2: Collision Type (Coefficient of Restitution)</div>
                    <div className="text-white">e = {mathBreakdown.e} ({getCollisionName(mathBreakdown.e)})</div>
                    <div className="text-xs text-slate-400 mt-1">
                        e=1 (Bounces perfectly), e=0 (Sticks together), e=0.5 (Loses half elasticity)
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded text-slate-300">
                    <div className="text-rose-300 mb-1">Step 3: Calculate Final Speeds (v1, v2)</div>
                    <div className="text-white mb-2">v1 = [P_initial + m2 × e × (u2 - u1)] / Total Mass</div>
                    <div className="mb-4">
                        v1 = [{mathBreakdown.momentumInitial.toFixed(2)} + {mathBreakdown.m2} × {mathBreakdown.e} × ({mathBreakdown.u2} - {mathBreakdown.u1})] / {mathBreakdown.totalMass}
                        <br/>
                        <strong className="text-rose-400 text-base">= {mathBreakdown.v1.toFixed(2)} m/s</strong>
                    </div>

                    <div className="text-white mb-2">v2 = [P_initial + m1 × e × (u1 - u2)] / Total Mass</div>
                    <div>
                        v2 = [{mathBreakdown.momentumInitial.toFixed(2)} + {mathBreakdown.m1} × {mathBreakdown.e} × ({mathBreakdown.u1} - {mathBreakdown.u2})] / {mathBreakdown.totalMass}
                        <br/>
                        <strong className="text-blue-400 text-base">= {mathBreakdown.v2.toFixed(2)} m/s</strong>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* User Controls */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 flex flex-col md:flex-row gap-6 items-end shadow-lg">
          
          <div className="flex-1 w-full md:border-r border-slate-600 md:pr-4">
            <h4 className="text-red-400 font-bold mb-2 text-sm">Particle 1</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-slate-400 text-xs mb-1">Mass (kg)</label>
                <input type="number" step="0.1" disabled={isPlaying} value={m1Input} onChange={(e) => setM1Input(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500 disabled:opacity-50" />
              </div>
              <div className="flex-1">
                <label className="block text-slate-400 text-xs mb-1">Init Speed u1</label>
                <input type="number" step="0.1" disabled={isPlaying} value={u1Input} onChange={(e) => setU1Input(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500 disabled:opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full md:border-r border-slate-600 md:pr-4">
            <h4 className="text-blue-400 font-bold mb-2 text-sm">Particle 2</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-slate-400 text-xs mb-1">Mass (kg)</label>
                <input type="number" step="0.1" disabled={isPlaying} value={m2Input} onChange={(e) => setM2Input(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
              </div>
              <div className="flex-1">
                <label className="block text-slate-400 text-xs mb-1">Init Speed u2</label>
                <input type="number" step="0.1" disabled={isPlaying} value={u2Input} onChange={(e) => setU2Input(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex-[1.2] w-full">
            <h4 className="text-amber-400 font-bold mb-2 text-sm">Collision Type (e)</h4>
            <div className="flex flex-col gap-1">
               <input type="number" step="0.1" min="0" max="1" disabled={isPlaying} value={eInput} onChange={(e) => setEInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-amber-500 disabled:opacity-50" />
               <p className="text-xs text-slate-500 mt-1">1 = Elastic, 0 = Inelastic</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto flex-col justify-end md:pl-4">
            <div className="flex gap-2">
              <button onClick={calculateCollision} disabled={isPlaying && !isPaused}
                className={`flex-1 px-4 py-2 font-bold rounded transition-all whitespace-nowrap ${isPlaying && !isPaused ? 'bg-amber-800/50 text-amber-600/50' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'}`}>
                RUN
              </button>
              <button onClick={handlePause} disabled={!isPlaying}
                className={`flex-1 px-4 py-2 font-bold rounded transition-colors whitespace-nowrap ${!isPlaying ? 'bg-orange-800/50 text-orange-600/50' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}>
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
            </div>
            <button onClick={handleReset}
              className="w-full px-6 py-2 font-bold rounded transition-colors bg-slate-700 hover:bg-slate-600 text-white whitespace-nowrap">
              RESET
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
