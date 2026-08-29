import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" || String(process.env.DATABASE_URL || "").includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Updating course_assignments table schema for start/end times and MST controls...");

    await client.query(`
      ALTER TABLE course_assignments
      ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 90,
      ADD COLUMN IF NOT EXISTS is_mst BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_proctored BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

      ALTER TABLE course_assignments
      DROP CONSTRAINT IF EXISTS course_assignments_assignment_type_check;

      ALTER TABLE course_assignments
      ADD CONSTRAINT course_assignments_assignment_type_check
      CHECK (assignment_type IN ('coding', 'theory', 'mst', 'quiz', 'assignment'));
    `);

    console.log("course_assignments schema updated successfully!");
  } catch (err) {
    console.error("Error updating course_assignments schema:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
