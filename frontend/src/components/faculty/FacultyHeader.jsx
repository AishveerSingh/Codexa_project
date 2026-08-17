import React, { useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Settings,
  Sparkles,
  CheckCircle,
  Clock,
  Code2,
  X
} from "lucide-react";

export default function FacultyHeader({ user, activeTab, onSelectTab, onOpenSettings }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const facultyName = user?.fullName || user?.full_name || "Prof. Akshay Girdhar";

  const notifications = [
    {
      id: 1,
      title: "New Assignment Submissions",
      desc: "14 students submitted 'Binary Search Trees & Heap Sort' in CS-301",
      time: "10 mins ago",
      unread: true,
      icon: Code2,
      color: "#7C5CFF"
    },
    {
      id: 2,
      title: "Contest Leaderboard Updated",
      desc: "Weekly Algorithmic Challenge #24 successfully completed.",
      time: "1 hour ago",
      unread: true,
      icon: CheckCircle,
      color: "#22C55E"
    },
    {
      id: 3,
      title: "Upcoming Class Reminder",
      desc: "Advanced Web Systems lecture starts today at 02:00 PM.",
      time: "2 hours ago",
      unread: false,
      icon: Clock,
      color: "#38BDF8"
    }
  ];

  return (
    <header className="fd-page-header">
      {/* Top Bar Controls */}
      <div className="fd-header-top-row">
        {/* Global Instant Search */}
        <div className="fd-search-bar-wrap">
          <Search className="fd-search-icon" size={18} />
          <input
            type="text"
            className="fd-search-input"
            placeholder="Search courses, students, assignments, or coding problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right Actions Header */}
        <div className="fd-header-actions">
          {/* Notifications Trigger */}
          <div style={{ position: "relative" }}>
            <button
              className="fd-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={20} />
              <span className="fd-btn-badge-dot" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "54px",
                  width: "360px",
                  background: "#141A24",
                  border: "1px solid rgba(124, 92, 255, 0.3)",
                  borderRadius: "18px",
                  padding: "1.2rem",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                  zIndex: 200,
                  backdropFilter: "blur(16px)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    paddingBottom: "0.6rem",
                    borderBottom: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Bell size={18} style={{ color: "#7C5CFF" }} />
                    <strong style={{ fontSize: "0.95rem", color: "#fff" }}>
                      Notifications
                    </strong>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#A5B4C3",
                      cursor: "pointer"
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {notifications.map((item) => {
                    const NIcon = item.icon;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "0.8rem",
                          padding: "0.75rem",
                          borderRadius: "12px",
                          background: item.unread ? "rgba(124, 92, 255, 0.08)" : "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}
                      >
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "10px",
                            background: item.color + "22",
                            color: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <NIcon size={18} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#fff",
                              marginBottom: "0.2rem"
                            }}
                          >
                            {item.title}
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "#A5B4C3" }}>
                            {item.desc}
                          </div>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#64748B",
                              marginTop: "0.3rem"
                            }}
                          >
                            {item.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            className="fd-icon-btn"
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Settings button */}
          <button className="fd-icon-btn" onClick={onOpenSettings} title="Settings">
            <Settings size={20} />
          </button>

          {/* User Avatar */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #7C5CFF, #38BDF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(124, 92, 255, 0.3)"
            }}
            onClick={() => onSelectTab("account")}
            title="View Profile Account"
          >
            {facultyName.split(" ").map((n) => n[0]).slice(-2).join("")}
          </div>
        </div>
      </div>

      {/* Large Welcome Banner */}
      <div className="fd-welcome-banner">
        <div className="fd-welcome-content">
          <div className="fd-welcome-tag">
            <Sparkles size={14} />
            <span>Codexa AI Academic Engine v2.4</span>
          </div>
          <h1 className="fd-welcome-title">Welcome back, {facultyName}</h1>
          <p className="fd-welcome-subtitle">
            Manage courses, students, assignments, coding assessments, and analytics from one centralized dashboard.
          </p>
        </div>
      </div>
    </header>
  );
}
