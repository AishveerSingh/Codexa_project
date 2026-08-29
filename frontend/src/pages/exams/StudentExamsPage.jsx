import { useState, useEffect } from "react";
import { PlatformLayout } from "../../components/PlatformLayout";
import CourseAssessmentWorkspace from "../../components/CourseAssessmentWorkspace";
import { apiRequest } from "../../utils/api";
import { getStudentSession, getFacultySession, getAdminSession } from "../../utils/session";

export default function StudentExamsPage() {
  const activeSession = getStudentSession();
  const user = activeSession?.user;
  const userRole = "student";

  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExam, setActiveExam] = useState(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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

  async function loadExamsFromDatabase() {
    setLoading(true);
    setError("");
    try {
      if (!activeSession?.token) {
        setLoading(false);
        return;
      }

      const coursesData = await apiRequest("/courses", {}, activeSession.token);
      const fetchedCourses = Array.isArray(coursesData) ? coursesData : [];
      setCourses(fetchedCourses);

      const fetchedExams = [];

      for (const course of fetchedCourses) {
        try {
          const assignments = await apiRequest(`/courses/${course.id}/assignments`, {}, activeSession.token);
          if (Array.isArray(assignments)) {
            for (const item of assignments) {
              const now = new Date();
              const start = item.startTime ? new Date(item.startTime) : (item.dueDate ? new Date(item.dueDate) : null);
              const end = item.endTime ? new Date(item.endTime) : (item.dueDate ? new Date(item.dueDate) : null);

              const isMst = item.isMst || item.title.toLowerCase().includes("mst") || item.title.toLowerCase().includes("mid-semester");
              const isQuiz = item.title.toLowerCase().includes("quiz") || item.title.toLowerCase().includes("unit");

              const submission = item.submissions?.[0] || null;
              const isCompleted = submission && (submission.status === "graded" || submission.status === "submitted");

              let status = "upcoming";
              if (isCompleted) {
                status = "completed";
              } else if (start && end) {
                if (now >= start && now <= end) {
                  status = "live";
                } else if (now > end) {
                  status = "completed";
                } else {
                  status = "upcoming";
                }
              } else if (end && now <= end) {
                status = "live";
              }

              fetchedExams.push({
                id: item.id,
                courseId: course.id,
                type: isMst ? "mst" : isQuiz ? "quiz" : "assignment",
                isMst: Boolean(isMst),
                title: item.title,
                description: item.description || "Official institutional paper.",
                courseCode: course.code || "COURSE",
                courseTitle: course.title || "Course",
                instructor: course.instructors?.[0]?.full_name || course.instructor_name || "Faculty Instructor",
                status,
                startRaw: start,
                endRaw: end,
                startTime: start ? start.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled",
                endTime: end ? end.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "TBA",
                durationMinutes: item.durationMinutes || 90,
                totalMarks: item.maxScore || 100,
                targetBatch: item.targetBatch || item.target_batch || "ALL",
                targetYear: item.targetYear || item.target_year || "ALL",
                score: submission?.grade ?? null,
                submittedAt: submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null,
                proctored: item.isProctored !== undefined ? item.isProctored : true,
                instructions: [
                  "Ensure a stable internet connection before starting the examination.",
                  "Full-screen tab switching is monitored. Do not exit full-screen during timed paper.",
                  "Your code submissions and answers are auto-saved and recorded directly in the server database."
                ]
              });
            }
          }
        } catch (err) {
          console.warn(`Could not fetch assignments for course ${course.id}:`, err);
        }
      }

      setExams(fetchedExams);
    } catch (err) {
      console.error("Failed to load database exams:", err);
      setError(err.message || "Failed to load examination schedule from server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExamsFromDatabase();
  }, [activeSession?.token]);

  async function handleScheduleSubmit(e) {
    e.preventDefault();
    setScheduleStatus({ loading: true, success: "", error: "" });

    if (!scheduleForm.courseId) {
      setScheduleStatus({ loading: false, success: "", error: "Please select a course for the MST / Assignment." });
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
        activeSession.token
      );

      setScheduleStatus({ loading: false, success: "Examination paper / MST scheduled successfully!", error: "" });
      setShowScheduleModal(false);
      setScheduleForm({
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
      loadExamsFromDatabase();
    } catch (err) {
      setScheduleStatus({ loading: false, success: "", error: err.message });
    }
  }

  const filteredExams = exams.filter((exam) => {
    if (filterTab === "mst" && !exam.isMst && exam.type !== "mst") return false;
    if (filterTab === "quiz" && exam.type !== "quiz" && exam.type !== "assignment") return false;
    if (filterTab === "completed" && exam.status !== "completed") return false;
    if (filterTab === "all" && exam.status === "completed") return false;

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

  const liveExamsCount = exams.filter((e) => e.status === "live").length;
  const upcomingExamsCount = exams.filter((e) => e.status === "upcoming").length;
  const completedExamsCount = exams.filter((e) => e.status === "completed").length;

  if (activeExam) {
    return (
      <PlatformLayout role={userRole} activeItem={`/${userRole}/exams`}>
        <div style={{ padding: "1rem" }}>
          <button
            onClick={() => setActiveExam(null)}
            className="lc-submit-btn"
            style={{
              width: "auto",
              marginBottom: "1rem",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--lc-border)"
            }}
          >
            ← Exit Exam Workspace
          </button>
          <CourseAssessmentWorkspace
            assignmentId={activeExam.id}
            courseId={activeExam.courseId}
            exam={activeExam}
            courseTitle={`${activeExam.courseCode}: ${activeExam.courseTitle}`}
            assignmentTitle={activeExam.title}
            dueDate={activeExam.endTime}
            lastSubmission={activeExam.submittedAt || "In Progress..."}
          />
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout role={userRole} activeItem={`/${userRole}/exams`}>
      <div className="lc-dashboard-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        
        {/* Page Header */}
        <div className="lc-page-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span style={{
                background: userRole === "admin" ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 126, 41, 0.15)",
                color: userRole === "admin" ? "#ef4444" : "#ff7e29",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                border: userRole === "admin" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 126, 41, 0.3)",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                {userRole === "admin" ? "Admin Full Access • MST Controller" : userRole === "faculty" ? "Faculty Course Evaluations" : "Student Examination Portal"}
              </span>
            </div>
            <h1 className="lc-card-title" style={{ fontSize: "2rem", fontWeight: 800, color: "var(--lc-text-primary)" }}>
              Tests & Mid-Sem Examinations (MST)
            </h1>
            <p className="lc-card-subtitle" style={{ color: "var(--lc-text-muted)", marginTop: "0.25rem" }}>
              {userRole === "admin"
                ? "Full administrative control to schedule MST exams, configure start/end times, and manage anti-cheat proctoring across all departments."
                : userRole === "faculty"
                  ? "Create and manage course evaluation assignments and tests for your assigned classes."
                  : "View scheduled MST papers, countdown to start time, and attempt live proctored examinations."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* Admin or Faculty Add Action Button */}
            {(userRole === "admin" || userRole === "faculty") && (
              <button
                onClick={() => setShowScheduleModal(true)}
                style={{
                  background: "#ff7e29",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.75rem 1.25rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(255, 126, 41, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {userRole === "admin" ? "+ Schedule MST Exam" : "+ Add Course Assignment"}
              </button>
            )}

            <div style={{
              background: "var(--lc-card-bg)",
              border: "1px solid var(--lc-border)",
              borderRadius: "12px",
              padding: "0.75rem 1.25rem",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", color: "var(--lc-text-muted)", display: "block" }}>Live Papers</span>
              <strong style={{ fontSize: "1.25rem", color: liveExamsCount > 0 ? "#10b981" : "var(--lc-text-primary)" }}>
                {liveExamsCount}
              </strong>
            </div>
            <div style={{
              background: "var(--lc-card-bg)",
              border: "1px solid var(--lc-border)",
              borderRadius: "12px",
              padding: "0.75rem 1.25rem",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", color: "var(--lc-text-muted)", display: "block" }}>Upcoming</span>
              <strong style={{ fontSize: "1.25rem", color: "#3b82f6" }}>
                {upcomingExamsCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
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
              { id: "all", label: "Active & Scheduled" },
              { id: "mst", label: "MST Exams Only" },
              { id: "quiz", label: "Quizzes & Assignments" },
              { id: "completed", label: "Closed / Results" }
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
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={loadExamsFromDatabase}
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
              🔄 Refresh DB
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

        {/* Loading / Error States */}
        {loading && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--lc-text-muted)" }}>
            <p>Loading database examination papers...</p>
          </div>
        )}

        {error && (
          <div className="lc-error-banner" style={{ marginBottom: "1.5rem" }}>
            <span>{error}</span>
          </div>
        )}

        {/* Exam Cards Grid */}
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
              {userRole === "admin"
                ? "Click '+ Schedule MST Exam' above to schedule new mid-semester examinations."
                : "No active or scheduled tests match your selected filter."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {filteredExams.map((exam) => {
              const now = new Date();
              const isStartTimeReached = !exam.startRaw || now >= exam.startRaw;
              const isEndTimePassed = exam.endRaw && now > exam.endRaw;

              return (
                <div
                  key={exam.id}
                  style={{
                    background: "var(--lc-card-bg)",
                    border: exam.status === "live" ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid var(--lc-border)",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: exam.status === "live" ? "0 4px 20px rgba(16, 185, 129, 0.1)" : "none"
                  }}
                >
                  <div>
                    {/* Header Badges */}
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

                      {exam.status === "completed" && (
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--lc-text-muted)",
                          background: "rgba(255, 255, 255, 0.08)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          border: "1px solid var(--lc-border)"
                        }}>
                          CLOSED / COMPLETED
                        </span>
                      )}
                    </div>

                    {/* Title & Course */}
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--lc-text-primary)", marginBottom: "0.35rem" }}>
                      {exam.title}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "0.75rem" }}>
                      {exam.courseTitle} • {exam.instructor}
                    </p>

                    {(exam.targetBatch !== "ALL" || exam.targetYear !== "ALL") && (
                      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        {exam.targetBatch !== "ALL" && (
                          <span style={{
                            fontSize: "0.7rem",
                            background: "rgba(147, 51, 234, 0.15)",
                            color: "#c084fc",
                            border: "1px solid rgba(147, 51, 234, 0.3)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "6px",
                            fontWeight: 600
                          }}>
                            🎓 Batch {exam.targetBatch}
                          </span>
                        )}
                        {exam.targetYear !== "ALL" && (
                          <span style={{
                            fontSize: "0.7rem",
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "#93c5fd",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "6px",
                            fontWeight: 600
                          }}>
                            📅 {exam.targetYear}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Timing details */}
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
                        <strong style={{ color: "var(--lc-text-primary)" }}>{exam.durationMinutes} Mins</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--lc-text-muted)", display: "block" }}>Max Marks</span>
                        <strong style={{ color: "var(--lc-text-primary)" }}>{exam.totalMarks} Marks</strong>
                      </div>
                    </div>

                    {exam.status === "completed" && (
                      <div style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: "10px",
                        padding: "0.75rem 1rem",
                        marginBottom: "1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)" }}>Grade Obtained</span>
                        <strong style={{ fontSize: "1.1rem", color: "#10b981" }}>
                          {exam.score !== null ? `${exam.score} / ${exam.totalMarks}` : "Submitted (Pending Grade)"}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer with timing lock */}
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    {exam.status === "live" ? (
                      <button
                        onClick={() => setActiveExam(exam)}
                        style={{
                          flex: 1,
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.65rem",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        Start Exam Now →
                      </button>
                    ) : exam.status === "upcoming" ? (
                      <button
                        disabled={!isStartTimeReached}
                        onClick={() => isStartTimeReached && setActiveExam(exam)}
                        style={{
                          flex: 1,
                          background: isStartTimeReached ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                          color: isStartTimeReached ? "#fff" : "var(--lc-text-muted)",
                          border: "1px solid var(--lc-border)",
                          borderRadius: "8px",
                          padding: "0.65rem",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: isStartTimeReached ? "pointer" : "not-allowed"
                        }}
                      >
                        {isStartTimeReached ? "Start Exam →" : `Opens on ${exam.startTime}`}
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveExam(exam)}
                        style={{
                          flex: 1,
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "var(--lc-text-primary)",
                          border: "1px solid var(--lc-border)",
                          borderRadius: "8px",
                          padding: "0.65rem",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        Review Paper
                      </button>
                    )}

                    <button
                      onClick={() => setShowInstructionsModal(exam)}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "var(--lc-text-primary)",
                        border: "1px solid var(--lc-border)",
                        borderRadius: "8px",
                        padding: "0.65rem 0.9rem",
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Guidelines
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Admin / Faculty Schedule MST Modal */}
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
                {userRole === "admin" ? "Schedule Institutional MST Exam" : "Add Course Assignment"}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "1.5rem" }}>
                Set official Start Date/Time, End Date/Time, Duration, and Anti-cheat proctoring.
              </p>

              {scheduleStatus.error && (
                <div className="lc-error-banner" style={{ marginBottom: "1rem" }}>
                  <span>{scheduleStatus.error}</span>
                </div>
              )}

              <form onSubmit={handleScheduleSubmit}>
                {/* Select Course */}
                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Select Course</label>
                  <select
                    className="lc-form-input"
                    value={scheduleForm.courseId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, courseId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Title */}
                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Exam Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-Semester Examination 1 (MST-1)"
                    className="lc-form-input"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="lc-form-group" style={{ marginBottom: "1rem" }}>
                  <label className="lc-input-label">Description / Topics Covered</label>
                  <textarea
                    placeholder="e.g. Covers Arrays, Linked Lists, and Stacks."
                    className="lc-form-input"
                    rows="2"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  />
                </div>

                {/* Start Time & End Time */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="lc-form-group">
                    <label className="lc-input-label">Start Date & Time (When to Start)</label>
                    <input
                      type="datetime-local"
                      className="lc-form-input"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="lc-form-group">
                    <label className="lc-input-label">End Date & Time (When to End)</label>
                    <input
                      type="datetime-local"
                      className="lc-form-input"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Duration & Max Score */}
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

                {/* Anti-Cheat Proctoring Checkbox */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  <input
                    type="checkbox"
                    id="proctored"
                    checked={scheduleForm.isProctored}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, isProctored: e.target.checked })}
                  />
                  <label htmlFor="proctored" style={{ fontSize: "0.85rem", color: "var(--lc-text-primary)", cursor: "pointer" }}>
                    Enable Full-Screen Anti-Cheat & Tab-Switching Proctoring
                  </label>
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
                      background: "#ff7e29",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1.4rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {scheduleStatus.loading ? "Scheduling..." : "Schedule Examination"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Guidelines Modal */}
        {showInstructionsModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
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
              maxWidth: "520px",
              width: "100%"
            }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                {showInstructionsModal.title} Instructions
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginBottom: "1.25rem" }}>
                {showInstructionsModal.courseCode}: {showInstructionsModal.courseTitle}
              </p>

              <div style={{
                background: "rgba(255, 126, 41, 0.08)",
                border: "1px solid rgba(255, 126, 41, 0.2)",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.5rem"
              }}>
                <strong style={{ fontSize: "0.85rem", color: "#ff7e29", display: "block", marginBottom: "0.5rem" }}>
                  Examination Policy
                </strong>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.825rem", color: "var(--lc-text-muted)" }}>
                  {showInstructionsModal.instructions?.map((inst, idx) => (
                    <li key={idx} style={{ marginBottom: "0.4rem" }}>{inst}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  onClick={() => setShowInstructionsModal(null)}
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
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
}
