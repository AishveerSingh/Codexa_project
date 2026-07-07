import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  useEffect(() => {
    document.title = "Codexa | Dynamic Coding Platform";
    // Hide browser window scrollbars
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  return (
    <div className="hp-container">
      <style>{`
        /* Import premium font */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .hp-container {
          background-image: url("/bg-codexa.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: #EFF1F6;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          height: 100vh;
          min-height: 100vh;
          max-height: 100vh;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Subtle dot grid pattern */
        .hp-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 1;
        }

        /* Background auroras */
        .hp-glow-1 {
          position: absolute;
          top: -200px;
          left: -100px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .hp-glow-2 {
          position: absolute;
          bottom: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250, 161, 22, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .hp-bg-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(10, 13, 20, 0.65);
          backdrop-filter: blur(12px);
          z-index: 1;
          pointer-events: none;
        }

        .hp-content {
          position: relative;
          z-index: 2;
          max-width: 1140px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        /* Nav Header */
        .hp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: border-color 0.3s ease;
        }

        .hp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #ffffff;
        }

        .hp-brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent !important;
          width: 32px;
          height: 32px;
          color: #ffffff;
          box-shadow: none !important;
        }

        .hp-brand-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #FFFFFF, #B0B5C1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hp-login-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 11px 22px;
          border-radius: 10px;
          color: #ffffff;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.25s ease;
        }

        .hp-login-btn:hover {
          background: linear-gradient(135deg, #FFA116 0%, #FF6B00 100%);
          box-shadow: 0 4px 16px rgba(250, 161, 22, 0.25);
          border-color: transparent;
          color: #ffffff;
          transform: translateY(-1px);
        }

        /* Main Hero Split Grid */
        .hp-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 60px;
          align-items: center;
          margin: 40px 0;
          min-height: 0; /* Important for grid containment */
        }

        @media (max-width: 900px) {
          .hp-main {
            grid-template-columns: 1fr;
            gap: 32px;
            overflow-y: auto;
            margin: 20px 0;
          }
        }

        /* Left Side: Call to action */
        .hp-left-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
        }

        .hp-kicker {
          display: inline-block;
          align-self: flex-start;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FFA116;
          background: rgba(250, 161, 22, 0.08);
          border: 1px solid rgba(250, 161, 22, 0.15);
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
        }

        .hp-title {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 20px;
          letter-spacing: -0.8px;
          background: linear-gradient(to right, #ffffff, #B0B5C1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hp-desc {
          font-size: 16px;
          line-height: 1.6;
          color: #9BA3B0;
          margin-bottom: 32px;
          transition: color 0.3s ease;
        }

        .hp-primary-btn {
          align-self: flex-start;
          background: linear-gradient(135deg, #FFA116 0%, #FF6B00 100%);
          color: #ffffff;
          padding: 15px 36px;
          border-radius: 10px;
          font-weight: 700;
          text-decoration: none;
          font-size: 15px;
          box-shadow: 0 4px 22px rgba(250, 161, 22, 0.25);
          transition: all 0.25s ease;
        }

        .hp-primary-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 26px rgba(250, 161, 22, 0.35);
          color: #ffffff;
        }

        /* Right Side: Features Board */
        .hp-right-col {
          display: flex;
          flex-direction: column;
          gap: 18px;
          justify-content: center;
        }

        .hp-card {
          background: rgba(14, 20, 32, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 22px 24px;
          display: flex;
          gap: 18px;
          align-items: flex-start;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .hp-card:hover {
          transform: translateY(-3px);
          border-color: rgba(250, 161, 22, 0.2);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
          background: rgba(14, 20, 32, 0.6);
        }

        .hp-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(250, 161, 22, 0.08);
          border: 1px solid rgba(250, 161, 22, 0.15);
          color: #FFA116;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .hp-card-text {
          display: flex;
          flex-direction: column;
        }

        .hp-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #ffffff;
          transition: color 0.3s ease;
        }

        .hp-card p {
          font-size: 13px;
          line-height: 1.5;
          color: #9BA3B0;
          margin: 0;
          transition: color 0.3s ease;
        }

        /* Lang Row badges */
        .hp-lang-row {
          display: flex;
          gap: 12px;
          margin-top: 6px;
        }

        .hp-lang-badge {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 8px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #EFF1F6;
          transition: all 0.25s ease;
        }

        .hp-lang-badge:hover {
          background: rgba(250, 161, 22, 0.03);
          border-color: rgba(250, 161, 22, 0.15);
        }

        /* Footer */
        .hp-footer {
          text-align: center;
          padding: 24px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 13px;
          color: #5A6372;
          transition: border-color 0.3s ease, color 0.3s ease;
        }

        /* Light Theme Overrides */
        [data-theme="light"] .hp-container {
          background-color: #F4F6F9;
          color: #1A202C;
        }
        [data-theme="light"] .hp-container::before {
          background-image: radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px);
        }
        [data-theme="light"] .hp-header {
          border-bottom-color: rgba(0, 0, 0, 0.06);
        }
        [data-theme="light"] .hp-brand-text {
          background: linear-gradient(to right, #1A202C, #4A5568);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        [data-theme="light"] .hp-brand {
          color: #1A202C;
        }
        [data-theme="light"] .hp-login-btn {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #1A202C;
        }
        [data-theme="light"] .hp-login-btn:hover {
          background: linear-gradient(135deg, #FFA116 0%, #FF6B00 100%);
          color: #ffffff;
          border-color: transparent;
        }
        [data-theme="light"] .hp-title {
          background: linear-gradient(to right, #1A202C, #4A5568);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        [data-theme="light"] .hp-desc {
          color: #4A5568;
        }
        [data-theme="light"] .hp-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }
        [data-theme="light"] .hp-card:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(250, 161, 22, 0.3);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
        }
        [data-theme="light"] .hp-card h3 {
          color: #1A202C;
        }
        [data-theme="light"] .hp-card p {
          color: #4A5568;
        }
        [data-theme="light"] .hp-lang-badge {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #1A202C;
        }
        [data-theme="light"] .hp-lang-badge:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(250, 161, 22, 0.3);
        }
        [data-theme="light"] .hp-footer {
          border-top-color: rgba(0, 0, 0, 0.06);
          color: #718096;
        }
      `}</style>

      {/* Background glass overlay */}
      <div className="hp-bg-overlay"></div>

      {/* Background Blurs */}
      <div className="hp-glow-1"></div>
      <div className="hp-glow-2"></div>

      <div className="hp-content">
        {/* Navigation Header */}
        <header className="hp-header">
          <Link className="hp-brand" to="/">
            <div className="hp-brand-logo" style={{ display: "flex", alignItems: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" style={{ display: "inline-block", verticalAlign: "middle" }}>
                <defs>
                  <linearGradient id="codexa-grad-hp" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path 
                  d="M16.5 5.5 L12 2.9 L4 7.5 L4 16.5 L12 21.1 L16.5 18.5" 
                  fill="none" 
                  stroke="url(#codexa-grad-hp)" 
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
            <span className="hp-brand-text">codexa</span>
          </Link>
        </header>

        {/* Main Hero Split Content */}
        <main className="hp-main">
          {/* Left Column: Title & Entry Action */}
          <section className="hp-left-col">
            <span className="hp-kicker">Developer Hub</span>
            <h1 className="hp-title">
              Train, review, and manage coding workflows.
            </h1>
            <p className="hp-desc">
              A unified environment featuring student practice dashboards, faculty assignments control, 
              interactive evaluation runtimes, and branch course setups.
            </p>
            <Link className="hp-primary-btn" to="/login">
              Enter Codexa Platform
            </Link>
          </section>

          {/* Right Column: Platform Features Overview & Languages */}
          <section className="hp-right-col">
            {/* Student card */}
            <article className="hp-card">
              <div className="hp-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div className="hp-card-text">
                <h3>Practice Workspace</h3>
                <p>Coding sandbox with requirements, live editors, and immediate testing verdicts.</p>
              </div>
            </article>

            {/* Faculty card */}
            <article className="hp-card">
              <div className="hp-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="hp-card-text">
                <h3>Faculty Classroom</h3>
                <p>Create assignments, inspect batch metrics, and control course enrollments.</p>
              </div>
            </article>

            {/* Admin card */}
            <article className="hp-card">
              <div className="hp-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div className="hp-card-text">
                <h3>Platform Control</h3>
                <p>Register users, manage database courses, and verify system actions.</p>
              </div>
            </article>

            {/* Compact Languages Row */}
            <div className="hp-lang-row">
              <span className="hp-lang-badge">C++</span>
              <span className="hp-lang-badge">Java</span>
              <span className="hp-lang-badge">Python</span>
              <span className="hp-lang-badge">JS</span>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="hp-footer" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center", padding: "1.5rem 0", borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "#8a8a8a", letterSpacing: "1px" }}>CODE. LEARN. COMPETE.</p>
          <p>© {new Date().getFullYear()} Codexa Coding Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
