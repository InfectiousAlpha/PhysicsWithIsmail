'use client';

import { useState, useRef, useEffect } from 'react';
import CompleteCourseButton from './CompleteCourseButton';

export default function SimulationCarousel({ simulations, unlocksLevel, currentLevel, courseId, category }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef(null);

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

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await wrapperRef.current.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  // Listen to standard escape key interactions modifying fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const isLastSim = currentIndex === simulations.length - 1;

  return (
    <div className="flex flex-col gap-6 mt-8">
      
      {/* Container that goes into fullscreen */}
      <div ref={wrapperRef} className="sim-fullscreen-wrapper transition-all duration-300 flex flex-col">
        
        {/* Navigation Header */}
        <div className={`flex justify-between items-center rounded-xl border-2 shadow-sm mb-6 ${
            isFullscreen ? 'bg-slate-800 border-slate-700 p-4' : 'bg-[#f8fafc] border-[var(--light-blue)] p-4'
          }`}
        >
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
            <span className={`block text-sm font-bold uppercase tracking-wider mb-1 ${isFullscreen ? 'text-slate-400' : 'text-slate-400'}`}>
              Interactive Laboratory
            </span>
            <span className={`font-semibold flex items-center justify-center gap-2 ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
              Simulation {currentIndex + 1} of {simulations.length}
              
              <button 
                onClick={toggleFullscreen} 
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} 
                className="text-slate-400 hover:text-[var(--primary-blue)] transition-colors p-1"
              >
                {isFullscreen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={isLastSim}
            className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
              isLastSim
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-[var(--primary-blue)] text-white hover:bg-[var(--dark-blue)] shadow-md shadow-blue-500/20'
            }`}
          >
            Next Sim →
          </button>
        </div>

        {/* Active Simulation */}
        <div className="simulation-wrapper flex-grow transition-all duration-300">
          {simulations[currentIndex]}
        </div>
      </div>

      {/* Completion Button - Now receiving courseId and category correctly */}
      <div>
        <CompleteCourseButton 
          courseId={courseId}
          category={category}
          unlocksLevel={unlocksLevel} 
          currentLevel={currentLevel} 
          isReady={isLastSim} 
        />
      </div>

    </div>
  );
}
