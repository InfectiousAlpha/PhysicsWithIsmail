'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export async function completeCourse(courseId, unlocksLevel, category, score = 100, hasPassed = true) {
  // 1. Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    throw new Error("Unauthorized");
  }

  const username = session.user.name;

  // 2. Ensure tables exist and alter old schema if needed
  await sql`
    CREATE TABLE IF NOT EXISTS user_levels (
      username VARCHAR(255) PRIMARY KEY,
      level INT DEFAULT 0,
      physics_level INT DEFAULT 0,
      math_level INT DEFAULT 0
    );
  `;
  
  // Create the dynamic score table
  await sql`
    CREATE TABLE IF NOT EXISTS user_course_scores (
      username VARCHAR(255),
      course_id VARCHAR(50),
      score INT DEFAULT 0,
      PRIMARY KEY (username, course_id)
    );
  `;

  // 3. Update Category Level (Math or Physics) ONLY if the user passed
  if (hasPassed) {
    if (category === 'math') {
      await sql`
        INSERT INTO user_levels (username, math_level)
        VALUES (${username}, ${unlocksLevel})
        ON CONFLICT (username)
        DO UPDATE SET math_level = GREATEST(user_levels.math_level, EXCLUDED.math_level);
      `;
    } else {
      // Default to physics
      await sql`
        INSERT INTO user_levels (username, physics_level)
        VALUES (${username}, ${unlocksLevel})
        ON CONFLICT (username)
        DO UPDATE SET physics_level = GREATEST(user_levels.physics_level, EXCLUDED.physics_level);
      `;
    }
  }

  // 4. Upsert Course Score (Keeps highest score achieved, even if they failed this attempt but had a higher one previously)
  await sql`
    INSERT INTO user_course_scores (username, course_id, score)
    VALUES (${username}, ${courseId}, ${score})
    ON CONFLICT (username, course_id)
    DO UPDATE SET score = GREATEST(user_course_scores.score, EXCLUDED.score);
  `;

  // 5. Refresh page data
  revalidatePath('/');
  revalidatePath('/courses/[id]', 'page');
}
