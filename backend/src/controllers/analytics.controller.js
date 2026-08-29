import { pool } from "../config/db.js";

export async function getFacultyAnalytics(req, res, next) {
  try {
    const isFaculty = req.currentUser?.role === "faculty";
    const facultyId = req.currentUser?.id;

    // 1. Overview Statistics
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE role = 'student') AS total_students,
        (
          SELECT COUNT(*)::int
          FROM (
            SELECT id FROM submissions
            UNION ALL
            SELECT id FROM course_problem_submissions
          ) all_subs
        ) AS total_submissions,
        (
          SELECT COUNT(*)::int
          FROM (
            SELECT id FROM submissions WHERE status = 'accepted'
            UNION ALL
            SELECT id FROM course_problem_submissions WHERE status = 'accepted'
          ) acc_subs
        ) AS accepted_submissions,
        (
          SELECT COUNT(DISTINCT problem_id)::int
          FROM (
            SELECT problem_id FROM submissions WHERE status = 'accepted'
            UNION ALL
            SELECT course_problem_id AS problem_id FROM course_problem_submissions WHERE status = 'accepted'
          ) solved
        ) AS unique_problems_solved,
        (SELECT COUNT(*)::int FROM problems) AS total_problems,
        (SELECT COUNT(*)::int FROM courses WHERE is_active = TRUE) AS total_courses
    `);

    const rawStats = statsResult.rows[0] || {};
    const totalSubs = parseInt(rawStats.total_submissions, 10) || 0;
    const acceptedSubs = parseInt(rawStats.accepted_submissions, 10) || 0;
    const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 1000) / 10 : 0;

    // 2. Activity Heatmap (Daily Submissions over past 52 weeks / 365 days)
    const heatmapResult = await pool.query(`
      SELECT 
        TO_CHAR(submitted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM (
        SELECT submitted_at FROM submissions
        UNION ALL
        SELECT submitted_at FROM course_problem_submissions
        UNION ALL
        SELECT submitted_at FROM course_assignment_submissions
        UNION ALL
        SELECT started_at AS submitted_at FROM assignment_student_attempts
      ) all_activity
      WHERE submitted_at >= NOW() - INTERVAL '365 days'
      GROUP BY TO_CHAR(submitted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      ORDER BY day ASC
    `);

    // 3. Department Comparison (aggregated by student profile branch)
    const deptResult = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(sp.branch), ''), 'General') AS department,
        COUNT(DISTINCT u.id)::int AS student_count,
        COUNT(s.id)::int AS total_submissions,
        COUNT(s.id) FILTER (WHERE s.status = 'accepted')::int AS accepted_count,
        COALESCE(
          ROUND(
            AVG(
              COALESCE(student_stats.score, 0)
            )::numeric, 1
          ), 0
        )::float AS avg_score
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN (
        SELECT
          student_id,
          (COUNT(DISTINCT problem_id) * 50 + COUNT(*) * 5)::int AS score
        FROM submissions
        WHERE status = 'accepted'
        GROUP BY student_id
      ) student_stats ON student_stats.student_id = u.id
      LEFT JOIN submissions s ON s.student_id = u.id
      WHERE u.role = 'student'
      GROUP BY COALESCE(NULLIF(TRIM(sp.branch), ''), 'General')
      ORDER BY avg_score DESC, student_count DESC
    `);

    // 4. Top Performing Students (Full Leaderboard in Serial Order)
    const topStudentsResult = await pool.query(`
      SELECT
        u.id,
        u.full_name AS name,
        u.email,
        COALESCE(sp.roll_number, 'N/A') AS roll_no,
        COALESCE(sp.branch, 'General') AS department,
        COALESCE(sp.semester, 1) AS semester,
        COALESCE(sp.section, 'A') AS section,
        COALESCE(sp.batch, '2024-2028') AS batch,
        COUNT(s.id)::int AS total_submissions,
        COUNT(s.id) FILTER (WHERE s.status = 'accepted')::int AS accepted_count,
        COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END)::int AS solved_count,
        (
          COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) * 50 +
          COUNT(s.id) FILTER (WHERE s.status = 'accepted') * 10
        )::int AS score
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN submissions s ON s.student_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id, u.full_name, u.email, sp.roll_number, sp.branch, sp.semester, sp.section, sp.batch, u.created_at
      ORDER BY score DESC, solved_count DESC, total_submissions DESC, u.created_at ASC
    `);

    const topStudents = topStudentsResult.rows.map((row, idx) => ({
      rank: idx + 1,
      id: row.id,
      name: row.name,
      email: row.email,
      rollNo: row.roll_no,
      department: row.department,
      semester: row.semester,
      section: row.section,
      batch: row.batch,
      score: row.score || 0,
      solved: row.solved_count || 0,
      totalSubmissions: row.total_submissions || 0,
      acceptedCount: row.accepted_count || 0
    }));

    // 5. Hierarchical Group Breakdown (Semester -> Class/Branch -> Subclass/Section -> Batch)
    const groupsResult = await pool.query(`
      SELECT
        COALESCE(sp.semester, 1) AS semester,
        COALESCE(NULLIF(TRIM(sp.branch), ''), 'General') AS department,
        COALESCE(NULLIF(TRIM(sp.section), ''), 'A') AS section,
        COALESCE(NULLIF(TRIM(sp.batch), ''), 'General') AS batch,
        COUNT(DISTINCT u.id)::int AS student_count,
        COUNT(s.id)::int AS total_submissions,
        COUNT(s.id) FILTER (WHERE s.status = 'accepted')::int AS accepted_count,
        COALESCE(
          ROUND(
            AVG(COALESCE(student_stats.score, 0))::numeric, 1
          ), 0
        )::float AS avg_score,
        COALESCE(SUM(COALESCE(student_stats.solved_count, 0)), 0)::int AS total_problems_solved
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN (
        SELECT
          student_id,
          COUNT(DISTINCT CASE WHEN status = 'accepted' THEN problem_id END)::int AS solved_count,
          (COUNT(DISTINCT CASE WHEN status = 'accepted' THEN problem_id END) * 50 + COUNT(*) FILTER (WHERE status = 'accepted') * 10)::int AS score
        FROM submissions
        GROUP BY student_id
      ) student_stats ON student_stats.student_id = u.id
      LEFT JOIN submissions s ON s.student_id = u.id
      WHERE u.role = 'student'
      GROUP BY sp.semester, sp.branch, sp.section, sp.batch
      ORDER BY sp.semester ASC, sp.branch ASC, sp.section ASC
    `);

    res.json({
      overview: {
        totalStudents: parseInt(rawStats.total_students, 10) || 0,
        totalSubmissions: totalSubs,
        acceptedSubmissions: acceptedSubs,
        uniqueProblemsSolved: parseInt(rawStats.unique_problems_solved, 10) || 0,
        totalProblems: parseInt(rawStats.total_problems, 10) || 0,
        totalCourses: parseInt(rawStats.total_courses, 10) || 0,
        acceptanceRate
      },
      heatmap: heatmapResult.rows,
      departments: deptResult.rows,
      groups: groupsResult.rows,
      topStudents
    });
  } catch (error) {
    next(error);
  }
}
