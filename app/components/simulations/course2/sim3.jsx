'use client';

import { useEffect } from 'react';

export default function Course2Sim1({ simId }) {
  useEffect(() => {
    const canvas = document.getElementById(`sim-canvas-${simId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isActive = true;

    let particles = [{ id: Date.now(), m: 2.0, r: 100 }];
    let params = { force: 0.0, damping: 0.0 };
    let state = { angle: 0, angularVel: 0, lastTime: 0 };
    let physics = { totalInertia: 0, torque: 0, alpha: 0 };

    const globalSliders = {
      force: document.getElementById(`slider-m-f-${simId}`),
      damp: document.getElementById(`slider-m-damp-${simId}`)
    };
    const globalDisplays = {
      force: document.getElementById(`val-m-f-${simId}`),
      damp: document.getElementById(`val-m-damp-${simId}`),
      count: document.getElementById(`stat-m-count-${simId}`),
      inertia: document.getElementById(`stat-m-inertia-${simId}`),
      omega: document.getElementById(`stat-m-omega-${simId}`),
      torque: document.getElementById(`stat-m-torque-${simId}`),
      alpha: document.getElementById(`stat-m-alpha-${simId}`)
    };
    
    const particleListContainer = document.getElementById(`particle-list-${simId}`);
    const btnAdd = document.getElementById(`btn-add-particle-${simId}`);

    function updateGlobals() {
      if(!globalSliders.force) return;
      params.force = parseFloat(globalSliders.force.value);
      params.damping = parseFloat(globalSliders.damp.value);
      
      if(globalDisplays.force) {
        globalDisplays.force.textContent = params.force.toFixed(1) + " N";
        globalDisplays.damp.textContent = params.damping.toFixed(2);
      }
    }

    function renderParticleControls() {
      if(!particleListContainer) return;
      particleListContainer.innerHTML = '';

      particles.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = "bg-slate-800/40 p-3 rounded border border-white/5 relative group transition-all hover:bg-slate-800/60";
        item.innerHTML = `
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-indigo-400">Partikel ${index + 1}</span>
            ${particles.length > 1 ? `<button class="btn-remove text-red-400 hover:text-red-300 p-1" data-id="${p.id}"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>` : ''}
          </div>
          <div class="space-y-2">
            <div>
              <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Massa: <b class="text-slate-200">${p.m.toFixed(1)} kg</b></span>
              </div>
              <input type="range" class="inp-m sim-slider w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" min="0.5" max="10" step="0.5" value="${p.m}" data-id="${p.id}">
            </div>
            <div>
              <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Radius: <b class="text-slate-200">${p.r} px</b></span>
              </div>
              <input type="range" class="inp-r sim-slider w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" min="20" max="250" step="10" value="${p.r}" data-id="${p.id}">
            </div>
          </div>
        `;
        particleListContainer.appendChild(item);
      });

      document.querySelectorAll('.inp-m').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const id = parseInt(e.target.dataset.id);
          const p = particles.find(x => x.id === id);
          if(p) { p.m = parseFloat(e.target.value); renderParticleControls(); }
        });
      });
      document.querySelectorAll('.inp-r').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const id = parseInt(e.target.dataset.id);
          const p = particles.find(x => x.id === id);
          if(p) { p.r = parseFloat(e.target.value); renderParticleControls(); }
        });
      });
      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          particles = particles.filter(p => p.id !== id);
          renderParticleControls();
        });
      });

      if(globalDisplays.count) globalDisplays.count.textContent = `${particles.length} Partikel`;
    }

    function addParticle() {
      if(particles.length >= 10) return alert("Maksimal 10 partikel!");
      const newR = 50 + Math.floor(Math.random() * 150);
      particles.push({ id: Date.now(), m: 2.0, r: newR });
      renderParticleControls();
    }

    globalSliders.force.addEventListener('input', updateGlobals);
    globalSliders.damp.addEventListener('input', updateGlobals);
    btnAdd.addEventListener('click', addParticle);
    
    const btnReset = document.getElementById(`btn-reset-${simId}`);
    const resetFn = () => { state.angle = 0; state.angularVel = 0; };
    if(btnReset) btnReset.addEventListener('click', resetFn);

    function updatePhysics(dt) {
      let totalInertia = 0;
      let maxR = 0;

      particles.forEach(p => {
        totalInertia += p.m * (p.r * p.r);
        if(p.r > maxR) maxR = p.r;
      });
      
      physics.totalInertia = totalInertia;
      const I_sim = totalInertia / 1000; 
      const torque = params.force * (maxR / 10);
      physics.torque = params.force * maxR;

      const alpha = I_sim > 0 ? torque / I_sim : 0;
      physics.alpha = alpha;

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

      if(globalDisplays.inertia) {
        globalDisplays.inertia.textContent = physics.totalInertia.toFixed(0);
        globalDisplays.omega.textContent = state.angularVel.toFixed(2);
        globalDisplays.torque.textContent = physics.torque.toFixed(1);
        globalDisplays.alpha.textContent = physics.alpha.toFixed(2);
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
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();

      ctx.rotate(state.angle);

      let maxR = 0;
      const sortedParticles = [...particles].sort((a,b) => b.r - a.r);

      sortedParticles.forEach(p => {
        if(p.r > maxR) maxR = p.r;
        ctx.strokeStyle = `rgba(100, 116, 139, 0.5)`; 
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.r, 0); ctx.stroke();

        ctx.fillStyle = `hsl(${200 + (p.id % 60)}, 70%, 50%)`;
        ctx.beginPath(); 
        ctx.arc(p.r, 0, 5 + p.m * 1.5, 0, Math.PI*2); 
        ctx.fill();
      });

      if(maxR > 0) drawArrow(ctx, maxR, 0, 0, params.force, "#fbbf24");
      ctx.restore();
      animationFrameId = requestAnimationFrame(loop);
    }

    updateGlobals();
    renderParticleControls();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
      btnAdd.removeEventListener('click', addParticle);
      if(btnReset) btnReset.removeEventListener('click', resetFn);
    };
  }, [simId]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-indigo-500 overflow-hidden text-white mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Sistem Banyak Partikel</h3>
        <p className="text-indigo-400 text-sm font-mono mt-1">Momen Inersia Total Aditif</p>
      </div>

      <div className="relative w-full h-[600px] bg-slate-900/50 rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        <div className="w-full md:w-80 p-6 flex flex-col gap-4 bg-slate-900/80 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto custom-scrollbar shrink-0 z-10">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Kontrol Global</h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-yellow-400">Gaya Luar</label> <span id={`val-m-f-${simId}`}>0.0 N</span>
              </div>
              <input type="range" id={`slider-m-f-${simId}`} className="sim-slider" min="-20" max="20" step="0.5" defaultValue="0.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Hambatan</label> <span id={`val-m-damp-${simId}`}>0.00</span>
              </div>
              <input type="range" id={`slider-m-damp-${simId}`} className="sim-slider" min="0" max="1" step="0.01" defaultValue="0.0" />
            </div>
          </div>

          <button id={`btn-add-particle-${simId}`} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors shadow-lg shadow-indigo-500/20 text-sm">
            + Tambah Partikel
          </button>

          <div id={`particle-list-${simId}`} className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar"></div>
          
          <button id={`btn-reset-${simId}`} className="mt-2 py-2 px-4 bg-red-500/80 hover:bg-red-500 text-white rounded font-bold transition-colors">
            Reset Posisi
          </button>
        </div>

        <div className="flex-grow relative h-full w-full bg-slate-800/20">
          <div className="absolute top-4 right-4 p-4 bg-slate-900/80 rounded-lg text-xs font-mono border border-slate-700 pointer-events-none z-10 backdrop-blur-sm shadow-xl min-w-[200px]">
            <div className="flex justify-between text-indigo-400 font-bold mb-2 border-b border-slate-600 pb-1 gap-4">
              <span>Sistem Multi Partikel</span>
              <span id={`stat-m-count-${simId}`} className="text-white">1 Partikel</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
              <span>Inersia Tot:</span> <span id={`stat-m-inertia-${simId}`} className="text-right text-slate-200">0.0</span>
              <span>Vel Sudut:</span> <span id={`stat-m-omega-${simId}`} className="text-right text-slate-200">0.0</span>
              <span>Percepatan:</span> <span id={`stat-m-alpha-${simId}`} className="text-right text-purple-300">0.0</span>
              <span className="text-white font-bold">Torsi Total:</span> <span id={`stat-m-torque-${simId}`} className="text-right text-white font-bold">0.0</span>
            </div>
          </div>
          <canvas id={`sim-canvas-${simId}`} className="w-full h-full block"></canvas>
        </div>
      </div>
    </div>
  );
}
