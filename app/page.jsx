import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./components/LogoutButton";
import { sql } from "@vercel/postgres";
import { courses } from "./lib/courses";
import DashboardTabs from "./components/DashboardTabs";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const username = session?.user?.name;

  let levels = { physics: 0, math: 0 };
  let scores = {};

  if (username) {
    // 1. Ensure tables and new columns exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_levels (
        username VARCHAR(255) PRIMARY KEY,
        level INT DEFAULT 0
      );
    `;
    
    // Safely add new columns if they don't exist yet
    try { await sql`ALTER TABLE user_levels ADD COLUMN IF NOT EXISTS physics_level INT DEFAULT 0;`; } catch(e){}
    try { await sql`ALTER TABLE user_levels ADD COLUMN IF NOT EXISTS math_level INT DEFAULT 0;`; } catch(e){}
    
    // Migrate old 'level' to 'physics_level' for existing users
    await sql`UPDATE user_levels SET physics_level = level WHERE physics_level = 0 AND level > 0;`;

    await sql`
      CREATE TABLE IF NOT EXISTS user_course_scores (
        username VARCHAR(255),
        course_id VARCHAR(50),
        score INT DEFAULT 0,
        PRIMARY KEY (username, course_id)
      );
    `;

    // 2. Initialize scores to 0 for ALL existing courses (won't overwrite if score already exists)
    // This adapts dynamically to any new courses you add to courses.js
    for (const course of courses) {
      await sql`
        INSERT INTO user_course_scores (username, course_id, score)
        VALUES (${username}, ${course.id}, 0)
        ON CONFLICT (username, course_id) DO NOTHING;
      `;
    }

    // 3. Fetch Levels
    const { rows: levelRows } = await sql`SELECT physics_level, math_level FROM user_levels WHERE username = ${username}`;
    if (levelRows.length > 0) {
      levels.physics = levelRows[0].physics_level || 0;
      levels.math = levelRows[0].math_level || 0;
    }

    // 4. Fetch Course Scores
    const { rows: scoreRows } = await sql`SELECT course_id, score FROM user_course_scores WHERE username = ${username}`;
    scoreRows.forEach(row => {
      scores[row.course_id] = row.score;
    });
  }

  return (
    <div className="content-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--dark-blue)'}}>Dashboard</h1>
          <p style={{marginTop: '5px', fontSize: '1.1rem', color: '#475569'}}>
            Welcome back, {username} 
            <span style={{marginLeft: '10px', fontSize: '0.9rem'}} className="badge badge-blue">
              Physics Lv.{levels.physics}
            </span>
            <span style={{marginLeft: '5px', fontSize: '0.9rem', background: '#d1fae5', color: '#047857'}} className="badge">
              Math Lv.{levels.math}
            </span>
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Render the client-side seamless tabs component */}
      <DashboardTabs courses={courses} levels={levels} scores={scores} />
    </div>
  );
}
