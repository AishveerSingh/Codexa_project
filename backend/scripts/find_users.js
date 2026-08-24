import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const isSsl =
  process.env.PGSSL === "true" ||
  String(process.env.DATABASE_URL || "").includes("neon.tech") ||
  String(process.env.DATABASE_URL || "").includes("sslmode=require");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : false
});

async function main() {
  try {
    const res = await pool.query("SELECT email, role, full_name FROM users");
    console.log("All Users:");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
