import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PlatformLayout, PlatformSection, PlatformStats } from "../../components/PlatformLayout";
import StudentProgressAnalytics from "../../components/StudentProgressAnalytics";
import { getFacultySession } from "../../utils/session";

export default function FacultyDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "overview";

  const [session] = useState(location.state?.session || getFacultySession());
  const user = session?.user;
  const profile = user?.profile || null;

  return (
    <PlatformLayout
      role="faculty"
      eyebrow="Faculty Dashboard"
      title={activeTab === "analytics" ? "Faculty Student Analytics" : user ? `${user.fullName || user.full_name}` : "Faculty profile"}
      subtitle={
        activeTab === "analytics"
          ? "Monitor student course progress, completion metrics, and submission history"
          : user
            ? `${profile?.designation || "Faculty"} | ${profile?.department || "Department not added"}`
            : "Faculty dashboard"
      }
      meta="Faculty Details"
      actions={
        <>
          <Link className="auth-button student-button panel-action-button" to="/faculty/account">
            Open account
          </Link>
          <Link className="auth-button ghost-button panel-action-button" to="/faculty/courses">
            Open courses
          </Link>
        </>
      }
      sidebarNote="Monitor student course completion metrics, submission history, and roster progress."
    >
      <PlatformStats
        items={[
          {
            label: "Faculty Role",
            value: profile?.designation || "Faculty",
            note: "Current designation"
          },
          {
            label: "Department",
            value: profile?.department || "-",
            note: "Academic department"
          },
          {
            label: "Employee ID",
            value: profile?.employee_id || "-",
            note: "Institute record"
          }
        ]}
      />

      {activeTab === "analytics" ? (
        <StudentProgressAnalytics role="faculty" session={session} />
      ) : (
        <PlatformSection label="Profile" title="Faculty details">
          <div className="faculty-note-stack">
            <article className="faculty-note-card">
              <strong>Full name</strong>
              <p>{user?.fullName || user?.full_name || "-"}</p>
            </article>
            <article className="faculty-note-card">
              <strong>Email address</strong>
              <p>{user?.email || "-"}</p>
            </article>
            <article className="faculty-note-card">
              <strong>Designation</strong>
              <p>{profile?.designation || "-"}</p>
            </article>
            <article className="faculty-note-card">
              <strong>Department</strong>
              <p>{profile?.department || "-"}</p>
            </article>
            <article className="faculty-note-card">
              <strong>Employee ID</strong>
              <p>{profile?.employee_id || "-"}</p>
            </article>
          </div>
        </PlatformSection>
      )}
    </PlatformLayout>
  );
}
