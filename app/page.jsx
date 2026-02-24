import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./components/LogoutButton";
import { sql } from "@vercel/postgres";
import { courses } from "./lib/courses";
import DashboardTabs from "./components/DashboardTabs";

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
            Welcome back, {username} | <span style={{fontWeight: 'bold', color: 'var(--primary-blue)'}}>Level {level}</span>
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Render the client-side seamless tabs component */}
      <DashboardTabs courses={courses} level={level} />
    </div>
  );
}
