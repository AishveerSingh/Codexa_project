import { pool } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, type, dueDate, startTime, endTime, durationMinutes, maxScore, isMst, isProctored } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Assignment title is required." });
  }

  const result = await pool.query(
    `
      INSERT INTO course_assignments (
        course_id, title, description, assignment_type, due_date, start_time, end_time, duration_minutes, max_score, is_mst, is_proctored, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, title, description, assignment_type, due_date, start_time, end_time, duration_minutes, max_score, is_mst, is_proctored
    `,
    [
      req.course.id,
      title.trim(),
      description?.trim() || "",
      type?.trim() || "coding",
      dueDate || endTime || null,
      startTime || null,
      endTime || dueDate || null,
      Number(durationMinutes) || 90,
      Number(maxScore) || 100,
      Boolean(isMst),
      isProctored !== undefined ? Boolean(isProctored) : true,
      req.currentUser.id
    ]
  );

  res.status(201).json({
    message: "Assignment / MST created successfully.",
    assignment: {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      type: result.rows[0].assignment_type,
      dueDate: result.rows[0].due_date,
      startTime: result.rows[0].start_time,
      endTime: result.rows[0].end_time,
      durationMinutes: result.rows[0].duration_minutes,
      maxScore: result.rows[0].max_score,
      isMst: result.rows[0].is_mst,
      isProctored: result.rows[0].is_proctored
    }
  });
});

export const listAssignmentsForCourse = asyncHandler(async (req, res) => {
  const assignmentResult = await pool.query(
    `
      SELECT id, title, description, assignment_type, due_date, start_time, end_time, duration_minutes, max_score, is_mst, is_proctored, created_at
      FROM course_assignments
      WHERE course_id = $1
      ORDER BY start_time ASC NULLS LAST, due_date ASC NULLS LAST, created_at DESC
    `,
    [req.course.id]
  );

  const assignmentIds = assignmentResult.rows.map((row) => row.id);
  const submissions =
    assignmentIds.length > 0
      ? await pool.query(
          req.currentUser.role === "student"
            ? `
                SELECT id, assignment_id, submitted_at, grade, feedback, status
                FROM course_assignment_submissions
                WHERE student_id = $1 AND assignment_id = ANY($2::uuid[])
              `
            : `
                SELECT s.id, s.assignment_id, s.submitted_at, s.grade, s.feedback, s.status, u.id AS student_id, u.full_name, u.email
                FROM course_assignment_submissions s
                JOIN users u ON u.id = s.student_id
                WHERE s.assignment_id = ANY($1::uuid[])
              `,
          req.currentUser.role === "student"
            ? [req.currentUser.id, assignmentIds]
            : [assignmentIds]
        )
      : { rows: [] };

  const groupedSubmissions = new Map();
  submissions.rows.forEach((row) => {
    const current = groupedSubmissions.get(row.assignment_id) || [];
    current.push(
      req.currentUser.role === "student"
        ? {
            id: row.id,
            submittedAt: row.submitted_at,
            grade: row.grade,
            feedback: row.feedback,
            status: row.status
          }
        : {
            id: row.id,
            student: {
              id: row.student_id,
              fullName: row.full_name,
              email: row.email
            },
            submittedAt: row.submitted_at,
            grade: row.grade,
            feedback: row.feedback,
            status: row.status
          }
    );
    groupedSubmissions.set(row.assignment_id, current);
  });

  res.json(
    assignmentResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      type: row.assignment_type,
      dueDate: row.due_date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      maxScore: row.max_score,
      isMst: row.is_mst,
      isProctored: row.is_proctored,
      submissions: groupedSubmissions.get(row.id) || []
    }))
  );
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { sourceCode, answerText, attachmentUrl } = req.body;

  const result = await pool.query(
    `
      INSERT INTO course_assignment_submissions (
        assignment_id,
        student_id,
        source_code,
        answer_text,
        attachment_url,
        status,
        submitted_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'submitted', NOW(), NOW())
      ON CONFLICT (assignment_id, student_id)
      DO UPDATE SET
        source_code = EXCLUDED.source_code,
        answer_text = EXCLUDED.answer_text,
        attachment_url = EXCLUDED.attachment_url,
        status = 'submitted',
        grade = NULL,
        feedback = '',
        submitted_at = NOW(),
        updated_at = NOW()
      RETURNING id
    `,
    [req.assignment.id, req.currentUser.id, sourceCode?.trim() || "", answerText?.trim() || "", attachmentUrl?.trim() || ""]
  );

  res.status(201).json({
    message: "Assignment submitted successfully.",
    submissionId: result.rows[0].id
  });
});

export const gradeAssignmentSubmission = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `
      UPDATE course_assignment_submissions
      SET grade = $1,
          feedback = $2,
          status = 'graded',
          updated_at = NOW()
      WHERE id = $3 AND assignment_id = $4
      RETURNING id
    `,
    [Number(req.body.grade), req.body.feedback?.trim() || "", req.params.submissionId, req.assignment.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Submission not found." });
  }

  res.json({ message: "Submission graded successfully." });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { title, description, type, dueDate, startTime, endTime, durationMinutes, maxScore, isMst, isProctored } = req.body;

  // Anti-tamper check: Students cannot edit assignments or scores
  if (req.currentUser.role === "student") {
    return res.status(403).json({ message: "Access denied. Students cannot modify examination papers or test scores." });
  }

  const result = await pool.query(
    `
      UPDATE course_assignments
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          assignment_type = COALESCE($3, assignment_type),
          due_date = COALESCE($4, due_date),
          start_time = COALESCE($5, start_time),
          end_time = COALESCE($6, end_time),
          duration_minutes = COALESCE($7, duration_minutes),
          max_score = COALESCE($8, max_score),
          is_mst = COALESCE($9, is_mst),
          is_proctored = COALESCE($10, is_proctored),
          updated_at = NOW()
      WHERE id = $11 AND course_id = $12
      RETURNING id, title, description, assignment_type, due_date, start_time, end_time, duration_minutes, max_score, is_mst, is_proctored
    `,
    [
      title?.trim() || null,
      description?.trim() || null,
      type?.trim() || null,
      dueDate || endTime || null,
      startTime || null,
      endTime || dueDate || null,
      durationMinutes ? Number(durationMinutes) : null,
      maxScore ? Number(maxScore) : null,
      isMst !== undefined ? Boolean(isMst) : null,
      isProctored !== undefined ? Boolean(isProctored) : null,
      assignmentId,
      req.course.id
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Examination paper not found." });
  }

  res.json({
    message: "Examination parameters updated successfully.",
    assignment: result.rows[0]
  });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  // Anti-tamper check: Students cannot delete assignments
  if (req.currentUser.role === "student") {
    return res.status(403).json({ message: "Access denied. Students cannot delete examination papers." });
  }

  const result = await pool.query(
    `DELETE FROM course_assignments WHERE id = $1 AND course_id = $2 RETURNING id`,
    [assignmentId, req.course.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Examination paper not found." });
  }

  res.json({ message: "Examination paper deleted successfully." });
});
