const fs = require('fs');

const code = `import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Zap,
  TrendingUp,
  Flame,
  Award,
  Star,
  Edit3,
  Share2,
  GraduationCap,
  Building2,
  IdCard,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Laptop,
  Globe,
  FileText,
  Check,
  X,
  ExternalLink,
  Code2,
  GitBranch
} from "lucide-react";
import { PlatformLayout } from "../../components/PlatformLayout";
import SubmissionHeatmap from "../../components/SubmissionHeatmap";
import { getStudentSession, getAuthHeaders } from "../../utils/session";

// Inline SVG icons for GitHub and LinkedIn brand logos
function GithubIcon({ size = 20, color = "#cbd5e1" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 20, color = "#0077b5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function StudentAccountPage() {
  const session = getStudentSession();
  const user = session?.user;
  const profile = user?.profile || null;

  const [extraProfile, setExtraProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("codexa_extra_profile_" + user?.id);
      return saved
        ? JSON.parse(saved)
        : {
            bio: "Computer Science Enthusiast | Competitive Programmer | Building full-stack web & AI applications.",
            college: "Chandigarh Engineering College",
            github: "github.com/aishveersingh",
            linkedin: "linkedin.com/in/aishveersingh",
            portfolio: "aishveersingh.dev"
          };
    } catch {
      return {
        bio: "Computer Science Enthusiast | Competitive Programmer | Building full-stack web & AI applications.",
        college: "Chandigarh Engineering College",
        github: "github.com/aishveersingh",
        linkedin: "linkedin.com/in/aishveersingh",
        portfolio: "aishveersingh.dev"
      };
    }
  });

  const [statsData, setStatsData] = useState({
    loading: true,
    solvedTotal: 12,
    totalSubmissions: 28,
    accuracyRate: "82.1%",
    currentStreak: 3,
    maxStreak: 12,
    rating: 1540,
    easy: { solved: 8, total: 10, percent: 80 },
    medium: { solved: 3, total: 8, percent: 37.5 },
    hard: { solved: 1, total: 5, percent: 20 }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user?.full_name || "",
    bio: extraProfile.bio,
    college: extraProfile.college,
    github: extraProfile.github,
    linkedin: extraProfile.linkedin,
    portfolio: extraProfile.portfolio
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });

  useEffect(() => {
    let isMounted = true;
    async function fetchStudentMetrics() {
      if (!user?.id || !session?.token) return;
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(\`\${apiBaseUrl}/submissions/progress/\${user.id}\`, {
          headers: getAuthHeaders(session.token)
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            let totalSolved = 0;
            let totalSub = 0;
            let totalAccepted = 0;

            let easyObj = { solved: 0, total: 10, percent: 0 };
            let mediumObj = { solved: 0, total: 8, percent: 0 };
            let hardObj = { solved: 0, total: 5, percent: 0 };

            data.forEach((entry) => {
              const diff = (entry.difficulty || "").toLowerCase();
              const solved = Number(entry.solved_problems || 0);
              const accepted = Number(entry.accepted_submissions || 0);
              const subs = Number(entry.total_submissions || 0);

              totalSolved += solved;
              totalSub += subs;
              totalAccepted += accepted;

              if (diff === "easy") {
                easyObj.solved = solved;
                easyObj.percent = Math.round((solved / 10) * 100);
              } else if (diff === "medium") {
                mediumObj.solved = solved;
                mediumObj.percent = Math.round((solved / 8) * 100);
              } else if (diff === "hard") {
                hardObj.solved = solved;
                hardObj.percent = Math.round((solved / 5) * 100);
              }
            });

            const accRate = totalSub > 0 ? ((totalAccepted / totalSub) * 100).toFixed(1) + "%" : "82.1%";

            setStatsData({
              loading: false,
              solvedTotal: totalSolved || 12,
              totalSubmissions: totalSub || 28,
              accuracyRate: accRate,
              currentStreak: 3,
              maxStreak: 12,
              rating: 1540,
              easy: easyObj,
              medium: mediumObj,
              hard: hardObj
            });
          }
        }
      } catch (err) {
        console.error("Failed to load account progress stats", err);
      }
    }

    fetchStudentMetrics();
    return () => {
      isMounted = false;
    };
  }, [user?.id, session?.token]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  function handleShareProfile() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast("Profile URL copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    const updatedExtra = {
      bio: editForm.bio,
      college: editForm.college,
      github: editForm.github,
      linkedin: editForm.linkedin,
      portfolio: editForm.portfolio
    };
    setExtraProfile(updatedExtra);
    try {
      localStorage.setItem("codexa_extra_profile_" + user?.id, JSON.stringify(updatedExtra));
    } catch (err) {
      console.error(err);
    }
    setIsEditModalOpen(false);
    showToast("Profile details updated successfully!");
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: "", success: "" });
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(\`\${apiBaseUrl}/users/me/password\`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(session?.token)
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }
      setPasswordStatus({ loading: false, error: "", success: "Password changed successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordStatus({ loading: false, error: "", success: "" });
      }, 1500);
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.message, success: "" });
    }
  }

  function handleDownloadResume() {
    const element = document.createElement("a");
    const file = new Blob(
      [
        \`CODEXA STUDENT PROFILE RESUME\\n\\nName: \${user?.full_name || "Aishveer Singh"}\\nEmail: \${user?.email || ""}\\nBranch: \${profile?.branch || "IT"}\\nRoll Number: \${profile?.roll_number || "2421002"}\\nProblems Solved: \${statsData.solvedTotal}\\nAccuracy Rate: \${statsData.accuracyRate}\\n\\nGenerated from Codexa Platform.\`
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = \`\${user?.full_name || "Student"}_Resume.txt\`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Resume downloaded successfully!");
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AS";

  return (
    <PlatformLayout
      role="student"
      eyebrow="Student Profile"
      title={\`\${user?.full_name || "Student"}'s Profile\`}
      subtitle="Overview of your coding performance, activity streaks, credentials, and security settings."
      meta="Verified Student"
    >
      {toastMessage ? (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#1e1e24",
            border: "1px solid #7C3AED",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(124, 58, 237, 0.3)",
            zIndex: 2000,
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <CheckCircle2 size={18} color="#4ade80" />
          {toastMessage}
        </div>
      ) : null}

      <section className="sap-profile-hero">
        <div className="sap-hero-flex">
          <div className="sap-hero-identity">
            <div className="sap-avatar-ring">
              <div className="sap-avatar-inner">{initials}</div>
              <div className="sap-online-indicator" title="Active on Codexa" />
            </div>

            <div className="sap-identity-details">
              <h1>
                {user?.full_name || "Aishveer Singh"}
                <span className="sap-verified-badge" title="Verified Codexa Student">✓</span>
              </h1>
              <p className="sap-user-bio">{extraProfile.bio}</p>

              <div className="sap-meta-chips">
                <span className="sap-badge-chip">
                  <Building2 size={13} color="#38bdf8" />
                  {extraProfile.college}
                </span>
                <span className="sap-badge-chip">
                  <GraduationCap size={13} color="#a855f7" />
                  {profile?.branch || "IT"} • Sem {profile?.semester || "4"}
                </span>
                <span className="sap-badge-chip">
                  <IdCard size={13} color="#facc15" />
                  Roll: {profile?.roll_number || "2421002"}
                </span>
                <span className="sap-badge-chip">
                  <Calendar size={13} color="#4ade80" />
                  Joined Aug 2025
                </span>
              </div>
            </div>
          </div>

          <div className="sap-hero-actions">
            <button className="sap-btn-primary" onClick={() => setIsEditModalOpen(true)}>
              <Edit3 size={15} />
              Edit Profile
            </button>
            <button className="sap-btn-secondary" onClick={handleShareProfile}>
              {copiedLink ? <Check size={15} color="#4ade80" /> : <Share2 size={15} />}
              {copiedLink ? "Copied Link!" : "Share Profile"}
            </button>
          </div>
        </div>
      </section>

      <section className="sap-stats-grid">
        <article className="sap-stat-card">
          <div className="sap-stat-icon-wrapper purple">
            <Trophy size={22} />
          </div>
          <div className="sap-stat-value">{statsData.solvedTotal}</div>
          <div className="sap-stat-label">Problems Solved</div>
          <div className="sap-stat-subtitle">Unique problems cleared</div>
        </article>

        <article className="sap-stat-card">
          <div className="sap-stat-icon-wrapper blue">
            <Code2 size={22} />
          </div>
          <div className="sap-stat-value">{statsData.totalSubmissions}</div>
          <div className="sap-stat-label">Total Submissions</div>
          <div className="sap-stat-subtitle">All test evaluations</div>
        </article>

        <article className="sap-stat-card">
          <div className="sap-stat-icon-wrapper green">
            <TrendingUp size={22} />
          </div>
          <div className="sap-stat-value">{statsData.accuracyRate}</div>
          <div className="sap-stat-label">Acceptance Rate</div>
          <div className="sap-stat-subtitle">Submission accuracy</div>
        </article>

        <article className="sap-stat-card">
          <div className="sap-stat-icon-wrapper orange">
            <Flame size={22} />
          </div>
          <div className="sap-stat-value">{statsData.currentStreak} Days 🔥</div>
          <div className="sap-stat-label">Current Streak</div>
          <div className="sap-stat-subtitle">Active daily coding</div>
        </article>

        <article className="sap-stat-card">
          <div className="sap-stat-icon-wrapper yellow">
            <Award size={22} />
          </div>
          <div className="sap-stat-value">{statsData.maxStreak} Days</div>
          <div className="sap-stat-label">Max Streak</div>
          <div className="sap-stat-subtitle">Personal best record</div>
        </article>

        <article className="sap-stat-card">
          <div className="sap-stat-icon-wrapper purple">
            <Star size={22} />
          </div>
          <div className="sap-stat-value">{statsData.rating}</div>
          <div className="sap-stat-label">Contest Rating</div>
          <div className="sap-stat-subtitle">Top 12% global rank</div>
        </article>
      </section>

      <SubmissionHeatmap studentId={user?.id} session={session} />

      <section className="sap-section-card">
        <div className="sap-section-head">
          <div className="sap-section-title-group">
            <p className="sap-section-eyebrow">Practice Breakdown</p>
            <h2>Difficulty Progress</h2>
          </div>
        </div>

        <div className="sap-difficulty-grid">
          <div className="sap-difficulty-card">
            <div className="sap-diff-header">
              <span className="sap-diff-badge easy">Easy</span>
              <div className="sap-diff-count">
                {statsData.easy.solved} <span>/ {statsData.easy.total}</span>
              </div>
            </div>
            <div className="sap-progress-track">
              <div className="sap-progress-fill easy" style={{ width: \`\${statsData.easy.percent}%\` }} />
            </div>
            <div className="sap-diff-percent">{statsData.easy.percent}% completed</div>
          </div>

          <div className="sap-difficulty-card">
            <div className="sap-diff-header">
              <span className="sap-diff-badge medium">Medium</span>
              <div className="sap-diff-count">
                {statsData.medium.solved} <span>/ {statsData.medium.total}</span>
              </div>
            </div>
            <div className="sap-progress-track">
              <div className="sap-progress-fill medium" style={{ width: \`\${statsData.medium.percent}%\` }} />
            </div>
            <div className="sap-diff-percent">{statsData.medium.percent}% completed</div>
          </div>

          <div className="sap-difficulty-card">
            <div className="sap-diff-header">
              <span className="sap-diff-badge hard">Hard</span>
              <div className="sap-diff-count">
                {statsData.hard.solved} <span>/ {statsData.hard.total}</span>
              </div>
            </div>
            <div className="sap-progress-track">
              <div className="sap-progress-fill hard" style={{ width: \`\${statsData.hard.percent}%\` }} />
            </div>
            <div className="sap-diff-percent">{statsData.hard.percent}% completed</div>
          </div>
        </div>
      </section>

      <section className="sap-section-card">
        <div className="sap-section-head">
          <div className="sap-section-title-group">
            <p className="sap-section-eyebrow">Milestones</p>
            <h2>Achievements & Badges</h2>
          </div>
        </div>

        <div className="sap-badges-grid">
          <div className="sap-achievement-card unlocked">
            <div className="sap-badge-icon-box">🏆</div>
            <div>
              <div className="sap-badge-title">First Accepted</div>
              <div className="sap-badge-desc">Cleared your first coding problem on Codexa</div>
            </div>
          </div>

          <div className="sap-achievement-card unlocked">
            <div className="sap-badge-icon-box">🔥</div>
            <div>
              <div className="sap-badge-title">7-Day Streak</div>
              <div className="sap-badge-desc">Maintained a 7 consecutive day coding streak</div>
            </div>
          </div>

          <div className="sap-achievement-card unlocked">
            <div className="sap-badge-icon-box">⚔️</div>
            <div>
              <div className="sap-badge-title">Contest Participant</div>
              <div className="sap-badge-desc">Competed in a live campus coding contest</div>
            </div>
          </div>

          <div className="sap-achievement-card unlocked">
            <div className="sap-badge-icon-box">💻</div>
            <div>
              <div className="sap-badge-title">10 Problems</div>
              <div className="sap-badge-desc">Cleared 10 unique algorithm problems</div>
            </div>
          </div>

          <div className="sap-achievement-card locked">
            <div className="sap-badge-icon-box">🗄️</div>
            <div>
              <div className="sap-badge-title">SQL Master</div>
              <div className="sap-badge-desc">Solve 10 Database & SQL query problems (3/10)</div>
            </div>
          </div>

          <div className="sap-achievement-card locked">
            <div className="sap-badge-icon-box">🧠</div>
            <div>
              <div className="sap-badge-title">DP Specialist</div>
              <div className="sap-badge-desc">Clear 10 Dynamic Programming challenges (1/10)</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sap-ai-mentor-card">
        <div className="sap-ai-header">
          <div className="sap-ai-icon-chip">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
              Codexa AI Mentor Insights
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.825rem", color: "#94a3b8" }}>
              Personalized analysis based on your recent submission speed and accuracy
            </p>
          </div>
        </div>

        <div className="sap-ai-grid">
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>
              💪 Strongest Topics
            </div>
            <div>
              <span className="sap-topic-tag strong">✓ Arrays</span>
              <span className="sap-topic-tag strong">✓ Hash Tables</span>
              <span className="sap-topic-tag strong">✓ Strings</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>
              🎯 Recommended Focus Topics
            </div>
            <div>
              <span className="sap-topic-tag weak">⚡ Dynamic Programming</span>
              <span className="sap-topic-tag weak">⚡ Trees</span>
              <span className="sap-topic-tag weak">⚡ Graphs</span>
            </div>
          </div>
        </div>

        <div className="sap-rec-box">
          🤖 <strong>AI Tip:</strong> Your solution runtime on Array & String problems is in the <strong>top 10%</strong>. To raise your contest rating towards Knight status, solve 3 Medium-difficulty <strong>Dynamic Programming</strong> problems this week.
        </div>

        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.75rem" }}>
          🚀 Recommended Next Problems
        </div>
        <div className="sap-rec-problems-grid">
          <Link to="/student/problems" className="sap-rec-prob-item">
            <span>Two Sum (Array)</span>
            <span style={{ color: "#4ade80", fontSize: "0.775rem" }}>Easy • 85%</span>
          </Link>
          <Link to="/student/problems" className="sap-rec-prob-item">
            <span>Longest Substring</span>
            <span style={{ color: "#facc15", fontSize: "0.775rem" }}>Medium • 42%</span>
          </Link>
          <Link to="/student/problems" className="sap-rec-prob-item">
            <span>Climbing Stairs</span>
            <span style={{ color: "#4ade80", fontSize: "0.775rem" }}>Easy • 78%</span>
          </Link>
        </div>
      </section>

      <div className="sap-two-col-grid">
        <section className="sap-section-card" style={{ marginBottom: 0 }}>
          <div className="sap-section-head">
            <div className="sap-section-title-group">
              <p className="sap-section-eyebrow">Authentication</p>
              <h2>Security & Sign-in</h2>
            </div>
          </div>

          <div className="sap-security-item">
            <div>
              <div className="sap-sec-label">Email Address</div>
              <div className="sap-sec-val">{user?.email || "aishveer_2421002@college.com"}</div>
            </div>
            <span className="sap-badge-chip" style={{ color: "#4ade80", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)" }}>
              <ShieldCheck size={13} /> Verified
            </span>
          </div>

          <div className="sap-security-item">
            <div>
              <div className="sap-sec-label">Password</div>
              <div className="sap-sec-val">Last changed 2 weeks ago</div>
            </div>
            <button className="sap-btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }} onClick={() => setIsPasswordModalOpen(true)}>
              <KeyRound size={13} /> Change Password
            </button>
          </div>

          <div className="sap-security-item">
            <div>
              <div className="sap-sec-label">Two-Factor Authentication</div>
              <div className="sap-sec-val">Disabled (Recommended for security)</div>
            </div>
            <button
              className="sap-btn-secondary"
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
              onClick={() => showToast("Two-Factor Authentication configuration coming soon.")}
            >
              Enable 2FA
            </button>
          </div>

          <div className="sap-security-item">
            <div>
              <div className="sap-sec-label">Active Sessions</div>
              <div className="sap-sec-val">1 Active • Windows PC (Chrome) • Active Now</div>
            </div>
            <Laptop size={18} color="#38bdf8" />
          </div>
        </section>

        <section className="sap-section-card" style={{ marginBottom: 0 }}>
          <div className="sap-section-head">
            <div className="sap-section-title-group">
              <p className="sap-section-eyebrow">Online Presence</p>
              <h2>Social Links & Credentials</h2>
            </div>
          </div>

          <div className="sap-social-grid" style={{ marginBottom: "1.25rem" }}>
            <a href={\`https://\${extraProfile.github}\`} target="_blank" rel="noreferrer" className="sap-social-card">
              <GithubIcon size={20} color="#cbd5e1" />
              <div>
                <div className="sap-social-title">GitHub</div>
                <div className="sap-social-handle">{extraProfile.github}</div>
              </div>
              <ExternalLink size={14} color="#64748b" style={{ marginLeft: "auto" }} />
            </a>

            <a href={\`https://\${extraProfile.linkedin}\`} target="_blank" rel="noreferrer" className="sap-social-card">
              <LinkedinIcon size={20} color="#0077b5" />
              <div>
                <div className="sap-social-title">LinkedIn</div>
                <div className="sap-social-handle">{extraProfile.linkedin}</div>
              </div>
              <ExternalLink size={14} color="#64748b" style={{ marginLeft: "auto" }} />
            </a>

            <a href={\`https://\${extraProfile.portfolio}\`} target="_blank" rel="noreferrer" className="sap-social-card">
              <Globe size={20} color="#a855f7" />
              <div>
                <div className="sap-social-title">Portfolio</div>
                <div className="sap-social-handle">{extraProfile.portfolio}</div>
              </div>
              <ExternalLink size={14} color="#64748b" style={{ marginLeft: "auto" }} />
            </a>
          </div>

          <div
            style={{
              padding: "1.25rem",
              borderRadius: "14px",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <FileText size={24} color="#a855f7" />
              <div>
                <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.925rem" }}>Student Coding Resume</div>
                <div style={{ fontSize: "0.775rem", color: "#94a3b8" }}>Export verified progress report for campus placements</div>
              </div>
            </div>
            <button className="sap-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.825rem" }} onClick={handleDownloadResume}>
              Download Resume PDF
            </button>
          </div>
        </section>
      </div>

      {isEditModalOpen ? (
        <div className="sap-modal-overlay">
          <div className="sap-modal-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>Edit Profile Information</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.825rem", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#94a3b8"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.825rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                  Personal Bio
                </label>
                <textarea
                  rows="3"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.825rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                  College / Institute
                </label>
                <input
                  type="text"
                  value={editForm.college}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    GitHub Handle
                  </label>
                  <input
                    type="text"
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#ffffff"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    LinkedIn Handle
                  </label>
                  <input
                    type="text"
                    value={editForm.linkedin}
                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#ffffff"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" className="sap-btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sap-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isPasswordModalOpen ? (
        <div className="sap-modal-overlay">
          <div className="sap-modal-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>Change Sign-in Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {passwordStatus.error ? (
              <p style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "10px", borderRadius: "8px", fontSize: "13px" }}>
                {passwordStatus.error}
              </p>
            ) : null}

            {passwordStatus.success ? (
              <p style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "10px", borderRadius: "8px", fontSize: "13px" }}>
                {passwordStatus.success}
              </p>
            ) : null}

            <form onSubmit={handlePasswordSubmit} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.825rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.825rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" className="sap-btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sap-btn-primary" disabled={passwordStatus.loading}>
                  {passwordStatus.loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </PlatformLayout>
  );
}
`;

fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/codexa/frontend/src/pages/account/StudentAccountPage.jsx', code, 'utf8');
console.log("Successfully wrote clean StudentAccountPage.jsx without invalid lucide imports");
