'use client';

import { useEffect } from 'react';

export default function Course1Sim2({ simId }) {
  useEffect(() => {
    const canvas = document.getElementById(`sim-canvas-${simId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isActive = true;
    
    let params = { m1: 2.0, m2: 2.0, L: 150, f1: 0.0, f2: 0.0, damping: 0.0 };
    let state = { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, angle: 0, angularVel: 0, lastTime: 0 };
    let physics_output = { inertia: 0, torque: 0, f_net_mag: 0 };

    const sliders = {
      m1: document.getElementById(`slider-m1-${simId}`),
      m2: document.getElementById(`slider-m2-${simId}`),
      len: document.getElementById(`slider-len-${simId}`),
      damping: document.getElementById(`slider-damping-${simId}`),
      f1: document.getElementById(`slider-f1-${simId}`),
      f2: document.getElementById(`slider-f2-${simId}`)
    };

    const displays = {
      m1: document.getElementById(`val-m1-${simId}`),
      m2: document.getElementById(`val-m2-${simId}`),
      len: document.getElementById(`val-len-${simId}`),
      damping: document.getElementById(`val-damping-${simId}`),
      f1: document.getElementById(`val-f1-${simId}`),
      f2: document.getElementById(`val-f2-${simId}`),
      inertia: document.getElementById(`stat-inertia-${simId}`),
      omega: document.getElementById(`stat-omega-${simId}`),
      v: document.getElementById(`stat-v-${simId}`),
      torque: document.getElementById(`stat-torque-rigid-${simId}`)
    };

    function updateParams() {
      if(!sliders.m1) return;
      params.m1 = parseFloat(sliders.m1.value);
      params.m2 = parseFloat(sliders.m2.value);
      params.L = parseFloat(sliders.len.value);
      params.damping = parseFloat(sliders.damping.value);
      params.f1 = parseFloat(sliders.f1.value);
      params.f2 = parseFloat(sliders.f2.value);

      if(displays.m1) {
        displays.m1.textContent = params.m1.toFixed(1) + " kg";
        displays.m2.textContent = params.m2.toFixed(1) + " kg";
        displays.len.textContent = params.L.toFixed(0) + " px";
        displays.damping.textContent = params.damping.toFixed(2);
        displays.f1.textContent = params.f1.toFixed(1) + " N";
        displays.f2.textContent = params.f2.toFixed(1) + " N";
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
    const resetFn = () => {
      state.pos = { x: 0, y: 0 }; state.vel = { x: 0, y: 0 }; state.angle = 0; state.angularVel = 0;
    };
    if(btnReset) {
      btnReset.addEventListener('click', resetFn);
      listeners.push({ el: btnReset, type: 'click', fn: resetFn });
    }

    function updatePhysics(dt) {
      const M = params.m1 + params.m2;
      const r1 = (params.m2 / M) * params.L;
      const r2 = (params.m1 / M) * params.L;
      const I = params.m1 * r1 * r1 + params.m2 * r2 * r2;
      physics_output.inertia = I;

      const forceDir = state.angle - Math.PI / 2;
      const F1x = params.f1 * Math.cos(forceDir);
      const F1y = params.f1 * Math.sin(forceDir);
      const F2x = params.f2 * Math.cos(forceDir);
      const F2y = params.f2 * Math.sin(forceDir);

      const F_net_x = F1x + F2x;
      const F_net_y = F1y + F2y;
      
      const torque = (params.f2 * r2) - (params.f1 * r1);
      physics_output.torque = torque;

      const ax = F_net_x / M;
      const ay = F_net_y / M;
      const dragFactor = 1.0 - (params.damping * 0.05);
      
      state.vel.x = (state.vel.x + ax * dt) * dragFactor;
      state.vel.y = (state.vel.y + ay * dt) * dragFactor;
      state.pos.x += state.vel.x * dt * 10;
      state.pos.y += state.vel.y * dt * 10;

      const alpha = torque / I * 500;
      state.angularVel = (state.angularVel + alpha * dt) * dragFactor;
      state.angle += state.angularVel * dt;

      const w = canvas.width / 2; const h = canvas.height / 2; const margin = 50;
      const wallDamp = 0.8;
      if (state.pos.x > w - margin) { state.pos.x = w - margin; state.vel.x *= -wallDamp; }
      if (state.pos.x < -w + margin) { state.pos.x = -w + margin; state.vel.x *= -wallDamp; }
      if (state.pos.y > h - margin) { state.pos.y = h - margin; state.vel.y *= -wallDamp; }
      if (state.pos.y < -h + margin) { state.pos.y = -h + margin; state.vel.y *= -wallDamp; }
    }

    function drawArrow(ctx, startX, startY, angle, magnitude, color) {
      if (Math.abs(magnitude) < 0.1) return;
      const scale = 5; 
      const len = magnitude * scale;
      const endX = startX + Math.cos(angle) * len;
      const endY = startY + Math.sin(angle) * len;

      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
      const arrowAngle = Math.atan2(endY - startY, endX - startX);
      const headLen = 8;
      ctx.beginPath(); ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(arrowAngle - Math.PI/6), endY - headLen * Math.sin(arrowAngle - Math.PI/6));
      ctx.lineTo(endX - headLen * Math.cos(arrowAngle + Math.PI/6), endY - headLen * Math.sin(arrowAngle + Math.PI/6));
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
        displays.v.textContent = (Math.sqrt(state.vel.x**2 + state.vel.y**2) * 10).toFixed(1);
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
      ctx.translate(cx + state.pos.x, cy + state.pos.y);
      ctx.rotate(state.angle);

      const M = params.m1 + params.m2;
      const r1 = (params.m2 / M) * params.L;
      const r2 = (params.m1 / M) * params.L;

      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-r1, 0); ctx.lineTo(r2, 0); ctx.stroke();

      ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.arc(-r1, 0, 5 + params.m1 * 3, 0, Math.PI*2); ctx.fill();
      drawArrow(ctx, -r1, 0, -Math.PI/2, params.f1, "#60a5fa");

      ctx.fillStyle = "#fb923c"; ctx.beginPath(); ctx.arc(r2, 0, 5 + params.m2 * 3, 0, Math.PI*2); ctx.fill();
      drawArrow(ctx, r2, 0, -Math.PI/2, params.f2, "#fbbf24");

      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
      
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
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-teal-500 overflow-hidden text-white mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Sistem Rigid Rotor 2D</h3>
        <p className="text-teal-400 text-sm font-mono mt-1">Analisis Translasi & Rotasi</p>
      </div>

      <div className="relative w-full h-[600px] bg-slate-900/50 rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        <div className="w-full md:w-80 p-6 flex flex-col gap-4 bg-slate-900/80 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto shrink-0 z-10">
          <h2 className="text-lg font-bold text-green-400 mb-2">Parameter</h2>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-blue-400">Massa 1</label> <span id={`val-m1-${simId}`}>2.0 kg</span>
              </div>
              <input type="range" id={`slider-m1-${simId}`} className="sim-slider" min="1" max="10" step="0.5" defaultValue="2.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-orange-400">Massa 2</label> <span id={`val-m2-${simId}`}>2.0 kg</span>
              </div>
              <input type="range" id={`slider-m2-${simId}`} className="sim-slider" min="1" max="10" step="0.5" defaultValue="2.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Panjang</label> <span id={`val-len-${simId}`}>150 px</span>
              </div>
              <input type="range" id={`slider-len-${simId}`} className="sim-slider" min="50" max="250" step="10" defaultValue="150" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Hambatan Udara</label> <span id={`val-damping-${simId}`}>0.00</span>
              </div>
              <input type="range" id={`slider-damping-${simId}`} className="sim-slider" min="0" max="1" step="0.01" defaultValue="0.0" />
            </div>
            <div className="w-full h-px bg-white/10 my-1"></div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-blue-400">Gaya P1</label> <span id={`val-f1-${simId}`}>0.0 N</span>
              </div>
              <input type="range" id={`slider-f1-${simId}`} className="sim-slider" min="-20" max="20" step="0.5" defaultValue="0.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-orange-400">Gaya P2</label> <span id={`val-f2-${simId}`}>0.0 N</span>
              </div>
              <input type="range" id={`slider-f2-${simId}`} className="sim-slider" min="-20" max="20" step="0.5" defaultValue="0.0" />
            </div>
            <button id={`btn-reset-${simId}`} className="mt-4 py-2 px-4 bg-red-500/80 hover:bg-red-500 text-white rounded font-bold transition-colors">
              Reset Posisi
            </button>
          </div>
        </div>

        <div className="flex-grow relative h-full w-full bg-slate-800/20">
          <div className="absolute top-4 right-4 p-4 bg-slate-900/80 rounded-lg text-xs font-mono border border-slate-700 pointer-events-none z-10 backdrop-blur-sm shadow-xl min-w-[200px]">
            <div className="flex justify-between text-teal-400 font-bold mb-2 border-b border-slate-600 pb-1 gap-4">
              <span>Status Sistem</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
              <span>Inersia (I):</span> <span id={`stat-inertia-${simId}`} className="text-right text-slate-200">0.0</span>
              <span>Vel Sudut:</span> <span id={`stat-omega-${simId}`} className="text-right text-slate-200">0.0</span>
              <span>Vel Linear:</span> <span id={`stat-v-${simId}`} className="text-right text-purple-300">0.0</span>
              <span className="text-white font-bold">Total Torsi:</span> <span id={`stat-torque-rigid-${simId}`} className="text-right text-white font-bold">0.0</span>
            </div>
          </div>
          <canvas id={`sim-canvas-${simId}`} className="w-full h-full block"></canvas>
        </div>
      </div>
    </div>
  );
}
