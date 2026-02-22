import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./components/LogoutButton";
import { sql } from "@vercel/postgres";
import { courses } from "./lib/courses";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const username = session?.user?.name;

  let level = 0;

  if (username) {
    await sql`
      CREATE TABLE IF NOT EXISTS user_levels (
        username VARCHAR(255) PRIMARY KEY,
        level INT DEFAULT 0
      );
    `;

    const { rows } = await sql`SELECT level FROM user_levels WHERE username = ${username}`;
    if (rows.length > 0) {
      level = rows[0].level;
    }
  }

  return (
    <div className="content-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--dark-blue)'}}>Dashboard</h1>
          <p style={{marginTop: '5px', fontSize: '1.1rem', color: '#475569'}}>
            Welcomee back, {username} | <span style={{fontWeight: 'bold', color: 'var(--primary-blue)'}}>Level {level}</span>
          </p>
        </div>
        <LogoutButton />
      </div>

      <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>Your Courses</h2>
      
      <div className="course-grid">
        {courses.map((course) => {
          const isLocked = level < course.requiredLevel;
          const isCompleted = level >= course.unlocksLevel;

          const CardContent = (
            <div className={`course-card ${isLocked ? 'locked' : ''}`}>
              <div className={`badge ${isLocked ? 'badge-gray' : 'badge-blue'}`}>
                {isLocked ? `Requires Level ${course.requiredLevel}` : isCompleted ? 'Completed' : 'Unlocked'}
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: isLocked ? '#64748b' : 'var(--text-main)'}}>
                {course.title}
              </h3>
              <p style={{color: '#64748b', lineHeight: '1.5', flexGrow: 1}}>
                {course.description}
              </p>
              
              <div style={{marginTop: '1.5rem'}}>
                {isLocked ? (
                  <div style={{color: '#94a3b8', fontWeight: '500', textAlign: 'center'}}>Locked 🔒</div>
                ) : (
                  <div style={{color: 'var(--primary-blue)', fontWeight: 'bold', textAlign: 'center'}}>
                    {isCompleted ? 'Review Course →' : 'Start Course →'}
                  </div>
                )}
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={course.id}>{CardContent}</div>; // Non-clickable if locked
          }

          return (
            <Link key={course.id} href={`/courses/${course.id}`} style={{textDecoration: 'none'}}>
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
