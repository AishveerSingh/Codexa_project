import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlatformLayout, PlatformSection, PlatformStats } from "../../components/PlatformLayout";
import { apiRequest } from "../../utils/api";
import { clearFacultySession, getFacultySession } from "../../utils/session";

export default function FacultyStudentList() {
  const navigate = useNavigate();
  const session = getFacultySession();
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    search: ""
  });
  const [status, setStatus] = useState({
    loading: true,
    error: ""
  });

  function handleExpiredFacultySession(message = "Your faculty session expired. Please log in again.") {
    clearFacultySession();
    setStudents([]);
    setStatus({
      loading: false,
      error: message
    });

    window.setTimeout(() => {
      navigate("/faculty/login");
    }, 300);
  }

  useEffect(() => {
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
            error: "Log in as faculty to review accessible students."
          });
        }
        return;
      }

      try {
        const params = new URLSearchParams();
        if (filters.search.trim()) {
          params.set("search", filters.search.trim());
        }

        const data = await apiRequest(`/users/students/accessible?${params.toString()}`, {}, session.token);

        if (isMounted) {
          setStudents(data);
          setStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          if (error.message === "Invalid or expired token.") {
            handleExpiredFacultySession();
            return;
          }

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
  }, [filters.search, session?.token]);

  return (
    <PlatformLayout
      role="faculty"
      eyebrow="Student Access"
      title="Review the students you teach"
      subtitle="Faculty can see only students enrolled in at least one assigned course, keeping roster access aligned with real teaching responsibility."
      meta={`${students.length} students`}
      sidebarNote="Student access for faculty stays limited to shared courses, so roster review and attempt inspection never leak outside assigned teaching scope."
    >
      <PlatformStats
        items={[
          {
            label: "Students",
            value: students.length,
            note: "Reachable from assigned courses"
          }
        ]}
      />

      <PlatformSection label="Search" title="Find a student quickly">
        <div className="filter-bar">
          <input
            aria-label="Search students"
            className="filter-input"
            name="search"
            placeholder="Search by student name, email, or roll number"
            type="search"
            value={filters.search}
            onChange={(event) => {
              setFilters({
                search: event.target.value
              });
            }}
          />
        </div>
      </PlatformSection>

      <PlatformSection label="Roster" title="Open student activity">
        {status.loading ? <p className="dashboard-copy">Loading students...</p> : null}
        {status.error ? <p className="form-status error">{status.error}</p> : null}

        {!status.loading && !status.error ? (
          <>
            {students.length === 0 ? (
              <p className="dashboard-copy">No students matched the current search.</p>
            ) : (
              <div className="question-list">
                {students.map((student) => {
                  const acceptedRuns = student.accepted_count || 0;
                  const totalSubmissions = student.submission_count || 0;
                  const progressPct = totalSubmissions > 0 ? Math.min(100, Math.round((acceptedRuns / totalSubmissions) * 100)) : 0;

                  return (
                    <article className="question-card student-roster-progress-card" key={student.id}>
                      <div className="question-card-top">
                        <span className="difficulty-pill easy">
                          {student.profile?.roll_number ? `Roll: ${student.profile.roll_number}` : "Student"}
                        </span>
                        <span className="question-meta">
                          {student.profile?.branch || "-"} | Sem {student.profile?.semester || "-"} | Sec {student.profile?.section || "-"}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
                        <div className="sidebar-profile-avatar" style={{ width: "40px", height: "40px", fontSize: "14px" }}>
                          {student.full_name ? student.full_name.slice(0, 2).toUpperCase() : "ST"}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: "1.08rem" }}>{student.full_name}</h3>
                          <p className="question-meta" style={{ margin: 0 }}>{student.email}</p>
                        </div>
                      </div>

                      <div className="course-progress-block" style={{ margin: "1rem 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>
                          <span>Activity Success Rate</span>
                          <span style={{ color: progressPct > 70 ? "#16a34a" : progressPct > 35 ? "#0284c7" : "#d97706" }}>
                            {progressPct}% Success ({acceptedRuns} accepted)
                          </span>
                        </div>
                        <div className="progress-meter" style={{ height: "10px", background: "rgba(148, 163, 184, 0.15)" }}>
                          <div
                            className="progress-meter-fill"
                            style={{
                              width: `${progressPct}%`,
                              background: progressPct > 70 ? "linear-gradient(90deg, #22c55e, #16a34a)" : progressPct > 35 ? "linear-gradient(90deg, #38bdf8, #0284c7)" : "linear-gradient(90deg, #fbbf24, #d97706)",
                              height: "100%",
                              borderRadius: "6px"
                            }}
                          />
                        </div>
                        <div className="stats-inline" style={{ marginTop: "8px", fontSize: "0.8rem", color: "#64748b" }}>
                          <span>Accepted Verdicts: {student.accepted_count || 0}</span>
                        </div>
                      </div>

                      <div className="compact-action-row">
                        <Link className="compact-btn compact-btn-primary" to={`/faculty/students/${student.id}/submissions`}>
                          Open Student Progress & Attempts →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </PlatformSection>
    </PlatformLayout>
  );
}
