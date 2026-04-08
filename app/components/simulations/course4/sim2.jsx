'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course4Sim2({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [forceInput, setForceInput] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [isSimReady, setIsSimReady] = useState(false);
  
  const [instruction, setInstruction] = useState("Calculate Force & Duration to stop exactly on the target!");
  const [blinkClass, setBlinkClass] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [levelState, setLevelState] = useState({ initV: 50, targetX: 150, m: 1 });
  
  const canvasRef = useRef(null);
  const initialized = useRef(false);
  const handleResultRef = useRef(() => {});
  
  // Physics state kept in a mutable ref for the animation loop
  // Absolute calculations are used to avoid frame-rate integration drift
  const physicsState = useRef({
    x: 50,
    v: 50, 
    initV: 50,
    targetX: 150,
    m: 1,  
    isRunning: false,
    timeElapsed: 0,
    appliedForce: 0,
    appliedDuration: 0,
    lastTime: 0,
    hasEvaluated: false
  });

  // Timing variables
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500; 
  const EXTRA_WAIT = 500; 

  // Handle Win/Loss Logic gracefully within closures
  useEffect(() => {
    handleResultRef.current = (isWin) => {
      if (isWin) {
        setBlinkClass('bg-emerald-500/30 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]');
        setInstruction("🎉 Outstanding! You stopped right on the mark! Try another one. 🎉");
        setTimeout(() => {
          setBlinkClass('');
          generateLevel();
          setIsPlaying(false);
        }, 2000);
      } else {
        setBlinkClass('bg-red-500/30 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]');
        setInstruction("Missed the target or didn't stop completely! Try again.");
        setTimeout(() => {
          setBlinkClass('');
          resetToCurrentLevel();
          setIsPlaying(false);
        }, 1000);
      }
    };
  }, []);

  const generateLevel = () => {
    // Generate new velocity and target parameters
    const vOptions = [40, 60, 80, 100];
    const tOptions = [2, 3, 4, 5];
    const mOptions = [1, 2, 4, 5]; // Easy to multiply integers
    
    const v = vOptions[Math.floor(Math.random() * vOptions.length)];
    const t = tOptions[Math.floor(Math.random() * tOptions.length)];
    const m = mOptions[Math.floor(Math.random() * mOptions.length)];
    
    // Target calculation: distance = v*t + 0.5*a*t^2. To stop, a = -v/t.
    // distance = v*t - 0.5*v*t = 0.5*v*t. 
    // Start x is always 50.
    const target = 50 + 0.5 * v * t;
    
    setLevelState({ initV: v, targetX: target, m: m });
    setInstruction("Calculate Force & Duration to stop exactly on the target!");
    setForceInput('');
    setDurationInput('');
    
    physicsState.current = {
        ...physicsState.current,
        x: 50,
        v: v,
        initV: v,
        targetX: target,
        m: m,
        isRunning: false,
        timeElapsed: 0,
        appliedForce: 0,
        appliedDuration: 0,
        lastTime: 0,
        hasEvaluated: false
    };
  };

  const resetToCurrentLevel = () => {
    physicsState.current = {
        ...physicsState.current,
        x: 50,
        v: physicsState.current.initV,
        isRunning: false,
        timeElapsed: 0,
        lastTime: 0,
        hasEvaluated: false
    };
  };

  // Phase progression
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    generateLevel();

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
      }
      
      const cw = canvas.width;
      const ch = canvas.height;
      const state = physicsState.current;
      
      // Calculate Delta Time (dt)
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;

      // --- PHYSICS UPDATE ---
      if (state.isRunning) {
        state.timeElapsed += dt;
        
        const tPush = Math.min(state.timeElapsed, state.appliedDuration);
        const coastTime = Math.max(0, state.timeElapsed - state.appliedDuration);
        
        // Exact analytical position and velocity prevents dt integration errors
        const a = state.appliedForce / state.m;
        const vPushEnd = state.initV + a * tPush;
        const xPushEnd = 50 + state.initV * tPush + 0.5 * a * tPush * tPush;
        
        state.v = vPushEnd;
        state.x = xPushEnd + (vPushEnd * coastTime);

        // Evaluation when the force duration finishes
        if (state.timeElapsed >= state.appliedDuration && !state.hasEvaluated) {
          state.hasEvaluated = true;
          
          const isStopped = Math.abs(vPushEnd) < 0.1;
          const isAtTarget = Math.abs(xPushEnd - state.targetX) < 0.1;
          
          handleResultRef.current(isStopped && isAtTarget);
        }
      }

      // --- RENDER ---
      ctx.clearRect(0, 0, cw, ch);
      const cy = ch / 2;

      // 1. Draw Ruler
      const rulerY = cy + 40;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, rulerY);
      ctx.lineTo(cw, rulerY);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      
      // Draw ticks every 100px, aligning 0m with the particle's starting position (x = 50)
      const startOffsetX = 50;
      for (let i = startOffsetX; i < cw; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, rulerY - 5);
        ctx.lineTo(i, rulerY + 15);
        ctx.stroke();
        ctx.fillText(`${i - startOffsetX}m`, i, rulerY + 30);
      }

      // 2. Draw Target Zone
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(state.targetX - 3, cy - 40, 6, 80);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(state.targetX, cy - 40);
      ctx.lineTo(state.targetX, cy + 40);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("TARGET", state.targetX, cy - 50);
      ctx.fillText(`${state.targetX - startOffsetX}m`, state.targetX, cy + 65);

      // 3. Draw Particle
      ctx.beginPath();
      ctx.arc(state.x, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#10b981';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Mass inside the particle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${state.m}kg`, state.x, cy);
      ctx.textBaseline = 'alphabetic'; // reset for other texts

      // 4. Draw Velocity Vector (Green)
      if (Math.abs(state.v) > 0.5) {
        const vMagnitude = Math.min(Math.abs(state.v) * 0.5, 150);
        const vAngle = state.v > 0 ? 0 : Math.PI;
        drawArrow(ctx, state.x, cy - 30, vAngle, vMagnitude, '#34d399');
        ctx.fillStyle = '#34d399';
        ctx.font = '12px monospace';
        ctx.fillText(`v = ${state.v.toFixed(1)} m/s`, state.x, cy - 45);
      }

      // 5. Draw Force Vector (Red) - Only when actively pushing
      if (state.isRunning && state.timeElapsed < state.appliedDuration && Math.abs(state.appliedForce) > 0) {
        const fMagnitude = Math.min(Math.abs(state.appliedForce) * 2, 150);
        const fAngle = state.appliedForce > 0 ? 0 : Math.PI;
        drawArrow(ctx, state.x, cy, fAngle, fMagnitude, '#ef4444');
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`F = ${state.appliedForce}N`, state.x + (state.appliedForce > 0 ? 40 : -40), cy + 20);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimReady]);

  // --- CONTROLS ---
  const handleStart = () => {
    if (isPlaying) return;
    
    physicsState.current.appliedForce = Number(forceInput) || 0;
    physicsState.current.appliedDuration = Math.max(0, Number(durationInput) || 0);
    physicsState.current.timeElapsed = 0;
    physicsState.current.hasEvaluated = false;
    physicsState.current.isRunning = true;
    physicsState.current.lastTime = 0;
    
    setIsPlaying(true);
  };

  const handleReset = () => {
    if (isPlaying) return;
    resetToCurrentLevel();
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-4 translate-y-0' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "Let's remember how force works."
        </h2>
      </div>

      {/* PHASE 2 & 3: The Simulation & Controls */}
      <div 
        className={`w-full flex-grow relative transition-all duration-1000 flex flex-col z-10 mt-16 gap-4
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Instruction UI */}
        <div className={`bg-slate-800/80 p-4 rounded-xl border border-slate-600 shadow-lg text-center transition-all duration-300 ${blinkClass}`}>
           <p className="text-white font-bold text-lg">{instruction}</p>
        </div>

        {/* Canvas Area */}
        <div className={`w-full flex-grow bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden min-h-[300px] transition-all duration-300 ${blinkClass}`}>
          <canvas ref={canvasRef} className="w-full h-full block"></canvas>
        </div>

        {/* User Controls */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 flex flex-col md:flex-row gap-6 items-end shadow-lg">
          <div className="flex-1 w-full">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Force Magnitude (Newtons)
            </label>
            <input 
              type="number" 
              disabled={isPlaying}
              value={forceInput}
              onChange={(e) => setForceInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
              placeholder="e.g. -10"
            />
            <p className="text-xs text-slate-500 mt-1">Use negative values to push left.</p>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-slate-300 text-sm font-bold mb-2">
              Force Duration (Seconds)
            </label>
            <input 
              type="number" 
              disabled={isPlaying}
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              min="0"
              step="0.5"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
              placeholder="e.g. 4"
            />
            <p className="text-xs text-slate-500 mt-1">How long the push lasts.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleReset}
              disabled={isPlaying}
              className={`flex-1 md:flex-none px-6 py-3 font-bold rounded-lg transition-colors ${isPlaying ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
            >
              Reset
            </button>
            <button 
              onClick={handleStart}
              disabled={isPlaying}
              className={`flex-1 md:flex-none px-8 py-3 font-bold rounded-lg transition-all ${isPlaying ? 'bg-emerald-800/50 text-emerald-600/50' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'}`}
            >
              Start
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
