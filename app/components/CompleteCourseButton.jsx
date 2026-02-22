'use client';

import { useTransition } from 'react';
import { completeCourse } from '../actions';
import { useRouter } from 'next/navigation';

export default function CompleteCourseButton({ unlocksLevel, currentLevel }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // If the user's level is already equal or higher than what this course unlocks, disable it
  const isCompleted = currentLevel >= unlocksLevel;

  return (
    <button
      onClick={() => startTransition(async () => {
         await completeCourse(unlocksLevel);
         router.push('/'); // Send back to dashboard upon completing
      })}
      disabled={isPending || isCompleted}
      className="submit-btn"
      style={{ width: '100%', marginTop: '2rem' }}
    >
      {isPending 
        ? 'Processing...' 
        : isCompleted 
          ? 'Course Completed ✅' 
          : 'Complete Course & Level Up!'}
    </button>
  );
}
