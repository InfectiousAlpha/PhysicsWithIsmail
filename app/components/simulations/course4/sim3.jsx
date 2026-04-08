'use client';

import { useEffect, useState, useRef } from 'react';

export default function Course4Sim3({ simId, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [isSimReady, setIsSimReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlots, setShowPlots] = useState(false);
  
  // User Inputs
  const [m1Input, setM1Input] = useState('2');
  const [v1Input, setV1Input] = useState('6.0');
  const [m2Input, setM2Input] = useState('2');
  const [v2Input, setV2Input] = useState('6.0');
  const [forceInput, setForceInput] = useState('50');

  const canvasRef = useRef(null);
  const vPlotRef = useRef(null);
  const kePlotRef = useRef(null);
  const initialized = useRef(false);
  const showPlotsRef = useRef(false);
  
  // Plot data ref to avoid re-renders
  const plotData = useRef({ v1: [], v2: [], ke1: [], ke2: [], keTotal: [] });
  
  // Physics state kept in a mutable ref for the animation loop
  const physicsState = useRef({
    x1: 0,
    v1: 0,
    m1: 2,
    x2: 0,
    v2: 0,
    m2: 2,
    forceK: 50,
    isRunning: false,
    lastTime: 0,
    hasCollided: false
  });

  // Timing variables
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500; 
  const EXTRA_WAIT = 500; 

  // Sync showPlots state to ref for the animation loop
  useEffect(() => {
    showPlotsRef.current = showPlots;
  }, [showPlots]);

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
    const BUBBLE_RADIUS = 70;
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

    function render(timestamp) {
      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
        // Set initial positions if not running
        if (!physicsState.current.isRunning) {
          physicsState.current.x1 = 100;
          physicsState.current.x2 = canvas.width - 100;
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
      if (state.isRunning) {
        let dist = state.x2 - state.x1;
        
        // Check if particles are inside each other's bubbles
        if (Math.abs(dist) < INTERACTION_DIST) {
          state.hasCollided = true;
          // Spring-like repulsive force based on overlap to ensure elastic collision
          const overlap = INTERACTION_DIST - Math.abs(dist);
          // Force magnitude = userForce * overlap factor
          currentForce = state.forceK * overlap * 2; 
          
          // Apply Newton's Third Law (Equal and Opposite)
          // Direction depends on relative position
          const dir = Math.sign(dist) || 1; 
          const a1 = -(currentForce * dir) / state.m1;
          const a2 = (currentForce * dir) / state.m2;

          state.v1 += a1 * dt;
          state.v2 += a2 * dt;
        }

        state.x1 += state.v1 * dt;
        state.x2 += state.v2 * dt;

        // Wall collisions to keep them on screen
        if (state.x1 < 40) { state.x1 = 40; state.v1 = Math.abs(state.v1); }
        if (state.x2 > cw - 40) { state.x2 = cw - 40; state.v2 = -Math.abs(state.v2); }
        if (state.x1 > cw - 40) { state.x1 = cw - 40; state.v1 = -Math.abs(state.v1); }
        if (state.x2 < 40) { state.x2 = 40; state.v2 = Math.abs(state.v2); }

        // Collect data for plots
        const pd = plotData.current;
        pd.v1.push(state.v1);
        pd.v2.push(state.v2);
        const currentKe1 = 0.5 * state.m1 * Math.pow(state.v1 / 10, 2);
        const currentKe2 = 0.5 * state.m2 * Math.pow(state.v2 / 10, 2);
        pd.ke1.push(currentKe1);
        pd.ke2.push(currentKe2);
        pd.keTotal.push(currentKe1 + currentKe2);

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

      // Energy Calculations for display
      const ke1 = 0.5 * state.m1 * Math.pow(state.v1 / 10, 2);
      const ke2 = 0.5 * state.m2 * Math.pow(state.v2 / 10, 2);

      // Function to draw a particle
      const drawParticle = (x, color, m, v, ke, label) => {
        // Force Bubble
        ctx.beginPath();
        ctx.arc(x, cy, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `${color}22`; // 22 is low opacity hex
        ctx.fill();
        ctx.strokeStyle = `${color}66`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Core Particle
        ctx.beginPath();
        ctx.arc(x, cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Mass Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${m}kg`, x, cy);
        
        // Velocity Vector
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

      // Draw Particles
      drawParticle(state.x1, '#ef4444', state.m1, state.v1, ke1, 'PARTICLE 1');
      drawParticle(state.x2, '#3b82f6', state.m2, state.v2, ke2, 'PARTICLE 2');

      // Draw Interaction Forces if colliding
      if (state.isRunning && currentForce > 1) {
        const forceVis = Math.min(currentForce * 0.05, 80);
        // Force on 1 (pushes left)
        drawArrow(ctx, state.x1, cy, Math.PI, forceVis, '#ef4444');
        // Force on 2 (pushes right)
        drawArrow(ctx, state.x2, cy, 0, forceVis, '#3b82f6');

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
            [pd.v1, pd.v2], ['#ef4444', '#3b82f6'], ['V1', 'V2'], vMin, vMax, 'Velocity (m/s)');
            
          drawGraph(keCanvas.getContext('2d'), keCanvas.width, keCanvas.height, 
            [pd.ke1, pd.ke2, pd.keTotal], ['#ef4444', '#3b82f6', '#fbbf24'], ['KE1', 'KE2', 'Total KE'], keMin, keMax, 'Kinetic Energy (J)');
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
    
    physicsState.current.m2 = Math.max(0.1, Number(m2Input) || 1);
    // Particle 2 moves left initially (negative velocity)
    physicsState.current.v2 = -(Number(v2Input) || 0) * 10; 
    
    physicsState.current.forceK = Number(forceInput) || 50;
    
    // Reset positions to edges
    const canvas = canvasRef.current;
    physicsState.current.x1 = 100;
    physicsState.current.x2 = canvas ? canvas.width - 100 : 600;
    
    physicsState.current.hasCollided = false;
    physicsState.current.isRunning = true;
    physicsState.current.lastTime = 0;
    
    setIsPlaying(true);
  };

  const handleReset = () => {
    plotData.current = { v1: [], v2: [], ke1: [], ke2: [], keTotal: [] };
    physicsState.current.isRunning = false;
    const canvas = canvasRef.current;
    if (canvas) {
      physicsState.current.x1 = 100;
      physicsState.current.x2 = canvas.width - 100;
    }
    physicsState.current.v1 = 0;
    physicsState.current.v2 = 0;
    setIsPlaying(false);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* PHASE 1 & 2: The Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-4 translate-y-0' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "How collision happen."
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
           <p className="text-white text-sm">Observe energy transfer and Newton's Third Law in action via overlapping force bubbles.</p>
        </div>

        {/* Canvas Area */}
        <div className="w-full flex-grow bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden min-h-[300px]">
          <canvas ref={canvasRef} className="w-full h-full block"></canvas>
        </div>

        {/* User Controls & Plots Area */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 flex flex-col md:flex-row gap-6 items-stretch shadow-lg min-h-[160px]">
          
          {!showPlots ? (
            <>
              {/* Particle 1 Config */}
              <div className="flex-1 w-full md:border-r border-slate-600 md:pr-4 flex flex-col justify-end">
                <h4 className="text-red-400 font-bold mb-2 text-sm">Particle 1 (Left)</h4>
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
              <div className="flex-1 w-full md:border-r border-slate-600 md:pr-4 flex flex-col justify-end">
                <h4 className="text-blue-400 font-bold mb-2 text-sm">Particle 2 (Right)</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Mass (kg)</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={m2Input} onChange={(e) => setM2Input(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-slate-400 text-xs mb-1">Speed (m/s)</label>
                    <input type="number" step="0.1" disabled={isPlaying} value={v2Input} onChange={(e) => setV2Input(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-blue-500 disabled:opacity-50" />
                  </div>
                </div>
              </div>

              {/* Interaction Config */}
              <div className="flex-1 w-full flex flex-col justify-end">
                <h4 className="text-purple-400 font-bold mb-2 text-sm">Interaction</h4>
                <label className="block text-slate-400 text-xs mb-1">Bubble Force Magnitude</label>
                <input type="number" disabled={isPlaying} value={forceInput} onChange={(e) => setForceInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-purple-500 disabled:opacity-50" />
              </div>
            </>
          ) : (
            <div className="flex-1 w-full flex flex-col md:flex-row gap-4 min-h-[120px]">
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden">
                <canvas ref={vPlotRef} className="w-full h-full block"></canvas>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden">
                <canvas ref={kePlotRef} className="w-full h-full block"></canvas>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 w-full md:w-auto flex-col justify-end md:border-l border-slate-600 md:pl-6 pt-4 md:pt-0">
            <button onClick={handleStart} disabled={isPlaying}
              className={`px-6 py-2 font-bold rounded transition-all ${isPlaying ? 'bg-purple-800/50 text-purple-600/50' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'}`}>
              START
            </button>
            <button onClick={handleReset}
              className="px-6 py-2 font-bold rounded transition-colors bg-slate-700 hover:bg-slate-600 text-white">
              RESET
            </button>
            <button onClick={() => setShowPlots(!showPlots)}
              className="px-6 py-2 font-bold rounded transition-colors bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-600 mt-2">
              {showPlots ? 'HIDE PLOTS' : 'SHOW PLOTS'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
