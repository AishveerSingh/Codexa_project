import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const password = "password123";
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    await pool.query("UPDATE users SET password_hash = $1 WHERE email IN ($2, $3, $4)", [hash, "admin_main@college.com", "aishveer_2421002@college.com", "akshay_50@college.com"]);
    console.log("Updated accounts password to password123 successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
