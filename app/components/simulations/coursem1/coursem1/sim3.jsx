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
          className={`text-4xl transition-all duration-500 ${isEaten ? 'opacity-50 scale-90' : 'animate-bounce'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {isEaten ? '🍏' : '🍎'}
        </span>
      );
    });
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-rose-500 overflow-hidden text-white flex-grow flex flex-col w-full h-full">
      <div className="w-full mb-6 shrink-0">
        <h3 className="text-2xl font-bold text-white">Concept of Subtraction</h3>
        <p className="text-rose-400 text-sm font-mono mt-1">Taking quantities away</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-grow mx-auto">
        
        <p className="text-slate-300 text-center mb-8 text-lg">
          Subtraction is taking things away! We start with a total, and remove some to see what is left over.
        </p>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 w-full flex flex-col items-center min-h-[160px] justify-center mb-8">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {renderApples()}
          </div>
          
          {isSubtracted ? (
            <div className="text-3xl font-bold text-white mb-2 animate-in fade-in zoom-in">
              {totalApples} - {applesToRemove} = <span className="text-emerald-400">{totalApples - applesToRemove}</span>
            </div>
          ) : (
            <div className="text-xl font-bold text-slate-300">
              We have {totalApples} apples...
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!isSubtracted ? (
            <button 
              onClick={() => setIsSubtracted(true)}
              className="bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-rose-500/30"
            >
              Take Away {applesToRemove}!
            </button>
          ) : (
            <button 
              onClick={randomize}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors"
            >
              Try Another
            </button>
          )}
        </div>

        <p className="text-slate-500 text-sm mt-8 italic">
          (This is a concept module. It is not graded. You can proceed to the test whenever you're ready.)
        </p>

      </div>
    </div>
  );
}