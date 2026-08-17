import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  FileCheck,
  Clock,
  Code2,
  TrendingUp,
  PlusCircle,
  Calendar,
  UploadCloud,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  UserPlus,
  Zap,
  Activity,
  Flame,
  Award
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { getFacultySession } from "../../utils/session";

export default function FacultyDashboardOverview({ onQuickAction, onNavigateTab }) {
  const session = getFacultySession();
  const token = session?.token;

  const [activeChartTab, setActiveChartTab] = useState("performance");

  const [metrics, setMetrics] = useState({
    coursesCount: 6,
    studentsCount: 248,
    assignmentsCount: 18,
    evaluationsCount: 32,
    problemsCount: 142,
    avgPerformance: "84.5%"
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardMetrics() {
      if (!token) return;
      try {
        const [coursesRes, studentsRes, problemsRes] = await Promise.allSettled([
          apiRequest("/courses", {}, token),
          apiRequest("/users/students/accessible", {}, token),
          apiRequest("/problems", {}, token)
        ]);

        if (isMounted) {
          const courses = coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value) ? coursesRes.value : [];
          const students = studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value) ? studentsRes.value : [];
          const problems = problemsRes.status === "fulfilled" && Array.isArray(problemsRes.value) ? problemsRes.value : [];

          setMetrics({
            coursesCount: courses.length || 6,
            studentsCount: students.length || 248,
            assignmentsCount: 18,
            evaluationsCount: 32,
            problemsCount: problems.length || 142,
            avgPerformance: "84.5%"
          });
        }
      } catch (_err) {
        // Fallback to baseline
      }
    }

    fetchDashboardMetrics();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Top Statistics Data
  const stats = [
    {
      id: "courses",
      label: "Total Courses",
      value: String(metrics.coursesCount),
      growth: "+2 this sem",
      isPositive: true,
      icon: BookOpen,
      color: "#6366F1",
      sparkline: "M 0,25 Q 15,10 30,22 T 60,12 T 76,5"
    },
    {
      id: "students",
      label: "Total Students",
      value: String(metrics.studentsCount),
      growth: "+14%",
      isPositive: true,
      icon: Users,
      color: "#0EA5E9",
      sparkline: "M 0,28 Q 15,20 30,15 T 60,8 T 76,2"
    },
    {
      id: "assignments",
      label: "Active Assignments",
      value: String(metrics.assignmentsCount),
      growth: "4 due today",
      isPositive: true,
      icon: FileCheck,
      color: "#10B981",
      sparkline: "M 0,18 Q 15,24 30,10 T 60,20 T 76,12"
    },
    {
      id: "evaluations",
      label: "Pending Evaluations",
      value: String(metrics.evaluationsCount),
      growth: "-12% urgency",
      isPositive: false,
      icon: Clock,
      color: "#F59E0B",
      sparkline: "M 0,5 Q 15,18 30,12 T 60,22 T 76,26"
    },
    {
      id: "problems",
      label: "Coding Problems",
      value: String(metrics.problemsCount),
      growth: "+18 new",
      isPositive: true,
      icon: Code2,
      color: "#EC4899",
      sparkline: "M 0,22 Q 15,15 30,18 T 60,8 T 76,3"
    },
    {
      id: "performance",
      label: "Avg Class Performance",
      value: metrics.avgPerformance,
      growth: "+3.2%",
      isPositive: true,
      icon: TrendingUp,
      color: "#8B5CF6",
      sparkline: "M 0,20 Q 15,25 30,14 T 60,6 T 76,2"
    }
  ];

  // Quick Action Buttons Data
  const quickActions = [
    {
      id: "create_course",
      title: "Create Course",
      desc: "Setup new academic module",
      icon: PlusCircle,
      gradient: "rgba(99, 102, 241, 0.15)",
      iconColor: "#818CF8"
    },
    {
      id: "create_assignment",
      title: "Create Assignment",
      desc: "Assign theory or code task",
      icon: FileCheck,
      gradient: "rgba(14, 165, 233, 0.15)",
      iconColor: "#38BDF8"
    },
    {
      id: "add_problem",
      title: "Add Coding Problem",
      desc: "Create test cases & problem",
      icon: Code2,
      gradient: "rgba(236, 72, 153, 0.15)",
      iconColor: "#F472B6"
    },
    {
      id: "schedule_class",
      title: "Schedule Class",
      desc: "Set live lecture or lab hour",
      icon: Calendar,
      gradient: "rgba(16, 185, 129, 0.15)",
      iconColor: "#34D399"
    },
    {
      id: "upload_notes",
      title: "Upload Notes",
      desc: "Share PDFs & slides resources",
      icon: UploadCloud,
      gradient: "rgba(245, 158, 11, 0.15)",
      iconColor: "#FBBF24"
    },
    {
      id: "create_contest",
      title: "Create Contest",
      desc: "Host timed coding competition",
      icon: Trophy,
      gradient: "rgba(139, 92, 246, 0.15)",
      iconColor: "#A78BFA"
    }
  ];

  // Recent Activity Feed
  const recentActivities = [
    {
      id: 1,
      title: "Recent Assignment Submitted",
      meta: "Rahul Sharma submitted 'Dynamic Programming & Knapsack' (CS-301)",
      time: "8 mins ago",
      icon: CheckCircle2,
      color: "#10B981"
    },
    {
      id: 2,
      title: "Student Joined Course",
      meta: "Anya Gupta enrolled in 'Full-Stack Web Engineering' (IT-402)",
      time: "24 mins ago",
      icon: UserPlus,
      color: "#0EA5E9"
    },
    {
      id: 3,
      title: "Contest Created",
      meta: "Published 'Codexa Hackathon Spring '26' with 5 coding problems",
      time: "1 hour ago",
      icon: Trophy,
      color: "#6366F1"
    },
    {
      id: 4,
      title: "Problem Published",
      meta: "Created new Hard problem 'Graph Shortest Path with K Stops'",
      time: "3 hours ago",
      icon: Code2,
      color: "#EC4899"
    },
    {
      id: 5,
      title: "Assignment Deadline Updated",
      meta: "Extended submission deadline for CS-201 Data Structures by 2 days",
      time: "5 hours ago",
      icon: Zap,
      color: "#F59E0B"
    }
  ];

  // Upcoming Schedule / Events
  const upcomingEvents = [
    {
      id: 1,
      title: "CS-301: Advanced Algorithms Lecture",
      subtitle: "Topic: Graph Traversals & Topological Sorting",
      date: "07",
      month: "AUG",
      time: "02:00 PM - 03:30 PM",
      badge: "Today",
      badgeClass: "fd-badge-success"
    },
    {
      id: 2,
      title: "Binary Trees Assignment Deadline",
      subtitle: "248 enrolled students due",
      date: "08",
      month: "AUG",
      time: "11:59 PM",
      badge: "Tomorrow",
      badgeClass: "fd-badge-warning"
    },
    {
      id: 3,
      title: "Codexa Bi-Weekly Sprint Contest",
      subtitle: "Timed contest with automated evaluation",
      date: "10",
      month: "AUG",
      time: "06:00 PM - 09:00 PM",
      badge: "Upcoming",
      badgeClass: "fd-badge-primary"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Statistics Cards Grid */}
      <div className="fd-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="fd-stat-card">
              <div className="fd-stat-header">
                <div
                  className="fd-stat-icon-wrapper"
                  style={{
                    background: stat.color + "18",
                    color: stat.color,
                    border: `1px solid ${stat.color}30`
                  }}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`fd-stat-growth-badge ${
                    stat.isPositive ? "positive" : "warning"
                  }`}
                >
                  {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.growth}
                </span>
              </div>
              <div className="fd-stat-body">
                <div>
                  <div className="fd-stat-label">{stat.label}</div>
                  <div className="fd-stat-value">{stat.value}</div>
                </div>
                {/* SVG Mini Sparkline */}
                <svg className="fd-sparkline" viewBox="0 0 76 32">
                  <path
                    d={stat.sparkline}
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div>
        <div className="fd-section-title-wrap">
          <div>
            <h2 className="fd-section-title">
              <Zap size={20} style={{ color: "#6366F1" }} />
              Quick Actions
            </h2>
            <p className="fd-section-subtitle">
              Instantly create courses, assignments, problems, or classes
            </p>
          </div>
        </div>

        <div className="fd-quick-actions-grid">
          {quickActions.map((action) => {
            const AIcon = action.icon;
            return (
              <button
                key={action.id}
                className="fd-quick-action-card"
                onClick={() => onQuickAction(action.id)}
              >
                <div
                  className="fd-action-icon-box"
                  style={{ background: action.gradient, color: action.iconColor || "#fff" }}
                >
                  <AIcon size={22} />
                </div>
                <div>
                  <h3 className="fd-action-title">{action.title}</h3>
                  <p className="fd-action-desc">{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Interactive Charts Preview Card */}
      <div className="fd-card-panel">
        <div className="fd-section-title-wrap">
          <div>
            <h2 className="fd-section-title">
              <Activity size={20} style={{ color: "#0EA5E9" }} />
              Analytics & Insights Preview
            </h2>
            <p className="fd-section-subtitle">
              Live performance visualizer across all enrolled batches
            </p>
          </div>
          <button
            className="fd-btn fd-btn-secondary"
            onClick={() => onNavigateTab("analytics")}
          >
            Full Analytics <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Chart View Selector Tabs */}
        <div className="fd-chart-container">
          <div className="fd-chart-header-tabs">
            <button
              className={`fd-chart-tab-btn ${
                activeChartTab === "performance" ? "active" : ""
              }`}
              onClick={() => setActiveChartTab("performance")}
            >
              Student Performance
            </button>
            <button
              className={`fd-chart-tab-btn ${
                activeChartTab === "submissions" ? "active" : ""
              }`}
              onClick={() => setActiveChartTab("submissions")}
            >
              Coding Submission Trend
            </button>
            <button
              className={`fd-chart-tab-btn ${
                activeChartTab === "attendance" ? "active" : ""
              }`}
              onClick={() => setActiveChartTab("attendance")}
            >
              Attendance Trend
            </button>
            <button
              className={`fd-chart-tab-btn ${
                activeChartTab === "completion" ? "active" : ""
              }`}
              onClick={() => setActiveChartTab("completion")}
            >
              Assignment Completion
            </button>
            <button
              className={`fd-chart-tab-btn ${
                activeChartTab === "engagement" ? "active" : ""
              }`}
              onClick={() => setActiveChartTab("engagement")}
            >
              Course Engagement
            </button>
          </div>

          {/* SVG Area/Line Chart Canvas */}
          <div
            style={{
              background: "rgba(10, 14, 23, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "1.4rem",
              position: "relative"
            }}
          >
            <svg
              className="fd-svg-chart"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
              <line x1="0" y1="220" x2="800" y2="220" stroke="rgba(255,255,255,0.07)" />

              {/* Chart Filled Area */}
              {activeChartTab === "performance" && (
                <>
                  <path
                    d="M 0,180 Q 100,110 200,130 T 400,60 T 600,90 T 800,30 L 800,220 L 0,220 Z"
                    fill="url(#chartGlow)"
                  />
                  <path
                    d="M 0,180 Q 100,110 200,130 T 400,60 T 600,90 T 800,30"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="3"
                  />
                  <circle cx="200" cy="130" r="4" fill="#0EA5E9" />
                  <circle cx="400" cy="60" r="4" fill="#6366F1" />
                  <circle cx="600" cy="90" r="4" fill="#10B981" />
                  <circle cx="800" cy="30" r="5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
                </>
              )}

              {activeChartTab === "submissions" && (
                <>
                  <path
                    d="M 0,200 Q 120,80 240,150 T 480,40 T 720,110 T 800,20 L 800,220 L 0,220 Z"
                    fill="url(#chartGlow)"
                  />
                  <path
                    d="M 0,200 Q 120,80 240,150 T 480,40 T 720,110 T 800,20"
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="3"
                  />
                </>
              )}

              {activeChartTab === "attendance" && (
                <>
                  <path
                    d="M 0,60 Q 150,40 300,50 T 600,30 T 800,45 L 800,220 L 0,220 Z"
                    fill="url(#chartGlow)"
                  />
                  <path
                    d="M 0,60 Q 150,40 300,50 T 600,30 T 800,45"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                  />
                </>
              )}

              {activeChartTab === "completion" && (
                <>
                  <path
                    d="M 0,140 Q 100,180 250,90 T 550,110 T 800,40 L 800,220 L 0,220 Z"
                    fill="url(#chartGlow)"
                  />
                  <path
                    d="M 0,140 Q 100,180 250,90 T 550,110 T 800,40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                  />
                </>
              )}

              {activeChartTab === "engagement" && (
                <>
                  <path
                    d="M 0,160 Q 130,50 280,120 T 580,30 T 800,70 L 800,220 L 0,220 Z"
                    fill="url(#chartGlow)"
                  />
                  <path
                    d="M 0,160 Q 130,50 280,120 T 580,30 T 800,70"
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="3"
                  />
                </>
              )}
            </svg>

            {/* Chart X Labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.8rem",
                color: "#64748B",
                fontSize: "0.78rem",
                fontWeight: 600
              }}
            >
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Activity & Upcoming Events */}
      <div className="fd-grid-2col">
        {/* Recent Activity Card */}
        <div className="fd-card-panel">
          <h2 className="fd-section-title">
            <Activity size={20} style={{ color: "#6366F1" }} />
            Recent Activity
          </h2>
          <p className="fd-section-subtitle">Real-time student & course events</p>

          <div className="fd-timeline">
            {recentActivities.map((act) => {
              const AIcon = act.icon;
              return (
                <div key={act.id} className="fd-timeline-item">
                  <div
                    className="fd-timeline-icon"
                    style={{
                      background: act.color + "18",
                      color: act.color,
                      borderColor: act.color
                    }}
                  >
                    <AIcon size={16} />
                  </div>
                  <div className="fd-timeline-content">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <h4 className="fd-timeline-title">{act.title}</h4>
                      <span className="fd-timeline-time">{act.time}</span>
                    </div>
                    <p className="fd-timeline-meta">{act.meta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Calendar Widget */}
        <div className="fd-card-panel">
          <h2 className="fd-section-title">
            <Calendar size={20} style={{ color: "#0EA5E9" }} />
            Upcoming Events & Schedule
          </h2>
          <p className="fd-section-subtitle">Today's classes, deadlines & contests</p>

          <div className="fd-events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="fd-event-card">
                <div className="fd-event-date-box">
                  <div className="fd-event-date-day">{event.date}</div>
                  <div className="fd-event-date-month">{event.month}</div>
                </div>
                <div className="fd-event-info">
                  <h4 className="fd-event-title">{event.title}</h4>
                  <p className="fd-event-subtitle">
                    {event.subtitle} • {event.time}
                  </p>
                </div>
                <span className={`fd-event-badge ${event.badgeClass}`}>
                  {event.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
