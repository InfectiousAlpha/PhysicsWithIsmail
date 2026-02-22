import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./components/LogoutButton";
import LevelButton from "./components/LevelButton";
import { sql } from "@vercel/postgres";

export default async function Home() {
  // Fetch the session on the server
  const session = await getServerSession(authOptions);
  const username = session?.user?.name;

  let level = 0;

  if (username) {
    // 1. Ensure the table exists before querying
    await sql`
      CREATE TABLE IF NOT EXISTS user_levels (
        username VARCHAR(255) PRIMARY KEY,
        level INT DEFAULT 0
      );
    `;

    // 2. Fetch the current level for this user from Postgres
    const { rows } = await sql`SELECT level FROM user_levels WHERE username = ${username}`;
    if (rows.length > 0) {
      level = rows[0].level;
    }
  }

  return (
    <div className="content-container">
      <h1 style={{fontSize: '4rem', fontWeight: 'bold'}}>you login</h1>
      
      {/* Display the username from the session */}
      <p style={{marginTop: '20px', fontSize: '1.2rem'}}>Welcome back {username}.</p>
      
      {/* Display the persistent level from Neon Postgres */}
      <p style={{marginTop: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: '#0070f3'}}>
        Current Level: {level}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        {/* The new Server Action button */}
        <LevelButton />

        {/* Use the existing client-side logout button component */}
        <LogoutButton />
      </div>
    </div>
  );
}
