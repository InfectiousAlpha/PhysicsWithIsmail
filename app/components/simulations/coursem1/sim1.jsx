'use client';

import { useState, useEffect } from 'react';

export default function CourseM1Sim2({ simId, onScoreUpdate, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState([]); // Stores boolean (true for correct)
  const [isFinished, setIsFinished] = useState(false);
  
  // Track time
  const [startTime, setStartTime] = useState(0);
  const [scoreData, setScoreData] = useState({ finalScore: 0, time: 0, multiplier: 1, baseScore: 0 });

  // Generate 10 random 1-digit subtraction questions on component mount
  useEffect(() => {
    const generated = [];
    for (let i = 0; i < 10; i++) {
      let num1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      let num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      
      // Ensure the result is always positive or zero since our keypad has no minus sign
      if (num1 < num2) {
        let temp = num1;
        num1 = num2;
        num2 = temp;
      }

      generated.push({
        a: num1,
        b: num2
      });
    }
    setQuestions(generated);
    setStartTime(Date.now()); // Record the time when questions load
  }, []);

  const handleNum = (num) => {
    setUserAnswer(prev => prev + num);
  };

  const handleClear = () => {
    setUserAnswer('');
  };

  const handleSubmit = () => {
    if (userAnswer === '') return; // Prevent empty submission

    const currentQ = questions[qIndex];
    const isCorrect = parseInt(userAnswer) === (currentQ.a - currentQ.b);
    
    const updatedResults = [...results, isCorrect];
    setResults(updatedResults);

    if (qIndex < 9) {
      setQIndex(q => q + 1);
      setUserAnswer('');
    } else {
      setIsFinished(true);
      
      // Calculate elapsed time in seconds
      const endTime = Date.now();
      const elapsedSeconds = (endTime - startTime) / 1000;
      
      // Multiplier logic: 1 / (time segment). 0-29.9s = 1, 30-59.9s = 1/2, etc.
      const timeSegment = Math.floor(elapsedSeconds / 30) + 1;
      const multiplier = 1 / timeSegment;
      
      // Calculate base and final scores
      const baseScore = Math.round((updatedResults.filter(Boolean).length / 10) * 100);
      const finalScore = Math.round(baseScore * multiplier);
      
      setScoreData({
        finalScore,
        time: elapsedSeconds,
        multiplier,
        baseScore
      });

      if (onScoreUpdate) {
        onScoreUpdate(finalScore);
      }
      
      // Tell the Carousel that this simulation is finished so it unlocks the Next button
      if (onComplete) {
        onComplete();
      }
    }
  };

  const btnClass = "bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl text-xl transition-colors shadow-sm active:bg-slate-500";

  // Prevent rendering until questions are ready
  if (questions.length === 0) return null;

  return (
    <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden text-white mb-8 flex flex-col items-center">
      <div className="w-full mb-6">
        <h3 className="text-2xl font-bold text-white">Subtraction Mastery</h3>
        <p className="text-emerald-400 text-sm font-mono mt-1">10 Random 1-Digit Questions</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl relative">
        
        {isFinished ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h4>
            
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 mb-4 inline-block w-full text-left">
              <div className="flex justify-between text-slate-300 text-sm mb-1">
                <span>Correct Answers:</span>
                <span className="text-white font-bold">{results.filter(Boolean).length} / 10</span>
              </div>
              <div className="flex justify-between text-slate-300 text-sm mb-1">
                <span>Time Taken:</span>
                <span className="text-sky-400 font-bold">{scoreData.time.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Speed Multiplier:</span>
                <span className="text-purple-400 font-bold">{scoreData.multiplier.toFixed(2)}x</span>
              </div>
            </div>

            <div className="text-emerald-400 text-5xl font-mono font-bold my-2">
              {scoreData.finalScore}
            </div>
            <div className="text-emerald-500/80 text-sm font-bold uppercase tracking-widest mb-4">Final Score</div>

            <p className="text-slate-400 text-sm">
              Your score has been recorded. Click "Finish & View Report" to complete the course.
            </p>
          </div>
        ) : (
          <>
            {/* Progress Header */}
            <div className="flex justify-between text-slate-400 text-sm font-mono mb-4 border-b border-slate-700 pb-2">
              <span>Question {qIndex + 1}/10</span>
              <span className="text-emerald-400">Score: {results.filter(Boolean).length}</span>
            </div>

            {/* Display Screen */}
            <div className="bg-slate-800 p-4 rounded-xl mb-6 text-right border border-slate-600 h-24 flex flex-col justify-between items-center flex-row">
              <div className="text-4xl font-bold text-white tracking-wider flex items-center justify-center w-full">
                {questions[qIndex].a} - {questions[qIndex].b} = <span className="text-emerald-400 ml-2">{userAnswer || '?'}</span>
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleNum('7')} className={btnClass}>7</button>
              <button onClick={() => handleNum('8')} className={btnClass}>8</button>
              <button onClick={() => handleNum('9')} className={btnClass}>9</button>

              <button onClick={() => handleNum('4')} className={btnClass}>4</button>
              <button onClick={() => handleNum('5')} className={btnClass}>5</button>
              <button onClick={() => handleNum('6')} className={btnClass}>6</button>

              <button onClick={() => handleNum('1')} className={btnClass}>1</button>
              <button onClick={() => handleNum('2')} className={btnClass}>2</button>
              <button onClick={() => handleNum('3')} className={btnClass}>3</button>

              <button onClick={handleClear} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl text-xl transition-colors active:bg-rose-400">CLR</button>
              <button onClick={() => handleNum('0')} className={btnClass}>0</button>
              <button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl text-xl transition-colors shadow-lg shadow-emerald-500/30 active:bg-emerald-300">OK</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
