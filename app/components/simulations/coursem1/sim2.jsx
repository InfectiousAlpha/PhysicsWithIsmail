'use client';

import { useState, useEffect } from 'react';

export default function CourseM1Sim1({ simId, onScoreUpdate, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState([]); // Stores boolean (true for correct)
  const [isFinished, setIsFinished] = useState(false);

  // Track time
  const [startTime, setStartTime] = useState(0);
  const [scoreData, setScoreData] = useState({ finalScore: 0, time: 0, multiplier: 1, baseScore: 0 });

  // Generate 10 random 1-digit addition questions on component mount
  useEffect(() => {
    const generated = [];
    for (let i = 0; i < 10; i++) {
      generated.push({
        a: Math.floor(Math.random() * 9) + 1, // 1 to 9
        b: Math.floor(Math.random() * 9) + 1  // 1 to 9
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
    const isCorrect = parseInt(userAnswer) === (currentQ.a + currentQ.b);
    
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
      
      // Multiplier logic: 1 / (time segment). 0-29.9s = 1, 30-59.9s = 1/2, 60-89.9s = 1/3 etc.
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

  const btnClass = "bg-slate-700 hover:bg-slate-600 text-white font-bold py-6 md:py-10 rounded-2xl text-3xl md:text-5xl transition-colors shadow-sm active:bg-slate-500";

  // Prevent rendering until questions are ready
  if (questions.length === 0) return null;

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden text-white flex-grow flex flex-col h-full w-full">
      <div className="w-full mb-6 shrink-0">
        <h3 className="text-2xl md:text-4xl font-bold text-white">Addition Mastery</h3>
        <p className="text-emerald-400 text-sm md:text-base font-mono mt-1">10 Random 1-Digit Questions</p>
      </div>

      <div className="flex-grow flex items-center justify-center w-full min-h-0 py-4">
        <div className="bg-slate-900 p-8 md:p-12 rounded-3xl w-full max-w-3xl border border-slate-700 shadow-2xl relative">
          
          {isFinished ? (
            <div className="text-center py-6 md:py-10">
              <div className="text-7xl md:text-8xl mb-6">🎉</div>
              <h4 className="text-3xl md:text-5xl font-bold text-white mb-6">Quiz Complete!</h4>
              
              <div className="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-600 mb-6 md:mb-8 inline-block w-full text-left">
                <div className="flex justify-between text-slate-300 text-lg md:text-2xl mb-3">
                  <span>Correct Answers:</span>
                  <span className="text-white font-bold">{results.filter(Boolean).length} / 10</span>
                </div>
                <div className="flex justify-between text-slate-300 text-lg md:text-2xl mb-3">
                  <span>Time Taken:</span>
                  <span className="text-sky-400 font-bold">{scoreData.time.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between text-slate-300 text-lg md:text-2xl">
                  <span>Speed Multiplier:</span>
                  <span className="text-purple-400 font-bold">{scoreData.multiplier.toFixed(2)}x</span>
                </div>
              </div>

              <div className="text-emerald-400 text-6xl md:text-8xl font-mono font-bold my-4">
                {scoreData.finalScore}
              </div>
              <div className="text-emerald-500/80 text-lg md:text-2xl font-bold uppercase tracking-widest mb-6">Final Score</div>

              <p className="text-slate-400 text-base md:text-xl">
                Your score has been recorded. Click "Finish & View Report" to complete the course.
              </p>
            </div>
          ) : (
            <>
              {/* Progress Header */}
              <div className="flex justify-between text-slate-400 text-base md:text-xl font-mono mb-6 md:mb-8 border-b border-slate-700 pb-3 md:pb-4">
                <span>Question {qIndex + 1}/10</span>
                <span className="text-emerald-400">Score: {results.filter(Boolean).length}</span>
              </div>

              {/* Display Screen */}
              <div className="bg-slate-800 p-6 md:p-8 rounded-2xl mb-6 md:mb-10 text-right border border-slate-600 h-32 md:h-48 flex flex-col justify-center items-center">
                <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider flex items-center justify-center w-full">
                  {questions[qIndex].a} + {questions[qIndex].b} = <span className="text-emerald-400 ml-4">{userAnswer || '?'}</span>
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <button onClick={() => handleNum('7')} className={btnClass}>7</button>
                <button onClick={() => handleNum('8')} className={btnClass}>8</button>
                <button onClick={() => handleNum('9')} className={btnClass}>9</button>

                <button onClick={() => handleNum('4')} className={btnClass}>4</button>
                <button onClick={() => handleNum('5')} className={btnClass}>5</button>
                <button onClick={() => handleNum('6')} className={btnClass}>6</button>

                <button onClick={() => handleNum('1')} className={btnClass}>1</button>
                <button onClick={() => handleNum('2')} className={btnClass}>2</button>
                <button onClick={() => handleNum('3')} className={btnClass}>3</button>

                <button onClick={handleClear} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-6 md:py-10 rounded-2xl text-2xl md:text-4xl transition-colors active:bg-rose-400">CLR</button>
                <button onClick={() => handleNum('0')} className={btnClass}>0</button>
                <button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-6 md:py-10 rounded-2xl text-2xl md:text-4xl transition-colors shadow-lg shadow-emerald-500/30 active:bg-emerald-300">OK</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
