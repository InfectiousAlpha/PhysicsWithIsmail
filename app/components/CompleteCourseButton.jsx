'use client';

import { useTransition } from 'react';
import { completeCourse } from '../actions';
import { useRouter } from 'next/navigation';

export default function CompleteCourseButton({ courseId, category, unlocksLevel, currentLevel, isReady = true, finalScore = 100 }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Check if the user has already finished this course previously
  const isCompleted = currentLevel >= unlocksLevel;
  
  // Base theme colors depending on the category
  const themeClass = category === 'math' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-500 hover:bg-sky-600';

  const handleComplete = () => {
    startTransition(async () => {
      // Save the exact final score passed from the simulations. 
      // The backend uses GREATEST() so it will never lower a past high score!
      await completeCourse(courseId, unlocksLevel, category, finalScore);
      
      // Redirect to the dashboard and ensure the correct tab is active
      router.push(`/?tab=${category}`); 
    });
  };

  return (
    <button
      onClick={handleComplete}
      // We removed "isCompleted" from the disabled check so they can resubmit!
      disabled={isPending || !isReady}
      className={`text-white font-bold py-3 px-6 rounded-lg transition-colors w-full mt-8 ${
        isPending 
          ? 'bg-slate-400 cursor-not-allowed' 
          : !isReady 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : themeClass
      }`}
    >
      {isPending 
        ? 'Processing & Saving Score...' 
        : !isReady 
          ? 'Finish all simulations to unlock!'
          : isCompleted 
            ? 'Submit New Score ✅' // Change text if they are replaying
            : 'Complete Course & Save Score!'}
    </button>
  );
}
