'use client';

import { useState } from 'react';

export default function SimulationCarousel({ simulations }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!simulations || simulations.length === 0) return null;

  const handleNext = () => {
    if (currentIndex < simulations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="flex justify-between items-center bg-[#f8fafc] p-4 rounded-xl border-2 border-[var(--light-blue)] shadow-sm">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
            currentIndex === 0 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-[var(--primary-blue)] text-white hover:bg-[var(--dark-blue)] shadow-md shadow-blue-500/20'
          }`}
        >
          ← Previous Sim
        </button>
        
        <div className="text-center">
          <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            Interactive Laboratory
          </span>
          <span className="font-semibold text-slate-800">
            Simulation {currentIndex + 1} of {simulations.length}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === simulations.length - 1}
          className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
            currentIndex === simulations.length - 1 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-[var(--primary-blue)] text-white hover:bg-[var(--dark-blue)] shadow-md shadow-blue-500/20'
          }`}
        >
          Next Sim →
        </button>
      </div>

      {/* Render the currently active simulation */}
      <div className="simulation-wrapper transition-all duration-300">
        {simulations[currentIndex]}
      </div>
    </div>
  );
}
