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
    console.log("Seeding real courses and MST examinations into PostgreSQL database...");

    // Get Admin & Faculty user IDs
    const adminRes = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const facultyRes = await client.query("SELECT id FROM users WHERE role = 'faculty' LIMIT 1");

    if (adminRes.rows.length === 0 || facultyRes.rows.length === 0) {
      console.error("Please seed users first via node scripts/seed_users.mjs!");
      return;
    }

    const adminId = adminRes.rows[0].id;
    const facultyId = facultyRes.rows[0].id;

    // Course 1: Data Structures & Algorithms
    await client.query("BEGIN");
    let c1Res = await client.query("SELECT id FROM courses WHERE code = $1", ["CSE-204"]);
    let c1Id;
    if (c1Res.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO courses (code, title, description, instructor_id) VALUES ($1, $2, $3, $4) RETURNING id",
        ["CSE-204", "Data Structures & Algorithms", "Core computer science course covering Trees, Graphs, and Dynamic Programming.", facultyId]
      );
      c1Id = ins.rows[0].id;
    } else {
      c1Id = c1Res.rows[0].id;
    }

    // Add Course Audience for CSE, Semester 4, Section A, Batch 2024-2028
    await client.query(
      `INSERT INTO course_audiences (course_id, branch, semester, section, batch)
       VALUES ($1, 'CSE', 4, 'A', '2024-2028')
       ON CONFLICT (course_id, branch, semester, section, batch) DO NOTHING`,
      [c1Id]
    );

    // Add Course Faculty
    await client.query(
      `INSERT INTO course_faculty (course_id, faculty_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, faculty_id) DO NOTHING`,
      [c1Id, facultyId]
    );

    // Course 2: Database Management Systems
    let c2Res = await client.query("SELECT id FROM courses WHERE code = $1", ["CSE-205"]);
    let c2Id;
    if (c2Res.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO courses (code, title, description, instructor_id) VALUES ($1, $2, $3, $4) RETURNING id",
        ["CSE-205", "Database Management Systems", "Relational Databases, Normalization, SQL, and Indexing.", facultyId]
      );
      c2Id = ins.rows[0].id;
    } else {
      c2Id = c2Res.rows[0].id;
    }

    await client.query(
      `INSERT INTO course_audiences (course_id, branch, semester, section, batch)
       VALUES ($1, 'CSE', 4, 'A', '2024-2028')
       ON CONFLICT (course_id, branch, semester, section, batch) DO NOTHING`,
      [c2Id]
    );

    await client.query(
      `INSERT INTO course_faculty (course_id, faculty_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, faculty_id) DO NOTHING`,
      [c2Id, facultyId]
    );

    // Add Assignments / MST Exams into course_assignments
    const exams = [
      {
        courseId: c1Id,
        title: "Mid-Semester Examination 1 (MST-1)",
        description: "Official MST-1 exam covering Arrays, Linked Lists, Stacks, Queues, and Trees. Anti-cheating proctoring active.",
        assignmentType: "coding",
        dueDate: "2026-08-30T20:30:00Z",
        maxScore: 50,
        createdBy: facultyId
      },
      {
        courseId: c1Id,
        title: "Unit Test 1: Algorithm Analysis & Recursion",
        description: "Multiple choice test & short programming problems on Big-O Time Complexity.",
        assignmentType: "theory",
        dueDate: "2026-09-10T18:00:00Z",
        maxScore: 25,
        createdBy: facultyId
      },
      {
        courseId: c2Id,
        title: "MST-2: Relational Algebra & Advanced SQL Queries",
        description: "Mid-semester practical exam on SQL joins, grouping, views, and normalization.",
        assignmentType: "coding",
        dueDate: "2026-09-05T11:30:00Z",
        maxScore: 50,
        createdBy: facultyId
      }
    ];

    for (const ex of exams) {
      const existing = await client.query(
        "SELECT id FROM course_assignments WHERE course_id = $1 AND title = $2",
        [ex.courseId, ex.title]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO course_assignments (course_id, title, description, assignment_type, due_date, max_score, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [ex.courseId, ex.title, ex.description, ex.assignmentType, ex.dueDate, ex.maxScore, ex.createdBy]
        );
        console.log(`Created DB exam: ${ex.title}`);
      }
    }

    await client.query("COMMIT");
    console.log("Successfully seeded database courses and MST examinations!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding courses & exams:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
