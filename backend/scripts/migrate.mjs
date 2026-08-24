import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { Pool } = pg;

const isSsl =
  process.env.PGSSL === "true" ||
  String(process.env.DATABASE_URL || "").includes("neon.tech") ||
  String(process.env.DATABASE_URL || "").includes("sslmode=require");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : false
});

async function migrate() {
  const client = await pool.connect();
  try {
    const schemaPath = path.resolve(__dirname, "../src/database/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("Applying schema.sql to the database...");
    await client.query(sql);
    console.log("Schema applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
