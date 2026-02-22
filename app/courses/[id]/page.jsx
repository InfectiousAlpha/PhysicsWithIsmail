import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { sql } from "@vercel/postgres";
import { courses } from "../../lib/courses";
import Link from "next/link";
import { redirect } from "next/navigation";
import CompleteCourseButton from "../../components/CompleteCourseButton";

// Import Carousel
import SimulationCarousel from "../../components/SimulationCarousel";

// Import refactored simulation directory structure
import Course1Sim1 from "../../components/simulations/course1/sim1";
import Course1Sim2 from "../../components/simulations/course1/sim2";
import Course2Sim1 from "../../components/simulations/course2/sim1";
import Course2Sim2 from "../../components/simulations/course2/sim2";
import Course3Sim1 from "../../components/simulations/course3/sim1";
import Course3Sim2 from "../../components/simulations/course3/sim2";

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
  let currentLevel = 0;
  const { rows } = await sql`SELECT level FROM user_levels WHERE username = ${username}`;
  if (rows.length > 0) {
    currentLevel = rows[0].level;
  }

  // Server-side lock protection
  if (currentLevel < course.requiredLevel) {
    return (
      <div className="content-container" style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '2rem', color: '#ef4444', marginBottom: '1rem'}}>Access Denied 🛑</h1>
        <p>You need to be Level {course.requiredLevel} to access this course.</p>
        <Link href="/" style={{color: 'var(--primary-blue)', marginTop: '2rem', display: 'inline-block'}}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // Assign multiple simulations depending on the course ID
  // Pack them in an array so the SimulationCarousel can cycle through them
  let courseSimulationsArray = [];

  if (courseId === '1') {
    courseSimulationsArray = [
      <Course1Sim1 key="c1-s1" simId="c1-sim1" />,
      <Course1Sim2 key="c1-s2" simId="c1-sim2" />
    ];
  } else if (courseId === '2') {
    courseSimulationsArray = [
      <Course2Sim1 key="c2-s1" simId="c2-sim1" />,
      <Course2Sim2 key="c2-s2" simId="c2-sim2" />
    ];
  } else if (courseId === '3') {
    courseSimulationsArray = [
      <Course3Sim1 key="c3-s1" simId="c3-sim1" />,
      <Course3Sim2 key="c3-s2" simId="c3-sim2" />
    ];
  }

  return (
    <div className="content-container" style={{maxWidth: '1000px'}}>
      <Link href="/" style={{color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500'}}>
        ← Back to Dashboard
      </Link>

      <div style={{marginTop: '2rem', background: 'white', padding: '3rem', borderRadius: '12px', border: '1px solid var(--light-blue)'}}>
        <div className="badge badge-blue">Course Content</div>
        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: 'var(--dark-blue)'}}>
          {course.title}
        </h1>
        <p style={{fontSize: '1.1rem', color: '#475569', lineHeight: '1.6'}}>
          {course.description}
        </p>
        
        <div style={{marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary-blue)'}}>
          <h3 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Lesson Material</h3>
          <p>Please complete all the interactive physics laboratories below to finish this section.</p>
        </div>

        {/* Load the new Simulation Carousel Component */}
        {courseSimulationsArray.length > 0 && (
          <SimulationCarousel simulations={courseSimulationsArray} />
        )}

        <CompleteCourseButton unlocksLevel={course.unlocksLevel} currentLevel={currentLevel} />
      </div>
    </div>
  );
}
