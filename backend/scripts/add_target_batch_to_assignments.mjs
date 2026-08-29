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
    console.log("Adding target_batch, target_year, target_semester columns to course_assignments...");

    await client.query(`
      ALTER TABLE course_assignments
      ADD COLUMN IF NOT EXISTS target_batch VARCHAR(100) DEFAULT 'ALL',
      ADD COLUMN IF NOT EXISTS target_year VARCHAR(50) DEFAULT 'ALL',
      ADD COLUMN IF NOT EXISTS target_semester VARCHAR(50) DEFAULT 'ALL';
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
