import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminSession, getAuthHeaders } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminStudentSubmissions() {
  const { studentId } = useParams();
  const session = getAdminSession();
  const [student, setStudent] = useState(null);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    problemId: "",
    status: "",
    language: ""
  });
  const [studentStatus, setStudentStatus] = useState({
    loading: true,
    error: ""
  });
  const [submissionStatus, setSubmissionStatus] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let isMounted = true;

    async function loadStudent() {
      if (!session?.token) {
        if (isMounted) {
          setStudentStatus({
            loading: false,
            error: "Log in as an admin to review submissions."
          });
        }
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/users/${studentId}`, {
          headers: {
            ...getAuthHeaders(session.token)
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load student.");
        }

        if (isMounted) {
          setStudent(data);
          setStudentStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setStudentStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    async function loadProblems() {
      try {
        const response = await fetch(`${apiBaseUrl}/problems`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load coding questions.");
        }

        if (isMounted) {
          setProblems(data);
        }
      } catch (_error) {
        if (isMounted) {
          setProblems([]);
        }
      }
    }

    loadStudent();
    loadProblems();

    return () => {
      isMounted = false;
    };
  }, [session?.token, studentId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions() {
      setSubmissionStatus({
        loading: true,
        error: ""
      });

      try {
        if (!session?.token) {
          throw new Error("Log in as an admin to review submissions.");
        }

        const params = new URLSearchParams({
          studentId
        });

        if (filters.problemId) {
          params.set("problemId", filters.problemId);
        }

        if (filters.status) {
          params.set("status", filters.status);
        }

        if (filters.language) {
          params.set("language", filters.language);
        }

        const response = await fetch(`${apiBaseUrl}/submissions?${params.toString()}`, {
          headers: {
            ...getAuthHeaders(session.token)
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load submissions.");
        }

        if (isMounted) {
          setSubmissions(data);
          setSubmissionStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setSubmissionStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, [filters.language, filters.problemId, filters.status, session?.token, studentId]);

  return (
    <main className="detail-page admin-detail-page">
      <section className="detail-card admin-detail-card">
        <p className="auth-kicker">Student Submission Review</p>
        {studentStatus.loading ? <h1>Loading student...</h1> : null}
        {studentStatus.error ? <p className="form-status error">{studentStatus.error}</p> : null}

        {student ? (
          <>
            <h1>{student.full_name}</h1>
            <p className="detail-copy">
              Review this student's submission history, filter by problem, and inspect each code
              attempt with its latest result.
            </p>

            <div className="dashboard-stats">
              <article>
                <span>Email</span>
                <strong>{student.email}</strong>
              </article>
              <article>
                <span>Total submissions</span>
                <strong>{student.submission_count}</strong>
              </article>
              <article>
                <span>Accepted</span>
                <strong>{student.accepted_count}</strong>
              </article>
            </div>
          </>
        ) : null}

        <div className="filter-bar">
          <select
            aria-label="Filter submissions by problem"
            className="filter-select"
            name="problemId"
            value={filters.problemId}
            onChange={(event) => {
              setFilters((currentFilters) => ({
                ...currentFilters,
                problemId: event.target.value
              }));
            }}
          >
            <option value="">All questions</option>
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter submissions by status"
            className="filter-select"
            name="status"
            value={filters.status}
            onChange={(event) => {
              setFilters((currentFilters) => ({
                ...currentFilters,
                status: event.target.value
              }));
            }}
          >
            <option value="">All statuses</option>
            <option value="accepted">Accepted</option>
            <option value="wrong_answer">Wrong answer</option>
            <option value="time_limit">Time limit</option>
          </select>
          <select
            aria-label="Filter submissions by language"
            className="filter-select"
            name="language"
            value={filters.language}
            onChange={(event) => {
              setFilters((currentFilters) => ({
                ...currentFilters,
                language: event.target.value
              }));
            }}
          >
            <option value="">All languages</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        {submissionStatus.loading ? <p className="dashboard-copy">Loading submissions...</p> : null}
        {submissionStatus.error ? <p className="form-status error">{submissionStatus.error}</p> : null}

        {!submissionStatus.loading && !submissionStatus.error ? (
          <>
            {submissions.length === 0 ? (
              <p className="dashboard-copy">No submissions matched the current filters.</p>
            ) : (
              <div className="history-list">
                {submissions.map((submission) => (
                  <article className="history-card" key={submission.id}>
                    <div className="question-card-top">
                      <span className={`status-pill ${submission.status}`}>
                        {submission.status.replaceAll("_", " ")}
                      </span>
                      <span className="question-meta">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </span>
                    </div>
                    <strong>{submission.problem_title}</strong>
                    <p className="question-meta">
                      {submission.language.toUpperCase()} - {submission.difficulty}
                    </p>
                    <p className="history-snippet">{submission.source_code}</p>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}

        <div className="detail-actions">
          <Link className="auth-button admin-button detail-link" to="/admin/students">
            Back to students
          </Link>
          <Link className="auth-button ghost-button detail-link" to="/admin/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
