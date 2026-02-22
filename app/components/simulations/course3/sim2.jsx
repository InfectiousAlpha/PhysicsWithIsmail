'use client';

// Repeating the multi particle for Course 3 based on your original page logic mapping
import Course2Sim1 from '../course2/sim1';

export default function Course3Sim2({ simId }) {
  // We can reuse the same component internally or you can modify it as needed later
  return <Course2Sim1 simId={simId} />;
}
