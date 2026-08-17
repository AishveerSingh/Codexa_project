import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BarChart3,
  Code2,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Code,
  ShieldCheck
} from "lucide-react";

export default function FacultySidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  user,
  onOpenLogout
}) {
  const facultyName = user?.fullName || user?.full_name || "Prof. Akshay Girdhar";
  const facultyRole = user?.profile?.designation || "Senior Associate Professor";

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen, badge: "6" },
    { id: "students", label: "Students", icon: GraduationCap, badge: "248" },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "practice", label: "Practice", icon: Code2, badge: "142" },
    { id: "account", label: "Account", icon: User }
  ];

  return (
    <aside className={`fd-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="fd-sidebar-top">
        {/* Brand Header */}
        <div className="fd-sidebar-brand">
          <Link to="/" className="fd-logo-box">
            <div className="fd-logo-icon">
              <Code size={24} />
            </div>
            {!isCollapsed && <span className="fd-logo-text">Codexa</span>}
          </Link>
          <button
            className="fd-sidebar-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Faculty Profile Card */}
        <div className="fd-sidebar-faculty-card">
          <div className="fd-sidebar-faculty-avatar-wrap">
            <div className="fd-faculty-avatar">
              {facultyName.split(" ").map((n) => n[0]).slice(-2).join("")}
            </div>
            <span className="fd-online-dot" title="Online & Active" />
          </div>
          {!isCollapsed && (
            <div className="fd-faculty-details">
              <span className="fd-faculty-name">{facultyName}</span>
              <span className="fd-faculty-role">
                <ShieldCheck size={12} style={{ color: "#38BDF8" }} />
                {facultyRole}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="fd-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`fd-nav-item-btn ${isActive ? "active" : ""}`}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
              >
                <div className="fd-nav-left-content">
                  <span className="fd-nav-icon">
                    <Icon size={20} />
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="fd-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer - Logout */}
      <div className="fd-sidebar-footer">
        <button
          className="fd-nav-item-btn fd-logout-btn"
          onClick={onOpenLogout}
          title="Logout"
        >
          <div className="fd-nav-left-content">
            <span className="fd-nav-icon">
              <LogOut size={20} />
            </span>
            {!isCollapsed && <span>Logout</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}
