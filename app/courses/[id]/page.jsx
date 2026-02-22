import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { sql } from "@vercel/postgres";
import { courses } from "../../lib/courses";
import Link from "next/link";
import { redirect } from "next/navigation";
import CompleteCourseButton from "../../components/CompleteCourseButton";

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

  // Server-side lock protection (if they try to guess the URL)
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

  return (
    <div className="content-container" style={{maxWidth: '800px'}}>
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
          <p>Mock content for this course... Imagine a really great video and reading materials here!</p>
        </div>

        <CompleteCourseButton unlocksLevel={course.unlocksLevel} currentLevel={currentLevel} />
      </div>
    </div>
  );
}
