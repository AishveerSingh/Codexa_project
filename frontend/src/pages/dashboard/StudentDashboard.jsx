import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuthHeaders, getStudentSession } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const defaultProgress = [
  {
    difficulty: "easy",
    total_submissions: 0,
    accepted_submissions: 0,
    wrong_answer_submissions: 0,
    time_limit_submissions: 0,
    solved_problems: 0
  },
  {
    difficulty: "medium",
    total_submissions: 0,
    accepted_submissions: 0,
    wrong_answer_submissions: 0,
    time_limit_submissions: 0,
    solved_problems: 0
  },
  {
    difficulty: "hard",
    total_submissions: 0,
    accepted_submissions: 0,
    wrong_answer_submissions: 0,
    time_limit_submissions: 0,
    solved_problems: 0
  }
];

export default function StudentDashboard() {
  const location = useLocation();
  const session = location.state?.session || getStudentSession();
  const user = session?.user;
  const [progress, setProgress] = useState(defaultProgress);
  const [progressStatus, setProgressStatus] = useState({
    loading: Boolean(user?.id),
    error: ""
  });

  function getProgressPercent(entry) {
    if (!entry.total_submissions) {
      return 0;
    }

    return Math.round((entry.accepted_submissions / entry.total_submissions) * 100);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      if (!user?.id || !session?.token) {
        setProgress(defaultProgress);
        setProgressStatus({
          loading: false,
          error: user?.id ? "Log in again to view protected progress data." : ""
        });
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/submissions/student/${user.id}/progress`, {
          headers: {
            ...getAuthHeaders(session.token)
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load progress.");
        }

        if (isMounted) {
          setProgress(data);
          setProgressStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setProgressStatus({
            loading: false,
            error: error.message
          });
          setProgress(defaultProgress);
        }
      }
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [session?.token, user?.id]);

  return (
    <main className="dashboard-page student-dashboard-page">
      <section className="dashboard-card student-dashboard-card">
        <p className="auth-kicker">Student Dashboard</p>
        <h1>{user ? `Welcome, ${user.full_name}.` : "Student dashboard is ready."}</h1>
        <p className="dashboard-copy">
          {user ? `Authenticated as ${user.email}.` : "Open the student login page to register or sign in."}
        </p>

        <div className="dashboard-stats">
          <article>
            <span>Role</span>
            <strong>{user?.role || "student"}</strong>
          </article>
          <article>
            <span>Mode</span>
            <strong>Practice</strong>
          </article>
          <article>
            <span>Solved</span>
            <strong>{progress.reduce((sum, entry) => sum + (entry.solved_problems || 0), 0)}</strong>
          </article>
        </div>

        <section className="question-panel">
          <div className="question-panel-header question-panel-header-compact">
            <div>
              <p className="auth-kicker">Coding Questions</p>
              <h2>Open the practice list.</h2>
            </div>
            <Link className="auth-button student-button panel-action-button" to="/student/problems">
              View questions
            </Link>
          </div>
          <p className="dashboard-copy">
            Use the questions button to open the full list of coding problems, then click any one
            to see its student detail page.
          </p>
        </section>

        <section className="question-panel">
          <div className="question-panel-header">
            <div>
              <p className="auth-kicker">Progress</p>
              <h2>Submission status by difficulty</h2>
            </div>
          </div>
          {!user?.id ? (
            <p className="dashboard-copy">
              Log in as a student and submit solutions to fill these progress meters.
            </p>
          ) : null}
          {progressStatus.loading ? <p className="dashboard-copy">Loading progress...</p> : null}
          {progressStatus.error ? <p className="form-status error">{progressStatus.error}</p> : null}
          {!progressStatus.loading && !progressStatus.error ? (
            <div className="progress-grid">
              {progress.map((entry) => (
                <article className="progress-card" key={entry.difficulty}>
                  <span className={`difficulty-pill ${entry.difficulty}`}>{entry.difficulty}</span>
                  <div className="progress-meter">
                    <div
                      className={`progress-meter-fill ${entry.difficulty}`}
                      style={{ width: `${getProgressPercent(entry)}%` }}
                    />
                  </div>
                  <span className="progress-percent">{getProgressPercent(entry)}% success</span>
                  <strong>{entry.accepted_submissions} accepted</strong>
                  <p>{entry.total_submissions} submissions total</p>
                  <p>{entry.solved_problems} solved problems</p>
                  <p>{entry.wrong_answer_submissions} wrong answer</p>
                  <p>{entry.time_limit_submissions} time limit</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <div className="dashboard-actions">
          <Link className="auth-button student-button dashboard-link" to="/student/login">
            Back to student login
          </Link>
        </div>
      </section>
    </main>
  );
}
