'use client';

import { useEffect } from 'react';

export default function Course1Sim1({ simId }) {
  useEffect(() => {
    const canvas = document.getElementById(`sim-canvas-${simId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isActive = true;

    let params = { m: 2.0, r: 150, f: 0.0, damping: 0.0 };
    let state = { angle: 0, angularVel: 0, lastTime: 0 };
    let physics_output = { inertia: 0, torque: 0, alpha: 0 };

    const sliders = {
      m: document.getElementById(`slider-s-m-${simId}`),
      r: document.getElementById(`slider-s-r-${simId}`),
      f: document.getElementById(`slider-s-f-${simId}`),
      damp: document.getElementById(`slider-s-damp-${simId}`)
    };
    
    const displays = {
      m: document.getElementById(`val-s-m-${simId}`),
      r: document.getElementById(`val-s-r-${simId}`),
      f: document.getElementById(`val-s-f-${simId}`),
      damp: document.getElementById(`val-s-damp-${simId}`),
      inertia: document.getElementById(`stat-s-inertia-${simId}`),
      omega: document.getElementById(`stat-s-omega-${simId}`),
      alpha: document.getElementById(`stat-s-alpha-${simId}`),
      torque: document.getElementById(`stat-s-torque-${simId}`)
    };

    function updateParams() {
      if(!sliders.m) return;
      params.m = parseFloat(sliders.m.value);
      params.r = parseFloat(sliders.r.value);
      params.f = parseFloat(sliders.f.value);
      params.damping = parseFloat(sliders.damp.value);

      if(displays.m) {
        displays.m.textContent = params.m.toFixed(1) + " kg";
        displays.r.textContent = params.r.toFixed(0) + " px";
        displays.f.textContent = params.f.toFixed(1) + " N";
        displays.damp.textContent = params.damping.toFixed(2);
      }
    }

    const listeners = [];
    Object.values(sliders).forEach(s => { 
      if(s) {
        s.addEventListener('input', updateParams);
        listeners.push({ el: s, type: 'input', fn: updateParams });
      }
    });

    const btnReset = document.getElementById(`btn-reset-${simId}`);
    const resetFn = () => { state.angle = 0; state.angularVel = 0; };
    if(btnReset) {
      btnReset.addEventListener('click', resetFn);
      listeners.push({ el: btnReset, type: 'click', fn: resetFn });
    }

    function updatePhysics(dt) {
      const I = params.m * (params.r * params.r) / 1000; 
      physics_output.inertia = params.m * params.r * params.r;
      const torque = params.f * (params.r / 10);
      physics_output.torque = params.f * params.r;
      const alpha = torque / I;
      physics_output.alpha = alpha;
      const dragFactor = 1.0 - (params.damping * 0.05);
      state.angularVel = (state.angularVel + alpha * dt) * dragFactor;
      state.angle += state.angularVel * dt;
    }

    function drawArrow(ctx, startX, startY, angle, magnitude, color) {
      if (Math.abs(magnitude) < 0.1) return;
      const scale = 4; 
      const len = magnitude * scale;
      const arrowAngle = angle + (Math.PI / 2);
      const endX = startX + Math.cos(arrowAngle) * len;
      const endY = startY + Math.sin(arrowAngle) * len;

      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
      
      const headAngle = Math.atan2(endY - startY, endX - startX);
      const headLen = 8;
      ctx.beginPath(); ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(headAngle - Math.PI/6), endY - headLen * Math.sin(headAngle - Math.PI/6));
      ctx.lineTo(endX - headLen * Math.cos(headAngle + Math.PI/6), endY - headLen * Math.sin(headAngle + Math.PI/6));
      ctx.fill();
    }

    function loop(timestamp) {
      if (!isActive) return;
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;

      updatePhysics(dt);

      if(displays.inertia) {
        displays.inertia.textContent = physics_output.inertia.toFixed(0);
        displays.omega.textContent = state.angularVel.toFixed(2);
        displays.alpha.textContent = physics_output.alpha.toFixed(2);
        displays.torque.textContent = physics_output.torque.toFixed(1);
      }

      if(canvas.width === 0 || canvas.width !== canvas.parentElement.clientWidth) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      
      ctx.fillStyle = "#cbd5e1"; 
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
      ctx.rotate(state.angle);

      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(params.r, 0); ctx.stroke();

      const particleX = params.r;
      const particleY = 0;
      
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath(); 
      ctx.arc(particleX, particleY, 8 + params.m * 2, 0, Math.PI*2); 
      ctx.fill();
      
      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("m", particleX, particleY + 4);

      drawArrow(ctx, particleX, particleY, 0, params.f, "#fbbf24");
      ctx.restore();
      
      animationFrameId = requestAnimationFrame(loop);
    }

    updateParams();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
      listeners.forEach(l => l.el.removeEventListener(l.type, l.fn));
    };
  }, [simId]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Rotasi Partikel Tunggal</h3>
        <p className="text-purple-400 text-sm font-mono mt-1">Hukum II Newton untuk Rotasi</p>
      </div>

      <div className="relative w-full h-[600px] bg-slate-900/50 rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        <div className="w-full md:w-80 p-6 flex flex-col gap-4 bg-slate-900/80 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto shrink-0 z-10">
          <h2 className="text-lg font-bold text-green-400 mb-2">Parameter</h2>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-blue-400">Massa (m)</label> <span id={`val-s-m-${simId}`}>2.0 kg</span>
              </div>
              <input type="range" id={`slider-s-m-${simId}`} className="sim-slider" min="0.5" max="10" step="0.5" defaultValue="2.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Jari-jari (r)</label> <span id={`val-s-r-${simId}`}>150 px</span>
              </div>
              <input type="range" id={`slider-s-r-${simId}`} className="sim-slider" min="50" max="250" step="10" defaultValue="150" />
            </div>
            <div className="w-full h-px bg-white/10 my-1"></div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-orange-400">Gaya Tangensial (F)</label> <span id={`val-s-f-${simId}`}>0.0 N</span>
              </div>
              <input type="range" id={`slider-s-f-${simId}`} className="sim-slider" min="-20" max="20" step="0.5" defaultValue="0.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Hambatan Udara</label> <span id={`val-s-damp-${simId}`}>0.00</span>
              </div>
              <input type="range" id={`slider-s-damp-${simId}`} className="sim-slider" min="0" max="1" step="0.01" defaultValue="0.0" />
            </div>
            <button id={`btn-reset-${simId}`} className="mt-4 py-2 px-4 bg-red-500/80 hover:bg-red-500 text-white rounded font-bold transition-colors">
              Reset Posisi
            </button>
          </div>
        </div>

        <div className="flex-grow relative h-full w-full bg-slate-800/20">
          <div className="absolute top-4 right-4 p-4 bg-slate-900/80 rounded-lg text-xs font-mono border border-slate-700 pointer-events-none z-10 backdrop-blur-sm shadow-xl min-w-[200px]">
            <div className="flex justify-between text-emerald-400 font-bold mb-2 border-b border-slate-600 pb-1 gap-4">
              <span>Status Partikel</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
              <span>Inersia (I):</span> <span id={`stat-s-inertia-${simId}`} className="text-right text-slate-200">0.0</span>
              <span>Vel Sudut:</span> <span id={`stat-s-omega-${simId}`} className="text-right text-slate-200">0.0</span>
              <span>Percepatan:</span> <span id={`stat-s-alpha-${simId}`} className="text-right text-purple-300">0.0</span>
              <span className="text-white font-bold">Torsi:</span> <span id={`stat-s-torque-${simId}`} className="text-right text-white font-bold">0.0 Nm</span>
            </div>
          </div>
          <canvas id={`sim-canvas-${simId}`} className="w-full h-full block"></canvas>
        </div>
      </div>
    </div>
  );
}
