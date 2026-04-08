'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course4Sim4({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [isSimReady, setIsSimReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPlots, setShowPlots] = useState(false);
  
  // User Inputs
  const [m1Input, setM1Input] = useState('2');
  const [v1Input, setV1Input] = useState('6.0');
  
  const [mAInput, setMAInput] = useState('1');
  const [mBInput, setMBInput] = useState('1');
  const [v2Input, setV2Input] = useState('6.0');
  
  const [forceInput, setForceInput] = useState('50');
  const [springKInput, setSpringKInput] = useState('200');

  const canvasRef = useRef(null);
  const vPlotRef = useRef(null);
  const kePlotRef = useRef(null);
  const initialized = useRef(false);
  const showPlotsRef = useRef(false);
  const isPausedRef = useRef(false);
  
  // Plot data ref to avoid re-renders
  const plotData = useRef({ v1: [], v2: [], ke1: [], ke2: [], keTotal: [] });
  
  // Physics state kept in a mutable ref for the animation loop
  const physicsState = useRef({
    x1: 0,
    v1: 0,
    m1: 2,
    xA: 0,
    vA: 0,
    mA: 1,
    xB: 0,
    vB: 0,
    mB: 1,
    forceK: 50,
    springK: 200,
    L0: 50,
    isRunning: false,
    lastTime: 0,
    hasCollided: false
  });

  // Timing variables
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500; 
  const EXTRA_WAIT = 500; 

  useEffect(() => { showPlotsRef.current = showPlots; }, [showPlots]);
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
    const BUBBLE_RADIUS = 60;
    const INTERACTION_DIST = BUBBLE_RADIUS * 2;

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

    function drawSpring(context, xStart, yStart, xEnd, yEnd, coils = 6, width = 8) {
        context.strokeStyle = '#94a3b8';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(xStart, yStart);
        const length = xEnd - xStart;
        const segment = length / (coils * 2 + 1);
        for(let i=0; i<coils; i++) {
             context.lineTo(xStart + segment*(2*i+1), yStart - width);
             context.lineTo(xStart + segment*(2*i+2), yStart + width);
        }
        context.lineTo(xEnd, yEnd);
        context.stroke();
    }

    function render(timestamp) {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
        // Set initial positions if not running
        if (!physicsState.current.isRunning) {
          physicsState.current.x1 = 100;
          physicsState.current.xB = canvas.width - 100;
          physicsState.current.xA = physicsState.current.xB - physicsState.current.L0;
        }
      }
      
      const cw = canvas.width;
      const ch = canvas.height;
      const state = physicsState.current;
      
      // Calculate Delta Time (dt)
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;

      let currentForce = 0;

      // --- PHYSICS UPDATE ---
      if (state.isRunning && !isPausedRef.current) {
        let dist = state.xA - state.x1; // Interaction between Particle 1 and Shell (A) of Particle 2
        
        // Repulsion collision logic
        if (Math.abs(dist) < INTERACTION_DIST) {
          state.hasCollided = true;
          const overlap = INTERACTION_DIST - Math.abs(dist);
          currentForce = state.forceK * overlap * 2; 
          
          const dir = Math.sign(dist) || 1; 
          const a1 = -(currentForce * dir) / state.m1;
          const extAa = (currentForce * dir) / state.mA;

          state.v1 += a1 * dt;
          state.vA += extAa * dt;
        }

        // Spring logic inside Molecule (Particle 2)
        const currentLen = state.xB - state.xA;
        const springForce = state.springK * (currentLen - state.L0);
        
        const aSpringA = springForce / state.mA;
        const aSpringB = -springForce / state.mB;

        state.vA += aSpringA * dt;
        state.vB += aSpringB * dt;

        // Position Updates
        state.x1 += state.v1 * dt;
        state.xA += state.vA * dt;
        state.xB += state.vB * dt;

        // Wall collisions to keep them on screen
        if (state.x1 < 40) { state.x1 = 40; state.v1 = Math.abs(state.v1); }
        if (state.xB > cw - 40) { state.xB = cw - 40; state.vB = -Math.abs(state.vB); }
        if (state.x1 > cw - 40) { state.x1 = cw - 40; state.v1 = -Math.abs(state.v1); }
        
        // Prevent atom masses from passing through each other
        if (state.xA >= state.xB - 10) {
            const vCm = (state.mA * state.vA + state.mB * state.vB) / (state.mA + state.mB);
            state.xA = state.xB - 10;
            state.vA = vCm;
            state.vB = vCm;
        }

        // Collect data for plots
        const pd = plotData.current;
        
        const v1_real = state.v1 / 10;
        const vA_real = state.vA / 10;
        const vB_real = state.vB / 10;
        const v2_cm = ((state.mA * vA_real) + (state.mB * vB_real)) / (state.mA + state.mB);

        pd.v1.push(v1_real); 
        pd.v2.push(v2_cm);
        
        const ke1 = 0.5 * state.m1 * Math.pow(v1_real, 2);
        const ke2_trans = 0.5 * (state.mA + state.mB) * Math.pow(v2_cm, 2);
        
        pd.ke1.push(ke1);
        pd.ke2.push(ke2_trans);
        pd.keTotal.push(ke1 + ke2_trans);

        if (pd.v1.length > 300) {
          pd.v1.shift(); pd.v2.shift(); pd.ke1.shift(); pd.ke2.shift(); pd.keTotal.shift();
        }
      }

      // --- RENDER ---
      ctx.clearRect(0, 0, cw, ch);
      const cy = ch / 2 + 20;

      // Draw Floor line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, cy + 40);
      ctx.lineTo(cw, cy + 40);
      ctx.stroke();

      const drawStandardParticle = (x, color, m, v, ke, label) => {
        // Force Bubble
        ctx.beginPath();
        ctx.arc(x, cy, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `${color}22`;
        ctx.fill();
        ctx.strokeStyle = `${color}66`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Core
        ctx.beginPath();
        ctx.arc(x, cy, 25, 0, Math.PI * 2);
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
        
        if (Math.abs(v) > 1) {
          const vMag = Math.min(Math.abs(v) * 0.5, 60);
          const vAng = v > 0 ? 0 : Math.PI;
          drawArrow(ctx, x, cy - 35, vAng, vMag, color);
        }

        // Stats Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(x - 45, cy - 110, 90, 50);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 45, cy - 110, 90, 50);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(label, x, cy - 95);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`v: ${Math.abs(v/10).toFixed(1)} m/s`, x, cy - 80);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`KE: ${ke.toFixed(0)} J`, x, cy - 65);
      };

      const drawSubParticle = (x, color, m, v) => {
        ctx.beginPath();
        ctx.arc(x, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m}kg`, x, cy);
      };

      // Draw Particle 1
      const ke1_disp = 0.5 * state.m1 * Math.pow(state.v1 / 10, 2);
      drawStandardParticle(state.x1, '#ef4444', state.m1, state.v1, ke1_disp, 'PARTICLE 1');

      // Draw Particle 2 (Molecule)
      // Draw Bubble around Mass A (left side of molecule)
      ctx.beginPath();
      ctx.arc(state.xA, cy, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `#0ea5e922`;
      ctx.fill();
      ctx.strokeStyle = `#0ea5e966`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      drawSpring(ctx, state.xA + 18, cy, state.xB - 18, cy);
      drawSubParticle(state.xA, '#0ea5e9', state.mA, state.vA); // Cyan (Shell/Left)
      drawSubParticle(state.xB, '#3b82f6', state.mB, state.vB); // Blue (Core/Right)

      // Center of Mass for Molecule Label
      const xCM = (state.mA * state.xA + state.mB * state.xB) / (state.mA + state.mB);
      const vCM = (state.mA * state.vA + state.mB * state.vB) / (state.mA + state.mB);
      const ke2_disp = 0.5 * (state.mA + state.mB) * Math.pow(vCM / 10, 2);
      
      if (Math.abs(vCM) > 1) {
          const vMag = Math.min(Math.abs(vCM) * 0.5, 60);
          const vAng = vCM > 0 ? 0 : Math.PI;
          drawArrow(ctx, xCM, cy - 35, vAng, vMag, '#60a5fa');
      }

      // Stats Box for Molecule
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(xCM - 45, cy - 110, 90, 50);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1;
      ctx.strokeRect(xCM - 45, cy - 110, 90, 50);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText('MOLECULE (P2)', xCM, cy - 95);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`v: ${Math.abs(vCM/10).toFixed(1)} m/s`, xCM, cy - 80);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`KE: ${ke2_disp.toFixed(0)} J`, xCM, cy - 65);

      // Draw Interaction Forces if colliding
      if (state.isRunning && currentForce > 1) {
        const forceVis = Math.min(currentForce * 0.05, 80);
        drawArrow(ctx, state.x1, cy, Math.PI, forceVis, '#ef4444');
        drawArrow(ctx, state.xA, cy, 0, forceVis, '#0ea5e9');

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ REPULSION FIELD ACTIVE ⚡', cw / 2, cy + 70);
      }

      // --- DRAW PLOTS ---
      if (showPlotsRef.current) {
        const vCanvas = vPlotRef.current;
        const keCanvas = kePlotRef.current;
        if (vCanvas && keCanvas) {
          if (vCanvas.width === 0 || vCanvas.width !== vCanvas.parentElement.clientWidth) {
            vCanvas.width = vCanvas.parentElement.clientWidth;
            vCanvas.height = vCanvas.parentElement.clientHeight;
          }
          if (keCanvas.width === 0 || keCanvas.width !== keCanvas.parentElement.clientWidth) {
            keCanvas.width = keCanvas.parentElement.clientWidth;
            keCanvas.height = keCanvas.parentElement.clientHeight;
          }

          const pd = plotData.current;
          
          const drawGraph = (cContext, w, h, dataArrays, colors, labels, yMin, yMax, title) => {
            cContext.clearRect(0, 0, w, h);
            cContext.fillStyle = '#0f172a';
            cContext.fillRect(0, 0, w, h);
            cContext.fillStyle = '#94a3b8';
            cContext.font = '10px sans-serif';
            cContext.textAlign = 'left';
            cContext.fillText(title, 10, 15);
            
            if (dataArrays[0].length === 0) return;

            const dx = w / 300;

            if (yMin < 0 && yMax > 0) {
              const y0 = h - ((0 - yMin) / (yMax - yMin)) * h;
              cContext.strokeStyle = '#334155';
              cContext.beginPath(); cContext.moveTo(0, y0); cContext.lineTo(w, y0); cContext.stroke();
            }

            dataArrays.forEach((data, idx) => {
              cContext.strokeStyle = colors[idx];
              cContext.lineWidth = 2;
              cContext.beginPath();
              for (let i = 0; i < data.length; i++) {
                const x = i * dx;
                const y = h - ((data[i] - yMin) / (yMax - yMin)) * h;
                if (i === 0) cContext.moveTo(x, y);
                else cContext.lineTo(x, y);
              }
              cContext.stroke();
              cContext.fillStyle = colors[idx];
              cContext.fillText(labels[idx], 10, 30 + idx * 12);
            });
          };

          let maxV = 10;
          pd.v1.forEach(v => maxV = Math.max(maxV, Math.abs(v)));
          pd.v2.forEach(v => maxV = Math.max(maxV, Math.abs(v)));
          const vMin = -maxV * 1.2;
          const vMax = maxV * 1.2;

          let maxKE = 10;
          pd.keTotal.forEach(k => maxKE = Math.max(maxKE, k));
          const keMin = 0;
          const keMax = maxKE * 1.2;

          drawGraph(vCanvas.getContext('2d'), vCanvas.width, vCanvas.height, 
            [pd.v1, pd.v2], ['#ef4444', '#0ea5e9'], ['V1', 'V2 (CoM)'], vMin, vMax, 'Velocity (m/s)');
            
          drawGraph(keCanvas.getContext('2d'), keCanvas.width, keCanvas.height, 
            [pd.ke1, pd.ke2, pd.keTotal], ['#ef4444', '#0ea5e9', '#fbbf24'], ['KE1', 'KE2 (Trans)', 'Total Macroscopic KE'], keMin, keMax, 'Kinetic Energy (J)');
          
          if (pd.keTotal.length > 0) {
              const cContext = keCanvas.getContext('2d');
              cContext.fillStyle = '#64748b';
              cContext.textAlign = 'right';
              cContext.fillText('Note: Total Macroscopic KE dips when energy converts to Internal Energy!', keCanvas.width - 10, keCanvas.height - 10);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimReady]);

  // --- CONTROLS ---
  const handleStart = () => {
    if (isPlaying) return;
    
    plotData.current = { v1: [], v2: [], ke1: [], ke2: [], keTotal: [] };
    
    physicsState.current.m1 = Math.max(0.1, Number(m1Input) || 1);
    physicsState.current.v1 = (Number(v1Input) || 0) * 10;
    
    physicsState.current.mA = Math.max(0.1, Number(mAInput) || 1);
    physicsState.current.mB = Math.max(0.1, Number(mBInput) || 1);
    
    // Molecule moves left initially (negative velocity)
    const initV2 = -(Number(v2Input) || 0) * 10; 
    physicsState.current.vA = initV2;
    physicsState.current.vB = initV2;
    
    physicsState.current.forceK = Number(forceInput) || 50;
    physicsState.current.springK = Number(springKInput) || 200;
    
    // Reset positions to edges
    const canvas = canvasRef.current;
    physicsState.current.x1 = 100;
    physicsState.current.xB = canvas ? canvas.width - 100 : 600;
    physicsState.current.xA = physicsState.current.xB - physicsState.current.L0;
    
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
    plotData.current = { v1: [], v2: [], ke1: [], ke2: [], keTotal: [] };
    physicsState.current.isRunning = false;
    const canvas = canvasRef.current;
    if (canvas) {
      physicsState.current.x1 = 100;
      physicsState.current.xB = canvas.width - 100;
      physicsState.current.xA = physicsState.current.xB - physicsState.current.L0;
    }
    physicsState.current.v1 = 0;
    physicsState.current.vA = 0;
    physicsState.current.vB = 0;
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-indigo-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-4 translate-y-0' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "Energy can be stored internally."
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
           <p className="text-white text-sm">Observe a collision with a diatomic molecule. Note how the spring absorbs kinetic energy!</p>
        </div>

        {/* Canvas Area (Split when plots are shown) */}
        <div className="w-full flex-grow flex flex-col md:flex-row gap-4 min-h-[300px]">
          <div className={`bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden flex-grow transition-all ${showPlots ? 'md:w-1/2' : 'w-full'}`}>
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0"></canvas>
          </div>
          
          {showPlots && (
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden">
                <canvas ref={vPlotRef} className="w-full h-full block absolute inset-0"></canvas>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden">
                <canvas ref={kePlotRef} className="w-full h-full block absolute inset-0"></canvas>
              </div>
            </div>
          )}
        </div>

        {/* User Controls */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 flex flex-col md:flex-row gap-6 items-end shadow-lg">
          
          {!showPlots ? (
            <>
              {/* Particle 1 Config */}
              <div className="flex-1 w-full md:border-r border-slate-600 md:pr-4 flex flex-col justify-end">
                <h4 className="text-red-400 font-bold mb-2 text-sm">Particle 1</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Mass (kg)</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={m1Input} onChange={(e) => setM1Input(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500 disabled:opacity-50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Speed (m/s)</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={v1Input} onChange={(e) => setV1Input(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-red-500 disabled:opacity-50" />
                  </div>
                </div>
              </div>

              {/* Particle 2 Config */}
              <div className="flex-[1.5] w-full md:border-r border-slate-600 md:pr-4 flex flex-col justify-end">
                <h4 className="text-blue-400 font-bold mb-2 text-sm">Molecule (Particle 2)</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Mass A</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={mAInput} onChange={(e) => setMAInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Mass B</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={mBInput} onChange={(e) => setMBInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Speed</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={v2Input} onChange={(e) => setV2Input(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
                  </div>
                </div>
              </div>

              {/* Interaction Config */}
              <div className="flex-1 w-full flex flex-col justify-end">
                <h4 className="text-purple-400 font-bold mb-2 text-sm">Forces</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Repulsion</label>
                    <input type="number" disabled={isPlaying} value={forceInput} onChange={(e) => setForceInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-purple-500 disabled:opacity-50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Spring K</label>
                    <input type="number" disabled={isPlaying} value={springKInput} onChange={(e) => setSpringKInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-purple-500 disabled:opacity-50" />
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div className="flex-1 w-full flex items-center justify-center text-slate-400 text-sm italic min-h-[60px]">
                Inputs hidden while plots are active. Press "HIDE PLOTS" to configure masses and speeds.
             </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 w-full md:w-auto flex-col justify-end md:border-l border-slate-600 md:pl-6 pt-4 md:pt-0">
            <div className="flex gap-2">
              <button onClick={handleStart} disabled={isPlaying && !isPaused}
                className={`flex-1 px-4 py-2 font-bold rounded transition-all ${isPlaying && !isPaused ? 'bg-indigo-800/50 text-indigo-600/50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}`}>
                START
              </button>
              <button onClick={handlePause} disabled={!isPlaying}
                className={`flex-1 px-4 py-2 font-bold rounded transition-colors ${!isPlaying ? 'bg-amber-800/50 text-amber-600/50' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}>
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleReset}
                className="flex-1 px-4 py-2 font-bold rounded transition-colors bg-slate-700 hover:bg-slate-600 text-white">
                RESET
              </button>
              <button onClick={() => setShowPlots(!showPlots)}
                className={`flex-1 px-4 py-2 font-bold rounded transition-colors ${showPlots ? 'bg-sky-700 text-white' : 'bg-slate-800 text-sky-400'} hover:bg-sky-600 hover:text-white border border-slate-600 hover:border-sky-500`}>
                PLOTS
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
