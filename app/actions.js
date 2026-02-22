'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export async function completeCourse(unlocksLevel) {
  // 1. Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    throw new Error("Unauthorized");
  }

  const username = session.user.name;

  // 2. Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS user_levels (
      username VARCHAR(255) PRIMARY KEY,
      level INT DEFAULT 0
    );
  `;

  // 3. Upsert user level. The GREATEST function ensures we only level UP, never down.
  // It also prevents them from infinitely leveling up by clicking the same button.
  await sql`
    INSERT INTO user_levels (username, level)
    VALUES (${username}, ${unlocksLevel})
    ON CONFLICT (username)
    DO UPDATE SET level = GREATEST(user_levels.level, EXCLUDED.level);
  `;

  // 4. Refresh page data
  revalidatePath('/');
  revalidatePath('/courses/[id]', 'page');
}
