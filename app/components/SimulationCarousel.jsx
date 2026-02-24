'use client';

import React, { useState, useRef, useEffect } from 'react';
import CompleteCourseButton from './CompleteCourseButton';

export default function SimulationCarousel({ simulations, unlocksLevel, currentLevel, courseId, category }) {
  // Navigation phases: 'intro', 'sims', 'summary'
  const [step, setStep] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Array to hold scores for each simulation (defaults to 100)
  const [scores, setScores] = useState(Array(simulations?.length || 0).fill(100));
  
  const wrapperRef = useRef(null);

  if (!simulations || simulations.length === 0) return null;

  // Handler to catch dynamic score updates from within a simulation component
  const handleScoreUpdate = (index, newScore) => {
    setScores(prev => {
      const updated = [...prev];
      updated[index] = newScore;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIndex < simulations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // If it's the last simulation, proceed to the report screen
      setStep('summary');
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

  // =====================================
  // PHASE 1: INTRO SCREEN
  // =====================================
  if (step === 'intro') {
    return (
      <div className={`glass-panel p-8 rounded-2xl border-l-4 overflow-hidden text-white mt-8 ${category === 'math' ? 'border-l-emerald-500' : 'border-l-[var(--primary-blue)]'}`}>
        <h3 className="text-3xl font-bold mb-4">Course Introduction</h3>
        <p className="text-slate-300 mb-6">This course contains the following interactive simulations. Complete all of them to finish the course and record your score.</p>
        
        <ul className="list-disc list-inside mb-8 space-y-2 text-slate-200">
          {simulations.map((_, i) => (
            <li key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              Interactive Laboratory {i + 1}
            </li>
          ))}
        </ul>
        
        <button 
          onClick={() => setStep('sims')} 
          className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-colors w-full md:w-auto text-white ${
            category === 'math' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[var(--primary-blue)] hover:bg-[var(--dark-blue)]'
          }`}
        >
          Start First Simulation →
        </button>
      </div>
    );
  }

  // =====================================
  // PHASE 3: SUMMARY SCREEN (REPORT)
  // =====================================
  if (step === 'summary') {
    const meanScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    return (
      <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white mt-8">
        <h3 className="text-3xl font-bold mb-4">Course Report</h3>
        <p className="text-slate-300 mb-6">Here is your performance across all simulations in this course.</p>
        
        <div className="space-y-3 mb-8">
          {simulations.map((_, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <span className="font-semibold">Interactive Laboratory {i + 1}</span>
              <span className="text-emerald-400 font-mono font-bold">{scores[i]}/100 pts</span>
            </div>
          ))}
          
          <div className="flex justify-between items-center bg-slate-700 p-4 rounded-lg border border-slate-500 mt-4 shadow-lg">
            <span className="font-bold text-lg text-white">Mean Final Score</span>
            <span className="text-white font-mono font-bold text-2xl">{meanScore}/100 pts</span>
          </div>
        </div>

        <CompleteCourseButton 
          courseId={courseId}
          category={category}
          unlocksLevel={unlocksLevel} 
          currentLevel={currentLevel} 
          isReady={true}
          finalScore={meanScore}
        />
      </div>
    );
  }

  // =====================================
  // PHASE 2: ACTIVE SIMULATION CAROUSEL
  // =====================================
  
  // Clone the current simulation element to inject the score updater prop
  const currentSimWithProps = React.cloneElement(simulations[currentIndex], {
    onScoreUpdate: (newScore) => handleScoreUpdate(currentIndex, newScore)
  });

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
            className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
              category === 'math' && isLastSim
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-[var(--primary-blue)] text-white hover:bg-[var(--dark-blue)] shadow-md shadow-blue-500/20'
            }`}
          >
            {isLastSim ? 'Finish & View Report →' : 'Next Sim →'}
          </button>
        </div>

        {/* Active Simulation */}
        <div className="simulation-wrapper flex-grow transition-all duration-300">
          {currentSimWithProps}
        </div>
      </div>
    </div>
  );
}
