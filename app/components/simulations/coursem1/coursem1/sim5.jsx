'use client';

import { useState } from 'react';

export default function CourseM1Sim5({ simId }) {
  const [startNum, setStartNum] = useState(3);
  const [subNum, setSubNum] = useState(5);
  const [currentPos, setCurrentPos] = useState(3);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const randomize = () => {
    const newStart = Math.floor(Math.random() * 5) + 1; // 1 to 5
    const newSub = newStart + Math.floor(Math.random() * 5) + 1; // Guarantee larger than start
    setStartNum(newStart);
    setSubNum(newSub);
    setCurrentPos(newStart);
    setIsCalculated(false);
    setIsAnimating(false);
  };

  const handleCalculate = () => {
    setIsAnimating(true);
    let step = 0;
    
    // Animate jumping backwards one step at a time
    const interval = setInterval(() => {
      step++;
      setCurrentPos(prev => prev - 1);
      
      if (step >= subNum) {
        clearInterval(interval);
        setIsAnimating(false);
        setIsCalculated(true);
      }
    }, 600); // Wait 600ms between each jump
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-rose-500 overflow-hidden text-white flex-grow flex flex-col w-full h-full">
      <div className="w-full mb-6 shrink-0">
        <h3 className="text-2xl font-bold text-white">Below Zero</h3>
        <p className="text-rose-400 text-sm font-mono mt-1">What happens if we subtract a bigger number?</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-grow mx-auto">
        
        <p className="text-slate-300 text-center mb-8 text-lg">
          If you have ${startNum} but you need to pay ${subNum}, you don't just have $0 left... you owe money! We use <strong>Negative Numbers</strong> to show values less than zero.
        </p>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 w-full flex flex-col items-center justify-center mb-8 overflow-x-auto custom-scrollbar">
          
          {/* Number Line Area */}
          <div className="flex items-start justify-center min-w-max relative pt-8 pb-4 px-4 overflow-hidden">
            
            {/* Horizontal Line - Perfectly aligned to start of tick marks */}
            <div className="absolute top-[64px] left-4 right-4 h-[2px] bg-slate-500 z-0"></div>

            {Array.from({ length: 17 }, (_, i) => i - 8).map((num) => (
              <div key={num} className="flex flex-col items-center w-8 sm:w-10 relative">
                
                {/* Ball Area - fixed height to align ball exactly above the tick */}
                <div className="h-8 flex flex-col justify-end w-full items-center">
                  {currentPos === num && (
                    <div className={`w-5 h-5 rounded-full z-10 mb-1 ${
                      isAnimating ? 'bg-sky-400 animate-bounce' : 
                      isCalculated ? 'bg-rose-500 animate-bounce' : 'bg-sky-500'
                    }`}></div>
                  )}
                </div>

                {/* Tick Mark */}
                <div className={`w-[2px] z-0 ${num === 0 ? 'bg-white h-6' : 'bg-slate-500 h-4'}`}></div>
                
                {/* Number Label */}
                <div className={`mt-2 h-6 flex items-center justify-center text-sm font-mono ${num === 0 ? 'text-white font-bold text-lg' : num < 0 ? 'text-rose-400' : 'text-sky-400'}`}>
                  {num}
                </div>
                
              </div>
            ))}
          </div>
          
          {isCalculated && !isAnimating ? (
            <div className="text-3xl font-bold text-white mt-6 animate-in fade-in zoom-in">
              {startNum} - {subNum} = <span className="text-rose-400">{startNum - subNum}</span>
            </div>
          ) : (
            <div className="text-xl font-bold text-slate-300 mt-6 min-h-[40px]">
               {isAnimating 
                  ? `Jumping back... ${startNum - currentPos} / ${subNum} spaces` 
                  : `Start at ${startNum}, jump back ${subNum} spaces...`}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {!isCalculated && !isAnimating && (
            <button 
              onClick={handleCalculate}
              className="bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-rose-500/30"
            >
              See the Result!
            </button>
          )}
          
          {isAnimating && (
            <button 
              disabled
              className="bg-slate-700 text-slate-400 font-bold py-3 px-8 rounded-xl text-lg cursor-not-allowed"
            >
              Jumping...
            </button>
          )}

          {isCalculated && !isAnimating && (
            <button 
              onClick={randomize}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-sky-500/30 animate-in fade-in zoom-in"
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