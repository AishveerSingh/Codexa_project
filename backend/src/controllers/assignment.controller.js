import { pool } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAssignment = asyncHandler(async (req, res) => {
const { title, description, startDate, dueDate, startTime, endTime, timeLimitMinutes, durationMinutes, maxScore, status, questions, type, isMst, isProctored } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Assignment title is required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const startVal = startTime || startDate || null;
    const endVal = endTime || dueDate || null;
    const allowedTypes = ['coding', 'theory', 'mst', 'quiz', 'assignment'];
    const safeType = type && allowedTypes.includes(type.trim().toLowerCase()) 
      ? type.trim().toLowerCase() 
      : (isMst ? 'mst' : 'coding');

    // 1. Create Assignment
    const assignmentResult = await client.query(
      `
        INSERT INTO course_assignments (
          course_id, title, description, assignment_type, start_date, due_date, start_time, end_time, time_limit_minutes, duration_minutes, max_score, status, is_mst, is_proctored, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, title, description, assignment_type, start_date, due_date, start_time, end_time, time_limit_minutes, duration_minutes, max_score, status, is_mst, is_proctored
      `,
      [
        req.course.id,
        title.trim(),
        description?.trim() || "",
        safeType,
        startVal,
        endVal,
        startVal,
        endVal,
        timeLimitMinutes || null,
        Number(durationMinutes) || 90,
        Number(maxScore) || 100,
        status || 'published',
        Boolean(isMst),
        isProctored !== undefined ? Boolean(isProctored) : true,
        req.currentUser.id
      ]
    );

    const assignmentId = assignmentResult.rows[0].id;

    // 2. Add Questions (if provided)
    if (questions && Array.isArray(questions)) {
      let sortOrder = 0;
      for (const q of questions) {
        let mcqId = null;
        let codingProblemId = q.course_coding_problem_id || null;

        if (q.type === 'mcq') {
          const mcqResult = await client.query(
            `
              INSERT INTO mcq_questions (course_id, question_text, options, correct_option_index, marks, negative_marks)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id
            `,
            [
              req.course.id,
              q.questionText,
              JSON.stringify(q.options),
              q.correctOptionIndex,
              q.marks || 1,
              q.negativeMarks || 0
            ]
          );
          mcqId = mcqResult.rows[0].id;
        } else if (q.type === 'coding' && !codingProblemId) {
          const codingResult = await client.query(
            `
                INSERT INTO course_coding_problems (course_id, title, statement, input_format, output_format, constraints_text, examples_text, difficulty, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `,
            [
              req.course.id,
              q.title || "Coding Question",
              q.statement || "",
              q.inputFormat || "",
              q.outputFormat || "",
              q.constraintsText || "",
              q.examplesText || "",
              q.difficulty || 'medium',
              req.currentUser.id
            ]
          );
          codingProblemId = codingResult.rows[0].id;
        }

        await client.query(
          `
            INSERT INTO assignment_questions (assignment_id, question_type, mcq_id, course_coding_problem_id, sort_order, marks)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            assignmentId,
            q.type,
            mcqId,
            codingProblemId,
            sortOrder++,
            q.marks || 1
          ]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Assignment created successfully.", assignmentId });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export const getAssignment = asyncHandler(async (req, res) => {
    const assignmentResult = await pool.query(
        `SELECT * FROM course_assignments WHERE id = $1`, [req.params.assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
        return res.status(404).json({ message: "Assignment not found." });
    }

    const assignment = assignmentResult.rows[0];

    const questionsResult = await pool.query(
        `
        SELECT aq.id as assignment_question_id, aq.question_type, aq.marks, aq.sort_order,
               m.id as mcq_id, m.question_text, m.options, m.correct_option_index, m.negative_marks,
               c.id as coding_id, c.title, c.statement, c.input_format, c.output_format, c.constraints_text, c.examples_text, c.difficulty
        FROM assignment_questions aq
        LEFT JOIN mcq_questions m ON aq.mcq_id = m.id
        LEFT JOIN course_coding_problems c ON aq.course_coding_problem_id = c.id
        WHERE aq.assignment_id = $1
        ORDER BY aq.sort_order ASC
        `, [assignment.id]
    );

    const questions = questionsResult.rows.map(q => {
        if (q.question_type === 'mcq') {
            const mcq = {
                id: q.assignment_question_id,
                type: 'mcq',
                marks: q.marks,
                sortOrder: q.sort_order,
                questionText: q.question_text,
                options: q.options,
                negativeMarks: q.negative_marks
            };
            if (req.currentUser.role !== 'student') {
                mcq.correctOptionIndex = q.correct_option_index;
            }
            return mcq;
        } else {
            return {
                id: q.assignment_question_id,
                type: 'coding',
                marks: q.marks,
                sortOrder: q.sort_order,
                codingProblemId: q.coding_id,
                title: q.title,
                statement: q.statement,
                inputFormat: q.input_format,
                outputFormat: q.output_format,
                constraintsText: q.constraints_text,
                examplesText: q.examples_text,
                difficulty: q.difficulty
            };
        }
    });

    res.json({ ...assignment, questions });
});

export const listAssignmentsForCourse = asyncHandler(async (req, res) => {
  const assignmentResult = await pool.query(
    `
      SELECT id, title, description, assignment_type, start_date, due_date, start_time, end_time, time_limit_minutes, duration_minutes, max_score, status, is_mst, is_proctored, created_at
      FROM course_assignments
      WHERE course_id = $1
      ORDER BY start_time ASC NULLS LAST, due_date ASC NULLS LAST, created_at DESC
    `,
    [req.course.id]
  );

  const submissionsResult = await pool.query(
    `
      SELECT id, assignment_id, student_id, status, total_score, submitted_at
      FROM assignment_student_attempts
      WHERE assignment_id IN (SELECT id FROM course_assignments WHERE course_id = $1)
    `,
    [req.course.id]
  );

  const groupedSubmissions = new Map();
  submissionsResult.rows.forEach((sub) => {
    if (!groupedSubmissions.has(sub.assignment_id)) {
      groupedSubmissions.set(sub.assignment_id, []);
    }
    groupedSubmissions.get(sub.assignment_id).push(sub);
  });

  let attempts = { rows: [] };
  if (req.currentUser.role === 'student') {
    attempts = await pool.query(
        `SELECT assignment_id, status, total_score FROM assignment_student_attempts WHERE student_id = $1`,
        [req.currentUser.id]
    );
  }

  const attemptsMap = new Map();
  attempts.rows.forEach(a => attemptsMap.set(a.assignment_id, a));

  res.json(
    assignmentResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      type: row.assignment_type,
      startDate: row.start_date,
      dueDate: row.due_date,
      startTime: row.start_time,
      endTime: row.end_time,
      timeLimitMinutes: row.time_limit_minutes,
      durationMinutes: row.duration_minutes,
      maxScore: row.max_score,
      status: row.status,
      isMst: row.is_mst,
      isProctored: row.is_proctored,
      submissions: groupedSubmissions.get(row.id) || [],
      attempt: req.currentUser.role === 'student' ? attemptsMap.get(row.id) || null : undefined
    }))
  );
});

export const startAttempt = asyncHandler(async (req, res) => {
    const result = await pool.query(
        `
        INSERT INTO assignment_student_attempts (assignment_id, student_id, status, started_at)
        VALUES ($1, $2, 'in_progress', NOW())
        ON CONFLICT (assignment_id, student_id) DO UPDATE SET updated_at = NOW()
        RETURNING id, status, started_at
        `,
        [req.params.assignmentId, req.currentUser.id]
    );
    res.json(result.rows[0]);
});

export const saveProgress = asyncHandler(async (req, res) => {
    const { attemptId, questionId, type, answer } = req.body;

    if (type === 'mcq') {
        await pool.query(
            `
            INSERT INTO assignment_mcq_answers (attempt_id, assignment_question_id, selected_option_index)
            VALUES ($1, $2, $3)
            ON CONFLICT (attempt_id, assignment_question_id) DO UPDATE SET selected_option_index = EXCLUDED.selected_option_index, updated_at = NOW()
            `,
            [attemptId, questionId, answer]
        );
    } else if (type === 'coding') {
        await pool.query(
            `
            INSERT INTO assignment_coding_answers (attempt_id, assignment_question_id, language, source_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (attempt_id, assignment_question_id) DO UPDATE SET language = EXCLUDED.language, source_code = EXCLUDED.source_code, updated_at = NOW()
            `,
            [attemptId, questionId, answer.language, answer.code]
        );
    }
    res.json({ message: "Progress saved." });
});

export const submitAttempt = asyncHandler(async (req, res) => {
    const { attemptId } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Fetch all MCQ answers for this attempt and grade them
        const mcqs = await client.query(`
            SELECT ama.id, ama.selected_option_index, mq.correct_option_index, aq.marks, mq.negative_marks
            FROM assignment_mcq_answers ama
            JOIN assignment_questions aq ON ama.assignment_question_id = aq.id
            JOIN mcq_questions mq ON aq.mcq_id = mq.id
            WHERE ama.attempt_id = $1
        `, [attemptId]);

        let totalMcqScore = 0;
        for (const ans of mcqs.rows) {
            const isCorrect = ans.selected_option_index === ans.correct_option_index;
            const marksObtained = isCorrect ? ans.marks : (ans.selected_option_index !== null && ans.selected_option_index !== undefined ? -ans.negative_marks : 0);
            totalMcqScore += Math.max(0, marksObtained);

            await client.query(`
                UPDATE assignment_mcq_answers
                SET is_correct = $1, marks_obtained = $2, updated_at = NOW()
                WHERE id = $3
            `, [isCorrect, marksObtained, ans.id]);
        }

        // Coding questions grading usually happens asynchronously via judge.
        // For simplicity, we just finalize attempt status and MCQ score for now.
        const codings = await client.query(`
             SELECT COALESCE(SUM(marks_obtained), 0) as coding_score FROM assignment_coding_answers WHERE attempt_id = $1
        `, [attemptId]);

        const totalScore = totalMcqScore + parseInt(codings.rows[0].coding_score || 0);

        await client.query(`
            UPDATE assignment_student_attempts
            SET status = 'submitted', submitted_at = NOW(), total_score = $1, updated_at = NOW()
            WHERE id = $2
        `, [totalScore, attemptId]);

        await client.query("COMMIT");
        res.json({ message: "Attempt submitted successfully.", totalScore });
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
});

export const getAssignmentRecords = asyncHandler(async (req, res) => {
    const attempts = await pool.query(`
        SELECT asa.id as attempt_id, asa.status, asa.started_at, asa.submitted_at, asa.total_score,
               u.id as student_id, u.full_name, u.email
        FROM assignment_student_attempts asa
        JOIN users u ON u.id = asa.student_id
        WHERE asa.assignment_id = $1
        ORDER BY asa.submitted_at DESC NULLS LAST
    `, [req.params.assignmentId]);

    res.json(attempts.rows);
});

export const getAttemptDetails = asyncHandler(async (req, res) => {
     const attemptId = req.params.attemptId;

     const attemptInfo = await pool.query(`SELECT * FROM assignment_student_attempts WHERE id = $1`, [attemptId]);
     if (attemptInfo.rows.length === 0) return res.status(404).json({message: "Not found"});

     const mcqAnswers = await pool.query(`
        SELECT ama.assignment_question_id, ama.selected_option_index, ama.is_correct, ama.marks_obtained,
               mq.correct_option_index
        FROM assignment_mcq_answers ama
        JOIN assignment_questions aq ON ama.assignment_question_id = aq.id
        JOIN mcq_questions mq ON aq.mcq_id = mq.id
        WHERE ama.attempt_id = $1
     `, [attemptId]);

     const codingAnswers = await pool.query(`
         SELECT aca.assignment_question_id, aca.language, aca.source_code, aca.execution_result, aca.passed_test_cases, aca.total_test_cases, aca.marks_obtained
         FROM assignment_coding_answers aca
         WHERE aca.attempt_id = $1
     `, [attemptId]);

     res.json({
         attempt: attemptInfo.rows[0],
         mcqAnswers: mcqAnswers.rows,
         codingAnswers: codingAnswers.rows
     });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { title, description, type, dueDate, startTime, endTime, durationMinutes, maxScore, isMst, isProctored } = req.body;

  // Anti-tamper check: Students cannot edit assignments or scores
  if (req.currentUser.role === "student") {
    return res.status(403).json({ message: "Access denied. Students cannot modify examination papers or test scores." });
  }

  const allowedTypes = ['coding', 'theory', 'mst', 'quiz', 'assignment'];
  const safeType = type && allowedTypes.includes(type.trim().toLowerCase()) ? type.trim().toLowerCase() : null;

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
      safeType,
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
