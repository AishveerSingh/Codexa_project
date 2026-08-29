import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle,
  Download,
  Calendar,
  Layers,
  Trophy,
  Users,
  Flame,
  FileSpreadsheet,
  FileText,
  Loader2,
  Code2,
  ExternalLink,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Mail,
  User,
  ShieldCheck,
  Filter,
  FolderTree,
  ListOrdered
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { getFacultySession } from "../../utils/session";

export default function FacultyAnalyticsView() {
  const session = getFacultySession();
  const token = session?.token;

  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalStudents: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      uniqueProblemsSolved: 0,
      totalProblems: 0,
      totalCourses: 0,
      acceptanceRate: 0
    },
    heatmap: [],
    departments: [],
    groups: [],
    topStudents: []
  });

  // Group Filter State (Semester, Class / Branch, Subclass / Section, Year / Batch)
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubclass, setSelectedSubclass] = useState("all");

  // View Mode: "overview" (default analytics dashboard) or "hierarchy" (separated by Semester -> Class -> Subclass)
  const [activeViewMode, setActiveViewMode] = useState("overview");

  // Modal & Drawer State
  const [showAllStudentsModal, setShowAllStudentsModal] = useState(false);
  const [modalViewTab, setModalViewTab] = useState("serial"); // "serial" or "grouped"
  const [allStudentsSearch, setAllStudentsSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [studentProgress, setStudentProgress] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);

  // Accordion open states for hierarchy
  const [expandedSemesters, setExpandedSemesters] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/analytics/faculty", {}, token);
        if (isMounted && data) {
          setAnalyticsData({
            overview: data.overview || {
              totalStudents: 0,
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              uniqueProblemsSolved: 0,
              totalProblems: 0,
              totalCourses: 0,
              acceptanceRate: 0
            },
            heatmap: Array.isArray(data.heatmap) ? data.heatmap : [],
            departments: Array.isArray(data.departments) ? data.departments : [],
            groups: Array.isArray(data.groups) ? data.groups : [],
            topStudents: Array.isArray(data.topStudents) ? data.topStudents : []
          });

          // Expand all semesters by default in hierarchy
          const initialExpanded = {};
          if (Array.isArray(data.topStudents)) {
            data.topStudents.forEach((st) => {
              const semKey = String(st.semester || 1);
              initialExpanded[semKey] = true;
            });
          }
          setExpandedSemesters(initialExpanded);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Analytics fetch error:", err);
          setError(err.message || "Failed to load database analytics.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Load individual student details when a student is selected
  useEffect(() => {
    let isMounted = true;

    async function loadStudentData() {
      if (!selectedStudent?.id || !token) return;
      setStudentDetailsLoading(true);
      try {
        const [progressRes, subsRes] = await Promise.allSettled([
          apiRequest(`/submissions/student/${selectedStudent.id}/progress`, {}, token),
          apiRequest(`/submissions/student/${selectedStudent.id}`, {}, token)
        ]);

        if (isMounted) {
          if (progressRes.status === "fulfilled" && Array.isArray(progressRes.value)) {
            setStudentProgress(progressRes.value);
          } else {
            setStudentProgress([]);
          }

          if (subsRes.status === "fulfilled" && Array.isArray(subsRes.value)) {
            setStudentSubmissions(subsRes.value);
          } else {
            setStudentSubmissions([]);
          }
        }
      } catch (e) {
        console.warn("Student detail fetch notice:", e.message);
      } finally {
        if (isMounted) setStudentDetailsLoading(false);
      }
    }

    if (selectedStudent) {
      loadStudentData();
    } else {
      setStudentProgress(null);
      setStudentSubmissions([]);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedStudent, token]);

  const { overview, departments, topStudents } = analyticsData;

  // Extract distinct filter options dynamically from real DB records
  const filterOptions = useMemo(() => {
    const batches = new Set();
    const semesters = new Set();
    const classes = new Set();
    const subclasses = new Set();

    topStudents.forEach((st) => {
      if (st.batch) batches.add(String(st.batch));
      if (st.semester) semesters.add(String(st.semester));
      if (st.department) classes.add(String(st.department));
      if (st.section) subclasses.add(String(st.section));
    });

    return {
      batches: Array.from(batches).sort(),
      semesters: Array.from(semesters).sort((a, b) => Number(a) - Number(b)),
      classes: Array.from(classes).sort(),
      subclasses: Array.from(subclasses).sort()
    };
  }, [topStudents]);

  // Filter students based on active filter selections
  const filteredStudents = useMemo(() => {
    return topStudents.filter((st) => {
      if (selectedBatch !== "all" && String(st.batch) !== selectedBatch) return false;
      if (selectedSemester !== "all" && String(st.semester) !== selectedSemester) return false;
      if (selectedClass !== "all" && String(st.department) !== selectedClass) return false;
      if (selectedSubclass !== "all" && String(st.section) !== selectedSubclass) return false;
      return true;
    });
  }, [topStudents, selectedBatch, selectedSemester, selectedClass, selectedSubclass]);

  // Hierarchical Grouping: Semester -> Class (Branch) -> Subclass (Section)
  const hierarchicalGroups = useMemo(() => {
    const map = {};

    filteredStudents.forEach((st) => {
      const sem = String(st.semester || 1);
      const cls = String(st.department || "General");
      const subcls = String(st.section || "A");

      if (!map[sem]) map[sem] = { semester: sem, classes: {}, totalStudents: 0, totalSolved: 0 };
      map[sem].totalStudents += 1;
      map[sem].totalSolved += (st.solved || 0);

      if (!map[sem].classes[cls]) map[sem].classes[cls] = { className: cls, subclasses: {}, totalStudents: 0, totalSolved: 0 };
      map[sem].classes[cls].totalStudents += 1;
      map[sem].classes[cls].totalSolved += (st.solved || 0);

      if (!map[sem].classes[cls].subclasses[subcls]) {
        map[sem].classes[cls].subclasses[subcls] = {
          subclassName: subcls,
          students: []
        };
      }
      map[sem].classes[cls].subclasses[subcls].students.push(st);
    });

    // Sort students inside each subclass serialwise by score/solved
    Object.values(map).forEach((semObj) => {
      Object.values(semObj.classes).forEach((clsObj) => {
        Object.values(clsObj.subclasses).forEach((subclsObj) => {
          subclsObj.students.sort((a, b) => (b.score || 0) - (a.score || 0));
        });
      });
    });

    return map;
  }, [filteredStudents]);

  const heatmapMap = useMemo(() => {
    const map = new Map();
    if (analyticsData.heatmap) {
      analyticsData.heatmap.forEach((item) => {
        if (item.day) {
          map.set(item.day, parseInt(item.count, 10) || 0);
        }
      });
    }
    return map;
  }, [analyticsData.heatmap]);

  const handleExport = (format) => {
    if (format === "CSV") {
      const headers = ["Rank", "Student Name", "Email", "Roll Number", "Batch/Year", "Semester", "Class/Branch", "Subclass/Section", "Problems Solved", "Total Submissions", "Coding Score"];
      const rows = filteredStudents.map((st, idx) => [
        idx + 1,
        `"${st.name}"`,
        `"${st.email || "N/A"}"`,
        `"${st.rollNo}"`,
        `"${st.batch || "N/A"}"`,
        `"Semester ${st.semester || 1}"`,
        `"${st.department}"`,
        `"Section ${st.section || "A"}"`,
        st.solved,
        st.totalSubmissions,
        st.score
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `codexa_student_analytics_grouped_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMsg("Exported separated group Analytics report as CSV.");
    } else {
      setToastMsg(`Preparing ${format.toUpperCase()} export report from database...`);
    }
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Generate GitHub style heatmap matrix grid using real DB daily submission records
  const renderHeatmap = () => {
    const days = 7;
    const weeks = 36;
    const cells = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = weeks * days;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const offset = w * 7 + d;
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + offset);
        const dateStr = cellDate.toISOString().split("T")[0];
        const count = heatmapMap.get(dateStr) || 0;

        let level = 0;
        if (count >= 10) level = 4;
        else if (count >= 6) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;

        const isFuture = cellDate > today;

        cells.push(
          <div
            key={`${w}-${d}`}
            className={`fd-heatmap-cell ${!isFuture ? `level-${level}` : ""}`}
            style={{ opacity: isFuture ? 0.3 : 1 }}
            title={
              isFuture
                ? `${dateStr} (Upcoming)`
                : `${dateStr}: ${count} submission(s) recorded in DB`
            }
          />
        );
      }
    }
    return cells;
  };

  // Search in modal
  const filteredModalStudents = useMemo(() => {
    let list = filteredStudents;
    if (allStudentsSearch.trim()) {
      const q = allStudentsSearch.toLowerCase();
      list = list.filter(
        (st) =>
          st.name?.toLowerCase().includes(q) ||
          st.rollNo?.toLowerCase().includes(q) ||
          st.department?.toLowerCase().includes(q) ||
          st.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filteredStudents, allStudentsSearch]);

  const maxDeptScore = useMemo(() => {
    if (!departments || departments.length === 0) return 100;
    const maxVal = Math.max(...departments.map((d) => d.avg_score || 0));
    return maxVal > 0 ? maxVal : 100;
  }, [departments]);

  const deptGradients = [
    "linear-gradient(90deg, #7C5CFF, #6366F1)",
    "linear-gradient(90deg, #38BDF8, #0EA5E9)",
    "linear-gradient(90deg, #22C55E, #10B981)",
    "linear-gradient(90deg, #F59E0B, #D97706)",
    "linear-gradient(90deg, #EC4899, #DB2777)"
  ];

  const deptColors = ["#7C5CFF", "#38BDF8", "#22C55E", "#F59E0B", "#EC4899"];

  const toggleSemesterExpand = (semKey) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semKey]: !prev[semKey]
    }));
  };

  const hasActiveFilters =
    selectedBatch !== "all" ||
    selectedSemester !== "all" ||
    selectedClass !== "all" ||
    selectedSubclass !== "all";

  const clearAllFilters = () => {
    setSelectedBatch("all");
    setSelectedSemester("all");
    setSelectedClass("all");
    setSelectedSubclass("all");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
      {/* Toast Banner */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "linear-gradient(135deg, #7C5CFF, #38BDF8)",
            color: "#fff",
            padding: "0.9rem 1.4rem",
            borderRadius: "14px",
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem"
          }}
        >
          <CheckCircle size={18} />
          {toastMsg}
        </div>
      )}

      {/* Header & Export Actions */}
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
            Analytics & Academic Insights
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#A5B4C3",
              margin: "0.2rem 0 0 0"
            }}
          >
            Real database analytics grouped by Semester, Class (Department), and Subclass (Section)
          </p>
        </div>

        {/* Action Controls & Export */}
        <div className="fd-filters-group">
          {/* View Mode Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <button
              onClick={() => setActiveViewMode("overview")}
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: activeViewMode === "overview" ? "#7C5CFF" : "transparent",
                color: activeViewMode === "overview" ? "#fff" : "#94A3B8",
                transition: "all 0.2s ease"
              }}
            >
              <BarChart3 size={14} /> Overview
            </button>
            <button
              onClick={() => setActiveViewMode("hierarchy")}
              style={{
                padding: "0.45rem 0.85rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: activeViewMode === "hierarchy" ? "#7C5CFF" : "transparent",
                color: activeViewMode === "hierarchy" ? "#fff" : "#94A3B8",
                transition: "all 0.2s ease"
              }}
            >
              <FolderTree size={14} /> Group Hierarchy
            </button>
          </div>

          <button
            className="fd-btn fd-btn-secondary"
            onClick={() => handleExport("PDF")}
            disabled={loading}
          >
            <FileText size={15} /> PDF
          </button>
          <button
            className="fd-btn fd-btn-secondary"
            onClick={() => handleExport("Excel")}
            disabled={loading}
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            className="fd-btn fd-btn-primary"
            onClick={() => handleExport("CSV")}
            disabled={loading}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* HIERARCHICAL GROUP FILTER BAR (Year/Batch -> Semester -> Class -> Subclass) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.8rem",
          padding: "1rem 1.25rem",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          backdropFilter: "blur(8px)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#A78BFA",
            fontWeight: 700,
            fontSize: "0.84rem",
            marginRight: "0.4rem"
          }}
        >
          <Filter size={15} /> Group Filter:
        </div>

        {/* 1. Batch / Year Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Year/Batch:</span>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            style={{
              padding: "0.42rem 0.8rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all" style={{ background: "#0F172A" }}>All Batches</option>
            {filterOptions.batches.map((b) => (
              <option key={b} value={b} style={{ background: "#0F172A" }}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Semester Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Semester:</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              padding: "0.42rem 0.8rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all" style={{ background: "#0F172A" }}>All Semesters</option>
            {filterOptions.semesters.map((s) => (
              <option key={s} value={s} style={{ background: "#0F172A" }}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Class / Department Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Class (Branch):</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: "0.42rem 0.8rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all" style={{ background: "#0F172A" }}>All Classes</option>
            {filterOptions.classes.map((c) => (
              <option key={c} value={c} style={{ background: "#0F172A" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Subclass / Section Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>Subclass (Sec):</span>
          <select
            value={selectedSubclass}
            onChange={(e) => setSelectedSubclass(e.target.value)}
            style={{
              padding: "0.42rem 0.8rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all" style={{ background: "#0F172A" }}>All Subclasses</option>
            {filterOptions.subclasses.map((sec) => (
              <option key={sec} value={sec} style={{ background: "#0F172A" }}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#F87171",
              borderRadius: "8px",
              padding: "0.38rem 0.75rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              cursor: "pointer",
              marginLeft: "auto"
            }}
          >
            Reset Filters ({filteredStudents.length} matching)
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 2rem",
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#A5B4C3",
            gap: "1rem"
          }}
        >
          <Loader2 size={36} className="spin-animation" style={{ color: "#7C5CFF" }} />
          <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
            Fetching live statistics and activity from database...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            color: "#FCA5A5"
          }}
        >
          {error}
        </div>
      ) : activeViewMode === "hierarchy" ? (
        /* HIERARCHY VIEW: SEMESTER -> CLASS (BRANCH) -> SUBCLASS (SECTION) */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              padding: "1.2rem 1.5rem",
              background: "rgba(124, 92, 255, 0.08)",
              border: "1px solid rgba(124, 92, 255, 0.2)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.8rem"
            }}
          >
            <div>
              <h3 style={{ color: "#fff", margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
                Hierarchical Academic Structure Breakdown
              </h3>
              <p style={{ color: "#A5B4C3", margin: "0.2rem 0 0 0", fontSize: "0.82rem" }}>
                Students partitioned serialwise by Semester, Class (Branch), and Subclass (Section). Click any student to view full details.
              </p>
            </div>
            <button
              className="fd-btn fd-btn-secondary"
              onClick={() => setShowAllStudentsModal(true)}
              style={{ fontSize: "0.82rem", fontWeight: 700 }}
            >
              <ListOrdered size={14} /> Full Leaderboard Modal
            </button>
          </div>

          {Object.keys(hierarchicalGroups).length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "14px",
                border: "1px dashed rgba(255, 255, 255, 0.1)",
                color: "#94A3B8"
              }}
            >
              No students found for the selected filter combination.
            </div>
          ) : (
            Object.values(hierarchicalGroups).map((semObj) => {
              const semKey = semObj.semester;
              const isExpanded = expandedSemesters[semKey] !== false;

              return (
                <div
                  key={semKey}
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    overflow: "hidden"
                  }}
                >
                  {/* Semester Header Accordion */}
                  <div
                    onClick={() => toggleSemesterExpand(semKey)}
                    style={{
                      padding: "1.2rem 1.6rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderBottom: isExpanded ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #7C5CFF, #38BDF8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 800
                        }}
                      >
                        {semKey}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#fff" }}>
                          Semester {semKey}
                        </h3>
                        <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                          {semObj.totalStudents} {semObj.totalStudents === 1 ? "Student" : "Students"} • {semObj.totalSolved} Total Problems Solved
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span className="fd-badge fd-badge-primary">
                        {Object.keys(semObj.classes).length} {Object.keys(semObj.classes).length === 1 ? "Class" : "Classes"}
                      </span>
                      {isExpanded ? <ChevronDown size={20} style={{ color: "#94A3B8" }} /> : <ChevronRight size={20} style={{ color: "#94A3B8" }} />}
                    </div>
                  </div>

                  {/* Classes & Subclasses Body */}
                  {isExpanded && (
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {Object.values(semObj.classes).map((clsObj) => (
                        <div
                          key={clsObj.className}
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "14px",
                            padding: "1.2rem 1.4rem"
                          }}
                        >
                          {/* Class Header */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "1rem",
                              paddingBottom: "0.8rem",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Layers size={18} style={{ color: "#38BDF8" }} />
                              <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>
                                Class: {clsObj.className}
                              </h4>
                              <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                                ({clsObj.totalStudents} {clsObj.totalStudents === 1 ? "student" : "students"})
                              </span>
                            </div>
                            <span className="fd-badge fd-badge-neutral">
                              {Object.keys(clsObj.subclasses).length} {Object.keys(clsObj.subclasses).length === 1 ? "Subclass (Sec)" : "Subclasses"}
                            </span>
                          </div>

                          {/* Subclasses (Sections) List */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                            {Object.values(clsObj.subclasses).map((subclsObj) => (
                              <div
                                key={subclsObj.subclassName}
                                style={{
                                  background: "rgba(0, 0, 0, 0.2)",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(255, 255, 255, 0.04)",
                                  overflow: "hidden"
                                }}
                              >
                                <div
                                  style={{
                                    padding: "0.7rem 1rem",
                                    background: "rgba(255, 255, 255, 0.02)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
                                  }}
                                >
                                  <span style={{ color: "#A78BFA", fontWeight: 700, fontSize: "0.86rem" }}>
                                    Subclass / Section: {subclsObj.subclassName} ({subclsObj.students.length} {subclsObj.students.length === 1 ? "student" : "students"})
                                  </span>
                                  <span style={{ color: "#64748B", fontSize: "0.76rem" }}>
                                    Ranked serialwise by completion
                                  </span>
                                </div>

                                <div className="fd-table-container" style={{ margin: 0 }}>
                                  <table className="fd-table">
                                    <thead>
                                      <tr>
                                        <th style={{ width: "50px" }}>#</th>
                                        <th>Student Name</th>
                                        <th>Roll Number</th>
                                        <th>Problems Solved</th>
                                        <th>Submissions</th>
                                        <th>Score</th>
                                        <th style={{ textAlign: "right" }}>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subclsObj.students.map((st, idx) => (
                                        <tr
                                          key={st.id || idx}
                                          onClick={() => setSelectedStudent(st)}
                                          style={{ cursor: "pointer" }}
                                        >
                                          <td style={{ fontWeight: 800, color: idx === 0 ? "#F59E0B" : "#94A3B8" }}>
                                            {idx + 1}
                                          </td>
                                          <td>
                                            <div style={{ fontWeight: 700, color: "#fff" }}>{st.name}</div>
                                            <div style={{ fontSize: "0.74rem", color: "#64748B" }}>{st.email}</div>
                                          </td>
                                          <td>
                                            <span
                                              style={{
                                                fontFamily: "monospace",
                                                background: "rgba(255,255,255,0.05)",
                                                padding: "0.2rem 0.4rem",
                                                borderRadius: "4px",
                                                fontSize: "0.8rem"
                                              }}
                                            >
                                              {st.rollNo}
                                            </span>
                                          </td>
                                          <td>
                                            <strong style={{ color: "#22C55E" }}>{st.solved}</strong> solved
                                          </td>
                                          <td>{st.totalSubmissions}</td>
                                          <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#7C5CFF", fontWeight: 800 }}>
                                              <Flame size={14} />
                                              {st.score} pts
                                            </div>
                                          </td>
                                          <td style={{ textAlign: "right" }}>
                                            <button
                                              className="fd-btn fd-btn-secondary"
                                              style={{ padding: "0.3rem 0.65rem", fontSize: "0.74rem" }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStudent(st);
                                              }}
                                            >
                                              <ExternalLink size={12} /> View Details
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* STANDARD OVERVIEW VIEW (Overview cards, Heatmap, Dept Bars, Top 3 performars) */
        <>
          {/* Overview Cards with real DB counts */}
          <div className="fd-stats-grid">
            <div className="fd-stat-card">
              <div className="fd-stat-header">
                <span className="fd-stat-label">
                  {hasActiveFilters ? "Filtered Students" : "Total Enrolled Students"}
                </span>
                <span className="fd-stat-growth-badge positive">DB Record</span>
              </div>
              <div className="fd-stat-value" style={{ color: "#22C55E" }}>
                {filteredStudents.length.toLocaleString()}
              </div>
            </div>

            <div className="fd-stat-card">
              <div className="fd-stat-header">
                <span className="fd-stat-label">Total Submissions</span>
                <span className="fd-stat-growth-badge positive">Live DB</span>
              </div>
              <div className="fd-stat-value" style={{ color: "#7C5CFF" }}>
                {overview.totalSubmissions.toLocaleString()}
              </div>
            </div>

            <div className="fd-stat-card">
              <div className="fd-stat-header">
                <span className="fd-stat-label">Problems Solved</span>
                <span className="fd-stat-growth-badge positive">Accepted</span>
              </div>
              <div className="fd-stat-value" style={{ color: "#38BDF8" }}>
                {overview.uniqueProblemsSolved.toLocaleString()}
              </div>
            </div>

            <div className="fd-stat-card">
              <div className="fd-stat-header">
                <span className="fd-stat-label">Acceptance Rate</span>
                <span className="fd-stat-growth-badge neutral">
                  {overview.totalSubmissions > 0 ? "Calculated" : "No Submissions"}
                </span>
              </div>
              <div className="fd-stat-value" style={{ color: "#F59E0B" }}>
                {overview.acceptanceRate}%
              </div>
            </div>
          </div>

          {/* Attendance & Activity Heatmap Card */}
          <div className="fd-card-panel">
            <div className="fd-section-title-wrap">
              <div>
                <h2 className="fd-section-title">
                  <Calendar size={20} style={{ color: "#22C55E" }} />
                  Class Attendance & Activity Heatmap
                </h2>
                <p className="fd-section-subtitle">
                  Daily submission frequency and student activity matrix directly from database
                </p>
              </div>
              <span className="fd-badge fd-badge-success">Live Database Stream</span>
            </div>

            <div className="fd-heatmap-grid">{renderHeatmap()}</div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.8rem",
                fontSize: "0.76rem",
                color: "#A5B4C3"
              }}
            >
              <span>Less</span>
              <div className="fd-heatmap-cell" />
              <div className="fd-heatmap-cell level-1" />
              <div className="fd-heatmap-cell level-2" />
              <div className="fd-heatmap-cell level-3" />
              <div className="fd-heatmap-cell level-4" />
              <span>More</span>
            </div>
          </div>

          {/* Department Comparison Bar Chart & Leaderboard */}
          <div className="fd-grid-2col">
            {/* Department Comparison */}
            <div className="fd-card-panel">
              <h2 className="fd-section-title">
                <Layers size={20} style={{ color: "#38BDF8" }} />
                Department Comparison
              </h2>
              <p className="fd-section-subtitle">Average coding score and engagement by department</p>

              {departments.length === 0 ? (
                <div
                  style={{
                    padding: "2.5rem 1rem",
                    textAlign: "center",
                    color: "#A5B4C3",
                    fontSize: "0.9rem"
                  }}
                >
                  No student department records found in database.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.2rem",
                    marginTop: "1.5rem"
                  }}
                >
                  {departments.map((dept, index) => {
                    const score = dept.avg_score || 0;
                    const pct = Math.max(5, Math.min(100, Math.round((score / maxDeptScore) * 100)));
                    const color = deptColors[index % deptColors.length];
                    const gradient = deptGradients[index % deptGradients.length];

                    return (
                      <div key={dept.department || index}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "0.4rem",
                            fontSize: "0.88rem"
                          }}
                        >
                          <span style={{ color: "#fff", fontWeight: 700 }}>
                            {dept.department} ({dept.student_count} {dept.student_count === 1 ? "student" : "students"})
                          </span>
                          <span style={{ color: color, fontWeight: 800 }}>
                            {score} pts
                          </span>
                        </div>
                        <div className="fd-progress-bar-wrap" style={{ margin: 0 }}>
                          <div
                            className="fd-progress-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: gradient
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Performing Students Leaderboard (Displays Top 3 + Clickable to Open All Students or Student Detail) */}
            <div className="fd-card-panel">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem"
                }}
              >
                <div>
                  <h2 className="fd-section-title">
                    <Trophy size={20} style={{ color: "#F59E0B" }} />
                    Top Performing Students
                  </h2>
                  <p className="fd-section-subtitle">
                    {hasActiveFilters ? `Top rated in active filter (${filteredStudents.length} students)` : "Top rated coders across all courses in database"}
                  </p>
                </div>

                {filteredStudents.length > 0 && (
                  <button
                    className="fd-btn fd-btn-secondary"
                    onClick={() => setShowAllStudentsModal(true)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      background: "rgba(124, 92, 255, 0.12)",
                      border: "1px solid rgba(124, 92, 255, 0.3)",
                      color: "#A78BFA",
                      cursor: "pointer"
                    }}
                    title="View all students in serial order"
                  >
                    <Users size={14} />
                    View All ({filteredStudents.length})
                  </button>
                )}
              </div>

              {filteredStudents.length === 0 ? (
                <div
                  style={{
                    padding: "2.5rem 1rem",
                    textAlign: "center",
                    color: "#A5B4C3",
                    fontSize: "0.9rem"
                  }}
                >
                  No student submission records found for this filter.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                    marginTop: "1.2rem"
                  }}
                >
                  {/* ONLY show Top 3 students in this card */}
                  {filteredStudents.slice(0, 3).map((st, idx) => (
                    <div
                      key={st.id || idx}
                      onClick={() => setSelectedStudent(st)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1.1rem",
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(124, 92, 255, 0.08)";
                        e.currentTarget.style.borderColor = "rgba(124, 92, 255, 0.35)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                      title="Click to view complete student progress and details"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background:
                              idx === 0
                                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                : idx === 1
                                ? "linear-gradient(135deg, #94A3B8, #64748B)"
                                : "linear-gradient(135deg, #B45309, #78350F)",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow:
                              idx === 0
                                ? "0 0 12px rgba(245, 158, 11, 0.4)"
                                : "none"
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "0.92rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem"
                            }}
                          >
                            {st.name}
                          </div>
                          <div style={{ color: "#A5B4C3", fontSize: "0.76rem" }}>
                            {st.rollNo} • {st.department} {st.semester ? `(Sem ${st.semester})` : ""} {st.section ? `• Sec ${st.section}` : ""} • {st.solved} Solved
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            color: "#7C5CFF",
                            fontWeight: 800,
                            fontSize: "0.95rem"
                          }}
                        >
                          <Flame size={16} />
                          {st.score}
                        </div>
                        <ChevronRight size={16} style={{ color: "#64748B" }} />
                      </div>
                    </div>
                  ))}

                  {/* Button to open All Students Modal */}
                  <button
                    onClick={() => setShowAllStudentsModal(true)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      marginTop: "0.4rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px dashed rgba(255, 255, 255, 0.15)",
                      borderRadius: "10px",
                      color: "#A5B4C3",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(124, 92, 255, 0.1)";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "rgba(124, 92, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      e.currentTarget.style.color = "#A5B4C3";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    }}
                  >
                    <Users size={16} style={{ color: "#7C5CFF" }} />
                    View All {filteredStudents.length} Students in Serial Order →
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ALL STUDENTS SERIALWISE & GROUPED MODAL */}
      {showAllStudentsModal && (
        <div
          className="fd-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "fd-modal-overlay") setShowAllStudentsModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div
            className="fd-modal-card"
            style={{
              width: "min(1040px, 96vw)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              background: "#0F172A",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.4rem 2rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(15, 23, 42, 0.95)",
                flexWrap: "wrap",
                gap: "1rem"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Trophy size={22} style={{ color: "#F59E0B" }} />
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                    Students Completion Leaderboard
                  </h2>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: "0.2rem 0 0 0" }}>
                  Ranked list of students separated by Year, Semester, Class, and Subclass. Click any row to view full details.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                {/* Search Bar */}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Search size={15} style={{ position: "absolute", left: "12px", color: "#64748B" }} />
                  <input
                    type="text"
                    placeholder="Search by name, roll no..."
                    value={allStudentsSearch}
                    onChange={(e) => setAllStudentsSearch(e.target.value)}
                    style={{
                      padding: "0.5rem 1rem 0.5rem 2.2rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "0.82rem",
                      outline: "none",
                      width: "200px"
                    }}
                  />
                </div>

                <button
                  onClick={() => setShowAllStudentsModal(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                    padding: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
              {filteredModalStudents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#94A3B8" }}>
                  No students found matching your criteria.
                </div>
              ) : (
                <div className="fd-table-container" style={{ margin: 0 }}>
                  <table className="fd-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>Serial</th>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Semester</th>
                        <th>Class (Branch)</th>
                        <th>Subclass (Sec)</th>
                        <th>Problems Solved</th>
                        <th>Submissions</th>
                        <th>Coding Score</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModalStudents.map((st, idx) => {
                        const isTop3 = idx < 3;
                        return (
                          <tr
                            key={st.id || idx}
                            onClick={() => setSelectedStudent(st)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background:
                                    idx === 0
                                      ? "linear-gradient(135deg, #F59E0B, #D97706)"
                                      : idx === 1
                                      ? "linear-gradient(135deg, #94A3B8, #64748B)"
                                      : idx === 2
                                      ? "linear-gradient(135deg, #B45309, #78350F)"
                                      : "rgba(255, 255, 255, 0.05)",
                                  color: isTop3 ? "#fff" : "#94A3B8",
                                  fontWeight: 800,
                                  fontSize: "0.82rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: isTop3 ? "none" : "1px solid rgba(255, 255, 255, 0.1)"
                                }}
                              >
                                {idx + 1}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                                {st.name}
                              </div>
                              {st.email && (
                                <div style={{ fontSize: "0.76rem", color: "#64748B" }}>
                                  {st.email}
                                </div>
                              )}
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
                                {st.rollNo}
                              </span>
                            </td>
                            <td>
                              <span className="fd-badge fd-badge-primary" style={{ fontSize: "0.76rem" }}>
                                Sem {st.semester || 1}
                              </span>
                            </td>
                            <td>{st.department}</td>
                            <td>
                              <span className="fd-badge fd-badge-neutral" style={{ fontSize: "0.76rem" }}>
                                Sec {st.section || "A"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <CheckCircle2 size={14} style={{ color: "#22C55E" }} />
                                <strong style={{ color: "#fff" }}>{st.solved}</strong>
                                <span style={{ color: "#64748B", fontSize: "0.78rem" }}>solved</span>
                              </div>
                            </td>
                            <td>{st.totalSubmissions}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#7C5CFF", fontWeight: 800 }}>
                                <Flame size={15} />
                                {st.score} pts
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                className="fd-btn fd-btn-secondary"
                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.76rem" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(st);
                                }}
                              >
                                <ExternalLink size={12} /> Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE & PROGRESS DETAILS DRAWER / MODAL */}
      {selectedStudent && (
        <div
          className="fd-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "fd-modal-overlay") setSelectedStudent(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1050,
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <div className="fd-drawer-card" style={{ width: "min(820px, 94vw)" }}>
            {/* Drawer Header */}
            <div
              style={{
                padding: "1.5rem 2rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0F172A"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C5CFF, #38BDF8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: "#fff",
                    boxShadow: "0 0 20px rgba(124, 92, 255, 0.4)"
                  }}
                >
                  {selectedStudent.name
                    ? selectedStudent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                    : "ST"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                    <span className="fd-badge fd-badge-primary">
                      Rank #{selectedStudent.rank}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: "0.2rem 0 0 0" }}>
                    {selectedStudent.rollNo} • {selectedStudent.department} {selectedStudent.semester ? `• Semester ${selectedStudent.semester}` : ""} {selectedStudent.section ? `(Sec ${selectedStudent.section})` : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
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
              {/* Academic Details Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.8rem",
                  padding: "1rem 1.2rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  fontSize: "0.82rem"
                }}
              >
                <div>
                  <span style={{ color: "#64748B" }}>Email: </span>
                  <strong style={{ color: "#fff" }}>{selectedStudent.email || "N/A"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Roll Number: </span>
                  <strong style={{ color: "#fff" }}>{selectedStudent.rollNo || "N/A"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Class (Branch): </span>
                  <strong style={{ color: "#fff" }}>{selectedStudent.department || "General"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Semester & Section: </span>
                  <strong style={{ color: "#fff" }}>
                    Semester {selectedStudent.semester || 1} • Section {selectedStudent.section || "A"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748B" }}>Batch / Year: </span>
                  <strong style={{ color: "#fff" }}>{selectedStudent.batch || "2024-2028"}</strong>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="fd-stats-grid" style={{ marginBottom: 0 }}>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Coding Score</span>
                  <div className="fd-stat-value" style={{ color: "#7C5CFF" }}>
                    {selectedStudent.score} <span style={{ fontSize: "0.8rem", color: "#64748B" }}>pts</span>
                  </div>
                </div>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Problems Solved</span>
                  <div className="fd-stat-value" style={{ color: "#22C55E" }}>
                    {selectedStudent.solved}
                  </div>
                </div>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Total Submissions</span>
                  <div className="fd-stat-value" style={{ color: "#38BDF8" }}>
                    {selectedStudent.totalSubmissions}
                  </div>
                </div>
                <div className="fd-stat-card">
                  <span className="fd-stat-label">Accuracy Rate</span>
                  <div className="fd-stat-value" style={{ color: "#F59E0B" }}>
                    {selectedStudent.totalSubmissions > 0
                      ? `${Math.round((selectedStudent.acceptedCount / selectedStudent.totalSubmissions) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="fd-card-panel">
                <h3 style={{ fontSize: "1.05rem", color: "#fff", margin: "0 0 1rem 0" }}>
                  Problem Completion by Difficulty
                </h3>

                {studentDetailsLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#94A3B8" }}>
                    <Loader2 size={18} className="fd-spin" />
                    <span>Loading difficulty statistics...</span>
                  </div>
                ) : !studentProgress || studentProgress.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                    No problem attempts logged yet for this student.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    {studentProgress.map((prog) => {
                      const diff = (prog.difficulty || "easy").toLowerCase();
                      const solved = prog.solved_problems || 0;
                      const total = prog.total_problems || 0;
                      const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                      const color = diff === "easy" ? "#22C55E" : diff === "medium" ? "#F59E0B" : "#EF4444";

                      return (
                        <div
                          key={diff}
                          style={{
                            padding: "1rem",
                            background: "rgba(255,255,255,0.025)",
                            border: `1px solid ${color}30`,
                            borderRadius: "12px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ color: "#fff", fontWeight: 700, textTransform: "capitalize" }}>
                              {diff}
                            </span>
                            <span style={{ color: color, fontWeight: 800 }}>
                              {solved} / {total} Solved
                            </span>
                          </div>
                          <div className="fd-progress-bar-wrap" style={{ margin: 0 }}>
                            <div
                              className="fd-progress-bar-fill"
                              style={{
                                width: `${Math.max(5, pct)}%`,
                                background: color
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "0.4rem" }}>
                            {prog.total_submissions || 0} total attempts ({prog.accepted_submissions || 0} accepted)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Submissions Log */}
              <div className="fd-card-panel">
                <h3 style={{ fontSize: "1.05rem", color: "#fff", margin: "0 0 1rem 0" }}>
                  Recent Submission History
                </h3>

                {studentDetailsLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#94A3B8" }}>
                    <Loader2 size={18} className="fd-spin" />
                    <span>Loading submission logs...</span>
                  </div>
                ) : studentSubmissions.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: "0.88rem", textAlign: "center", padding: "1.5rem" }}>
                    No submissions recorded yet for this student.
                  </div>
                ) : (
                  <div className="fd-table-container" style={{ margin: 0 }}>
                    <table className="fd-table">
                      <thead>
                        <tr>
                          <th>Problem Title</th>
                          <th>Verdict</th>
                          <th>Language</th>
                          <th>Runtime</th>
                          <th>Submitted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentSubmissions.slice(0, 10).map((sub) => {
                          const isAccepted = sub.status === "accepted";
                          return (
                            <tr key={sub.id}>
                              <td style={{ fontWeight: 700, color: "#fff" }}>
                                {sub.problem_title || "Coding Challenge"}
                              </td>
                              <td>
                                <span
                                  className={`fd-badge ${
                                    isAccepted
                                      ? "fd-badge-success"
                                      : sub.status === "wrong_answer"
                                      ? "fd-badge-danger"
                                      : "fd-badge-warning"
                                  }`}
                                >
                                  {isAccepted ? "Accepted" : sub.status === "wrong_answer" ? "Wrong Answer" : sub.status || "Evaluated"}
                                </span>
                              </td>
                              <td style={{ fontFamily: "monospace" }}>
                                {sub.language?.toUpperCase() || "C++"}
                              </td>
                              <td style={{ fontFamily: "monospace" }}>
                                {sub.execution_time_ms ? `${sub.execution_time_ms} ms` : "0 ms"}
                              </td>
                              <td style={{ color: "#94A3B8", fontSize: "0.78rem" }}>
                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "Recently"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
