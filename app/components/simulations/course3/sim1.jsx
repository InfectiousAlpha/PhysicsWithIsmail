'use client';

// Repeating the single particle for Course 3 based on your original page logic mapping
import Course1Sim1 from '../course1/sim1';

export default function Course3Sim1({ simId }) {
  // We can reuse the same component internally or you can modify it as needed later
  return <Course1Sim1 simId={simId} />;
}
