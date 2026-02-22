'use client';

import { useTransition } from 'react';
import { completeCourse } from '../actions';
import { useRouter } from 'next/navigation';

export default function CompleteCourseButton({ targetLevel, isCompleted }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = () => {
    startTransition(async () => {
      await completeCourse(targetLevel);
      router.push('/');
    });
  };

  if (isCompleted) {
     return (
       <button disabled className="bg-green-100 text-green-700 border border-green-200 px-8 py-3 rounded-xl font-bold cursor-default">
         ✓ Course Completed
       </button>
     );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className={`px-8 py-3 rounded-xl font-bold shadow-sm transition-all w-full md:w-auto ${
        isPending 
          ? 'bg-blue-300 cursor-not-allowed text-white' 
          : 'bg-blue-600 hover:bg-blue-700 hover:shadow text-white active:scale-95'
      }`}
    >
      {isPending ? 'Updating Level...' : 'Complete & Level Up'}
    </button>
  );
}
