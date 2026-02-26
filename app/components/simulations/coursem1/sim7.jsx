'use client';

import { useState } from 'react';

export default function CourseM1Sim7({ simId }) {
  const [baseNum, setBaseNum] = useState(4);
  const [actionNum, setActionNum] = useState(2);
  const [operation, setOperation] = useState('+'); // '+' or '-'
  const [isRevealed, setIsRevealed] = useState(false);

  const randomize = () => {
    setBaseNum(Math.floor(Math.random() * 5) + 1);
    setActionNum(Math.floor(Math.random() * 5) + 1);
    setOperation(Math.random() > 0.5 ? '+' : '-');
    setIsRevealed(false);
  };

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white flex-grow flex flex-col h-full w-full">
      <div className="w-full mb-6 shrink-0">
        <h3 className="text-2xl md:text-4xl font-bold text-white">Tricky Operations</h3>
        <p className="text-purple-400 text-sm md:text-base font-mono mt-1">Adding and Subtracting Negative Numbers</p>
      </div>

      <div className="flex-grow flex items-center justify-center w-full min-h-0 py-4">
        <div className="bg-slate-900 p-8 md:p-16 rounded-3xl w-full max-w-5xl border border-slate-700 shadow-2xl flex flex-col items-center">
          
          <p className="text-slate-300 text-center mb-8 md:mb-12 text-lg md:text-2xl max-w-4xl">
            What happens when we add or subtract a <strong>negative</strong> number? Let's translate it to simple rules!
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-12 w-full max-w-2xl">
            <button 
              onClick={() => { setOperation('+'); setIsRevealed(false); }}
              className={`flex-1 py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl transition-all ${operation === '+' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
            >
              Add a Negative
            </button>
            <button 
              onClick={() => { setOperation('-'); setIsRevealed(false); }}
              className={`flex-1 py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl transition-all ${operation === '-' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
            >
              Subtract a Negative
            </button>
          </div>

          <div className="bg-slate-800 p-8 md:p-12 rounded-3xl border border-slate-600 w-full flex flex-col items-center justify-center mb-10 min-h-[300px]">
            
            <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 md:mb-12 tracking-wider">
              {baseNum} {operation} (<span className="text-rose-400">-{actionNum}</span>)
            </div>

            {isRevealed ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
                <div className="text-2xl md:text-4xl text-slate-300 mb-6 md:mb-8 text-center leading-relaxed">
                  {operation === '+' ? (
                    <span>Adding debt is just like <strong>subtracting</strong>! <br/> <span className="text-rose-400 font-bold mt-2 block">+ (-) becomes -</span></span>
                  ) : (
                    <span>Taking away debt is just like <strong>adding</strong>! <br/> <span className="text-sky-400 font-bold mt-2 block">- (-) becomes +</span></span>
                  )}
                </div>
                
                <div className="text-3xl md:text-5xl font-bold text-slate-400 mb-4 md:mb-6">
                  becomes
                </div>
                
                <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-white bg-slate-900 px-8 py-6 md:px-12 md:py-8 rounded-3xl border border-slate-600 shadow-inner">
                  {baseNum} {operation === '+' ? '-' : '+'} {actionNum} = <span className="text-emerald-400">{operation === '+' ? baseNum - actionNum : baseNum + actionNum}</span>
                </div>
              </div>
            ) : (
              <div className="text-2xl md:text-4xl font-bold text-slate-500 italic mt-6 h-[160px] md:h-[220px] flex items-center text-center px-4">
                Can you guess the simplified version?
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!isRevealed ? (
              <button 
                onClick={() => setIsRevealed(true)}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-4 px-10 rounded-2xl text-xl md:text-3xl transition-colors shadow-lg shadow-purple-500/30"
              >
                Reveal Rule
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
            (This is a concept module. It is not graded. You can proceed when you're ready.)
          </p>
        </div>
      </div>
    </div>
  );
}
