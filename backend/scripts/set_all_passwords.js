import pg from "pg";
import bcrypt from "bcrypt";
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
    const password = "12345678";
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query("UPDATE users SET password_hash = $1", [hash]);
    console.log(`Updated password for all ${result.rowCount} users to '12345678' successfully!`);
  } catch (err) {
    console.error("Error updating passwords:", err);
  } finally {
    await pool.end();
  }
}

main();
