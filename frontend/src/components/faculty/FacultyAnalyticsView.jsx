import React, { useState } from "react";
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
  FileText
} from "lucide-react";

export default function FacultyAnalyticsView() {
  const [toastMsg, setToastMsg] = useState("");

  const handleExport = (format) => {
    setToastMsg(`Exporting Analytics report as ${format.toUpperCase()}...`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Generate GitHub style heatmap matrix grid (52 weeks x 7 days)
  const renderHeatmap = () => {
    const days = 7;
    const weeks = 36;
    const cells = [];
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        // Random activity level 0-4
        const rand = (w * 7 + d) % 5;
        cells.push(
          <div
            key={`${w}-${d}`}
            className={`fd-heatmap-cell level-${rand}`}
            title={`Day ${w * 7 + d + 1}: ${rand * 14} submissions & attendance mark`}
          />
        );
      }
    }
    return cells;
  };

  const topStudents = [
    { rank: 1, name: "Sneha Patel", rollNo: "2023-AI-019", score: 975, solved: 142 },
    { rank: 2, name: "Rahul Sharma", rollNo: "2023-CS-104", score: 920, solved: 128 },
    { rank: 3, name: "Anya Gupta", rollNo: "2023-IT-088", score: 845, solved: 110 },
    { rank: 4, name: "Arjun Mehta", rollNo: "2023-CS-055", score: 810, solved: 104 },
    { rank: 5, name: "Priya Das", rollNo: "2023-AI-042", score: 795, solved: 98 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
            Detailed metrics on student engagement, submissions, attendance heatmap, and rankings
          </p>
        </div>

        {/* Export Buttons */}
        <div className="fd-filters-group">
          <button
            className="fd-btn fd-btn-secondary"
            onClick={() => handleExport("PDF")}
          >
            <FileText size={15} /> PDF
          </button>
          <button
            className="fd-btn fd-btn-secondary"
            onClick={() => handleExport("Excel")}
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            className="fd-btn fd-btn-primary"
            onClick={() => handleExport("CSV")}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="fd-stats-grid">
        <div className="fd-stat-card">
          <div className="fd-stat-header">
            <span className="fd-stat-label">Average Attendance</span>
            <span className="fd-stat-growth-badge positive">+1.8%</span>
          </div>
          <div className="fd-stat-value" style={{ color: "#22C55E" }}>
            91.2%
          </div>
        </div>

        <div className="fd-stat-card">
          <div className="fd-stat-header">
            <span className="fd-stat-label">Average Coding Score</span>
            <span className="fd-stat-growth-badge positive">+24 pts</span>
          </div>
          <div className="fd-stat-value" style={{ color: "#7C5CFF" }}>
            785 / 1000
          </div>
        </div>

        <div className="fd-stat-card">
          <div className="fd-stat-header">
            <span className="fd-stat-label">Problems Solved</span>
            <span className="fd-stat-growth-badge positive">+142 this week</span>
          </div>
          <div className="fd-stat-value" style={{ color: "#38BDF8" }}>
            1,420
          </div>
        </div>

        <div className="fd-stat-card">
          <div className="fd-stat-header">
            <span className="fd-stat-label">Acceptance Rate</span>
            <span className="fd-stat-growth-badge neutral">Stable</span>
          </div>
          <div className="fd-stat-value" style={{ color: "#F59E0B" }}>
            68.4%
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
              Daily submission frequency and student login density matrix
            </p>
          </div>
          <span className="fd-badge fd-badge-success">Live System Stream</span>
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
          <p className="fd-section-subtitle">Average coding score by department</p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              marginTop: "1.5rem"
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem",
                  fontSize: "0.88rem"
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  Computer Science (CS)
                </span>
                <span style={{ color: "#7C5CFF", fontWeight: 800 }}>865 pts</span>
              </div>
              <div className="fd-progress-bar-wrap" style={{ margin: 0 }}>
                <div
                  className="fd-progress-bar-fill"
                  style={{
                    width: "86.5%",
                    background: "linear-gradient(90deg, #7C5CFF, #6366F1)"
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem",
                  fontSize: "0.88rem"
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  Information Technology (IT)
                </span>
                <span style={{ color: "#38BDF8", fontWeight: 800 }}>810 pts</span>
              </div>
              <div className="fd-progress-bar-wrap" style={{ margin: 0 }}>
                <div
                  className="fd-progress-bar-fill"
                  style={{
                    width: "81%",
                    background: "linear-gradient(90deg, #38BDF8, #0EA5E9)"
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem",
                  fontSize: "0.88rem"
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  Artificial Intelligence (AI-DS)
                </span>
                <span style={{ color: "#22C55E", fontWeight: 800 }}>915 pts</span>
              </div>
              <div className="fd-progress-bar-wrap" style={{ margin: 0 }}>
                <div
                  className="fd-progress-bar-fill"
                  style={{
                    width: "91.5%",
                    background: "linear-gradient(90deg, #22C55E, #10B981)"
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Students Leaderboard */}
        <div className="fd-card-panel">
          <h2 className="fd-section-title">
            <Trophy size={20} style={{ color: "#F59E0B" }} />
            Top Performing Students
          </h2>
          <p className="fd-section-subtitle">Highest rated coders across courses</p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              marginTop: "1.2rem"
            }}
          >
            {topStudents.map((st) => (
              <div
                key={st.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.8rem 1rem",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background:
                        st.rank === 1
                          ? "linear-gradient(135deg, #F59E0B, #D97706)"
                          : st.rank === 2
                          ? "linear-gradient(135deg, #94A3B8, #64748B)"
                          : "linear-gradient(135deg, #B45309, #78350F)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {st.rank}
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
                      {st.name}
                    </div>
                    <div style={{ color: "#A5B4C3", fontSize: "0.76rem" }}>
                      {st.rollNo} • {st.solved} Solved
                    </div>
                  </div>
                </div>

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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
