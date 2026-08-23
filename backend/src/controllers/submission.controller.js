import { pool } from "../config/db.js";
import { executeSubmission } from "../utils/codeExecution.js";

async function updateStudentProgress(client, { studentId, problemId, status, submittedAt }) {
  await client.query(
    `
      INSERT INTO student_progress (
        student_id,
        problem_id,
        total_submissions,
        accepted_submissions,
        wrong_answer_submissions,
        time_limit_submissions,
        latest_status,
        first_attempted_at,
        last_submitted_at,
        solved_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        1,
        CASE WHEN $3 = 'accepted' THEN 1 ELSE 0 END,
        CASE WHEN $3 = 'wrong_answer' THEN 1 ELSE 0 END,
        CASE WHEN $3 = 'time_limit' THEN 1 ELSE 0 END,
        $3,
        $4::timestamptz,
        $4::timestamptz,
        CASE WHEN $3 = 'accepted' THEN $4::timestamptz ELSE NULL END,
        NOW()
      )
      ON CONFLICT (student_id, problem_id)
      DO UPDATE SET
        total_submissions = student_progress.total_submissions + 1,
        accepted_submissions = student_progress.accepted_submissions + CASE WHEN EXCLUDED.latest_status = 'accepted' THEN 1 ELSE 0 END,
        wrong_answer_submissions = student_progress.wrong_answer_submissions + CASE WHEN EXCLUDED.latest_status = 'wrong_answer' THEN 1 ELSE 0 END,
        time_limit_submissions = student_progress.time_limit_submissions + CASE WHEN EXCLUDED.latest_status = 'time_limit' THEN 1 ELSE 0 END,
        latest_status = EXCLUDED.latest_status,
        last_submitted_at = EXCLUDED.last_submitted_at,
        solved_at = COALESCE(student_progress.solved_at, EXCLUDED.solved_at),
        updated_at = NOW()
    `,
    [studentId, problemId, status, submittedAt]
  );
}

export async function createSubmission(req, res, next) {
  const { studentId, problemId, language, sourceCode } = req.body;

  if (!studentId || !problemId || !language?.trim() || !sourceCode?.trim()) {
    return res.status(400).json({
      message: "Student, problem, language, and source code are required."
    });
  }

  if (req.auth?.role !== "admin" && req.auth?.userId !== studentId) {
    return res.status(403).json({
      message: "You do not have permission to submit for another student."
    });
  }

  const client = await pool.connect();

  try {
    const problemResult = await client.query(
      `
        SELECT id, difficulty
        FROM problems
        WHERE id = $1
      `,
      [problemId]
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({
        message: "Coding question not found."
      });
    }

    const userResult = await client.query(
      `
        SELECT id, role
        FROM users
        WHERE id = $1
      `,
      [studentId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const testCaseResult = await client.query(
      `
        SELECT id, input_data, expected_output, is_sample, sort_order
        FROM test_cases
        WHERE problem_id = $1
        ORDER BY is_sample DESC, sort_order ASC, created_at ASC
      `,
      [problemId]
    );

    const normalizedLanguage = language.trim().toLowerCase();
    const executionResult = await executeSubmission({
      language: normalizedLanguage,
      sourceCode,
      testCases: testCaseResult.rows,
      problemId: problemId
    });
    const {
      status,
      passedTestCases,
      totalTestCases,
      executionTimeMs,
      memoryKb,
      compilerOutput
    } = executionResult;

    await client.query("BEGIN");

    const result = await client.query(
      `
        INSERT INTO submissions (
          student_id,
          problem_id,
          language,
          source_code,
          status,
          passed_test_cases,
          total_test_cases,
          execution_time_ms,
          memory_kb,
          compiler_output
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
          id,
          student_id,
          problem_id,
          language,
          source_code,
          status,
          passed_test_cases,
          total_test_cases,
          execution_time_ms,
          memory_kb,
          compiler_output,
          submitted_at
      `,
      [
        studentId,
        problemId,
        normalizedLanguage,
        sourceCode.trim(),
        status,
        passedTestCases,
        totalTestCases,
        executionTimeMs,
        memoryKb,
        compilerOutput
      ]
    );

    if (userResult.rows[0].role === "student") {
      await updateStudentProgress(client, {
        studentId,
        problemId,
        status,
        submittedAt: result.rows[0].submitted_at
      });
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Solution submitted successfully.",
      submission: result.rows[0],
      testCaseResults: executionResult.testCaseResults ?? [],
      execution: {
        errorType: executionResult.errorType ?? null,
        verdictLabel: executionResult.verdictLabel ?? result.rows[0].status,
        stdout: executionResult.stdout ?? "",
        stderr: executionResult.stderr ?? "",
        executionTimeMs: executionResult.executionTimeMs ?? 0
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

export async function runSubmission(req, res, next) {
  const { problemId, language, sourceCode } = req.body;

  if (!problemId || !language?.trim() || !sourceCode?.trim()) {
    return res.status(400).json({
      message: "Problem, language, and source code are required."
    });
  }

  try {
    const problemResult = await pool.query(
      `
        SELECT id
        FROM problems
        WHERE id = $1
      `,
      [problemId]
    );

    if (problemResult.rows.length === 0) {
      return res.status(404).json({
        message: "Coding question not found."
      });
    }

    const sampleTestCaseResult = await pool.query(
      `
        SELECT id, input_data, expected_output, is_sample, sort_order
        FROM test_cases
        WHERE problem_id = $1 AND is_sample = TRUE
        ORDER BY sort_order ASC, created_at ASC
      `,
      [problemId]
    );

    let testCasesToRun = sampleTestCaseResult.rows;

    if (testCasesToRun.length === 0) {
      const allTestCaseResult = await pool.query(
        `
          SELECT id, input_data, expected_output, is_sample, sort_order
          FROM test_cases
          WHERE problem_id = $1
          ORDER BY sort_order ASC, created_at ASC
        `,
        [problemId]
      );
      testCasesToRun = allTestCaseResult.rows;
    }

    if (testCasesToRun.length === 0) {
      testCasesToRun = [
        {
          id: "no-sample-case",
          input_data: "",
          expected_output: "",
          is_sample: true,
          sort_order: 0
        }
      ];
    }

    const normalizedLanguage = language.trim().toLowerCase();
    const executionResult = await executeSubmission({
      language: normalizedLanguage,
      sourceCode,
      testCases: testCasesToRun,
      problemId: problemId
    });

    res.json({
      message: "Sample test cases executed.",
      result: {
        ...executionResult,
        language: normalizedLanguage
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentSubmissions(req, res, next) {
  const { studentId } = req.params;
  const { problemId } = req.query;

  try {
    const values = [studentId];
    let problemFilter = "";

    if (problemId) {
      values.push(problemId);
      problemFilter = "AND s.problem_id = $2";
    }

    const result = await pool.query(
      `
        SELECT
          s.id,
          s.problem_id,
          p.title AS problem_title,
          p.difficulty,
          s.language,
          s.source_code,
          s.status,
          s.passed_test_cases,
          s.total_test_cases,
          s.execution_time_ms,
          s.memory_kb,
          s.compiler_output,
          s.submitted_at
        FROM submissions s
        JOIN problems p ON p.id = s.problem_id
        WHERE s.student_id = $1
        ${problemFilter}
        ORDER BY s.submitted_at DESC
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getAdminSubmissions(req, res, next) {
  const studentId = req.query.studentId?.trim() ?? "";
  const problemId = req.query.problemId?.trim() ?? "";
  const status = req.query.status?.trim().toLowerCase() ?? "";
  const language = req.query.language?.trim().toLowerCase() ?? "";
  const category = req.query.category?.trim().toLowerCase() ?? "";

  if (status && !["accepted", "wrong_answer", "time_limit"].includes(status)) {
    return res.status(400).json({
      message: "Status filter must be accepted, wrong_answer, or time_limit."
    });
  }

  if (language && !["cpp", "java", "python", "javascript"].includes(language)) {
    return res.status(400).json({
      message: "Language filter must be cpp, java, python, or javascript."
    });
  }

  if (category && !["course", "problem_bank"].includes(category)) {
    return res.status(400).json({
      message: "Category filter must be course or problem_bank."
    });
  }

  try {
    const values = [];
    const filters = [];

    if (studentId) {
      values.push(studentId);
      filters.push(`s.student_id = $${values.length}`);
    }

    if (problemId) {
      values.push(problemId);
      filters.push(`s.problem_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      filters.push(`s.status = $${values.length}`);
    }

    if (language) {
      values.push(language);
      filters.push(`s.language = $${values.length}`);
    }

    if (category) {
      values.push(category);
      filters.push(`s.category = $${values.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `
        SELECT * FROM (
          SELECT
            s.id,
            s.student_id,
            u.full_name AS student_name,
            u.email AS student_email,
            s.problem_id,
            p.title AS problem_title,
            p.difficulty,
            s.language,
            s.source_code,
            s.status,
            s.passed_test_cases,
            s.total_test_cases,
            s.execution_time_ms,
            s.memory_kb,
            s.compiler_output,
            s.submitted_at,
            'problem_bank' AS category
          FROM submissions s
          JOIN users u ON u.id = s.student_id
          JOIN problems p ON p.id = s.problem_id

          UNION ALL

          SELECT
            cps.id,
            cps.student_id,
            u.full_name AS student_name,
            u.email AS student_email,
            cps.course_problem_id AS problem_id,
            ccp.title AS problem_title,
            ccp.difficulty,
            cps.language,
            cps.source_code,
            cps.status,
            cps.passed_test_cases,
            cps.total_test_cases,
            cps.execution_time_ms,
            cps.memory_kb,
            cps.compiler_output,
            cps.submitted_at,
            'course' AS category
          FROM course_problem_submissions cps
          JOIN users u ON u.id = cps.student_id
          JOIN course_coding_problems ccp ON ccp.id = cps.course_problem_id
        ) s
        ${whereClause}
        ORDER BY s.submitted_at DESC
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getStudentProgress(req, res, next) {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
          d.difficulty,
          (
            SELECT COUNT(DISTINCT p_all.id)::int
            FROM (
              SELECT id, LOWER(TRIM(difficulty)) AS difficulty FROM problems
              UNION ALL
              SELECT id, LOWER(TRIM(difficulty)) AS difficulty FROM course_coding_problems
            ) p_all
            WHERE p_all.difficulty = d.difficulty
          ) AS total_problems,
          (
            SELECT COUNT(*)::int
            FROM (
              SELECT s.id
              FROM submissions s
              JOIN problems p ON p.id = s.problem_id
              WHERE s.student_id::text = $1::text AND LOWER(TRIM(p.difficulty)) = d.difficulty

              UNION ALL

              SELECT cps.id
              FROM course_problem_submissions cps
              JOIN course_coding_problems ccp ON ccp.id = cps.course_problem_id
              WHERE cps.student_id::text = $1::text AND LOWER(TRIM(ccp.difficulty)) = d.difficulty
            ) subs
          ) AS total_submissions,
          (
            SELECT COUNT(*)::int
            FROM (
              SELECT s.id
              FROM submissions s
              JOIN problems p ON p.id = s.problem_id
              WHERE s.student_id::text = $1::text AND LOWER(TRIM(s.status)) = 'accepted' AND LOWER(TRIM(p.difficulty)) = d.difficulty

              UNION ALL

              SELECT cps.id
              FROM course_problem_submissions cps
              JOIN course_coding_problems ccp ON ccp.id = cps.course_problem_id
              WHERE cps.student_id::text = $1::text AND LOWER(TRIM(cps.status)) = 'accepted' AND LOWER(TRIM(ccp.difficulty)) = d.difficulty
            ) accepted_subs
          ) AS accepted_submissions,
          (
            SELECT COUNT(DISTINCT prob_id)::int
            FROM (
              SELECT s.problem_id AS prob_id
              FROM submissions s
              JOIN problems p ON p.id = s.problem_id
              WHERE s.student_id::text = $1::text AND LOWER(TRIM(s.status)) = 'accepted' AND LOWER(TRIM(p.difficulty)) = d.difficulty

              UNION

              SELECT cps.course_problem_id AS prob_id
              FROM course_problem_submissions cps
              JOIN course_coding_problems ccp ON ccp.id = cps.course_problem_id
              WHERE cps.student_id::text = $1::text AND LOWER(TRIM(cps.status)) = 'accepted' AND LOWER(TRIM(ccp.difficulty)) = d.difficulty
            ) solved_probs
          ) AS solved_problems
        FROM (
          SELECT 'easy' AS difficulty
          UNION ALL SELECT 'medium'
          UNION ALL SELECT 'hard'
        ) d
      `,
      [studentId]
    );

    const progressMap = {
      easy: {
        difficulty: "easy",
        total_problems: 0,
        total_submissions: 0,
        accepted_submissions: 0,
        wrong_answer_submissions: 0,
        time_limit_submissions: 0,
        solved_problems: 0
      },
      medium: {
        difficulty: "medium",
        total_problems: 0,
        total_submissions: 0,
        accepted_submissions: 0,
        wrong_answer_submissions: 0,
        time_limit_submissions: 0,
        solved_problems: 0
      },
      hard: {
        difficulty: "hard",
        total_problems: 0,
        total_submissions: 0,
        accepted_submissions: 0,
        wrong_answer_submissions: 0,
        time_limit_submissions: 0,
        solved_problems: 0
      }
    };

    for (const row of result.rows) {
      const diff = (row.difficulty || "").toLowerCase();
      if (progressMap[diff]) {
        progressMap[diff] = {
          ...progressMap[diff],
          total_problems: Number(row.total_problems || 0),
          total_submissions: Number(row.total_submissions || 0),
          accepted_submissions: Number(row.accepted_submissions || 0),
          solved_problems: Number(row.solved_problems || 0)
        };
      }
    }

    res.json(Object.values(progressMap));
  } catch (error) {
    next(error);
  }
}
