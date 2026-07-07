import { useTheme } from "./ThemeProvider";
import { useLocation } from "react-router-dom";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDarkTheme = theme === "dark";

  if (location.pathname.includes("/problems/") && location.pathname.includes("/solve")) {
    return null;
  }

  return (
    <>
      <style>{`
        .lc-theme-toggle {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(40, 40, 40, 0.6);
          backdrop-filter: blur(12px);
          color: #FFA116;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          outline: none;
        }

        /* Light theme overrides for toggle button */
        body:not(.dark-theme) .lc-theme-toggle,
        body[class*="light"] .lc-theme-toggle {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #FF8F00;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .lc-theme-toggle:hover {
          transform: rotate(30deg) scale(1.08);
          background: rgba(50, 50, 50, 0.85);
          border-color: #FFA116;
          box-shadow: 0 0 16px rgba(250, 161, 22, 0.3);
        }

        body:not(.dark-theme) .lc-theme-toggle:hover,
        body[class*="light"] .lc-theme-toggle:hover {
          background: rgba(255, 255, 255, 1);
          border-color: #FF8F00;
          box-shadow: 0 0 16px rgba(255, 143, 0, 0.25);
        }

        .lc-theme-toggle:active {
          transform: scale(0.95);
        }

        .lc-theme-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s ease;
        }
      `}</style>

      <button
        className="lc-theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="lc-theme-toggle-icon">
          {isDarkTheme ? (
            /* Sun Icon for Switch to Light Mode */
            <svg
              width="20"
              height="20"
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}
