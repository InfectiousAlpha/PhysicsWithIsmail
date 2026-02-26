'use client';

import React, { useState, useRef, useEffect } from 'react';
import CompleteCourseButton from './CompleteCourseButton';
import { simulationNames } from '../lib/simulationNames';

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
  const renderIntro = () => (
    <div className={`glass-panel p-8 rounded-2xl border-l-4 overflow-hidden text-white flex-grow flex flex-col ${!isFullscreen ? 'mt-8' : ''} ${category === 'math' ? 'border-l-emerald-500' : 'border-l-[var(--primary-blue)]'}`}>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-3xl font-bold">Course Introduction</h3>
          <p className="text-slate-300 mt-2">This course contains the following interactive simulations. Complete all of them to finish the course and record your score.</p>
        </div>

        {/* Prominent Fullscreen Button */}
        <button 
          onClick={toggleFullscreen} 
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-600 shadow-xl shrink-0"
        >
          {isFullscreen ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
              Exit Fullscreen
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              Enter Fullscreen Mode
            </>
          )}
        </button>
      </div>
      
      <ul className="list-disc list-inside mb-8 space-y-3 text-slate-200 flex-grow">
        {simulations.map((sim, i) => {
          const simId = sim.props.simId;
          const simName = simulationNames[simId] || `Interactive Laboratory ${i + 1}`;
          return (
            <li key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center shadow-sm">
              <span className="font-semibold text-lg">{simName}</span>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">Modul {i + 1}</span>
            </li>
          );
        })}
      </ul>
      
      <button 
        onClick={() => setStep('sims')} 
        className={`font-bold py-4 px-8 rounded-xl shadow-lg transition-colors w-full md:w-auto text-white text-lg ${
          category === 'math' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-[var(--primary-blue)] hover:bg-[var(--dark-blue)] shadow-blue-500/20'
        }`}
      >
        Start First Simulation →
      </button>
    </div>
  );

  // =====================================
  // PHASE 2: ACTIVE SIMULATION CAROUSEL
  // =====================================
  const renderSims = () => {
    const currentSimWithProps = React.cloneElement(simulations[currentIndex], {
      onScoreUpdate: (newScore) => handleScoreUpdate(currentIndex, newScore)
    });

    const currentSimId = simulations[currentIndex].props.simId;
    const currentSimName = simulationNames[currentSimId] || `Interactive Laboratory`;

    return (
      <div className={`flex flex-col gap-6 flex-grow h-full ${!isFullscreen ? 'mt-8' : ''}`}>
        
        {/* Navigation Header */}
        <div className={`flex justify-between items-center rounded-xl border-2 shadow-sm shrink-0 ${
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
            ← Previous
          </button>
          
          <div className="text-center px-4">
            <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentSimName}
            </span>
            <span className={`font-semibold flex items-center justify-center gap-2 ${isFullscreen ? 'text-white' : 'text-slate-800'}`}>
              Modul {currentIndex + 1} of {simulations.length}
              
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
            {isLastSim ? 'Finish →' : 'Next →'}
          </button>
        </div>

        {/* Active Simulation */}
        <div className="simulation-wrapper flex-grow transition-all duration-300">
          {currentSimWithProps}
        </div>
      </div>
    );
  };

  // =====================================
  // PHASE 3: SUMMARY SCREEN (REPORT)
  // =====================================
  const renderSummary = () => {
    const meanScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    return (
      <div className={`glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white flex-grow flex flex-col ${!isFullscreen ? 'mt-8' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-3xl font-bold">Course Report</h3>
            <p className="text-slate-300 mt-2">Here is your performance across all simulations in this course.</p>
          </div>
          
          <button 
            onClick={toggleFullscreen} 
            className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg border border-slate-700"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            )}
          </button>
        </div>
        
        <div className="space-y-3 mb-8 flex-grow">
          {simulations.map((sim, i) => {
            const simId = sim.props.simId;
            const simName = simulationNames[simId] || `Interactive Laboratory ${i + 1}`;
            return (
              <div key={i} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700 shadow-sm">
                <span className="font-semibold">{simName}</span>
                <span className="text-emerald-400 font-mono font-bold text-lg">{scores[i]} pts</span>
              </div>
            );
          })}
          
          <div className="flex justify-between items-center bg-slate-700 p-5 rounded-xl border border-slate-500 mt-6 shadow-lg">
            <span className="font-bold text-xl text-white uppercase tracking-wider">Mean Final Score</span>
            <span className="text-white font-mono font-bold text-3xl">{meanScore} pts</span>
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
  };

  // We place the wrapperRef at the very root so that the entire carousel 
  // (Intro -> Sims -> Summary) stays within the fullscreen context.
  return (
    <div ref={wrapperRef} className="sim-fullscreen-wrapper transition-all duration-300 flex flex-col w-full min-h-full">
      {step === 'intro' && renderIntro()}
      {step === 'sims' && renderSims()}
      {step === 'summary' && renderSummary()}
    </div>
  );
}
