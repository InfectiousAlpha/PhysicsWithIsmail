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
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-purple-500 overflow-hidden text-white flex-grow flex flex-col w-full h-full">
      <div className="w-full mb-6 shrink-0">
        <h3 className="text-2xl font-bold text-white">Tricky Operations</h3>
        <p className="text-purple-400 text-sm font-mono mt-1">Adding and Subtracting Negative Numbers</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-grow mx-auto">
        
        <p className="text-slate-300 text-center mb-6 text-lg">
          What happens when we add or subtract a <strong>negative</strong> number? Let's translate it to simple rules!
        </p>

        <div className="flex gap-2 mb-6 w-full max-w-sm">
          <button 
            onClick={() => { setOperation('+'); setIsRevealed(false); }}
            className={`flex-1 py-2 rounded font-bold transition-all ${operation === '+' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Add a Negative
          </button>
          <button 
            onClick={() => { setOperation('-'); setIsRevealed(false); }}
            className={`flex-1 py-2 rounded font-bold transition-all ${operation === '-' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Subtract a Negative
          </button>
        </div>

        <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 w-full flex flex-col items-center justify-center mb-8">
          
          <div className="text-4xl font-bold text-white mb-6 tracking-wider">
            {baseNum} {operation} (<span className="text-rose-400">-{actionNum}</span>)
          </div>

          {isRevealed ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
              <div className="text-xl text-slate-300 mb-4 text-center">
                {operation === '+' ? (
                  <span>Adding debt is just like <strong>subtracting</strong>! <br/> <span className="text-rose-400">+ (-) becomes -</span></span>
                ) : (
                  <span>Taking away debt is just like <strong>adding</strong>! <br/> <span className="text-sky-400">- (-) becomes +</span></span>
                )}
              </div>
              
              <div className="text-3xl font-bold text-slate-400 mb-2">
                becomes
              </div>
              
              <div className="text-4xl font-bold text-white bg-slate-900 px-6 py-4 rounded-xl border border-slate-600">
                {baseNum} {operation === '+' ? '-' : '+'} {actionNum} = <span className="text-emerald-400">{operation === '+' ? baseNum - actionNum : baseNum + actionNum}</span>
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold text-slate-500 italic mt-4 h-[120px] flex items-center">
              Can you guess the simplified version?
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!isRevealed ? (
            <button 
              onClick={() => setIsRevealed(true)}
              className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg shadow-purple-500/30"
            >
              Reveal Rule
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