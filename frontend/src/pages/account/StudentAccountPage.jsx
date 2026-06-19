import { Link } from "react-router-dom";
import AccountSection from "../../components/AccountSection";
import { PlatformLayout, PlatformSection, PlatformStats } from "../../components/PlatformLayout";
import { getStudentSession, saveStudentSession } from "../../utils/session";

export default function StudentAccountPage() {
  const session = getStudentSession();
  const user = session?.user;
  const profile = user?.profile || null;

  return (
    <PlatformLayout
      role="student"
      eyebrow="Account Settings"
      title={user ? `${user.full_name}'s profile` : "Student account"}
      subtitle="Manage your personal details and password from a dedicated account page instead of mixing it into the practice dashboard."
      meta="Student Profile"
      actions={
        <Link className="auth-button student-button panel-action-button" to="/student/dashboard">
          Back to dashboard
        </Link>
      }
      sidebarNote="This is your account center: keep your profile details current and manage sign-in security without leaving the student workspace."
    >
      <PlatformStats
        items={[
          {
            label: "Full name",
            value: user?.full_name || "-",
            note: "Student profile name"
          },
          {
            label: "Roll number",
            value: profile?.roll_number || "-",
            note: "Institute identifier"
          },
          {
            label: "Branch",
            value: profile?.branch || "-",
            note: `Semester ${profile?.semester || "-"}`
          },
          {
            label: "Section",
            value: profile?.section || "-",
            note: profile?.batch ? `Batch ${profile.batch}` : "Academic section"
          }
        ]}
      />

      <PlatformSection label="Profile" title="Student account overview">
        <p className="dashboard-copy">
          This page keeps your academic identity visible the way a campus coding portal usually
          does, while keeping profile edits and password management separate from daily practice.
        </p>
      </PlatformSection>

      <AccountSection role="student" session={session} saveSession={saveStudentSession} />
    </PlatformLayout>
  );
}
