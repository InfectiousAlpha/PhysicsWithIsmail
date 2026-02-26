'use client';

import { useTransition } from 'react';
import { completeCourse } from '../actions';
import { useRouter } from 'next/navigation';

export default function CompleteCourseButton({ courseId, category, unlocksLevel, currentLevel, isReady = true, finalScore = 100, hasPassed = true }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Check if the user has already finished this course previously
  const isCompleted = currentLevel >= unlocksLevel;
  
  // Base theme colors depending on the category and pass status
  let themeClass = 'bg-slate-500 hover:bg-slate-600'; // Default
  if (hasPassed) {
    themeClass = category === 'math' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-500 hover:bg-sky-600';
  } else {
    themeClass = 'bg-red-500 hover:bg-red-600'; // Red button if saving a failed score
  }

  const handleComplete = () => {
    startTransition(async () => {
      // Pass the hasPassed boolean to the backend
      await completeCourse(courseId, unlocksLevel, category, finalScore, hasPassed);
      
      // Redirect to the dashboard and ensure the correct tab is active
      router.push(`/?tab=${category}`); 
    });
  };

  // Determine button text
  let btnText = 'Complete Course & Save Score!';
  if (isPending) {
    btnText = 'Processing & Saving Score...';
  } else if (!isReady) {
    btnText = 'Finish all simulations to unlock!';
  } else if (!hasPassed) {
    btnText = 'Save Score (Failed) ❌';
  } else if (isCompleted) {
    btnText = 'Submit New Score ✅';
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending || !isReady}
      className={`text-white font-bold py-3 px-6 rounded-lg transition-colors w-full mt-2 shadow-lg ${
        isPending 
          ? 'bg-slate-400 cursor-not-allowed' 
          : !isReady 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : themeClass
      }`}
    >
      {btnText}
    </button>
  );
}
