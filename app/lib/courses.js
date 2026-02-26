export const courses = [
  // --- PHYSICS COURSES ---
  {
    id: '1',
    title: 'Course 1: Introduction to Physics',
    description: 'Learn the fundamentals of motion, speed, and classical mechanics.',
    requiredLevel: 0,
    unlocksLevel: 1,
    category: 'physics',
    passingGrade: 0 // Physics sandboxes auto-pass for now
  },
  {
    id: '2',
    title: 'Course 2: Thermodynamics & Waves',
    description: 'Understand heat transfer, energy systems, and basic wave properties.',
    requiredLevel: 1,
    unlocksLevel: 2,
    category: 'physics',
    passingGrade: 0
  },
  {
    id: '3',
    title: 'Course 3: Quantum Physics Basics',
    description: 'Dive into the fascinating and weird world of subatomic particles.',
    requiredLevel: 2,
    unlocksLevel: 3,
    category: 'physics',
    passingGrade: 0
  },
  
  // --- MATHEMATICS COURSES ---
  {
    id: 'm1',
    title: 'Math 1: Basic Arithmetic',
    description: 'Master addition and subtraction with our interactive calculator.',
    requiredLevel: 0, 
    unlocksLevel: 1,
    category: 'math',
    passingGrade: 50 // Requires a mean score of at least 50 to pass
  },
  {
    id: 'm2',
    title: 'Math 2: Multiplication & Division',
    description: 'Learn how to multiply and divide numbers efficiently.',
    requiredLevel: 1,
    unlocksLevel: 2,
    category: 'math',
    passingGrade: 50
  },
  {
    id: 'm3',
    title: 'Math 3: Fractions & Decimals',
    description: 'Understanding parts of a whole and decimal placements.',
    requiredLevel: 2,
    unlocksLevel: 3,
    category: 'math',
    passingGrade: 50
  },
  {
    id: 'm4',
    title: 'Math 4: Pre-Algebra',
    description: 'Introduction to order of operations and simple calculations.',
    requiredLevel: 3,
    unlocksLevel: 4,
    category: 'math',
    passingGrade: 50
  }
];
