import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlatformLayout } from "../../components/PlatformLayout";
import { apiRequest } from "../../utils/api";
import { getAdminSession } from "../../utils/session";

export default function AdminExamsPage() {
  const session = getAdminSession();
  const user = session?.user;

  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCodingModal, setShowCodingModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);

  // Form state for scheduling MST/Assignment
  const [scheduleForm, setScheduleForm] = useState({
    courseId: "",
    title: "",
    description: "",
    type: "coding",
    isMst: true,
    startTime: "",
    endTime: "",
    durationMinutes: 90,
    maxScore: 50,
    isProctored: true
  });
  const [scheduleStatus, setScheduleStatus] = useState({ loading: false, success: "", error: "" });

  // Form state for editing MST parameters
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "coding",
    isMst: true,
    startTime: "",
    endTime: "",
    durationMinutes: 90,
    maxScore: 50,
    isProctored: true
  });
  const [editStatus, setEditStatus] = useState({ loading: false, success: "", error: "" });

  // Form state for adding coding content to MST
  const [codingForm, setCodingForm] = useState({
    title: "",
    statement: "",
    difficulty: "medium",
    inputFormat: "Standard Space-separated integers",
    outputFormat: "Output integer / array",
    constraintsText: "1 <= N <= 10^5",
    sampleInput: "",
    sampleOutput: "",
    hiddenInput: "",
    hiddenOutput: ""
  });
  const [codingStatus, setCodingStatus] = useState({ loading: false, success: "", error: "" });

  async function loadAdminExams() {
    setLoading(true);
    setError("");
    try {
      if (!session?.token) {
        setLoading(false);
        return;
      }

      const coursesData = await apiRequest("/courses", {}, session.token);
      const fetchedCourses = Array.isArray(coursesData) ? coursesData : [];
      setCourses(fetchedCourses);

      const fetchedExams = [];

      for (const course of fetchedCourses) {
        try {
          const assignments = await apiRequest(`/courses/${course.id}/assignments`, {}, session.token);
          if (Array.isArray(assignments)) {
            for (const item of assignments) {
              const now = new Date();
              const start = item.startTime ? new Date(item.startTime) : (item.dueDate ? new Date(item.dueDate) : null);
              const end = item.endTime ? new Date(item.endTime) : (item.dueDate ? new Date(item.dueDate) : null);

              const isMst = item.isMst || item.title.toLowerCase().includes("mst") || item.title.toLowerCase().includes("mid-semester");
              const isQuiz = item.title.toLowerCase().includes("quiz") || item.title.toLowerCase().includes("unit");

              let status = "upcoming";
              if (start && end) {
                if (now >= start && now <= end) {
                  status = "live";
                } else if (now > end) {
                  status = "closed";
                } else {
                  status = "upcoming";
                }
              }

              fetchedExams.push({
                id: item.id,
                courseId: course.id,
                type: isMst ? "mst" : isQuiz ? "quiz" : "assignment",
                isMst: Boolean(isMst),
                title: item.title,
                description: item.description || "Institutional paper.",
                courseCode: course.code || "COURSE",
                courseTitle: course.title || "Course",
                status,
                startRaw: start,
                endRaw: end,
                startTime: start ? start.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not Scheduled",
                endTime: end ? end.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "TBA",
                durationMinutes: item.durationMinutes || 90,
                totalMarks: item.maxScore || 100,
                submissionsCount: item.submissions?.length || 0,
                proctored: item.isProctored !== undefined ? item.isProctored : true
              });
            }
          }
        } catch (err) {
          console.warn(`Could not fetch assignments for course ${course.id}:`, err);
        }
      }

      setExams(fetchedExams);
    } catch (err) {
      console.error("Failed to load admin exams:", err);
      setError(err.message || "Failed to load examination schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminExams();
  }, [session?.token]);

  async function handleScheduleSubmit(e) {
    e.preventDefault();
    setScheduleStatus({ loading: true, success: "", error: "" });

    if (!scheduleForm.courseId) {
      setScheduleStatus({ loading: false, success: "", error: "Please select a course for the MST exam." });
      return;
    }

    try {
      await apiRequest(
        `/courses/${scheduleForm.courseId}/assignments`,
        {
          method: "POST",
          body: JSON.stringify({
            title: scheduleForm.title,
            description: scheduleForm.description,
            type: scheduleForm.type,
            startTime: scheduleForm.startTime ? new Date(scheduleForm.startTime).toISOString() : null,
            endTime: scheduleForm.endTime ? new Date(scheduleForm.endTime).toISOString() : null,
            dueDate: scheduleForm.endTime ? new Date(scheduleForm.endTime).toISOString() : null,
            durationMinutes: Number(scheduleForm.durationMinutes),
            maxScore: Number(scheduleForm.maxScore),
            isMst: scheduleForm.isMst,
            isProctored: scheduleForm.isProctored
          })
        },
        session.token
      );

      setScheduleStatus({ loading: false, success: "MST Exam scheduled successfully!", error: "" });
      setShowScheduleModal(false);
      loadAdminExams();
    } catch (err) {
      setScheduleStatus({ loading: false, success: "", error: err.message });
    }
  }

  function openEditModal(exam) {
    setShowEditModal(exam);
    setEditForm({
      title: exam.title,
      description: exam.description,
      type: exam.type,
      isMst: exam.isMst,
      startTime: exam.startRaw ? new Date(exam.startRaw.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
      endTime: exam.endRaw ? new Date(exam.endRaw.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
      durationMinutes: exam.durationMinutes,
      maxScore: exam.totalMarks,
      isProctored: exam.proctored
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditStatus({ loading: true, success: "", error: "" });

    try {
      await apiRequest(
        `/courses/${showEditModal.courseId}/assignments/${showEditModal.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: editForm.title,
            description: editForm.description,
            type: editForm.type,
            startTime: editForm.startTime ? new Date(editForm.startTime).toISOString() : null,
            endTime: editForm.endTime ? new Date(editForm.endTime).toISOString() : null,
            dueDate: editForm.endTime ? new Date(editForm.endTime).toISOString() : null,
            durationMinutes: Number(editForm.durationMinutes),
            maxScore: Number(editForm.maxScore),
            isMst: editForm.isMst,
            isProctored: editForm.isProctored
          })
        },
        session.token
      );

      setEditStatus({ loading: false, success: "MST parameters updated successfully!", error: "" });
      setShowEditModal(null);
      loadAdminExams();
    } catch (err) {
      setEditStatus({ loading: false, success: "", error: err.message });
    }
  }

  async function handleDeleteExam(exam) {
    if (!window.confirm(`Are you sure you want to delete the examination "${exam.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(
        `/courses/${exam.courseId}/assignments/${exam.id}`,
        { method: "DELETE" },
        session.token
      );
      loadAdminExams();
    } catch (err) {
      alert("Failed to delete exam: " + err.message);
    }
  }

  async function handleAddCodingProblem(e) {
    e.preventDefault();
    setCodingStatus({ loading: true, success: "", error: "" });

    if (!showCodingModal?.courseId) {
      setCodingStatus({ loading: false, success: "", error: "Target course missing." });
      return;
    }

    try {
      await apiRequest(
        `/courses/${showCodingModal.courseId}/coding-problems`,
        {
          method: "POST",
          body: JSON.stringify({
            title: codingForm.title,
            statement: codingForm.statement,
            difficulty: codingForm.difficulty,
            inputFormat: codingForm.inputFormat,
            outputFormat: codingForm.outputFormat,
            constraintsText: codingForm.constraintsText,
            sampleTestCases: codingForm.sampleInput ? [{ input_data: codingForm.sampleInput, expected_output: codingForm.sampleOutput }] : [],
            hiddenTestCases: codingForm.hiddenInput ? [{ input_data: codingForm.hiddenInput, expected_output: codingForm.hiddenOutput }] : []
          })
        },
        session.token
      );

      setCodingStatus({ loading: false, success: "Coding Problem added successfully!", error: "" });
      setShowCodingModal(null);
      loadAdminExams();
    } catch (err) {
      setCodingStatus({ loading: false, success: "", error: err.message });
    }
  }

  const filteredExams = exams.filter((exam) => {
    if (filterTab === "mst" && !exam.isMst && exam.type !== "mst") return false;
    if (filterTab === "quiz" && exam.type !== "quiz" && exam.type !== "assignment") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        exam.title.toLowerCase().includes(q) ||
        exam.courseCode.toLowerCase().includes(q) ||
        exam.courseTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalExamsCount = exams.length;
  const liveExamsCount = exams.filter((e) => e.status === "live").length;

  return (
    <PlatformLayout role="admin" activeItem="/admin/exams">
      <div className="lc-dashboard-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        
        {/* Header */}
        <div className="lc-page-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Admin Full Access • Customization Controller
              </span>
            </div>
            <h1 className="lc-card-title" style={{ fontSize: "2rem", fontWeight: 800, color: "var(--lc-text-primary)" }}>
              Admin MST & Examination Manager
            </h1>
            <p className="lc-card-subtitle" style={{ color: "var(--lc-text-muted)", marginTop: "0.25rem" }}>
              Full authority to schedule, edit parameters, adjust start/end timestamps, add coding problems, or delete MST papers.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={() => setShowScheduleModal(true)}
              style={{
                background: "var(--lc-accent, #ff7e29)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "0.75rem 1.25rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px var(--lc-brand-glow, rgba(255, 126, 41, 0.3))",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Schedule MST Exam
            </button>

            <div style={{
              background: "var(--lc-card-bg)",
              border: "1px solid var(--lc-border)",
              borderRadius: "12px",
              padding: "0.75rem 1.25rem",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", color: "var(--lc-text-muted)", display: "block" }}>Total Papers</span>
              <strong style={{ fontSize: "1.25rem", color: "var(--lc-text-primary)" }}>
                {totalExamsCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--lc-border)",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { id: "all", label: "All Papers" },
              { id: "mst", label: "MST Exams" },
              { id: "quiz", label: "Quizzes & Assignments" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  background: filterTab === tab.id ? "var(--lc-accent, #ff7e29)" : "rgba(255,255,255,0.05)",
                  color: filterTab === tab.id ? "#fff" : "var(--lc-text-muted)",
                  border: "1px solid",
                  borderColor: filterTab === tab.id ? "var(--lc-accent, #ff7e29)" : "var(--lc-border)",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={loadAdminExams}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "var(--lc-text-primary)",
                border: "1px solid var(--lc-border)",
                borderRadius: "8px",
                padding: "0.45rem 0.85rem",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              🔄 Refresh
            </button>
            <div style={{ width: "220px" }}>
              <input
                type="text"
                placeholder="Search paper or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="lc-form-input"
                style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--lc-text-muted)" }}>
            <p>Loading database papers...</p>
          </div>
        )}

        {error && (
          <div className="lc-error-banner" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </div>
        )}

        {/* Admin Exam Cards */}
        {!loading && filteredExams.length === 0 ? (
          <div style={{
            background: "var(--lc-card-bg)",
            border: "1px dashed var(--lc-border)",
            borderRadius: "16px",
            padding: "3rem",
            textAlign: "center",
            color: "var(--lc-text-muted)"
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", opacity: 0.5 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>No examination papers found</h3>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Click "+ Schedule Institutional MST Exam" above to create an exam paper.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                style={{
                  background: "var(--lc-card-bg)",
                  border: exam.status === "live" ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid var(--lc-border)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#3b82f6",
                      background: "rgba(59, 130, 246, 0.12)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(59, 130, 246, 0.3)"
                    }}>
                      {exam.courseCode}
                    </span>

                    {exam.status === "live" && (
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#10b981",
                        background: "rgba(16, 185, 129, 0.15)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                        LIVE NOW
                      </span>
                    )}

                    {exam.status === "upcoming" && (
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#f59e0b",
                        background: "rgba(245, 158, 11, 0.15)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(245, 158, 11, 0.3)"
                      }}>
                        SCHEDULED
                      </span>
                    )}

                    {exam.status === "closed" && (
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--lc-text-muted)",
                        background: "rgba(255, 255, 255, 0.08)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        border: "1px solid var(--lc-border)"
                      }}>
                        CLOSED
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--lc-text-primary)", marginBottom: "0.35rem" }}>
                    {exam.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "1.25rem" }}>
                    {exam.courseTitle}
                  </p>

                  <div style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "10px",
                    padding: "0.85rem 1rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginBottom: "1.25rem",
                    fontSize: "0.8rem"
                  }}>
                    <div>
                      <span style={{ color: "var(--lc-text-muted)", display: "block" }}>Start Time</span>
                      <strong style={{ color: "var(--lc-text-primary)" }}>{exam.startTime}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--lc-text-muted)", display: "block" }}>End Time</span>
                      <strong style={{ color: "var(--lc-text-primary)" }}>{exam.endTime}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--lc-text-muted)", display: "block" }}>Duration</span>
                      <strong style={{ color: "var(--lc-text-primary)" }}>{exam.durationMinutes} Mins ({exam.totalMarks} Marks)</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--lc-text-muted)", display: "block" }}>Submissions</span>
                      <strong style={{ color: "#3b82f6" }}>{exam.submissionsCount} Submissions</strong>
                    </div>
                  </div>
                </div>

                {/* Content Actions for Admin */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => openEditModal(exam)}
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "var(--lc-text-primary)",
                        border: "1px solid var(--lc-border)",
                        borderRadius: "8px",
                        padding: "0.55rem",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      ✏️ Edit Parameters
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        padding: "0.55rem 0.8rem",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCodingModal(exam)}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem"
                    }}
                  >
                    💻 Add Coding Problem & Test Cases
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem"
          }}>
            <div style={{
              background: "var(--lc-card-bg)",
              border: "1px solid var(--lc-border)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--lc-text-primary)" }}>
                Schedule Institutional MST Exam
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "1.5rem" }}>
                Select target course, title, start/end timestamps, and duration.
              </p>

              {scheduleStatus.error && (
                <div className="lc-error-banner" style={{ marginBottom: "1rem" }}>
                  <span>{scheduleStatus.error}</span>
                </div>
              )}

              <form onSubmit={handleScheduleSubmit}>
                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Target Course</label>
                  <select
                    className="lc-form-input"
                    value={scheduleForm.courseId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, courseId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Examination Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-Semester Examination 1 (MST-1)"
                    className="lc-form-input"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Description & Syllabus</label>
                  <textarea
                    placeholder="e.g. Institutional MST covering Units 1 & 2."
                    className="lc-form-input"
                    rows="2"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="lc-form-input"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="lc-form-input"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="300"
                      className="lc-form-input"
                      value={scheduleForm.durationMinutes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, durationMinutes: e.target.value })}
                      required
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Total Marks</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      className="lc-form-input"
                      value={scheduleForm.maxScore}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, maxScore: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.2rem",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleStatus.loading}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.4rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {scheduleStatus.loading ? "Scheduling..." : "Schedule MST"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit MST Parameters Modal */}
        {showEditModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem"
          }}>
            <div style={{
              background: "var(--lc-card-bg)",
              border: "1px solid var(--lc-border)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--lc-text-primary)" }}>
                Edit MST Parameters: {showEditModal.title}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "1.5rem" }}>
                Modify title, start/end timestamps, max score, or proctoring rules.
              </p>

              {editStatus.error && (
                <div className="lc-error-banner" style={{ marginBottom: "1rem" }}>
                  <span>{editStatus.error}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit}>
                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Paper Title</label>
                  <input
                    type="text"
                    className="lc-form-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Description / Syllabus</label>
                  <textarea
                    className="lc-form-input"
                    rows="2"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="lc-form-input"
                      value={editForm.startTime}
                      onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="lc-form-input"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="300"
                      className="lc-form-input"
                      value={editForm.durationMinutes}
                      onChange={(e) => setEditForm({ ...editForm, durationMinutes: e.target.value })}
                      required
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Total Marks</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      className="lc-form-input"
                      value={editForm.maxScore}
                      onChange={(e) => setEditForm({ ...editForm, maxScore: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.2rem",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editStatus.loading}
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.4rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {editStatus.loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Coding Content to MST Modal */}
        {showCodingModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem"
          }}>
            <div style={{
              background: "var(--lc-card-bg)",
              border: "1px solid var(--lc-border)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "640px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto"
            }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--lc-text-primary)" }}>
                Add Coding Problem to {showCodingModal.title}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "1.5rem" }}>
                Target Course: {showCodingModal.courseCode} - {showCodingModal.courseTitle}
              </p>

              {codingStatus.error && (
                <div className="lc-error-banner" style={{ marginBottom: "1rem" }}>
                  <span>{codingStatus.error}</span>
                </div>
              )}

              <form onSubmit={handleAddCodingProblem}>
                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Problem Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Reverse a Linked List / Array Sum"
                    className="lc-form-input"
                    value={codingForm.title}
                    onChange={(e) => setCodingForm({ ...codingForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Difficulty Level</label>
                    <select
                      className="lc-form-input"
                      value={codingForm.difficulty}
                      onChange={(e) => setCodingForm({ ...codingForm, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Constraints</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 <= N <= 10^5"
                      className="lc-form-input"
                      value={codingForm.constraintsText}
                      onChange={(e) => setCodingForm({ ...codingForm, constraintsText: e.target.value })}
                    />
                  </div>
                </div>

                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Problem Description & Statement</label>
                  <textarea
                    placeholder="Detailed explanation of algorithmic problem..."
                    className="lc-form-input"
                    rows="3"
                    value={codingForm.statement}
                    onChange={(e) => setCodingForm({ ...codingForm, statement: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Sample Input Case</label>
                    <textarea
                      placeholder="e.g. 5\n1 2 3 4 5"
                      className="lc-form-input"
                      rows="2"
                      value={codingForm.sampleInput}
                      onChange={(e) => setCodingForm({ ...codingForm, sampleInput: e.target.value })}
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Expected Sample Output</label>
                    <textarea
                      placeholder="e.g. 5 4 3 2 1"
                      className="lc-form-input"
                      rows="2"
                      value={codingForm.sampleOutput}
                      onChange={(e) => setCodingForm({ ...codingForm, sampleOutput: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Hidden Evaluation Input</label>
                    <textarea
                      placeholder="Input for automated judge evaluation..."
                      className="lc-form-input"
                      rows="2"
                      value={codingForm.hiddenInput}
                      onChange={(e) => setCodingForm({ ...codingForm, hiddenInput: e.target.value })}
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Expected Hidden Output</label>
                    <textarea
                      placeholder="Expected output for evaluation..."
                      className="lc-form-input"
                      rows="2"
                      value={codingForm.hiddenOutput}
                      onChange={(e) => setCodingForm({ ...codingForm, hiddenOutput: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowCodingModal(null)}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.2rem",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={codingStatus.loading}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.4rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {codingStatus.loading ? "Adding Problem..." : "Save Coding Problem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
}
