import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Users,
  GraduationCap,
  Mail,
  Award,
  BarChart2,
  ExternalLink,
  Edit3,
  MessageSquare,
  X,
  CheckCircle,
  FileCode,
  Trophy,
  Flame,
  Loader2,
  Filter,
  Layers
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { getFacultySession } from "../../utils/session";

export default function FacultyStudentsView() {
  const session = getFacultySession();
  const token = session?.token;

  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRealStudents() {
      setLoading(true);
      try {
        const data = await apiRequest("/users/students/accessible", {}, token);
        if (isMounted) {
          const loadedStudents = Array.isArray(data) ? data : data?.students || [];
          if (loadedStudents.length > 0) {
            setStudentList(
              loadedStudents.map((st) => {
                const totalSub = st.submission_count || 0;
                const accepted = st.accepted_count || 0;
                const pct = totalSub > 0 ? Math.min(100, Math.round((accepted / totalSub) * 100)) : 0;
                return {
                  id: st.id || st._id,
                  name: st.full_name || st.fullName || "Student",
                  rollNo: st.profile?.roll_number || st.profile?.rollNo || "N/A",
                  email: st.email || "N/A",
                  department: st.profile?.department || st.profile?.branch || "General",
                  semesterNum: st.profile?.semester ? String(st.profile.semester) : "1",
                  semester: st.profile?.semester ? `Semester ${st.profile.semester}` : "Semester 1",
                  section: st.profile?.section || "A",
                  batch: st.profile?.batch || "2024-2028",
                  attendancePct: st.profile?.attendance || (totalSub > 0 ? 100 : 0),
                  codingScore: accepted * 50,
                  assignmentsSolved: `${accepted}/${totalSub}`,
                  overallGrade: pct >= 80 ? "A+" : pct >= 60 ? "A" : pct > 0 ? "B+" : "N/A",
                  gradeBadge: pct >= 80 ? "fd-badge-success" : pct > 0 ? "fd-badge-warning" : "fd-badge-neutral"
                };
              })
            );
          } else {
            setStudentList([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load students");
          setLoading(false);
        }
      }
    }

    fetchRealStudents();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Extract cohorts: Semester -> Department (Class) -> Section (Subclass)
  const cohorts = useMemo(() => {
    const map = {};
    studentList.forEach((st) => {
      const sem = st.semesterNum || "1";
      const dept = st.department || "General";
      const sec = st.section || "A";
      const batch = st.batch || "2024-2028";
      const key = `sem${sem}_${dept}_sec${sec}`;
      if (!map[key]) {
        map[key] = {
          key,
          semester: sem,
          department: dept,
          section: sec,
          batch,
          students: []
        };
      }
      map[key].students.push(st);
    });

    return Object.values(map).sort(
      (a, b) => Number(a.semester) - Number(b.semester) || a.department.localeCompare(b.department) || a.section.localeCompare(b.section)
    );
  }, [studentList]);

  // Extract distinct filter options
  const filterOptions = useMemo(() => {
    const semesters = new Set();
    const departments = new Set();
    const sections = new Set();

    studentList.forEach((st) => {
      if (st.semesterNum) semesters.add(st.semesterNum);
      if (st.department) departments.add(st.department);
      if (st.section) sections.add(st.section);
    });

    return {
      semesters: Array.from(semesters).sort((a, b) => Number(a) - Number(b)),
      departments: Array.from(departments).sort(),
      sections: Array.from(sections).sort()
    };
  }, [studentList]);

  // Active Cohort Selection
  const activeCohort = useMemo(() => {
    if (!selectedSemester || !selectedDept || !selectedSection) return null;
    return cohorts.find(
      (c) => c.semester === selectedSemester && c.department === selectedDept && c.section === selectedSection
    ) || null;
  }, [cohorts, selectedSemester, selectedDept, selectedSection]);

  // Filtered Students strictly isolated to active cohort
  const displayStudents = useMemo(() => {
    if (!activeCohort) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return activeCohort.students;

    return activeCohort.students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
    );
  }, [activeCohort, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div className="fd-courses-header-filter">
        <div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#fff",
              margin: 0
            }}
          >
            Enrolled Students Roster
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#94A3B8",
              margin: "0.2rem 0 0 0"
            }}
          >
            Select a Semester, Class, and Section below to view isolated student records without mixing cohorts
          </p>
        </div>

        {activeCohort && (
          <button
            className="fd-btn fd-btn-secondary"
            onClick={() => {
              setSelectedSemester("");
              setSelectedDept("");
              setSelectedSection("");
              setSearchQuery("");
            }}
          >
            ← Back to All Class Sections
          </button>
        )}
      </div>

      {/* Cohort Selector Header Bar */}
      <div
        style={{
          padding: "1.1rem 1.4rem",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#A78BFA", fontWeight: 700, fontSize: "0.85rem" }}>
          <Filter size={15} /> Select Cohort:
        </div>

        {/* 1. Semester */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>1. Semester:</span>
          <select
            className="fd-select-filter"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}
          >
            <option value="">Choose Semester</option>
            {filterOptions.semesters.map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        {/* 2. Department / Class */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>2. Class (Branch):</span>
          <select
            className="fd-select-filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}
          >
            <option value="">Choose Class</option>
            {filterOptions.departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* 3. Section / Subclass */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>3. Subclass (Sec):</span>
          <select
            className="fd-select-filter"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}
          >
            <option value="">Choose Section</option>
            {filterOptions.sections.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
            color: "#94A3B8",
            gap: "0.8rem"
          }}
        >
          <Loader2 size={24} className="fd-spin" />
          <span>Fetching accessible student roster from database...</span>
        </div>
      ) : error ? (
        <div style={{ padding: "1.5rem", background: "rgba(239,68,68,0.1)", color: "#F87171", borderRadius: "12px" }}>
          {error}
        </div>
      ) : !activeCohort ? (
        /* WHEN NO COHORT IS SELECTED: Show Class & Section Directory Grid */
        <div>
          <div style={{ marginBottom: "1rem", color: "#94a3b8", fontSize: "0.88rem", fontWeight: 600 }}>
            Select an academic group below to open its student roster:
          </div>

          {cohorts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              No students enrolled in your assigned courses yet.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {cohorts.map((cohort) => (
                <div
                  key={cohort.key}
                  onClick={() => {
                    setSelectedSemester(cohort.semester);
                    setSelectedDept(cohort.department);
                    setSelectedSection(cohort.section);
                  }}
                  style={{
                    padding: "1.4rem",
                    background: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124, 92, 255, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(124, 92, 255, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.025)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                    <span className="fd-badge fd-badge-primary">
                      Semester {cohort.semester}
                    </span>
                    <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                      {cohort.batch}
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 0.3rem 0", color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>
                    {cohort.department} — Section {cohort.section}
                  </h4>

                  <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1rem" }}>
                    {cohort.students.length} {cohort.students.length === 1 ? "student registered" : "students registered"}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#64748b" }}>Cohort Cohort</span>
                    <span style={{ color: "#7C5CFF", fontWeight: 700 }}>Open Section Roster →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* WHEN COHORT IS SELECTED: Show isolated roster for this group only */
        <div>
          {/* Search bar inside selected cohort */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              gap: "1rem",
              flexWrap: "wrap"
            }}
          >
            <div className="fd-search-bar-wrap" style={{ minWidth: "300px", flex: 1 }}>
              <Search className="fd-search-icon" size={16} />
              <input
                type="text"
                className="fd-search-input"
                placeholder={`Search students in Semester ${activeCohort.semester} - ${activeCohort.department} (Sec ${activeCohort.section})...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.6rem 1rem 0.6rem 2.5rem", fontSize: "0.85rem" }}
              />
            </div>

            <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
              Showing {displayStudents.length} of {activeCohort.students.length} students in this section
            </span>
          </div>

          {displayStudents.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#94A3B8" }}>
              No students found matching your search in this section.
            </div>
          ) : (
            <div className="fd-table-container">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Roll Number</th>
                    <th>Attendance</th>
                    <th>Coding Score</th>
                    <th>Assignments</th>
                    <th>Grade</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="fd-user-cell">
                          <div className="fd-user-avatar-sm">
                            {student.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#fff" }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#94A3B8" }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            background: "rgba(255,255,255,0.05)",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.82rem"
                          }}
                        >
                          {student.rollNo}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`fd-badge ${
                            student.attendancePct >= 85
                              ? "fd-badge-success"
                              : student.attendancePct >= 75
                              ? "fd-badge-warning"
                              : "fd-badge-danger"
                          }`}
                        >
                          {student.attendancePct}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Flame size={14} style={{ color: "#6366F1" }} />
                          <strong style={{ color: "#fff" }}>{student.codingScore}</strong>
                          <span style={{ fontSize: "0.72rem", color: "#64748B" }}>pts</span>
                        </div>
                      </td>
                      <td>{student.assignmentsSolved}</td>
                      <td>
                        <span className={`fd-badge ${student.gradeBadge}`}>
                          {student.overallGrade}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="fd-btn fd-btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <ExternalLink size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student Profile Drawer */}
      {selectedStudent && (
        <div
          className="fd-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "fd-modal-overlay") setSelectedStudent(null);
          }}
        >
          <div className="fd-drawer-card">
            {/* Drawer Header */}
            <div
              style={{
                padding: "1.5rem 2rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#111622"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366F1, #0EA5E9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: "#fff"
                  }}
                >
                  {selectedStudent.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0
                    }}
                  >
                    {selectedStudent.name}
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                    {selectedStudent.rollNo} • {selectedStudent.department} • {selectedStudent.semester} (Sec {selectedStudent.section})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  padding: "0.5rem",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Student Profile Body */}
            <div
              style={{
                padding: "2rem",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
            >
              <div className="fd-stats-grid" style={{ marginBottom: 0 }}>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Coding Score</span>
                  <span className="fd-stat-value">{selectedStudent.codingScore}</span>
                </div>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Attendance</span>
                  <span className="fd-stat-value">{selectedStudent.attendancePct}%</span>
                </div>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Assignments</span>
                  <span className="fd-stat-value">{selectedStudent.assignmentsSolved}</span>
                </div>
              </div>

              <div className="fd-card-panel">
                <h3 style={{ fontSize: "1.05rem", color: "#fff", margin: "0 0 1rem 0" }}>
                  Academic Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.88rem" }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Email: </span>
                    <strong style={{ color: "#fff" }}>{selectedStudent.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Roll Number: </span>
                    <strong style={{ color: "#fff" }}>{selectedStudent.rollNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Class (Branch): </span>
                    <strong style={{ color: "#fff" }}>{selectedStudent.department}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Cohort: </span>
                    <strong style={{ color: "#fff" }}>{selectedStudent.semester} • Section {selectedStudent.section} ({selectedStudent.batch})</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
