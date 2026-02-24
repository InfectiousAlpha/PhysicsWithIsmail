import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { sql } from "@vercel/postgres";
import { courses } from "../../lib/courses";
import Link from "next/link";
import { redirect } from "next/navigation";
import SimulationCarousel from "../../components/SimulationCarousel";
import CompleteCourseButton from "../../components/CompleteCourseButton";

// Import Node native modules for reading the file system
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }) {
  const session = await getServerSession(authOptions);
  const username = session?.user?.name;

  if (!username) {
    redirect('/login');
  }

  const courseId = params.id;
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <div className="content-container">Course not found.</div>;
  }

  // Fetch user level to verify access
  let physicsLevel = 0;
  let mathLevel = 0;
  
  const { rows } = await sql`SELECT physics_level, math_level FROM user_levels WHERE username = ${username}`;
  if (rows.length > 0) {
    physicsLevel = rows[0].physics_level || 0;
    mathLevel = rows[0].math_level || 0;
  }

  // Determine correct level based on course category
  const currentLevel = course.category === 'math' ? mathLevel : physicsLevel;

  // Server-side lock protection
  if (currentLevel < course.requiredLevel) {
    return (
      <div className="content-container" style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '2rem', color: '#ef4444', marginBottom: '1rem'}}>Access Denied 🛑</h1>
        <p>You need to be {course.category === 'math' ? 'Math' : 'Physics'} Level {course.requiredLevel} to access this course.</p>
        <Link href="/" style={{color: 'var(--primary-blue)', marginTop: '2rem', display: 'inline-block'}}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // ==========================================
  // AUTOMATIC DYNAMIC SIMULATION LOADER
  // ==========================================
  let courseSimulationsArray = [];

  try {
    const simDirectory = path.join(process.cwd(), 'app', 'components', 'simulations', `course${courseId}`);

    if (fs.existsSync(simDirectory)) {
      const files = fs.readdirSync(simDirectory);

      const simFiles = files
        .filter(file => file.endsWith('.jsx') || file.endsWith('.js'))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });

      courseSimulationsArray = await Promise.all(
        simFiles.map(async (file) => {
          const compName = file.replace(/\.[^/.]+$/, ""); 
          const mod = await import(`../../components/simulations/course${courseId}/${compName}`);
          const SimComponent = mod.default;

          return (
            <SimComponent 
              key={`c${courseId}-${compName}`} 
              simId={`c${courseId}-${compName}`} 
            />
          );
        })
      );
    }
  } catch (error) {
    console.error(`Error loading simulations for course ${courseId}:`, error);
  }
  // ==========================================

  return (
    <div className="content-container" style={{maxWidth: '1000px'}}>
      <Link href="/" style={{color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500'}}>
        ← Back to Dashboard
      </Link>

      <div style={{marginTop: '2rem', background: 'white', padding: '3rem', borderRadius: '12px', border: '1px solid var(--light-blue)'}}>
        <div className={`badge ${course.category === 'math' ? 'bg-emerald-100 text-emerald-700' : 'badge-blue'}`}>
          {course.category === 'math' ? 'Mathematics Course' : 'Physics Course'}
        </div>
        
        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: 'var(--dark-blue)'}}>
          {course.title}
        </h1>
        <p style={{fontSize: '1.1rem', color: '#475569', lineHeight: '1.6'}}>
          {course.description}
        </p>
        
        <div style={{marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${course.category === 'math' ? '#10b981' : 'var(--primary-blue)'}`}}>
          <h3 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Lesson Material</h3>
          <p>Please complete all the interactive laboratories below to finish this section.</p>
        </div>

        {courseSimulationsArray.length > 0 ? (
          <SimulationCarousel 
            simulations={courseSimulationsArray} 
            unlocksLevel={course.unlocksLevel} 
            currentLevel={currentLevel} 
            courseId={course.id}
            category={course.category}
          />
        ) : (
          <>
            <p style={{marginTop: '2rem', color: '#64748b', textAlign: 'center'}}>No simulations found for this course yet.</p>
            <CompleteCourseButton 
              courseId={course.id} 
              category={course.category} 
              unlocksLevel={course.unlocksLevel} 
              currentLevel={currentLevel} 
              isReady={true} 
            />
          </>
        )}
      </div>
    </div>
  );
}
