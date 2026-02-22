'use client';

import { useTransition } from 'react';
import { incrementLevel } from '../actions';

export default function LevelButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => incrementLevel())}
      disabled={isPending}
      className="submit-btn"
      style={{
        backgroundColor: isPending ? '#9ca3af' : '#10b981', // Gray when loading, green otherwise
        cursor: isPending ? 'not-allowed' : 'pointer',
        marginTop: '1rem'
      }}
    >
      {isPending ? 'Leveling up...' : '+ Level Up'}
    </button>
  );
}
