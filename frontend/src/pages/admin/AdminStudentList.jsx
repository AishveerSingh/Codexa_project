import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PlatformLayout, PlatformSection, PlatformStats } from "../../components/PlatformLayout";
import { clearAdminSession, getAdminSession, getAuthHeaders } from "../../utils/session";
import { branchOptions, buildSemesterOptions, sectionOptions } from "../../types/course";


const apiBaseUrl = import.meta.env.VITE_API_URL || "https://codexa-project.onrender.com/api";
const initialStudentForm = {
  fullName: "",
  email: "",
  password: "",
  rollNumber: "",
  branch: branchOptions[0],
  semester: buildSemesterOptions()[0],
  section: sectionOptions[0],
  batch: "2024-2028"
};

export default function AdminStudentList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "list";

  const session = getAdminSession();
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    semester: ""
  });
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [status, setStatus] = useState({
    loading: true,
    error: ""
  });
  const [createStatus, setCreateStatus] = useState({ message: "", error: "" });
  const [isCreating, setIsCreating] = useState(false);

  const [activeResetStudentId, setActiveResetStudentId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetStatus, setResetStatus] = useState({ message: "", error: "" });
  const [isResetting, setIsResetting] = useState(false);

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [submissionFilters, setSubmissionFilters] = useState({
    problemId: "",
    status: "",
    language: ""
  });
  const [submissionStatus, setSubmissionStatus] = useState({
    loading: true,
    error: ""
  });
  const [problems, setProblems] = useState([]);

  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    userId: null,
    userName: null,
    role: "student",
    isDeleting: false,
    statusMessage: "",
    statusType: ""
  });


  async function handleCreateStudent(event) {
    event.preventDefault();
    setIsCreating(true);
    setCreateStatus({ message: "", error: "" });

    try {
      const response = await fetch(`${apiBaseUrl}/users/student-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(session?.token)
        },
        body: JSON.stringify(studentForm)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create student account.");
      }

      setCreateStatus({
        message: data.message || "Student account created successfully.",
        error: ""
      });
      setStudentForm(initialStudentForm);
      await new Promise((resolve) => setTimeout(resolve, 0));
      navigate(0);
    } catch (error) {
      setCreateStatus({
        message: "",
        error: error.message
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleResetPassword(event, studentId) {
    event.preventDefault();
    if (newPassword.trim().length < 8) {
      setResetStatus({
        message: "",
        error: "Password must be at least 8 characters long."
      });
      return;
    }

    setIsResetting(true);
    setResetStatus({ message: "", error: "" });

    try {
      const response = await fetch(`${apiBaseUrl}/users/${studentId}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(session?.token)
        },
        body: JSON.stringify({ newPassword: newPassword.trim() })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setResetStatus({
        message: data.message || "Password reset successfully.",
        error: ""
      });
      setNewPassword("");
      setTimeout(() => {
        setActiveResetStudentId(null);
        setResetStatus({ message: "", error: "" });
      }, 3000);
    } catch (error) {
      setResetStatus({
        message: "",
        error: error.message
      });
    } finally {
      setIsResetting(false);
    }
  }

  function handleDeleteStudent(studentId, fullName) {
    setDeleteConfirm({
      show: true,
      userId: studentId,
      userName: fullName,
      role: "student",
      isDeleting: false,
      statusMessage: "",
      statusType: ""
    });
  }

  async function confirmDeleteStudent() {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/users/${deleteConfirm.userId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(session?.token)
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete student account.");
      }

      setStudents((prev) => prev.filter((s) => s.id !== deleteConfirm.userId));
      setDeleteConfirm((prev) => ({
        ...prev,
        isDeleting: false,
        statusMessage: data.message || "Student account deleted successfully.",
        statusType: "success"
      }));
    } catch (error) {
      setDeleteConfirm((prev) => ({
        ...prev,
        isDeleting: false,
        statusMessage: error.message,
        statusType: "error"
      }));
    }
  }

  function closeDeleteModal() {
    setDeleteConfirm({
      show: false,
      userId: null,
      userName: null,
      role: "student",
      isDeleting: false,
      statusMessage: "",
      statusType: ""
    });
  }



  function handleExpiredAdminSession(message = "Your admin session expired. Please log in again.") {
    clearAdminSession();
    setStudents([]);
    setStatus({
      loading: false,
      error: message
    });

    window.setTimeout(() => {
      navigate("/admin/login");
    }, 300);
  }

  useEffect(() => {
    if (activeTab !== "list") return;

    let isMounted = true;

    async function loadStudents() {
      setStatus({
        loading: true,
        error: ""
      });

      if (!session?.token) {
        if (isMounted) {
          setStudents([]);
          setStatus({
            loading: false,
            error: "Log in as an admin to view students."
          });
        }
        return;
      }

      try {
        const params = new URLSearchParams({
          role: "student"
        });

        if (filters.search.trim()) {
          params.set("search", filters.search.trim());
        }

        const response = await fetch(`${apiBaseUrl}/users?${params.toString()}`, {
          headers: {
            ...getAuthHeaders(session.token)
          }
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            handleExpiredAdminSession(data.message || "Your admin session expired. Please log in again.");
            return;
          }

          throw new Error(data.message || "Unable to load students.");
        }

        if (isMounted) {
          setStudents(data);
          setStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [filters.search, session?.token, activeTab]);

  useEffect(() => {
    if (activeTab !== "submissions") return;

    let isMounted = true;

    async function loadProblems() {
      try {
        const response = await fetch(`${apiBaseUrl}/problems`);
        const data = await response.json();
        if (response.ok && isMounted) {
          setProblems(data);
        }
      } catch (error) {
        console.error("Failed to load problems:", error);
      }
    }

    async function loadAllSubmissions() {
      setSubmissionStatus({
        loading: true,
        error: ""
      });

      if (!session?.token) {
        setSubmissionStatus({
          loading: false,
          error: "Log in as an admin to view submissions."
        });
        return;
      }

      try {
        const params = new URLSearchParams();
        if (submissionFilters.problemId) {
          params.set("problemId", submissionFilters.problemId);
        }
        if (submissionFilters.status) {
          params.set("status", submissionFilters.status);
        }
        if (submissionFilters.language) {
          params.set("language", submissionFilters.language);
        }

        const response = await fetch(`${apiBaseUrl}/submissions?${params.toString()}`, {
          headers: {
            ...getAuthHeaders(session.token)
          }
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            handleExpiredAdminSession(data.message || "Your admin session expired. Please log in again.");
            return;
          }
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

    loadProblems();
    loadAllSubmissions();

    return () => {
      isMounted = false;
    };
  }, [submissionFilters.language, submissionFilters.problemId, submissionFilters.status, session?.token, activeTab]);

  // Determine page meta layout
  let pageTitle = "View all students on the platform";
  let pageSubtitle = "Search the roster, compare submission activity, and open any learner's submission history from one review screen.";
  let pageMeta = `${students.length} students`;

  if (activeTab === "add") {
    pageTitle = "Add Student Login";
    pageSubtitle = "Create student accounts with college credentials, academic details, and temporary passwords.";
    pageMeta = "New registration";
  } else if (activeTab === "submissions") {
    pageTitle = "All Student Submissions";
    pageSubtitle = "Real-time stream of all student coding attempts, code listings, and execution verdicts.";
    pageMeta = `${submissions.length} total attempts`;
  }

  return (
    <PlatformLayout
      role="admin"
      eyebrow={activeTab === "add" ? "Register Users" : activeTab === "submissions" ? "Verdicts stream" : "Student Directory"}
      title={pageTitle}
      subtitle={pageSubtitle}
      meta={pageMeta}
      sidebarNote={
        activeTab === "add"
          ? "Create a temporary password for new students. They can update it from their own Settings panel."
          : activeTab === "submissions"
            ? "Filter by specific language, verdict status, or coding problem to audit and debug code runs across all students."
            : "This directory should feel like an assessment platform roster: quick search, visible activity metrics, and one-click drill-down into attempts."
      }
    >
      {activeTab === "list" && (
        <>
          {/* Top Overview Metrics */}
          {(() => {
            const uniqueBranches = Array.from(new Set(students.map((s) => s.profile?.branch).filter(Boolean)));
            const uniqueBatches = Array.from(new Set(students.map((s) => s.profile?.batch).filter(Boolean)));
            return (
              <PlatformStats
                items={[
                  {
                    label: "Enrolled Students",
                    value: students.length,
                    note: "Total student accounts registered"
                  },
                  {
                    label: "Academic Branches",
                    value: uniqueBranches.length > 0 ? uniqueBranches.length : 1,
                    note: uniqueBranches.length > 0 ? uniqueBranches.join(", ") : "All engineering branches"
                  },
                  {
                    label: "Student Batches",
                    value: uniqueBatches.length > 0 ? uniqueBatches.length : 1,
                    note: uniqueBatches.length > 0 ? uniqueBatches.join(", ") : "Enrolled cohorts"
                  }
                ]}
              />
            );
          })()}

          {/* Student Directory Section */}
          {(() => {
            const filteredStudents = students.filter((student) => {
              if (filters.branch && student.profile?.branch !== filters.branch) return false;
              if (filters.semester && String(student.profile?.semester) !== String(filters.semester)) return false;
              return true;
            });

            return (
              <PlatformSection
                label="Directory"
                title="Student Roster & Accounts"
                actions={
                  <Link className="compact-btn compact-btn-primary" to="/admin/add-user?role=student" style={{ textDecoration: "none" }}>
                    + Add New Student
                  </Link>
                }
              >
                {/* Search & Filter Toolbar */}
                <div className="roster-toolbar">
                  <div className="roster-search-wrapper">
                    <svg className="roster-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      aria-label="Search students"
                      className="roster-search-input"
                      name="search"
                      placeholder="Search by student name, email, or roll number..."
                      type="search"
                      value={filters.search}
                      onChange={(event) => {
                        setFilters((prev) => ({
                          ...prev,
                          search: event.target.value
                        }));
                      }}
                    />
                  </div>

                  <select
                    className="roster-filter-select"
                    value={filters.branch}
                    onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
                  >
                    <option value="">All Branches</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="EE">EE</option>
                  </select>

                  <select
                    className="roster-filter-select"
                    value={filters.semester}
                    onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
                  >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>

                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500", marginLeft: "auto" }}>
                    Showing {filteredStudents.length} of {students.length} students
                  </span>
                </div>

                {status.loading ? <p className="dashboard-copy">Loading students...</p> : null}
                {status.error ? <p className="form-status error">{status.error}</p> : null}

                {!status.loading && !status.error ? (
                  <>
                    {filteredStudents.length === 0 ? (
                      <p className="dashboard-copy" style={{ padding: "1.5rem 0", color: "#94a3b8" }}>
                        No students found matching your filters.
                      </p>
                    ) : (
                      <div className="roster-grid">
                        {filteredStudents.map((student) => {
                          const acceptedRuns = student.accepted_count || 0;
                          const totalSubmissions = student.submission_count || 0;
                          const progressPct = totalSubmissions > 0 ? Math.min(100, Math.round((acceptedRuns / totalSubmissions) * 100)) : 0;
                          const initials = student.full_name
                            ? student.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "ST";

                          return (
                            <article className="student-roster-card" key={student.id}>
                              <div className="student-card-header">
                                <div className="student-info-meta">
                                  <div className="student-avatar-circle">
                                    {initials}
                                  </div>
                                  <div>
                                    <h3 className="student-name">{student.full_name}</h3>
                                    <span className="student-email">{student.email}</span>
                                  </div>
                                </div>

                                <div className="student-badges-container">
                                  <span className="roll-number-badge">
                                    ROLL: {student.profile?.roll_number || "N/A"}
                                  </span>
                                  <span className="academic-meta-badge">
                                    {student.profile?.branch || "CSE"} • Sem {student.profile?.semester || "1"} • Sec {student.profile?.section || "A"} • {student.profile?.batch || "2023-2027"}
                                  </span>
                                </div>
                              </div>

                              <div style={{ margin: "0.85rem 0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", marginBottom: "6px" }}>
                                  <span style={{ color: "#94a3b8" }}>Platform Success Rate</span>
                                  <span style={{ color: progressPct > 70 ? "#22c55e" : progressPct > 35 ? "#38bdf8" : "#f59e0b" }}>
                                    {progressPct}% ({acceptedRuns} accepted)
                                  </span>
                                </div>
                                <div className="progress-meter" style={{ height: "6px", background: "rgba(148, 163, 184, 0.12)", borderRadius: "6px", overflow: "hidden" }}>
                                  <div
                                    className="progress-meter-fill"
                                    style={{
                                      width: `${progressPct}%`,
                                      background: progressPct > 70 ? "linear-gradient(90deg, #22c55e, #16a34a)" : progressPct > 35 ? "linear-gradient(90deg, #38bdf8, #0284c7)" : "linear-gradient(90deg, #f59e0b, #d97706)",
                                      height: "100%",
                                      borderRadius: "6px"
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="compact-action-row">
                                <Link
                                  className="compact-btn compact-btn-primary"
                                  to={`/admin/students/${student.id}/submissions`}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                  Open Student Progress →
                                </Link>
                                <button
                                  className="compact-btn compact-btn-secondary"
                                  type="button"
                                  onClick={() => {
                                    if (activeResetStudentId === student.id) {
                                      setActiveResetStudentId(null);
                                      setNewPassword("");
                                      setResetStatus({ message: "", error: "" });
                                    } else {
                                      setActiveResetStudentId(student.id);
                                      setNewPassword("");
                                      setResetStatus({ message: "", error: "" });
                                    }
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                  {activeResetStudentId === student.id ? "Cancel" : "Reset Password"}
                                </button>
                                <button
                                  className="compact-btn compact-btn-danger"
                                  type="button"
                                  onClick={() => handleDeleteStudent(student.id, student.full_name)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  Delete
                                </button>
                              </div>

                              {activeResetStudentId === student.id ? (
                                <form
                                  className="auth-form"
                                  onSubmit={(e) => handleResetPassword(e, student.id)}
                                  style={{
                                    marginTop: "1rem",
                                    padding: "1rem",
                                    background: "rgba(15, 23, 42, 0.6)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.1)"
                                  }}
                                >
                                  <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#f8fafc" }}>
                                    Reset password for {student.full_name}
                                  </strong>
                                  <input
                                    placeholder="Enter new password (min 6 chars)"
                                    required
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{
                                      width: "100%",
                                      padding: "0.55rem 0.8rem",
                                      marginBottom: "0.75rem",
                                      background: "rgba(0, 0, 0, 0.3)",
                                      border: "1px solid rgba(255, 255, 255, 0.15)",
                                      borderRadius: "6px",
                                      color: "#fff",
                                      fontSize: "0.875rem"
                                    }}
                                  />
                                  <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                      className="compact-btn compact-btn-primary"
                                      type="submit"
                                      disabled={isResetting}
                                    >
                                      {isResetting ? "Resetting..." : "Confirm Password Reset"}
                                    </button>
                                    <button
                                      className="compact-btn compact-btn-secondary"
                                      type="button"
                                      onClick={() => setActiveResetStudentId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  {resetStatus.message ? (
                                    <p className="form-status success" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{resetStatus.message}</p>
                                  ) : null}
                                  {resetStatus.error ? (
                                    <p className="form-status error" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{resetStatus.error}</p>
                                  ) : null}
                                </form>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : null}
              </PlatformSection>
            );
          })()}
        </>
      )}

      {activeTab === "add" && (
        <PlatformSection label="Registration Form" title="Enter Student Account Details">
          <form className="auth-form course-form-grid" onSubmit={handleCreateStudent} style={{ marginBottom: "1.5rem" }}>
            <strong>Create student account</strong>
            <input
              placeholder="Full name"
              value={studentForm.fullName}
              onChange={(event) => setStudentForm((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
            <input
              placeholder="College email (name_rollno@college.com)"
              value={studentForm.email}
              onChange={(event) => setStudentForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <input
              type="password"
              minLength={8}
              placeholder="Temporary password"
              value={studentForm.password}
              onChange={(event) => setStudentForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
            <input
              placeholder="Roll number"
              value={studentForm.rollNumber}
              onChange={(event) => setStudentForm((current) => ({ ...current, rollNumber: event.target.value }))}
              required
            />
            <select
              value={studentForm.branch}
              onChange={(event) => setStudentForm((current) => ({ ...current, branch: event.target.value }))}
            >
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <select
              value={studentForm.semester}
              onChange={(event) => setStudentForm((current) => ({ ...current, semester: Number(event.target.value) }))}
            >
              {buildSemesterOptions().map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
            <select
              value={studentForm.section}
              onChange={(event) => setStudentForm((current) => ({ ...current, section: event.target.value }))}
            >
              {sectionOptions.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
            <input
              placeholder="Batch"
              value={studentForm.batch}
              onChange={(event) => setStudentForm((current) => ({ ...current, batch: event.target.value }))}
              required
            />
            <button className="auth-button admin-button" type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create student login"}
            </button>
            {createStatus.message ? <p className="form-status success">{createStatus.message}</p> : null}
            {createStatus.error ? <p className="form-status error">{createStatus.error}</p> : null}
          </form>
        </PlatformSection>
      )}

      {activeTab === "submissions" && (
        <>
          <PlatformSection label="Filters" title="Narrow the submission stream">
            <div className="filter-bar">
              <select
                aria-label="Filter submissions by problem"
                className="filter-select"
                name="problemId"
                value={submissionFilters.problemId}
                onChange={(event) => {
                  setSubmissionFilters((currentFilters) => ({
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
                value={submissionFilters.status}
                onChange={(event) => {
                  setSubmissionFilters((currentFilters) => ({
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
                value={submissionFilters.language}
                onChange={(event) => {
                  setSubmissionFilters((currentFilters) => ({
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
          </PlatformSection>

          <PlatformSection label="Attempt History" title="Inspect recent submissions across all students">
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                          <strong>{submission.problem_title}</strong>
                          <span className="question-meta" style={{ fontWeight: 500 }}>
                            by {submission.student_name || "Unknown Student"} ({submission.student_email || "no email"})
                          </span>
                        </div>
                        <p className="question-meta">
                          {submission.language.toUpperCase()} - {submission.difficulty}
                        </p>
                        {submission.compiler_output ? (
                          <p className="question-meta">{submission.compiler_output.split("\n")[0]}</p>
                        ) : null}
                        <p className="history-snippet">{submission.source_code}</p>
                      </article>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </PlatformSection>
        </>
      )}

      {deleteConfirm.show && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                color: "#ef4444"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                </svg>
              </div>
            </div>
            
            {deleteConfirm.statusMessage ? (
              <>
                <h2 style={{ fontSize: "1.35rem", margin: "0 0 0.5rem" }}>
                  {deleteConfirm.statusType === "success" ? "Success" : "Error"}
                </h2>
                <p style={{ color: deleteConfirm.statusType === "success" ? "#10b981" : "#ef4444", marginBottom: "1.5rem" }}>
                  {deleteConfirm.statusMessage}
                </p>
                <button
                  className="auth-button admin-button"
                  style={{ width: "100%", marginTop: 0 }}
                  onClick={closeDeleteModal}
                >
                  Okay
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: "1.35rem", margin: "0 0 0.5rem" }}>Delete Student</h2>
                <p style={{ opacity: 0.8, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                  Are you sure you want to permanently delete student <strong>{deleteConfirm.userName}</strong>? This action will cascade delete all associated profiles, enrollments, and submissions.
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className="auth-button ghost-button"
                    style={{ flex: 1, marginTop: 0, border: "1px solid rgba(148, 163, 184, 0.3)" }}
                    onClick={closeDeleteModal}
                    disabled={deleteConfirm.isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="auth-button"
                    style={{
                      flex: 1,
                      marginTop: 0,
                      background: "#ef4444",
                      borderColor: "#ef4444",
                      color: "#ffffff"
                    }}
                    onClick={confirmDeleteStudent}
                    disabled={deleteConfirm.isDeleting}
                  >
                    {deleteConfirm.isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PlatformLayout>
  );
}
