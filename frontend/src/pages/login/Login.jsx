import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveStudentSession, saveFacultySession, saveAdminSession } from "../../utils/session";
import { apiRequest } from "../../utils/api";

const initialForm = {
  email: "",
  password: ""
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    document.title = "Codexa | Developer Login";
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({
      type: "",
      message: ""
    });

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const session = {
        token: data.token,
        user: data.user
      };

      const role = data.user.role;

      if (role === "admin") {
        saveAdminSession(session);
        setStatus({
          type: "success",
          message: data.message || "Admin login successful."
        });
        navigate("/admin/dashboard", { state: { session } });
      } else if (role === "faculty") {
        saveFacultySession(session);
        setStatus({
          type: "success",
          message: data.message || "Faculty login successful."
        });
        navigate("/faculty/dashboard", { state: { session } });
      } else if (role === "student") {
        saveStudentSession(session);
        setStatus({
          type: "success",
          message: data.message || "Student login successful."
        });
        navigate("/student/dashboard", { state: { session } });
      } else {
        throw new Error("Invalid user role received.");
      }

      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="lc-login-container">
      <style>{`
        /* Import premium font */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .lc-login-container {
          --lc-bg: #0A0D14;
          --lc-card-bg: rgba(10, 14, 23, 0.3);
          --lc-left-bg: radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.05), rgba(10, 14, 23, 0.2) 70%);
          --lc-right-bg: rgba(10, 14, 23, 0.4);
          --lc-border: rgba(255, 255, 255, 0.08);
          --lc-text-primary: #EFF1F6;
          --lc-text-secondary: #9BA3B0;
          --lc-text-muted: #5A6372;
          
          --lc-input-bg: #0E1320;
          --lc-input-border: rgba(255, 255, 255, 0.06);
          --lc-input-focus-bg: #080B10;
          
          --lc-code-bg: #080B10;
          --lc-code-border: rgba(255, 255, 255, 0.05);
          --lc-code-text: #D8DEE9;
          --lc-code-keyword: #E7A43F;
          --lc-code-string: #A3BE8C;
          --lc-code-comment: #4C566A;
          --lc-code-function: #88C0D0;
          
          --lc-verdict-bg: rgba(13, 20, 33, 0.85);
          --lc-verdict-border: rgba(129, 199, 132, 0.2);
          --lc-dot-grid: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          --lc-brand-text: linear-gradient(to right, #FFFFFF, #B0B5C1);

          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          min-height: 100vh;
          background-image: url("/bg-codexa.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: var(--lc-text-primary);
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          padding: 24px;
          overflow: hidden;
          box-sizing: border-box;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Light Theme overrides - outer remains black, inner transitions to soft slate dim theme */
        [data-theme="light"] .lc-login-container {
          --lc-card-bg: rgba(203, 213, 225, 0.3);
          --lc-left-bg: rgba(226, 232, 240, 0.3);
          --lc-right-bg: rgba(203, 213, 225, 0.4);
          --lc-border: rgba(15, 23, 42, 0.15);
          --lc-text-primary: #0F172A;
          --lc-text-secondary: #334155;
          --lc-text-muted: #475569;
          
          --lc-input-bg: #F1F5F9;
          --lc-input-border: rgba(15, 23, 42, 0.15);
          --lc-input-focus-bg: #FFFFFF;
          
          --lc-code-bg: #0F172A;
          --lc-code-border: rgba(255, 255, 255, 0.05);
          --lc-code-text: #E2E8F0;
          --lc-code-keyword: #F59E0B;
          --lc-code-string: #10B981;
          --lc-code-comment: #64748B;
          --lc-code-function: #38BDF8;
          
          --lc-verdict-bg: rgba(15, 23, 42, 0.85);
          --lc-verdict-border: rgba(15, 23, 42, 0.08);
          --lc-brand-text: linear-gradient(to right, #0F172A, #334155);
        }

        /* Subtle dot grid pattern */
        .lc-login-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: var(--lc-dot-grid);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 1;
        }

        /* Aura glowing spots */
        .lc-glow-orange {
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250, 161, 22, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .lc-glow-purple {
          position: absolute;
          bottom: -200px;
          left: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .lc-login-bg-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(10, 13, 20, 0.65);
          backdrop-filter: blur(12px);
          z-index: 1;
          pointer-events: none;
        }

        .lc-split-layout {
          position: relative;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          width: 100%;
          max-width: 1140px;
          height: calc(100vh - 48px);
          max-height: 800px;
          min-height: 580px;
          background: var(--lc-card-bg);
          border-radius: 24px;
          border: 1px solid var(--lc-border);
          backdrop-filter: blur(20px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
          overflow: hidden;
          z-index: 2;
          box-sizing: border-box;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .lc-left-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          border-right: 1px solid var(--lc-border);
          background: var(--lc-left-bg);
          backdrop-filter: blur(20px);
          box-sizing: border-box;
          height: 100%;
          overflow: hidden;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .lc-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--lc-text-primary);
        }

        .lc-brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent !important;
          width: 32px;
          height: 32px;
          color: var(--lc-text-primary);
          box-shadow: none !important;
        }

        .lc-brand-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: var(--lc-brand-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lc-hero-content {
          margin: 20px 0;
        }

        .lc-kicker {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FFA116;
          margin-bottom: 12px;
        }

        .lc-left-title {
          font-size: 30px;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 12px;
          background: var(--lc-brand-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lc-left-desc {
          font-size: 16px;
          line-height: 1.6;
          color: var(--lc-text-secondary);
          max-width: 500px;
          transition: color 0.3s ease;
        }

        /* IDE Mockup Panel */
        .lc-code-card {
          position: relative;
          background-color: var(--lc-code-bg);
          border-radius: 16px;
          border: 1px solid var(--lc-code-border);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
          padding: 24px;
          width: 100%;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
          text-align: left;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .lc-code-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--lc-border);
          padding-bottom: 12px;
          transition: border-color 0.3s ease;
        }

        .lc-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .lc-dot.red { background-color: #EF5350; }
        .lc-dot.yellow { background-color: #FFB74D; }
        .lc-dot.green { background-color: #81C784; }

        .lc-file-name {
          margin-left: 8px;
          color: var(--lc-text-muted);
          font-size: 12px;
          transition: color 0.3s ease;
        }

        .lc-code-content {
          margin: 0;
          color: var(--lc-code-text);
          transition: color 0.3s ease;
        }
        .lc-code-content .keyword { color: var(--lc-code-keyword); }
        .lc-code-content .string { color: var(--lc-code-string); }
        .lc-code-content .comment { color: var(--lc-code-comment); font-style: italic; }
        .lc-code-content .function { color: var(--lc-code-function); }

        /* Floating Verdict Box */
        .lc-verdict-badge {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: var(--lc-verdict-bg);
          border: 1px solid var(--lc-verdict-border);
          border-radius: 12px;
          padding: 12px 18px;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          animation: floatAnimation 4s ease-in-out infinite;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .lc-verdict-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #81C784;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .lc-verdict-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #81C784;
          box-shadow: 0 0 8px #81C784;
        }

        .lc-verdict-status {
          font-size: 18px;
          font-weight: 700;
          color: var(--lc-text-primary);
          margin: 4px 0 2px;
          transition: color 0.3s ease;
        }

        .lc-verdict-info {
          font-size: 11px;
          color: var(--lc-text-muted);
          transition: color 0.3s ease;
        }

        /* Metric Bar */
        .lc-metric-row {
          display: flex;
          gap: 36px;
        }

        .lc-metric-item {
          display: flex;
          flex-direction: column;
        }

        .lc-metric-item span {
          font-size: 12px;
          color: var(--lc-text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }

        .lc-metric-item strong {
          font-size: 20px;
          font-weight: 700;
          color: var(--lc-text-primary);
          margin-top: 4px;
          transition: color 0.3s ease;
        }

        /* Right Panel (Sign In Card) */
        .lc-right-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px;
          background: var(--lc-right-bg);
          backdrop-filter: blur(20px);
          box-sizing: border-box;
          height: 100%;
          overflow-y: auto;
          scrollbar-width: none;
          transition: background 0.3s ease;
        }

        .lc-right-panel::-webkit-scrollbar {
          display: none;
        }

        .lc-card-header {
          margin-bottom: 24px;
        }

        .lc-system-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(76, 175, 80, 0.08);
          border: 1px solid rgba(76, 175, 80, 0.15);
          color: #4CAF50;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .lc-status-dot {
          width: 7px;
          height: 7px;
          background-color: #4CAF50;
          border-radius: 50%;
          box-shadow: 0 0 8px #4CAF50;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .lc-card-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--lc-text-primary);
          letter-spacing: -0.5px;
          transition: color 0.3s ease;
        }

        .lc-card-subtitle {
          font-size: 14px;
          color: var(--lc-text-muted);
          margin-top: 6px;
          transition: color 0.3s ease;
        }

        .lc-form-group {
          position: relative;
          margin-bottom: 18px;
        }

        .lc-input-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--lc-text-secondary);
          margin-bottom: 6px;
          display: block;
          transition: color 0.3s ease;
        }

        .lc-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lc-input-icon {
          position: absolute;
          left: 14px;
          color: var(--lc-text-muted);
          pointer-events: none;
          transition: color 0.3s ease;
        }

        .lc-form-input {
          width: 100%;
          background-color: var(--lc-input-bg);
          border: 1px solid var(--lc-input-border);
          border-radius: 10px;
          padding: 12px 14px 12px 42px;
          font-size: 14px;
          color: var(--lc-text-primary);
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .lc-form-input.password-input {
          padding-right: 42px;
        }

        .lc-form-input:focus {
          outline: none;
          border-color: #FFA116;
          background-color: var(--lc-input-focus-bg);
          box-shadow: 0 0 0 3px rgba(250, 161, 22, 0.15);
        }


        .lc-eye-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #4F5A6E;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .lc-eye-toggle:hover {
          color: #FFA116;
        }

        .lc-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #FFA116 0%, #FF6B00 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(250, 161, 22, 0.2);
          margin-top: 10px;
        }

        .lc-submit-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(250, 161, 22, 0.35);
        }

        .lc-submit-btn:active {
          transform: translateY(0);
        }

        .lc-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .lc-error-banner {
          display: flex;
          gap: 10px;
          background-color: rgba(239, 83, 80, 0.08);
          border: 1px solid rgba(239, 83, 80, 0.15);
          color: #F44336;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 20px;
        }

        .lc-success-banner {
          display: flex;
          gap: 10px;
          background-color: rgba(76, 175, 80, 0.08);
          border: 1px solid rgba(76, 175, 80, 0.15);
          color: #4CAF50;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 20px;
        }

        .lc-form-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 28px;
          font-size: 13px;
        }

        .lc-link {
          color: var(--lc-text-muted);
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .lc-link:hover {
          color: #FFA116;
        }

        @media (max-width: 960px) {
          .lc-split-layout {
            grid-template-columns: 1fr;
            max-width: 480px;
            min-height: auto;
          }
          .lc-left-panel {
            display: none !important;
          }
          .lc-right-panel {
            padding: 40px 30px;
          }
        }
      `}</style>

      {/* Background glass overlay */}
      <div className="lc-login-bg-overlay"></div>

      {/* Background aurora blurs */}
      <div className="lc-glow-orange"></div>
      <div className="lc-glow-purple"></div>

      <div className="lc-split-layout">
        {/* Left Side: Mock Dev Workspace */}
        <section className="lc-left-panel">
          <Link className="lc-brand" to="/">
            <div className="lc-brand-logo" style={{ display: "flex", alignItems: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" style={{ display: "inline-block", verticalAlign: "middle" }}>
                <defs>
                  <linearGradient id="codexa-grad-login" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path 
                  d="M16.5 5.5 L12 2.9 L4 7.5 L4 16.5 L12 21.1 L16.5 18.5" 
                  fill="none" 
                  stroke="url(#codexa-grad-login)" 
                  strokeWidth="3.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M8.5 9.5 L6 12 L8.5 14.5 M15.5 9.5 L18 12 L15.5 14.5 M13.5 8 L10.5 16" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="lc-brand-text">codexa</span>
          </Link>

          <div className="lc-hero-content">
            <span className="lc-kicker">CODE. LEARN. COMPETE. SUCCEED.</span>
            <h2 className="lc-left-title">Unlock your developer workspace.</h2>
            <p className="lc-left-desc">
              Solve coding challenges, join virtual classrooms, and run compilation setups in a unified, professional coding workspace.
            </p>
          </div>

          {/* IDE Mockup */}
          <div className="lc-code-card">
            <div className="lc-code-header">
              <span className="lc-dot red"></span>
              <span className="lc-dot yellow"></span>
              <span className="lc-dot green"></span>
              <span className="lc-file-name">two_sum.py</span>
            </div>
            <pre className="lc-code-content">
              <code>
                <span className="keyword">class</span> <span className="function">Solution</span>:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">def</span> <span className="function">twoSum</span>(self, nums: List[int], target: int) -&gt; List[int]:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen = &#123;&#125;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">for</span> i, num <span className="keyword">in</span> <span className="function">enumerate</span>(nums):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;remaining = target - num<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">if</span> remaining <span className="keyword">in</span> seen:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> [seen[remaining], i]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[num] = i<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> []
              </code>
            </pre>

            {/* Verdict Box */}
            <div className="lc-verdict-badge">
              <div className="lc-verdict-header">
                <span className="lc-verdict-dot"></span>
                <strong>STATUS VERDICT</strong>
              </div>
              <div className="lc-verdict-status" style={{ color: "#81C784" }}>Accepted</div>
              <div className="lc-verdict-info">Runtime: 12 ms | Memory: 14.2 MB</div>
            </div>
          </div>

          <div className="lc-metric-row">
            <div className="lc-metric-item">
              <span>Challenges</span>
              <strong>800+ Problems</strong>
            </div>
            <div className="lc-metric-item">
              <span>Compiler</span>
              <strong>Multi-Language</strong>
            </div>
            <div className="lc-metric-item">
              <span>Evaluation</span>
              <strong>Real-Time</strong>
            </div>
          </div>
        </section>

        {/* Right Side: Sign In Card */}
        <section className="lc-right-panel">
          <div className="lc-card-header">
            <div className="lc-system-status">
              <span className="lc-status-dot"></span>
              <span>Authentication Service: Online</span>
            </div>
            <h1 className="lc-card-title">Sign In</h1>
            <p className="lc-card-subtitle">Welcome back. Please enter your institutional details.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lc-form-group">
              <label className="lc-input-label" htmlFor="email">
                Institutional Email
              </label>
              <div className="lc-input-wrapper">
                <span className="lc-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  className="lc-form-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="username@college.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="lc-form-group">
              <label className="lc-input-label" htmlFor="password">
                Password
              </label>
              <div className="lc-input-wrapper">
                <span className="lc-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  className="lc-form-input password-input"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="lc-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="lc-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Enter platform dashboard"}
            </button>
          </form>

          {status.message ? (
            <div className={status.type === "success" ? "lc-success-banner" : "lc-error-banner"}>
              <span style={{ display: 'flex', marginTop: '2px' }}>
                {status.type === "success" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </span>
              <span>{status.message}</span>
            </div>
          ) : null}

          <div className="lc-form-footer">
            <Link className="lc-link" to="/">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Home
            </Link>
            <span style={{ color: 'var(--lc-border)' }}>•</span>
            <span style={{ color: 'var(--lc-text-muted)' }}>Admin account creation only</span>
          </div>
        </section>
      </div>
    </div>
  );
}
