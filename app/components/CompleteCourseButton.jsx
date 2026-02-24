'use client';

import { useTransition } from 'react';
import { completeCourse } from '../actions';
import { useRouter } from 'next/navigation';

export default function CompleteCourseButton({ courseId, category, unlocksLevel, currentLevel, isReady = true, finalScore = 100 }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // If the user's level is already equal or higher than what this course unlocks, disable it
  const isCompleted = currentLevel >= unlocksLevel;
  const themeClass = category === 'math' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-500 hover:bg-sky-600';

  const handleComplete = () => {
    startTransition(async () => {
      // Save the exact final score passed from the simulations
      await completeCourse(courseId, unlocksLevel, category, finalScore);
      
      // Redirect to the dashboard and ensure the correct tab is active
      router.push(`/?tab=${category}`); 
    });
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isPending || isCompleted || !isReady}
      className={`text-white font-bold py-3 px-6 rounded-lg transition-colors w-full mt-8 ${
        isPending 
          ? 'bg-slate-400 cursor-not-allowed' 
          : isCompleted 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : !isReady 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : themeClass
      }`}
    >
      {isPending 
        ? 'Processing & Saving Score...' 
        : isCompleted 
          ? 'Course Completed ✅' 
          : !isReady 
            ? 'Finish all simulations to unlock!'
            : 'Complete Course & Save Score!'}
    </button>
  );
}
