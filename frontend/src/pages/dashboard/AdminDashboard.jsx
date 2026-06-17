import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminSession, getAuthHeaders } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const location = useLocation();
  const session = location.state?.session || getAdminSession();
  const user = session?.user;
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [problemStatus, setProblemStatus] = useState({
    loading: true,
    error: ""
  });
  const [studentStatus, setStudentStatus] = useState({
    loading: true,
    error: ""
  });
  const [logStatus, setLogStatus] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    loadProblems();
    loadStudents();
    loadLogs();
  }, [session?.token]);

  async function loadProblems() {
    try {
      const response = await fetch(`${apiBaseUrl}/problems`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load coding questions.");
      }

      setProblems(data);
      setProblemStatus({
        loading: false,
        error: ""
      });
    } catch (error) {
      setProblemStatus({
        loading: false,
        error: error.message
      });
    }
  }

  async function loadStudents() {
    if (!session?.token) {
      setStudents([]);
      setStudentStatus({
        loading: false,
        error: "Log in as an admin to view students."
      });
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/users?role=student`, {
        headers: {
          ...getAuthHeaders(session.token)
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load students.");
      }

      setStudents(data);
      setStudentStatus({
        loading: false,
        error: ""
      });
    } catch (error) {
      setStudentStatus({
        loading: false,
        error: error.message
      });
    }
  }

  async function loadLogs() {
    if (!session?.token) {
      setLogs([]);
      setLogStatus({
        loading: false,
        error: "Log in as an admin to review recent activity."
      });
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/admin/logs?limit=6`, {
        headers: {
          ...getAuthHeaders(session.token)
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load admin activity.");
      }

      setLogs(data);
      setLogStatus({
        loading: false,
        error: ""
      });
    } catch (error) {
      setLogStatus({
        loading: false,
        error: error.message
      });
    }
  }

  return (
    <main className="dashboard-page admin-dashboard-page">
      <section className="dashboard-card admin-dashboard-card">
        <p className="auth-kicker">Admin Dashboard</p>
        <h1>{user ? `Welcome, ${user.full_name}.` : "Admin dashboard is ready."}</h1>
        <p className="dashboard-copy">
          {user ? `Authenticated as ${user.email}.` : "Open the admin login page to register or sign in."}
        </p>

        <div className="dashboard-stats">
          <article>
            <span>Role</span>
            <strong>{user?.role || "admin"}</strong>
          </article>
          <article>
            <span>Mode</span>
            <strong>Oversight</strong>
          </article>
          <article>
            <span>Students</span>
            <strong>{students.length}</strong>
          </article>
        </div>

        <section className="question-panel">
          <div className="question-panel-header">
            <div>
              <p className="auth-kicker">Question Manager</p>
              <h2>Manage the problem bank</h2>
            </div>
            <span className="question-count">{problems.length} total</span>
          </div>
          <p className="dashboard-copy">
            Open the add-question page to create a new coding problem, or open the list page to
            inspect existing questions one by one.
          </p>

          <div className="panel-action-row">
            <Link className="auth-button admin-button panel-action-button" to="/admin/problems/new">
              Add question
            </Link>
            <Link className="auth-button admin-button panel-action-button" to="/admin/problems">
              View question list
            </Link>
          </div>

          {problemStatus.error ? <p className="form-status error">{problemStatus.error}</p> : null}
          {problemStatus.loading ? <p className="dashboard-copy">Loading coding questions...</p> : null}
        </section>

        <section className="question-panel">
          <div className="question-panel-header">
            <div>
              <p className="auth-kicker">Student Directory</p>
              <h2>Review students and their submissions</h2>
            </div>
            <span className="question-count">{students.length} students</span>
          </div>
          <p className="dashboard-copy">
            Open the student list to view everyone on the platform, then drill into each student's
            submission history.
          </p>

          <div className="panel-action-row">
            <Link className="auth-button admin-button panel-action-button" to="/admin/students">
              View all students
            </Link>
          </div>

          {studentStatus.error ? <p className="form-status error">{studentStatus.error}</p> : null}
          {studentStatus.loading ? <p className="dashboard-copy">Loading students...</p> : null}
        </section>

        <section className="question-panel">
          <div className="question-panel-header">
            <div>
              <p className="auth-kicker">Admin Logs</p>
              <h2>Recent activity</h2>
            </div>
            <span className="question-count">{logs.length} entries</span>
          </div>
          {logStatus.loading ? <p className="dashboard-copy">Loading admin activity...</p> : null}
          {logStatus.error ? <p className="form-status error">{logStatus.error}</p> : null}
          {!logStatus.loading && !logStatus.error ? (
            logs.length ? (
              <div className="history-list">
                {logs.map((log) => (
                  <article className="history-card" key={log.id}>
                    <div className="question-card-top">
                      <span className="difficulty-pill medium">{log.action_type.replaceAll("_", " ")}</span>
                      <span className="question-meta">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <strong>{log.admin_name}</strong>
                    <p>
                      {log.target_type} {log.target_id ? `#${String(log.target_id).slice(0, 8)}` : ""}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="dashboard-copy">No admin activity has been recorded yet.</p>
            )
          ) : null}
        </section>

        <div className="dashboard-actions">
          <Link className="auth-button admin-button dashboard-link" to="/admin/login">
            Back to admin login
          </Link>
        </div>
      </section>
    </main>
  );
}
