import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  clearStudentSession,
  clearFacultySession,
  clearAdminSession,
  getStudentSession,
  getFacultySession,
  getAdminSession
} from "../utils/session";

const studentNavCategories = [
  {
    title: "PLATFORM",
    items: [
      { to: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/student/courses", label: "Courses", icon: "courses" },
      { to: "/student/problems", label: "Practice", icon: "problems" }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { to: "/student/account", label: "Account", icon: "account" }
    ]
  }
];

const facultyNavCategories = [
  {
    title: "PLATFORM",
    items: [
      { to: "/faculty/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/faculty/courses", label: "Courses", icon: "courses" },
      { to: "/faculty/students", label: "Students", icon: "users" },
      { to: "/faculty/problems", label: "Practice", icon: "problems" }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { to: "/faculty/account", label: "Account", icon: "account" }
    ]
  }
];

const adminNavCategories = [
  {
    title: "PLATFORM",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/admin/students", label: "Manage Users", icon: "users" },
      { to: "/admin/courses", label: "Courses", icon: "courses" },
      { to: "/admin/problems", label: "Problem Bank", icon: "problems" }
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { to: "/admin/students?tab=add", label: "Add Student", icon: "add-student" },
      { to: "/admin/faculty", label: "Add Faculty", icon: "add-faculty" },
      { to: "/admin/students?tab=submissions", label: "All Submissions", icon: "submissions" },
      { to: "/admin/dashboard?tab=analytics", label: "Analytics", icon: "analytics" }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { to: "/admin/account", label: "Settings", icon: "settings" }
    ]
  }
];


const navCategoriesByRole = {
  student: studentNavCategories,
  faculty: facultyNavCategories,
  admin: adminNavCategories
};

function getSidebarIcon(icon) {
  switch (icon) {
    case "dashboard":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "users":
    case "students":
    case "manage-users":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "courses":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "problems":
    case "problem-bank":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 6 22 12 16 18" />
          <polyline points="8 18 2 12 8 6" />
        </svg>
      );
    case "add-student":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
      );
    case "add-faculty":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "submissions":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "analytics":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "settings":
    case "account":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

function isItemActive(pathname, search, target) {
  const [targetPath, targetQuery] = target.split("?");
  if (targetQuery) {
    return pathname === targetPath && search.includes(targetQuery);
  }
  if (pathname === targetPath) {
    return !search || !search.includes("tab=");
  }
  return pathname.startsWith(`${targetPath}/`);
}

export function PlatformLayout({
  role = "student",
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  children,
  sidebarNote,
  showQuickActions
}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "overview";

  const isDashboardOverviewActive = location.pathname === "/admin/dashboard" && activeTab === "overview";
  const isDashboardAnalyticsActive = location.pathname === "/admin/dashboard" && activeTab === "analytics";
  const isUsersActive = location.pathname.startsWith("/admin/students");
  const isCoursesActive = location.pathname.startsWith("/admin/courses");
  const isProblemsActive = location.pathname.startsWith("/admin/problems");

  const navigate = useNavigate();
  const categories = navCategoriesByRole[role] ?? [];

  const session =
    role === "admin"
      ? getAdminSession()
      : role === "faculty"
        ? getFacultySession()
        : getStudentSession();
  const user = session?.user;

  useEffect(() => {
    const items = categories.flatMap((c) => c.items);
    const activeItem = [...items]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => {
        return isItemActive(location.pathname, location.search, item.to);
      });

    const activeLabel = activeItem ? activeItem.label : title;

    if (activeLabel) {
      document.title = `Codexa: ${activeLabel}`;
    } else {
      document.title = "Codexa";
    }
  }, [location.pathname, location.search, categories, title]);

  const handleLogout = () => {
    if (role === "student") {
      clearStudentSession();
      navigate("/student/login");
    } else if (role === "faculty") {
      clearFacultySession();
      navigate("/faculty/login");
    } else if (role === "admin") {
      clearAdminSession();
      navigate("/admin/login");
    }
  };

  return (
    <main className={`platform-page ${role}-platform-page`}>
      <aside className="platform-sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Link className="platform-brand" to="/">
            <span className="platform-brand-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </span>
            <strong>Codexa</strong>
          </Link>

          <nav className="platform-nav" aria-label={`${role} navigation`}>
            {categories.map((category) => (
              <div key={category.title} style={{ display: 'contents' }}>
                <div className="platform-nav-category-title">{category.title}</div>
                {category.items.map((item) => (
                  <Link
                    className={`platform-nav-item ${isItemActive(location.pathname, location.search, item.to) ? "active" : ""}`}
                    key={item.to + item.label}
                    to={item.to}
                  >
                    {getSidebarIcon(item.icon)}
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            <button
              onClick={handleLogout}
              className="platform-nav-item platform-logout-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </nav>
        </div>

        <div className="sidebar-profile-card">
          <div className="sidebar-profile-avatar">
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{user?.full_name || "Admin"}</span>
            <span className="sidebar-profile-role">
              {role === "admin"
                ? "Platform Administrator"
                : role === "faculty"
                  ? "Faculty Instructor"
                  : "Student"}
            </span>
          </div>
        </div>
      </aside>

      <section className="platform-main">


        <header className="platform-hero">
          <div className="platform-hero-copy">
            {eyebrow ? <p className="platform-eyebrow" style={{ display: "none" }}>{eyebrow}</p> : null}
            <h1>{title}</h1>
            {subtitle ? <p className="platform-hero-text">{subtitle}</p> : null}
          </div>
          <div className="platform-hero-side">
            {role === "admin" && <span className="admin-access-pill-sub">ADMIN ACCESS</span>}
            {meta ? <div className="platform-meta-chip">{meta}</div> : null}
            {actions ? <div className="platform-hero-actions">{actions}</div> : null}
          </div>
        </header>

        <div className="platform-content">
          {role === "admin" && (
            <div className="platform-tab-bar" style={{ marginBottom: "1.5rem" }}>
              <Link to="/admin/dashboard" className={`platform-tab ${isDashboardOverviewActive ? 'active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Overview
              </Link>

              <Link to="/admin/dashboard?tab=analytics" className={`platform-tab ${isDashboardAnalyticsActive ? 'active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Analytics
              </Link>

              <Link to="/admin/students" className={`platform-tab ${isUsersActive ? 'active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Users
              </Link>

              <Link to="/admin/courses" className={`platform-tab ${isCoursesActive ? 'active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Courses
              </Link>

              <Link to="/admin/problems" className={`platform-tab ${isProblemsActive ? 'active' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Problems
              </Link>
            </div>
          )}
          {role === "admin" && showQuickActions !== false && (
            <div className="quick-actions-row" style={{ marginBottom: "1.5rem" }}>
              <Link to="/admin/students?tab=add" className="quick-action-card">
                <div className="quick-action-icon-wrapper green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </div>
                <div className="quick-action-info">
                  <h4>Add Student</h4>
                  <p>Create student account with email & password</p>
                </div>
              </Link>

              <Link to="/admin/faculty" className="quick-action-card">
                <div className="quick-action-icon-wrapper orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className="quick-action-info">
                  <h4>Add Faculty</h4>
                  <p>Create faculty account with email & password</p>
                </div>
              </Link>

              <Link to="/admin/courses" className="quick-action-card">
                <div className="quick-action-icon-wrapper purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="quick-action-info">
                  <h4>Create Course</h4>
                  <p>Add course for a specific semester</p>
                </div>
              </Link>
            </div>
          )}
          {children}
        </div>
      </section>
    </main>
  );
}

export function PlatformSection({ title, label, actions, children }) {
  return (
    <section className="platform-section-card">
      <div className="platform-section-head">
        <div>
          {label ? <p className="platform-section-label">{label}</p> : null}
          <h2>{title}</h2>
        </div>
        {actions ? <div className="platform-section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function PlatformStats({ items }) {
  return (
    <div className="platform-stats-grid">
      {items.map((item) => {
        const valStr = String(item.value ?? "");
        const isLongOrText = valStr.length > 8 || /[a-zA-Z]/.test(valStr);
        return (
          <article className="platform-stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong className={isLongOrText ? "long-value" : ""}>{item.value}</strong>
            {item.note ? <p>{item.note}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
