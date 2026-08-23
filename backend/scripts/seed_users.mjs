import pg from "pg";
import bcrypt from "bcrypt";
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
    console.log("Seeding default demo users...");
    const passwordHash = await bcrypt.hash("12345678", 10);

    const usersToSeed = [
      {
        fullName: "System Administrator",
        email: "admin_main@college.com",
        role: "admin"
      },
      {
        fullName: "Abhishek Kumar",
        email: "abhishek_2421001@college.com",
        role: "student",
        studentProfile: {
          rollNumber: "2421001",
          branch: "CSE",
          semester: 4,
          section: "A",
          batch: "2024-2028"
        }
      },
      {
        fullName: "Aishveer Singh",
        email: "aishveer_2421002@college.com",
        role: "student",
        studentProfile: {
          rollNumber: "2421002",
          branch: "CSE",
          semester: 4,
          section: "A",
          batch: "2024-2028"
        }
      },
      {
        fullName: "Dr. Akshay Sharma",
        email: "akshay_50@college.com",
        role: "faculty",
        facultyProfile: {
          employeeId: "50",
          department: "CSE",
          designation: "Associate Professor"
        }
      }
    ];

    for (const u of usersToSeed) {
      await client.query("BEGIN");
      const existing = await client.query("SELECT id FROM users WHERE email = $1", [u.email]);
      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await client.query(
          "UPDATE users SET full_name = $1, password_hash = $2, role = $3 WHERE id = $4",
          [u.fullName, passwordHash, u.role, userId]
        );
        console.log(`Updated existing user: ${u.email}`);
      } else {
        const ins = await client.query(
          "INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
          [u.fullName, u.email, passwordHash, u.role]
        );
        userId = ins.rows[0].id;
        console.log(`Inserted user: ${u.email}`);
      }

      if (u.role === "student" && u.studentProfile) {
        const sp = u.studentProfile;
        await client.query(
          `
          INSERT INTO student_profiles (user_id, roll_number, branch, semester, section, batch)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id) DO UPDATE SET
            roll_number = EXCLUDED.roll_number,
            branch = EXCLUDED.branch,
            semester = EXCLUDED.semester,
            section = EXCLUDED.section,
            batch = EXCLUDED.batch
          `,
          [userId, sp.rollNumber, sp.branch, sp.semester, sp.section, sp.batch]
        );
      } else if (u.role === "faculty" && u.facultyProfile) {
        const fp = u.facultyProfile;
        await client.query(
          `
          INSERT INTO faculty_profiles (user_id, employee_id, department, designation)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO UPDATE SET
            employee_id = EXCLUDED.employee_id,
            department = EXCLUDED.department,
            designation = EXCLUDED.designation
          `,
          [userId, fp.employeeId, fp.department, fp.designation]
        );
      }

      await client.query("COMMIT");
    }

    console.log("\nAll default accounts created successfully with password: 12345678!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding users:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
