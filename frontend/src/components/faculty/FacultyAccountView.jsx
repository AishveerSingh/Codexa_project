import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Key,
  Smartphone,
  Lock,
  Edit,
  CheckCircle,
  Bell,
  Sun,
  Shield,
  Laptop
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { getFacultySession } from "../../utils/session";

export default function FacultyAccountView({ user }) {
  const session = getFacultySession();
  const token = session?.token;

  const [activeSecTab, setActiveSecTab] = useState("personal");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState(user || session?.user || null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRealUser() {
      if (!token) return;
      try {
        const meData = await apiRequest("/users/me", {}, token);
        if (isMounted && meData) {
          setCurrentUser(meData.user || meData);
        }
      } catch (_err) {
        // Fallback to session user
      }
    }

    fetchRealUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const facultyName = currentUser?.fullName || currentUser?.full_name || "Prof. Akshay Girdhar";
  const profile = currentUser?.profile || {};

  const activeDevices = [
    {
      id: 1,
      device: "MacBook Pro 16-inch (macOS Sonoma)",
      ip: "192.168.1.45 • New Delhi, India",
      status: "Current Session",
      isCurrent: true
    },
    {
      id: 2,
      device: "iPhone 15 Pro (iOS 17.4)",
      ip: "103.22.140.12 • New Delhi, India",
      status: "Active 2 hours ago",
      isCurrent: false
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Large Profile Banner Card */}
      <div className="fd-welcome-banner" style={{ padding: "2rem 2.2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            width: "100%",
            flexWrap: "wrap"
          }}
        >
          {/* Faculty Large Avatar */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #0EA5E9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "#fff",
              border: "3px solid rgba(255,255,255,0.12)",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.25)",
              flexShrink: 0
            }}
          >
            {facultyName.split(" ").map((n) => n[0]).slice(-2).join("")}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0
                }}
              >
                {facultyName}
              </h1>
              <span className="fd-badge fd-badge-primary">Verified Faculty</span>
            </div>

            <p style={{ color: "#94A3B8", fontSize: "0.92rem", margin: "0.3rem 0 0.8rem 0" }}>
              {profile.designation || "Senior Associate Professor"} •{" "}
              {profile.department || "Department of Computer Science & Engineering"}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                fontSize: "0.82rem",
                color: "#94A3B8",
                flexWrap: "wrap"
              }}
            >
              <span>
                <Briefcase size={14} style={{ display: "inline" }} /> Employee ID:{" "}
                <strong style={{ color: "#fff" }}>
                  {profile.employee_id || profile.employeeId || "EMP-2026-88"}
                </strong>
              </span>
              <span>
                <Mail size={14} style={{ display: "inline" }} /> {currentUser?.email || "akshay.girdhar@codexa.edu"}
              </span>
              <span>
                <MapPin size={14} style={{ display: "inline" }} /> Office: Block C, Room 304
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.8rem" }}>
            <button className="fd-btn fd-btn-primary">
              <Edit size={16} /> Edit Profile
            </button>
            <button className="fd-btn fd-btn-secondary">
              <Key size={16} /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Categorized Account Sections Tabs */}
      <div className="fd-card-panel">
        <div className="fd-chart-header-tabs" style={{ marginBottom: "1.8rem" }}>
          {[
            { id: "personal", label: "Personal Information" },
            { id: "professional", label: "Professional & Teaching" },
            { id: "notifications", label: "Preferences & Notifications" },
            { id: "security", label: "Security & Active Devices" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`fd-chart-tab-btn ${
                activeSecTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveSecTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Personal Info */}
        {activeSecTab === "personal" && (
          <div className="fd-grid-2col" style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "rgba(0,0,0,0.2)",
                padding: "1.4rem",
                borderRadius: "14px"
              }}
            >
              <h3 style={{ fontSize: "1rem", color: "#fff", margin: 0 }}>
                Faculty Identity Details
              </h3>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Full Name: <strong style={{ color: "#fff" }}>{facultyName}</strong>
              </div>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Primary Email: <strong style={{ color: "#fff" }}>{currentUser?.email || "akshay.girdhar@codexa.edu"}</strong>
              </div>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Phone Number: <strong style={{ color: "#fff" }}>{profile.phone || "+91 98765 43210"}</strong>
              </div>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Qualification: <strong style={{ color: "#fff" }}>{profile.qualification || "Ph.D. in Computer Science & Engineering"}</strong>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "rgba(0,0,0,0.2)",
                padding: "1.4rem",
                borderRadius: "14px"
              }}
            >
              <h3 style={{ fontSize: "1rem", color: "#fff", margin: 0 }}>
                Academic Campus Details
              </h3>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Experience: <strong style={{ color: "#fff" }}>{profile.experience || "14+ Years in Higher Education"}</strong>
              </div>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Office Location: <strong style={{ color: "#fff" }}>{profile.office || "Block C, Room 304 (CS Dept)"}</strong>
              </div>
              <div style={{ fontSize: "0.88rem", color: "#94A3B8" }}>
                Office Hours: <strong style={{ color: "#fff" }}>Mon, Wed, Fri (03:00 PM - 05:00 PM)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Professional Details & Teaching Subjects */}
        {activeSecTab === "professional" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
              Teaching Subjects & Assigned Batches
            </h3>
            <div className="fd-quick-actions-grid">
              <div className="fd-quick-action-card">
                <div style={{ color: "#6366F1", fontWeight: 800 }}>CS-301</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>Advanced Data Structures</div>
                <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>64 Students Enrolled</div>
              </div>
              <div className="fd-quick-action-card">
                <div style={{ color: "#0EA5E9", fontWeight: 800 }}>IT-402</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>Full-Stack Web Engineering</div>
                <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>58 Students Enrolled</div>
              </div>
              <div className="fd-quick-action-card">
                <div style={{ color: "#10B981", fontWeight: 800 }}>CS-201</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>Object-Oriented Programming</div>
                <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>72 Students Enrolled</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications & Preferences */}
        {activeSecTab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px"
              }}
            >
              <div>
                <div style={{ color: "#fff", fontWeight: 700 }}>Assignment Submission Alerts</div>
                <div style={{ color: "#94A3B8", fontSize: "0.8rem" }}>Receive email notifications when students turn in work</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px" }} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px"
              }}
            >
              <div>
                <div style={{ color: "#fff", fontWeight: 700 }}>AI Plagiarism Score Alerts</div>
                <div style={{ color: "#94A3B8", fontSize: "0.8rem" }}>Notify immediately if submission similarity exceeds 15%</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px" }} />
            </div>
          </div>
        )}

        {/* Tab 4: Security & Devices */}
        {activeSecTab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* 2FA Toggle Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.2rem 1.5rem",
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Shield size={24} style={{ color: "#6366F1" }} />
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>
                    Two-Factor Authentication (2FA)
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "0.82rem" }}>
                    Secured with Authenticator App & OTP
                  </div>
                </div>
              </div>

              <button
                className={`fd-btn ${
                  twoFactorEnabled ? "fd-btn-primary" : "fd-btn-secondary"
                }`}
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                {twoFactorEnabled ? "2FA Enabled" : "Enable 2FA"}
              </button>
            </div>

            {/* Active Devices List */}
            <div>
              <h3 style={{ fontSize: "1rem", color: "#fff", marginBottom: "0.8rem" }}>
                Active Devices & Login Sessions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {activeDevices.map((dev) => (
                  <div
                    key={dev.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1.2rem",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                      <Laptop size={20} style={{ color: "#0EA5E9" }} />
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
                          {dev.device}
                        </div>
                        <div style={{ color: "#94A3B8", fontSize: "0.78rem" }}>
                          {dev.ip}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`fd-badge ${
                        dev.isCurrent ? "fd-badge-success" : "fd-badge-primary"
                      }`}
                    >
                      {dev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
