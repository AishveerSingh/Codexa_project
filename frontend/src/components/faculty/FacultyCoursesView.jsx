import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Users,
  FileText,
  Code2,
  CheckCircle,
  ExternalLink,
  Edit,
  Archive,
  X,
  MessageSquare,
  FileCheck,
  FolderOpen,
  GraduationCap,
  Megaphone,
  BarChart,
  Layers,
  Plus,
  Loader2
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { getFacultySession } from "../../utils/session";

export default function FacultyCoursesView({ onQuickAction }) {
  const session = getFacultySession();
  const token = session?.token;

  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDrawerTab, setCourseDrawerTab] = useState("overview");

  useEffect(() => {
    let isMounted = true;

    async function fetchRealCourses() {
      setLoading(true);
      try {
        const data = await apiRequest("/courses", {}, token);
        if (isMounted) {
          const loadedCourses = Array.isArray(data) ? data : data?.courses || [];
          if (loadedCourses.length > 0) {
            setCoursesList(
              loadedCourses.map((c) => ({
                id: c.id || c._id,
                name: c.name || c.title || "Academic Course",
                code: c.code || `CS-${c.id?.substring(0, 3)}`,
                department: c.department || (c.audiences && c.audiences[0]?.branch) || "Computer Science",
                semester: c.semester || (c.audiences && c.audiences[0]?.semester ? `Semester ${c.audiences[0].semester}` : "All Semesters"),
                faculty: c.faculty?.name || c.faculty_name || session?.user?.fullName || "Faculty",
                studentsEnrolled: c.students?.length || c.enrolled_count || c.studentsEnrolled || 0,
                progress: c.progress || 0,
                assignmentsCount: c.assignments_count || c.assignmentsCount || 0,
                codingProblems: c.coding_problems_count || c.codingProblems || 0,
                attendancePct: c.attendance_pct || 0,
                status: c.status || (c.is_active !== false ? "Active" : "Archived")
              }))
            );
          } else {
            setCoursesList([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Loaded default course structure");
          setLoading(false);
        }
      }
    }

    fetchRealCourses();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredCourses = coursesList.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem =
      semesterFilter === "all" || course.semester.includes(semesterFilter);
    const matchesDept =
      deptFilter === "all" || course.department === deptFilter;
    return matchesSearch && matchesSem && matchesDept;
  });

  return (
    <div>
      {/* Header & Filter Controls */}
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
            Academic Courses
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#94A3B8",
              margin: "0.2rem 0 0 0"
            }}
          >
            Manage curricula, enrollments, modules, and programming assessments
          </p>
        </div>

        <div className="fd-filters-group">
          {/* Course Search */}
          <div className="fd-search-bar-wrap" style={{ minWidth: "260px" }}>
            <Search className="fd-search-icon" size={16} />
            <input
              type="text"
              className="fd-search-input"
              placeholder="Search course title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.6rem 1rem 0.6rem 2.5rem", fontSize: "0.85rem" }}
            />
          </div>

          {/* Semester Filter */}
          <select
            className="fd-select-filter"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="all">All Semesters</option>
            <option value="3rd">3rd Semester</option>
            <option value="4th">4th Semester</option>
            <option value="5th">5th Semester</option>
            <option value="6th">6th Semester</option>
            <option value="7th">7th Semester</option>
          </select>

          {/* Department Filter */}
          <select
            className="fd-select-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Tech</option>
            <option value="Artificial Intelligence">AI & Data Science</option>
          </select>

          <button
            className="fd-btn fd-btn-primary"
            onClick={() => onQuickAction("create_course")}
          >
            <Plus size={16} /> Create Course
          </button>
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
          <span>Fetching actual course records from database...</span>
        </div>
      ) : (
        /* Course Cards Grid */
        <div className="fd-courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="fd-course-card">
              <div>
                <div className="fd-course-header">
                  <span className="fd-course-code-badge">{course.code}</span>
                  <span
                    className={`fd-badge ${
                      course.status === "Active"
                        ? "fd-badge-success"
                        : course.status === "Draft"
                        ? "fd-badge-warning"
                        : "fd-badge-primary"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <h3 className="fd-course-title">{course.name}</h3>
                <p className="fd-course-dept">
                  {course.department} • {course.semester}
                </p>

                {/* Course Stats Row */}
                <div className="fd-course-stats-row">
                  <div className="fd-course-stat-item">
                    <span className="fd-course-stat-val">
                      {course.studentsEnrolled}
                    </span>
                    <span className="fd-course-stat-lbl">Enrolled</span>
                  </div>
                  <div className="fd-course-stat-item">
                    <span className="fd-course-stat-val">
                      {course.assignmentsCount}
                    </span>
                    <span className="fd-course-stat-lbl">Assignments</span>
                  </div>
                  <div className="fd-course-stat-item">
                    <span className="fd-course-stat-val">
                      {course.attendancePct}%
                    </span>
                    <span className="fd-course-stat-lbl">Attendance</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      color: "#94A3B8",
                      fontWeight: 600
                    }}
                  >
                    <span>Syllabus Completion</span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="fd-progress-bar-wrap">
                    <div
                      className="fd-progress-bar-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Course Action Buttons */}
              <div className="fd-course-actions">
                <button
                  className="fd-btn fd-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedCourse(course)}
                >
                  <ExternalLink size={14} /> Open
                </button>
                <button className="fd-btn fd-btn-secondary" title="Edit Course">
                  <Edit size={14} />
                </button>
                <button className="fd-btn fd-btn-secondary" title="Archive Course">
                  <Archive size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inside Course Detail Drawer Modal */}
      {selectedCourse && (
        <div
          className="fd-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "fd-modal-overlay") setSelectedCourse(null);
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
              <div>
                <span className="fd-course-code-badge">
                  {selectedCourse.code}
                </span>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0.4rem 0 0 0"
                  }}
                >
                  {selectedCourse.name}
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                  Faculty: {selectedCourse.faculty} • {selectedCourse.department}
                </p>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
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

            {/* Sub-tabs Header */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                padding: "0.8rem 2rem",
                background: "#0A0E17",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                overflowX: "auto"
              }}
            >
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "modules", label: "Modules", icon: Layers },
                { id: "assignments", label: "Assignments", icon: FileText },
                { id: "programming", label: "Coding Tasks", icon: Code2 },
                { id: "students", label: "Students", icon: GraduationCap },
                { id: "attendance", label: "Attendance", icon: CheckCircle },
                { id: "grades", label: "Grades", icon: BarChart },
                { id: "announcements", label: "Announcements", icon: Megaphone },
                { id: "resources", label: "Resources", icon: FolderOpen },
                { id: "forum", label: "Discussion", icon: MessageSquare }
              ].map((tab) => {
                const TIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`fd-chart-tab-btn ${
                      courseDrawerTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setCourseDrawerTab(tab.id)}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <TIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Content */}
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
              {courseDrawerTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div className="fd-stats-grid" style={{ marginBottom: 0 }}>
                    <div className="fd-stat-card">
                      <span className="fd-stat-label">Enrolled Students</span>
                      <span className="fd-stat-value">{selectedCourse.studentsEnrolled}</span>
                    </div>
                    <div className="fd-stat-card">
                      <span className="fd-stat-label">Syllabus Completion</span>
                      <span className="fd-stat-value">{selectedCourse.progress}%</span>
                    </div>
                    <div className="fd-stat-card">
                      <span className="fd-stat-label">Coding Problems</span>
                      <span className="fd-stat-value">{selectedCourse.codingProblems}</span>
                    </div>
                  </div>

                  <div className="fd-card-panel">
                    <h3 style={{ fontSize: "1.1rem", color: "#fff", margin: "0 0 0.5rem 0" }}>
                      Course Description & Objectives
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.6 }}>
                      Comprehensive curriculum covering theoretical foundations, algorithmic complexity, graph structures, dynamic programming paradigms, and real-world coding benchmarks.
                    </p>
                  </div>
                </div>
              )}

              {courseDrawerTab !== "overview" && (
                <div className="fd-card-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                  <FolderOpen size={48} style={{ color: "#6366F1", marginBottom: "1rem" }} />
                  <h3 style={{ fontSize: "1.2rem", color: "#fff", margin: "0 0 0.5rem 0" }}>
                    {courseDrawerTab.toUpperCase()} Section
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
                    Interactive management interface for {selectedCourse.code} {courseDrawerTab}.
                  </p>
                  <button className="fd-btn fd-btn-primary" style={{ marginTop: "1rem" }}>
                    <Plus size={16} /> Add New Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
