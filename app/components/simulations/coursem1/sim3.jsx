'use client';

import { useState } from 'react';

export default function CourseM1Sim3({ simId }) {
  const [totalApples, setTotalApples] = useState(5);
  const [applesToRemove, setApplesToRemove] = useState(2);
  const [isSubtracted, setIsSubtracted] = useState(false);

  const randomize = () => {
    const newTotal = Math.floor(Math.random() * 5) + 4; // 4 to 8
    const newRemove = Math.floor(Math.random() * (newTotal - 1)) + 1; // 1 to total-1
    setTotalApples(newTotal);
    setApplesToRemove(newRemove);
    setIsSubtracted(false);
  };

  const renderApples = () => {
    return Array.from({ length: totalApples }).map((_, i) => {
      // If subtracted, change the last 'applesToRemove' to cores
      const isEaten = isSubtracted && (i >= totalApples - applesToRemove);
      return (
        <span 
          key={i} 
          className={`text-5xl md:text-7xl lg:text-8xl transition-all duration-500 ${isEaten ? 'opacity-50 scale-90' : 'animate-bounce'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {isEaten ? '🍏' : '🍎'}
        </span>
      );
    });
  };

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl border-l-4 border-l-rose-500 overflow-hidden text-white flex-grow flex flex-col h-full w-full">
      <div className="w-full mb-6 shrink-0">
        <h3 className="text-2xl md:text-4xl font-bold text-white">Concept of Subtraction</h3>
        <p className="text-rose-400 text-sm md:text-base font-mono mt-1">Taking quantities away</p>
      </div>

      <div className="flex-grow flex items-center justify-center w-full min-h-0 py-4">
        <div className="bg-slate-900 p-8 md:p-16 rounded-3xl w-full max-w-5xl border border-slate-700 shadow-2xl flex flex-col items-center">
          
          <p className="text-slate-300 text-center mb-8 md:mb-12 text-lg md:text-2xl max-w-3xl">
            Subtraction is taking things away! We start with a total, and remove some to see what is left over.
          </p>

          <div className="bg-slate-800 p-6 md:p-12 rounded-3xl border border-slate-600 w-full flex flex-col items-center min-h-[200px] md:min-h-[300px] justify-center mb-10">
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-6 md:mb-10">
              {renderApples()}
            </div>
            
            {isSubtracted ? (
              <div className="text-4xl md:text-6xl font-bold text-white mb-2 animate-in fade-in zoom-in">
                {totalApples} - {applesToRemove} = <span className="text-emerald-400">{totalApples - applesToRemove}</span>
              </div>
            ) : (
              <div className="text-2xl md:text-4xl font-bold text-slate-300">
                We have {totalApples} apples...
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!isSubtracted ? (
              <button 
                onClick={() => setIsSubtracted(true)}
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold py-4 px-10 rounded-2xl text-xl md:text-3xl transition-colors shadow-lg shadow-rose-500/30"
              >
                Take Away {applesToRemove}!
              </button>
            ) : (
              <button 
                onClick={randomize}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-10 rounded-2xl text-xl md:text-3xl transition-colors"
              >
                Try Another
              </button>
            )}
          </div>

          <p className="text-slate-500 text-sm md:text-base mt-8 italic text-center">
            (This is a concept module. It is not graded. You can proceed to the test whenever you're ready.)
          </p>

        </div>
      </div>
    </div>
  );
}
