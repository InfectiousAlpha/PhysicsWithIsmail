'use client';

import { useState } from 'react';

export default function Calculator({ simId }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNum = (num) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // Evaluate string mathematically (safe here since input is restricted to buttons)
      const fullEq = equation + display;
      // Replace symbols for eval
      const sanitized = fullEq.replace('×', '*').replace('÷', '/');
      const result = eval(sanitized); 
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const btnClass = "bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl text-xl transition-colors shadow-sm active:bg-slate-500";
  const opClass = "bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-xl transition-colors shadow-sm active:bg-emerald-400";

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden text-white mb-8 flex flex-col items-center">
      <div className="w-full mb-6">
        <h3 className="text-2xl font-bold text-white">Interactive Calculator</h3>
        <p className="text-emerald-400 text-sm font-mono mt-1">Mathematics Laboratory</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl">
        {/* Display Screen */}
        <div className="bg-slate-800 p-4 rounded-xl mb-6 text-right border border-slate-600 h-24 flex flex-col justify-between">
          <div className="text-slate-400 h-6 text-sm font-mono tracking-widest">{equation}</div>
          <div className="text-4xl font-bold text-emerald-400 truncate tracking-wider">{display}</div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          <button onClick={clear} className="col-span-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl text-xl transition-colors active:bg-rose-400">CLEAR</button>
          <button onClick={() => setDisplay(prev => prev.includes('.') ? prev : prev + '.')} className={btnClass}>.</button>
          <button onClick={() => handleOp('÷')} className={opClass}>÷</button>

          <button onClick={() => handleNum('7')} className={btnClass}>7</button>
          <button onClick={() => handleNum('8')} className={btnClass}>8</button>
          <button onClick={() => handleNum('9')} className={btnClass}>9</button>
          <button onClick={() => handleOp('×')} className={opClass}>×</button>

          <button onClick={() => handleNum('4')} className={btnClass}>4</button>
          <button onClick={() => handleNum('5')} className={btnClass}>5</button>
          <button onClick={() => handleNum('6')} className={btnClass}>6</button>
          <button onClick={() => handleOp('-')} className={opClass}>-</button>

          <button onClick={() => handleNum('1')} className={btnClass}>1</button>
          <button onClick={() => handleNum('2')} className={btnClass}>2</button>
          <button onClick={() => handleNum('3')} className={btnClass}>3</button>
          <button onClick={() => handleOp('+')} className={opClass}>+</button>

          <button onClick={() => handleNum('0')} className="col-span-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl text-xl transition-colors active:bg-slate-500">0</button>
          <button onClick={calculate} className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl text-xl transition-colors shadow-lg shadow-emerald-500/30 active:bg-emerald-300">=</button>
        </div>
      </div>
    </div>
  );
}
