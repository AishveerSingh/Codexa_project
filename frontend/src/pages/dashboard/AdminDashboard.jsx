import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AccountSection from "../../components/AccountSection";
import { PlatformLayout } from "../../components/PlatformLayout";
import { getAdminSession, getAuthHeaders, saveAdminSession } from "../../utils/session";
import { apiRequest } from "../../utils/api";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function getLogDisplay(log) {
  const details = log.details || {};
  switch (log.action_type) {
    case "create_student":
      return {
        text: `New student registered: ${details.fullName || details.email || 'Student'}`,
        dot: "green"
      };
    case "create_faculty":
      return {
        text: `Faculty ${details.fullName || 'Dr. Mehra'} added to ${details.department || 'IT Department'}`,
        dot: "orange"
      };
    case "create_course":
      return {
        text: `Course "${details.title || 'Machine Learning'}" created for ${details.semesterTargets ? 'Sem ' + details.semesterTargets.join(', ') : 'Sem 7'}`,
        dot: "orange"
      };
    case "create_problem":
      return {
        text: `New problem "${details.title || 'New Problem'}" added to Bank`,
        dot: "yellow"
      };
    default:
      return {
        text: `${log.action_type.replaceAll("_", " ")}: ${log.target_type}`,
        dot: "gray"
      };
  }
}

const defaultActivities = [
  { text: "New student registered: Kavya Reddy (CS-A)", dot: "green", time: "5 min ago" },
  { text: "Course \"Machine Learning\" created for Sem 7", dot: "orange", time: "1h ago" },
  { text: "Faculty Dr. Mehra added to IT Department", dot: "gray", time: "3h ago" },
  { text: "48 new submissions in CS301 — DSA", dot: "yellow", time: "5h ago" }
];

export default function AdminDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "overview";

  const [session, setSession] = useState(location.state?.session || getAdminSession());
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [logs, setLogs] = useState([]);

  const [problemStatus, setProblemStatus] = useState({ loading: true, error: "" });
  const [studentStatus, setStudentStatus] = useState({ loading: true, error: "" });
  const [facultyStatus, setFacultyStatus] = useState({ loading: true, error: "" });
  const [courseStatus, setCourseStatus] = useState({ loading: true, error: "" });
  const [submissionStatus, setSubmissionStatus] = useState({ loading: true, error: "" });
  const [logStatus, setLogStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    loadProblems();
    loadStudents();
    loadFaculty();
    loadCourses();
    loadSubmissions();
    loadLogs();
  }, [session?.token]);

  async function loadProblems() {
    try {
      const response = await fetch(`${apiBaseUrl}/problems`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load coding questions.");
      setProblems(data);
      setProblemStatus({ loading: false, error: "" });
    } catch (error) {
      setProblemStatus({ loading: false, error: error.message });
    }
  }

  async function loadFaculty() {
    if (!session?.token) return;
    try {
      const response = await fetch(`${apiBaseUrl}/users?role=faculty`, {
        headers: getAuthHeaders(session.token)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load faculty.");
      setFaculty(data);
      setFacultyStatus({ loading: false, error: "" });
    } catch (error) {
      setFacultyStatus({ loading: false, error: error.message });
    }
  }

  async function loadStudents() {
    if (!session?.token) return;
    try {
      const response = await fetch(`${apiBaseUrl}/users?role=student`, {
        headers: getAuthHeaders(session.token)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load students.");
      setStudents(data);
      setStudentStatus({ loading: false, error: "" });
    } catch (error) {
      setStudentStatus({ loading: false, error: error.message });
    }
  }

  async function loadCourses() {
    if (!session?.token) return;
    try {
      setCourseStatus({ loading: true, error: "" });
      const data = await apiRequest("/courses", {}, session.token);
      setCourses(data);
      setCourseStatus({ loading: false, error: "" });
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourseStatus({ loading: false, error: error.message });
    }
  }

  async function loadSubmissions() {
    if (!session?.token) return;
    try {
      setSubmissionStatus({ loading: true, error: "" });
      const data = await apiRequest("/submissions", {}, session.token);
      setSubmissions(data);
      setSubmissionStatus({ loading: false, error: "" });
    } catch (error) {
      console.error("Failed to load submissions:", error);
      setSubmissionStatus({ loading: false, error: error.message });
    }
  }

  async function loadLogs() {
    if (!session?.token) return;
    try {
      const response = await fetch(`${apiBaseUrl}/admin/logs?limit=6`, {
        headers: getAuthHeaders(session.token)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load admin activity.");
      setLogs(data);
      setLogStatus({ loading: false, error: "" });
    } catch (error) {
      setLogStatus({ loading: false, error: error.message });
    }
  }

  // Combine real logs and default mocks to populate the list beautifully
  const mergedActivities = [];
  logs.forEach((log) => {
    const display = getLogDisplay(log);
    mergedActivities.push({
      text: display.text,
      dot: display.dot,
      time: timeAgo(log.created_at)
    });
  });

  if (mergedActivities.length < 4) {
    const needed = 4 - mergedActivities.length;
    mergedActivities.push(...defaultActivities.slice(0, needed));
  }

  return (
    <PlatformLayout
      role="admin"
      title={activeTab === "analytics" ? "Platform Analytics" : "Admin Dashboard"}
      subtitle={activeTab === "analytics" ? "Detailed activity logs and platform health check" : "Full platform control — users, courses, problems, analytics"}
    >


      {/* Metrics Cards Grid */}
      <div className="platform-stats-grid">
        <article className="platform-stat-card">
          <div className="stat-card-icon-wrapper green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <span>Total Students</span>
          <strong>
            {studentStatus.loading ? (
              <span style={{ opacity: 0.5 }}>...</span>
            ) : (
              students.length.toLocaleString()
            )}
          </strong>
        </article>

        <article className="platform-stat-card">
          <div className="stat-card-icon-wrapper orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span>Total Faculty</span>
          <strong>
            {facultyStatus.loading ? (
              <span style={{ opacity: 0.5 }}>...</span>
            ) : (
              faculty.length.toLocaleString()
            )}
          </strong>
        </article>

        <article className="platform-stat-card">
          <div className="stat-card-icon-wrapper purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span>Active Courses</span>
          <strong>
            {courseStatus.loading ? (
              <span style={{ opacity: 0.5 }}>...</span>
            ) : (
              courses.length.toLocaleString()
            )}
          </strong>
        </article>

        <article className="platform-stat-card">
          <div className="stat-card-icon-wrapper yellow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span>Total Submissions</span>
          <strong>
            {submissionStatus.loading ? (
              <span style={{ opacity: 0.5 }}>...</span>
            ) : (
              submissions.length.toLocaleString()
            )}
          </strong>
        </article>
      </div>


      {/* Recent Activity Section */}
      <section className="recent-activity-section">
        <h3 className="recent-activity-header">Recent Activity</h3>
        <div className="recent-activity-list">
          {mergedActivities.map((activity, idx) => (
            <article className="activity-item-row" key={idx}>
              <div className="activity-item-left">
                <span className={`activity-dot ${activity.dot}`} />
                <span className="activity-text">{activity.text}</span>
              </div>
              <span className="activity-time">{activity.time}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Status Messages */}
      {problemStatus.error && <p className="form-status error">{problemStatus.error}</p>}
      {studentStatus.error && <p className="form-status error">{studentStatus.error}</p>}
      {facultyStatus.error && <p className="form-status error">{facultyStatus.error}</p>}
      {logStatus.error && <p className="form-status error">{logStatus.error}</p>}

      {/* Profile Management Section */}
      {activeTab === "overview" && (
        <section className="platform-section-card" style={{ marginTop: "1rem" }}>
          <div className="platform-section-head">
            <div>
              <p className="platform-section-label">Account settings</p>
              <h2>Admin Profile Settings</h2>
            </div>
          </div>
          <AccountSection
            role="admin"
            session={session}
            saveSession={(nextSession) => {
              saveAdminSession(nextSession);
              setSession(nextSession);
            }}
          />
        </section>
      )}
    </PlatformLayout>
  );
}
