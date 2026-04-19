'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

// Define the tests/levels
const TESTS = [
  {
    name: "Test 1: Stationary Target",
    setup: (target) => {
      target.x = 400; target.y = 150;
      target.vx = 0; target.vy = 0;
      target.active = true;
      target.color = '#ef4444'; // Red
    }
  },
  {
    name: "Test 2: Slow Constant Speed",
    setup: (target) => {
      target.x = 100; target.y = 200;
      target.vx = 120; target.vy = 0; // Moves 120px per second
      target.active = true;
      target.color = '#f97316'; // Orange
    }
  },
  {
    name: "Test 3: Fast Constant Speed",
    setup: (target) => {
      target.x = 700; target.y = 250;
      target.vx = -250; target.vy = 0; // Moves -250px per second
      target.active = true;
      target.color = '#eab308'; // Yellow
    }
  },
  {
    name: "Test 4: Diagonal Bounce",
    setup: (target) => {
      target.x = 150; target.y = 150;
      target.vx = 150; target.vy = 80;
      target.active = true;
      target.color = '#a855f7'; // Purple
    }
  }
];

export default function Course1Sim3({ simId, onScoreUpdate, onComplete }) {
  const [phase, setPhase] = useState(0); 
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Game UI State
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [testStatus, setTestStatus] = useState('playing'); // playing, passed, finished
  const [finalScore, setFinalScore] = useState(0);
  
  const canvasRef = useRef(null);
  const initialized = useRef(false);
  
  const QUOTE_IN_TIME = 500;
  const SIM_IN_TIME = 2500;
  const BULLET_TIME_MS = 1000; 
  const SHOOTER_POS = { x: 400, y: 580 };
  const LOGICAL_W = 800;
  const LOGICAL_H = 600;

  // Mutable Physics State
  const engine = useRef({
    target: { x: 0, y: 0, radius: 20, vx: 0, vy: 0, active: false, color: '#ef4444' },
    bullets: [],
    markers: [],
    particles: [],
    lastTime: 0,
    isTransitioning: false
  });

  // Initialization & Phase Progression
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let isMounted = true;

    // Load first test data
    TESTS[0].setup(engine.current.target);

    setTimeout(() => { if (isMounted) setPhase(1); }, QUOTE_IN_TIME);
    setTimeout(() => { 
      if (isMounted) { 
        setPhase(2); 
        setIsAnimating(true); 
      } 
    }, SIM_IN_TIME);

    return () => { isMounted = false; };
  }, []);

  // Handle Level Transitions
  const handleNextTest = useCallback(() => {
    const nextIdx = currentTestIndex + 1;
    
    if (nextIdx >= TESTS.length) {
      setTestStatus('finished');
      
      // Scoring Logic: Start at 100, lose 5 points for every extra attempt beyond the minimum 4
      const extraAttempts = Math.max(0, attempts - TESTS.length);
      const calculatedScore = Math.max(0, 100 - (extraAttempts * 5));
      
      setFinalScore(calculatedScore);
      if (onScoreUpdate) onScoreUpdate(calculatedScore);
      if (onComplete) onComplete();
      return;
    }

    // Reset Engine State for next level
    engine.current.isTransitioning = false;
    engine.current.bullets = [];
    engine.current.markers = [];
    engine.current.particles = [];
    TESTS[nextIdx].setup(engine.current.target);
    
    setCurrentTestIndex(nextIdx);
    setTestStatus('playing');
  }, [currentTestIndex, attempts, onScoreUpdate, onComplete]);

  // Handle Canvas Clicks (Shooting)
  const handleCanvasClick = (e) => {
    const st = engine.current;
    if (!st.target.active || st.isTransitioning || testStatus !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const now = performance.now();

    // Fire Bullet
    st.bullets.push({
      startX: SHOOTER_POS.x, startY: SHOOTER_POS.y,
      endX: clickX, endY: clickY,
      x: SHOOTER_POS.x, y: SHOOTER_POS.y,
      startTime: now, radius: 6, active: true
    });

    // Place Click Marker
    st.markers.push({
      x: clickX, y: clickY,
      startTime: now, active: true
    });

    setAttempts(a => a + 1);
  };

  const createExplosion = (x, y, color) => {
    const st = engine.current;
    for (let i = 0; i < 30; i++) {
      st.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0, color: color
      });
    }
  };

  // Main Render & Physics Loop
  useEffect(() => {
    if (!isAnimating || testStatus === 'finished') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function gameLoop(now) {
      const st = engine.current;
      if (!st.lastTime) st.lastTime = now;
      const dt = Math.min((now - st.lastTime) / 1000, 0.05);
      st.lastTime = now;

      // --- UPDATE PHYSICS ---
      
      // Update Target
      if (st.target.active) {
        st.target.x += st.target.vx * dt;
        st.target.y += st.target.vy * dt;

        // Bounce horizontally
        if (st.target.x - st.target.radius < 0) {
          st.target.x = st.target.radius;
          st.target.vx *= -1;
        } else if (st.target.x + st.target.radius > LOGICAL_W) {
          st.target.x = LOGICAL_W - st.target.radius;
          st.target.vx *= -1;
        }

        // Bounce vertically
        if (st.target.y - st.target.radius < 0) {
          st.target.y = st.target.radius;
          st.target.vy *= -1;
        } else if (st.target.y + st.target.radius > 450) { // Limit bottom bound
          st.target.y = 450 - st.target.radius;
          st.target.vy *= -1;
        }
      }

      // Update Bullets
      st.bullets.forEach(b => {
        if (!b.active) return;

        let elapsed = now - b.startTime;
        let progress = elapsed / BULLET_TIME_MS;

        if (progress >= 1.0) {
          progress = 1.0;
          b.active = false;
          createExplosion(b.endX, b.endY, '#3b82f6'); // Small blue poof on miss
        }

        b.x = b.startX + (b.endX - b.startX) * progress;
        b.y = b.startY + (b.endY - b.startY) * progress;

        // Collision Check
        if (st.target.active && b.active) {
          let dist = Math.hypot(b.x - st.target.x, b.y - st.target.y);
          if (dist < st.target.radius + b.radius && !st.isTransitioning) {
            st.target.active = false;
            b.active = false;
            st.isTransitioning = true;
            createExplosion(st.target.x, st.target.y, st.target.color);
            setTestStatus('passed'); // Trigger React state update for UI
          }
        }
      });

      // Update Click Markers
      st.markers.forEach(m => {
        if (!m.active) return;
        if (now - m.startTime >= BULLET_TIME_MS) m.active = false;
      });

      // Update Particles
      st.particles.forEach(p => {
        if (p.life > 0) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt * 2; 
        }
      });

      // Cleanup
      st.bullets = st.bullets.filter(b => b.active);
      st.markers = st.markers.filter(m => m.active);
      st.particles = st.particles.filter(p => p.life > 0);

      // --- DRAWING ---
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Background Grid
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for(let i=0; i<LOGICAL_W; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, LOGICAL_H); ctx.stroke();
      }
      for(let i=0; i<LOGICAL_H; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(LOGICAL_W, i); ctx.stroke();
      }

      // Draw Markers
      st.markers.forEach(m => {
        let progress = (now - m.startTime) / BULLET_TIME_MS;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 30 * (1 - progress), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${1 - progress})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crosshair
        ctx.beginPath();
        ctx.moveTo(m.x - 5, m.y); ctx.lineTo(m.x + 5, m.y);
        ctx.moveTo(m.x, m.y - 5); ctx.lineTo(m.x, m.y + 5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
      });

      // Draw Target
      if (st.target.active) {
        ctx.beginPath();
        ctx.arc(st.target.x, st.target.y, st.target.radius, 0, Math.PI * 2);
        ctx.fillStyle = st.target.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Shooter
      ctx.beginPath();
      ctx.arc(SHOOTER_POS.x, SHOOTER_POS.y, 25, Math.PI, 0);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.fillRect(SHOOTER_POS.x - 5, SHOOTER_POS.y - 35, 10, 35);

      // Draw Bullets
      st.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#60a5fa';
      });
      ctx.shadowBlur = 0;

      // Draw Particles
      st.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAnimating, testStatus]);

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-fuchsia-500 overflow-hidden text-white flex-grow flex flex-col relative w-full h-full min-h-[600px]">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Intro Quote */}
      <div 
        className={`absolute left-0 w-full flex justify-center px-8 transition-all duration-1000 ease-in-out transform z-20 pointer-events-none
          ${phase === 0 ? 'opacity-0 top-1/2 -translate-y-1/2' : ''}
          ${phase === 1 ? 'opacity-100 top-1/2 -translate-y-1/2' : ''}
          ${phase >= 2 ? 'opacity-100 top-6 translate-y-0 scale-90' : ''}
        `}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-white drop-shadow-lg max-w-4xl text-center">
          "Time is relative, but a one-second delay is absolute. Anticipate."
        </h2>
      </div>

      {/* Game Container */}
      <div 
        className={`w-full flex-grow relative transition-all duration-1000 flex flex-col items-center z-10 mt-16
          ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        {/* HUD */}
        {testStatus !== 'finished' && (
          <div className="w-full max-w-[800px] flex justify-between items-start mb-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-400">
                {TESTS[currentTestIndex]?.name}
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Predict the target's position. Bullet takes <span className="text-yellow-400 font-bold">exactly 1 second</span> to arrive.
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-lg md:text-xl font-bold text-slate-200">
                Attempts: <span className="text-fuchsia-400">{attempts}</span>
              </div>
              {testStatus === 'passed' && (
                <button 
                  onClick={handleNextTest}
                  className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 animate-in fade-in"
                >
                  Next Test &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="relative w-full max-w-[800px] bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex-grow flex items-center justify-center">
          {testStatus === 'finished' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-30 animate-in fade-in duration-500 p-6 text-center">
              <h3 className="text-4xl font-bold mb-4 text-emerald-400">Simulation Complete!</h3>
              <div className="text-2xl mb-2 text-slate-200">
                Total Attempts: <span className="text-fuchsia-400 font-bold">{attempts}</span>
              </div>
              <div className="text-xl mb-8 text-slate-300">
                Final Accuracy Score: <span className="text-emerald-400 font-bold">{finalScore}</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Your prediction accuracy demonstrates a solid grasp of spatial forecasting over time.
                Click "Next" or "Submit" below to record your performance.
              </p>
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              width={LOGICAL_W} 
              height={LOGICAL_H}
              onMouseDown={handleCanvasClick}
              className={`w-full max-h-[60vh] object-contain bg-[#1e293b] rounded-lg ${testStatus === 'passed' ? 'cursor-default opacity-80' : 'cursor-crosshair'}`}
              style={{ boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
            />
          )}
        </div>
        
        <div className="mt-4 text-center max-w-2xl px-4 text-slate-400 text-xs md:text-sm">
           <p><strong>Mechanics:</strong> Click anywhere on the grid. Your turret will fire a bullet towards that point. The bullet is engineered to take exactly 1.0 seconds to reach the clicked destination, regardless of distance. Hit the target to advance.</p>
        </div>
      </div>
    </div>
  );
}
