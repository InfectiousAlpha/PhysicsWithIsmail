'use client';

import { useEffect } from 'react';

export default function Course2Sim2({ simId }) {
  useEffect(() => {
    const canvas = document.getElementById(`sim-canvas-${simId}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    let params = { M: 2.0, L: 200, N: 5 }; 
    let results = { I_approx: 0, I_exact: 0, error: 0 };

    const sliders = {
      M: document.getElementById(`slider-a-m-${simId}`),
      L: document.getElementById(`slider-a-l-${simId}`),
      N: document.getElementById(`slider-a-n-${simId}`)
    };
    
    const displays = {
      M: document.getElementById(`val-a-m-${simId}`),
      L: document.getElementById(`val-a-l-${simId}`),
      N: document.getElementById(`val-a-n-${simId}`),
      iApprox: document.getElementById(`stat-a-approx-${simId}`),
      iExact: document.getElementById(`stat-a-exact-${simId}`),
      error: document.getElementById(`stat-a-error-${simId}`)
    };

    function calculate() {
      results.I_exact = (1/3) * params.M * (params.L * params.L) / 1000;
      const dm = params.M / params.N;
      const dr = params.L / params.N;
      let sumInertia = 0;

      for (let i = 1; i <= params.N; i++) {
        let r = (i - 0.5) * dr;
        sumInertia += dm * (r * r);
      }

      results.I_approx = sumInertia / 1000;
      if (results.I_exact !== 0) {
        results.error = Math.abs((results.I_approx - results.I_exact) / results.I_exact) * 100;
      }
    }

    function updateUI() {
      if (!displays.M) return;
      
      displays.M.textContent = params.M.toFixed(1) + " kg";
      displays.L.textContent = params.L.toFixed(0) + " px";
      displays.N.textContent = params.N + " partikel";

      calculate();
      
      displays.iApprox.textContent = results.I_approx.toFixed(2);
      displays.iExact.textContent = results.I_exact.toFixed(2);
      
      displays.error.textContent = results.error.toFixed(2) + "%";
      if (results.error < 1) displays.error.className = "text-right text-green-400 font-bold";
      else if (results.error < 5) displays.error.className = "text-right text-yellow-400 font-bold";
      else displays.error.className = "text-right text-red-400 font-bold";

      render();
    }

    function onInput() {
      params.M = parseFloat(sliders.M.value);
      params.L = parseFloat(sliders.L.value);
      params.N = parseInt(sliders.N.value);
      updateUI();
    }

    Object.values(sliders).forEach(s => {
      if(s) s.addEventListener('input', onInput);
    });

    function render() {
      if (canvas.width !== canvas.parentElement.clientWidth) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2 - params.L / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy - 20, params.L, 40);
      ctx.fillRect(cx, cy - 20, params.L, 40);

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Bentuk Batang Ideal", cx + params.L/2, cy - 30);

      const dr = params.L / params.N; 
      const particleColor = params.N > 50 ? "#f43f5e" : "#fb7185";

      for (let i = 1; i <= params.N; i++) {
        let r_center = (i - 0.5) * dr;
        let drawX = cx + r_center;
        ctx.fillStyle = particleColor;
        let radius = Math.min(dr / 2 - 1, 15); 
        if (radius < 2) radius = dr/2;

        ctx.beginPath();
        ctx.arc(drawX, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      
      ctx.strokeStyle = "#cbd5e1";
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText("Poros Rotasi", cx + 10, cy + 60);
    }

    onInput();

    return () => {
      Object.values(sliders).forEach(s => {
        if(s) s.removeEventListener('input', onInput);
      });
    };
  }, [simId]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-rose-500 overflow-hidden text-white mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Aproksimasi Batang</h3>
        <p className="text-rose-400 text-sm font-mono mt-1">Dari Partikel Diskrit Menuju Kontinu (Integral)</p>
      </div>

      <div className="relative w-full h-[600px] bg-slate-900/50 rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        <div className="w-full md:w-80 p-6 flex flex-col gap-4 bg-slate-900/80 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto shrink-0 z-10">
          <h2 className="text-lg font-bold text-green-400 mb-2">Parameter</h2>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg text-xs text-rose-200 mb-2">
            Atur jumlah partikel (N) untuk melihat bagaimana penjumlahan diskrit mendekati inersia batang padat.
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label className="text-rose-400 font-bold">Jumlah Partikel (N)</label> 
                <span id={`val-a-n-${simId}`} className="font-bold text-white">5</span>
              </div>
              <input type="range" id={`slider-a-n-${simId}`} className="sim-slider accent-rose-500" min="2" max="100" step="1" defaultValue="5" />
            </div>
            <div className="w-full h-px bg-white/10 my-2"></div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Total Massa (M)</label> <span id={`val-a-m-${simId}`}>2.0 kg</span>
              </div>
              <input type="range" id={`slider-a-m-${simId}`} className="sim-slider" min="1" max="10" step="0.5" defaultValue="2.0" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <label>Panjang Batang (L)</label> <span id={`val-a-l-${simId}`}>200 px</span>
              </div>
              <input type="range" id={`slider-a-l-${simId}`} className="sim-slider" min="50" max="300" step="10" defaultValue="200" />
            </div>
          </div>
        </div>

        <div className="flex-grow relative h-full w-full bg-slate-800/20">
          <div className="absolute top-4 right-4 p-4 bg-slate-900/80 rounded-lg text-xs font-mono border border-slate-700 pointer-events-none z-10 backdrop-blur-sm shadow-xl min-w-[220px]">
            <div className="flex justify-between text-rose-400 font-bold mb-2 border-b border-slate-600 pb-1 gap-4">
              <span>Kalkulasi Inersia</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-400">
              <span>Inersia (Sum):</span> <span id={`stat-a-approx-${simId}`} className="text-right text-white font-bold text-lg">0.00</span>
              <span>Inersia (Teori):</span> <span id={`stat-a-exact-${simId}`} className="text-right text-emerald-400 font-bold text-lg">0.00</span>
              <span className="pt-2 border-t border-white/10">Error (%):</span> <span id={`stat-a-error-${simId}`} className="text-right pt-2 border-t border-white/10 font-bold">0.00%</span>
            </div>
          </div>
          <canvas id={`sim-canvas-${simId}`} className="w-full h-full block"></canvas>
        </div>
      </div>
    </div>
  );
}
