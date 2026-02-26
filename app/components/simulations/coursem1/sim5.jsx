'use client';

import { useState } from 'react';

export default function CourseM1Sim5({ simId }) {
  const [startNum, setStartNum] = useState(3);
  const [subNum, setSubNum] = useState(5);
  const [isCalculated, setIsCalculated] = useState(false);

  const randomize = () => {
    const newStart = Math.floor(Math.random() * 5) + 1; // 1 to 5
    const newSub = newStart + Math.floor(Math.random() * 5) + 1; // Guarantee larger than start
    setStartNum(newStart);
    setSubNum(newSub);
    setIsCalculated(false);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-rose-500 overflow-hidden text-white mb-8 flex flex-col items-center">
      <div className="w-full mb-6">
        <h3 className="text-2xl font-bold text-white">Below Zero</h3>
        <p className="text-rose-400 text-sm font-mono mt-1">What happens if we subtract a bigger number?</p>
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl flex flex-col items-center">
        
        <p className="text-slate-300 text-center mb-8 text-lg">
          If you have ${startNum} but you need to pay ${subNum}, you don't just have $0 left... you owe money! We use <strong>Negative Numbers</strong> to show values less than zero.
        </p>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 w-full flex flex-col items-center justify-center mb-8 overflow-x-auto">
          {/* Number Line */}
          <div className="flex items-center justify-center min-w-max relative py-8 px-4">
            {Array.from({ length: 15 }, (_, i) => i - 7).map((num) => (
              <div key={num} className="flex flex-col items-center mx-1 sm:mx-2 relative">
                <div className={`h-4 w-0.5 mb-1 ${num === 0 ? 'bg-white h-6' : 'bg-slate-500'}`}></div>
                <span className={`text-sm font-mono ${num === 0 ? 'text-white font-bold text-lg' : num < 0 ? 'text-rose-400' : 'text-sky-400'}`}>
                  {num}
                </span>
                
                {/* Visualizing the jump */}
                {isCalculated && num === startNum && (
                  <div className="absolute top-[-20px] left-1/2 w-4 h-4 bg-sky-500 rounded-full transform -translate-x-1/2 animate-ping"></div>
                )}
                {isCalculated && num === startNum - subNum && (
                  <div className="absolute top-[-20px] left-1/2 w-4 h-4 bg-rose-500 rounded-full transform -translate-x-1/2 animate-bounce"></div>
                )}
              </div>
            ))}
            
            {/* The line itself */}
            <div className="absolute top-[32px] left-0 right-0 h-0.5 bg-slate-500 z-0"></div>
          </div>
          
          {isCalculated ? (
            <div className="text-3xl font-bold text-white mt-6 animate-in fade-in zoom-in">
              {startNum} - {subNum} = <span className="text-rose-400">{startNum - subNum}</span>
            </div>
          ) : (
            <div className="text-xl font-bold text-slate-300 mt-6">
              Start at {startNum}, jump back {subNum} spaces...
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!isCalculated ? (
            <button 
              onClick={() => setIsCalculated(true)}
              className="bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-rose-500/30"
            >
              See the Result!
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
          (This is a concept module. It is not graded. You can proceed when you're ready.)
        </p>

      </div>
    </div>
  );
}
