'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export async function incrementLevel() {
  // 1. Verify the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    throw new Error("Unauthorized");
  }

  const username = session.user.name;

  // 2. Ensure table exists (safe to run multiple times)
  await sql`
    CREATE TABLE IF NOT EXISTS user_levels (
      username VARCHAR(255) PRIMARY KEY,
      level INT DEFAULT 0
    );
  `;

  // 3. Upsert the user's level
  // If user doesn't exist, insert with level 1. If they do, add 1.
  await sql`
    INSERT INTO user_levels (username, level)
    VALUES (${username}, 1)
    ON CONFLICT (username)
    DO UPDATE SET level = user_levels.level + 1;
  `;

  // 4. Tell Next.js to refresh the home page data to show the new level immediately
  revalidatePath('/');
}
