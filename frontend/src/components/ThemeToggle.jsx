import { useTheme } from "./ThemeProvider";
import { useLocation } from "react-router-dom";

export default function ThemeToggle({ inline = false }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDarkTheme = theme === "dark";

  const isPlatformRoute =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/faculty");

  if (!inline && isPlatformRoute) {
    return null;
  }

  const iconSvg = isDarkTheme ? (
    /* Sun Icon for Switch to Light Mode */
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ) : (
    /* Moon Icon for Switch to Dark Mode */
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <>
      <style>{`
        /* Fixed position toggle next to top-left brand */
        .lc-theme-toggle {
          position: fixed;
          top: 18px;
          left: 168px;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          color: #FFA116;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          outline: none;
        }

        /* Inline toggle inside brand header */
        .lc-theme-toggle-inline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(8px);
          color: #FFA116;
          cursor: pointer;
          transition: all 0.25s ease;
          outline: none;
          margin-left: 8px;
          flex-shrink: 0;
        }

        /* Light theme overrides for toggle button */
        body:not(.dark-theme) .lc-theme-toggle,
        body[class*="light"] .lc-theme-toggle,
        html[data-theme="light"] .lc-theme-toggle,
        body:not(.dark-theme) .lc-theme-toggle-inline,
        body[class*="light"] .lc-theme-toggle-inline,
        html[data-theme="light"] .lc-theme-toggle-inline {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #d97706;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .lc-theme-toggle:hover,
        .lc-theme-toggle-inline:hover {
          transform: rotate(20deg) scale(1.08);
          background: rgba(50, 60, 80, 0.85);
          border-color: #FFA116;
          box-shadow: 0 0 12px rgba(250, 161, 22, 0.3);
        }

        body:not(.dark-theme) .lc-theme-toggle:hover,
        body[class*="light"] .lc-theme-toggle:hover,
        html[data-theme="light"] .lc-theme-toggle:hover,
        body:not(.dark-theme) .lc-theme-toggle-inline:hover,
        body[class*="light"] .lc-theme-toggle-inline:hover,
        html[data-theme="light"] .lc-theme-toggle-inline:hover {
          background: #ffffff;
          border-color: #d97706;
          box-shadow: 0 0 12px rgba(217, 119, 6, 0.25);
        }

        .lc-theme-toggle:active,
        .lc-theme-toggle-inline:active {
          transform: scale(0.95);
        }

        .lc-theme-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s ease;
        }

        @media (max-width: 768px) {
          .lc-theme-toggle {
            top: 14px;
            left: auto;
            right: 16px;
          }
        }
      `}</style>

      <button
        className={inline ? "lc-theme-toggle-inline" : "lc-theme-toggle"}
        type="button"
        onClick={toggleTheme}
        aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="lc-theme-toggle-icon">{iconSvg}</span>
      </button>
    </>
  );
}
