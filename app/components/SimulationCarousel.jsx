'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function SimulationCarousel({ 
  simulations, 
  unlocksLevel, 
  currentLevel, 
  courseId, 
  category, 
  coursePassingGrade = 0,
  simulationData = {},
  CompleteCourseBtn = null
}) {
  // Navigation phases: 'intro', 'sims', 'summary'
  const [step, setStep] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track scores for each simulation (defaults to 100)
  const [scores, setScores] = useState(Array(simulations?.length || 0).fill(100));
  
  // Track completion state to unlock the "Next" button. Auto-completes if simulationData says so.
  const [isSimComplete, setIsSimComplete] = useState(() => 
    simulations?.map(sim => simulationData[sim.props.simId]?.autoComplete ?? true) || []
  );
  
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

  // Handler for simulations to signal they are "finished" and the user can proceed
  const handleSimComplete = (index) => {
    setIsSimComplete(prev => {
      const updated = [...prev];
      updated[index] = true;
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
          <p className="text-slate-300 mt-2">This course contains the following interactive modules. Complete all of them to finish the course and record your score.</p>
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

      {/* Course Requirements Block */}
      <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-600 mb-6 shadow-inner">
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Requirements to Pass
        </h4>
        <ul className="text-slate-300 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Achieve a Mean Course Score of at least: <span className="text-emerald-400 font-bold px-2 py-0.5 bg-slate-900 rounded">{coursePassingGrade} pts</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Meet or exceed the minimum passing grade for every individual graded module below.
          </li>
        </ul>
      </div>
      
      <ul className="list-disc list-inside mb-8 space-y-3 text-slate-200 flex-grow">
        {simulations.map((sim, i) => {
          const simId = sim.props.simId;
          const simInfo = simulationData[simId] || { name: `Interactive Laboratory ${i + 1}`, passingGrade: 0 };
          const isScored = simInfo.isScored !== false;

          return (
            <li key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center shadow-sm">
              <span className="font-semibold text-lg">{simInfo.name}</span>
              <div className="flex gap-3 items-center">
                {!isScored ? (
                  <span className="text-xs text-sky-400 border border-sky-400/50 bg-sky-400/10 px-2 py-1 rounded font-bold">Concept / No Score</span>
                ) : simInfo.passingGrade > 0 ? (
                  <span className="text-xs text-amber-400 border border-amber-400/50 bg-amber-400/10 px-2 py-1 rounded font-bold">Passing Grade: {simInfo.passingGrade}</span>
                ) : null}
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">Modul {i + 1}</span>
              </div>
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
      onScoreUpdate: (newScore) => handleScoreUpdate(currentIndex, newScore),
      onComplete: () => handleSimComplete(currentIndex)
    });

    const currentSimId = simulations[currentIndex].props.simId;
    const currentSimInfo = simulationData[currentSimId] || { name: `Interactive Laboratory` };
    const currentSimComplete = isSimComplete[currentIndex];

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
          
          <div className="text-center px-4 flex-grow">
            <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentSimInfo.name}
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
            disabled={!currentSimComplete}
            className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
              !currentSimComplete
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : category === 'math' && isLastSim
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
    // Determine which simulations are actually scored
    const scoredIndices = simulations.map((sim, i) => {
      const simInfo = simulationData[sim.props.simId] || {};
      return simInfo.isScored !== false ? i : -1;
    }).filter(i => i !== -1);

    // If there are scored modules, calculate mean. Otherwise default to 100.
    const meanScore = scoredIndices.length > 0 
      ? Math.round(scoredIndices.reduce((sum, i) => sum + scores[i], 0) / scoredIndices.length)
      : 100;
    
    // Check if the user failed ANY individual SCORED module
    const failedModules = scoredIndices.some((i) => {
      const simInfo = simulationData[simulations[i].props.simId] || { passingGrade: 0 };
      return scores[i] < simInfo.passingGrade;
    });

    // Determine final Pass/Fail state for the entire course
    const isCourseFailed = failedModules || meanScore < coursePassingGrade;
    
    return (
      <div className={`glass-panel p-8 rounded-2xl border-l-4 overflow-hidden text-white flex-grow flex flex-col ${!isFullscreen ? 'mt-8' : ''} ${isCourseFailed ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-3xl font-bold">Course Report</h3>
            <p className="text-slate-300 mt-2">Here is your performance across the graded modules in this course.</p>
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
        
        <div className="space-y-3 mb-6 flex-grow">
          {scoredIndices.map((originalIndex) => {
            const sim = simulations[originalIndex];
            const simId = sim.props.simId;
            const simInfo = simulationData[simId] || { name: `Interactive Laboratory ${originalIndex + 1}`, passingGrade: 0 };
            const didPassSim = scores[originalIndex] >= simInfo.passingGrade;

            return (
              <div key={originalIndex} className={`flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border ${didPassSim ? 'border-slate-700' : 'border-red-500/50'} shadow-sm`}>
                <div>
                  <span className="font-semibold block">{simInfo.name}</span>
                  {simInfo.passingGrade > 0 && <span className="text-xs text-slate-400">Target Grade: {simInfo.passingGrade}</span>}
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-lg ${didPassSim ? 'text-emerald-400' : 'text-red-400'}`}>{scores[originalIndex]} pts</span>
                  {!didPassSim && <span className="block text-xs font-bold text-red-400">Failed</span>}
                </div>
              </div>
            );
          })}
          
          <div className="flex justify-between items-center bg-slate-700 p-5 rounded-xl border border-slate-500 mt-6 shadow-lg">
            <div>
              <span className="font-bold text-xl text-white uppercase tracking-wider block">Mean Final Score</span>
              <span className="text-xs text-slate-300">Course Passing Grade: {coursePassingGrade}</span>
            </div>
            <div className="text-right">
              <span className={`font-mono font-bold text-3xl ${meanScore >= coursePassingGrade ? 'text-white' : 'text-red-400'}`}>{meanScore} pts</span>
            </div>
          </div>
        </div>

        {/* Clear feedback box */}
        {isCourseFailed ? (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center mb-6">
            <p className="text-red-400 font-bold text-lg mb-1">Course Failed</p>
            <p className="text-red-300 text-sm">You did not meet the required passing grades. You can save your score now, but you will <strong className="text-white">not level up</strong> until you pass.</p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center mb-6">
            <p className="text-emerald-400 font-bold text-lg mb-1">Course Passed! 🎉</p>
            <p className="text-emerald-300 text-sm">Great job! You met all the requirements. Saving this score will unlock the next level.</p>
          </div>
        )}

        {CompleteCourseBtn && (
          <CompleteCourseBtn 
            courseId={courseId}
            category={category}
            unlocksLevel={unlocksLevel} 
            currentLevel={currentLevel} 
            isReady={true}
            finalScore={meanScore}
            hasPassed={!isCourseFailed} // Passes this state down to the action!
          />
        )}
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className="sim-fullscreen-wrapper transition-all duration-300 flex flex-col w-full min-h-full">
      {step === 'intro' && renderIntro()}
      {step === 'sims' && renderSims()}
      {step === 'summary' && renderSummary()}
    </div>
  );
}
