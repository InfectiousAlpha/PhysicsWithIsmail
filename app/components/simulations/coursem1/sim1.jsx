'use client';

import { useState } from 'react';

export default function CourseM1Sim1({ simId }) {
  const [leftApples, setLeftApples] = useState(3);
  const [rightApples, setRightApples] = useState(2);
  const [isCombined, setIsCombined] = useState(false);

  const randomize = () => {
    setLeftApples(Math.floor(Math.random() * 4) + 1);
    setRightApples(Math.floor(Math.random() * 4) + 1);
    setIsCombined(false);
  };

  const renderApples = (count) => {
    return Array.from({ length: count }).map((_, i) => (
      <span key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>🍎</span>
    ));
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-sky-500 overflow-hidden text-white mb-8 flex flex-col items-center">
      <div className="w-full mb-6">
        <h3 className="text-2xl font-bold text-white">Concept of Addition</h3>
        <p className="text-sky-400 text-sm font-mono mt-1">Combining quantities together</p>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl flex flex-col items-center">
        
        <p className="text-slate-300 text-center mb-8 text-lg">
          Addition is just putting things together! Let's see what happens when we combine two groups of apples.
        </p>

        {!isCombined ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full mb-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 flex-1 flex flex-col items-center min-h-[120px] justify-center">
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {renderApples(leftApples)}
              </div>
              <span className="text-xl font-bold text-sky-400">{leftApples} Apples</span>
            </div>
            
            <div className="text-4xl font-bold text-slate-500">+</div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 flex-1 flex flex-col items-center min-h-[120px] justify-center">
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {renderApples(rightApples)}
              </div>
              <span className="text-xl font-bold text-sky-400">{rightApples} Apples</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full mb-8 animate-in fade-in zoom-in duration-300">
            <div className="bg-sky-900/40 p-8 rounded-xl border-2 border-sky-500/50 w-full flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {renderApples(leftApples + rightApples)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {leftApples} + {rightApples} = <span className="text-sky-400">{leftApples + rightApples}</span>
              </div>
              <span className="text-sky-300">Total Apples!</span>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {!isCombined ? (
            <button 
              onClick={() => setIsCombined(true)}
              className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-sky-500/30"
            >
              Combine Them!
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
