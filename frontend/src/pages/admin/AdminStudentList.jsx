import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminSession, getAuthHeaders } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminStudentList() {
  const session = getAdminSession();
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    search: ""
  });
  const [status, setStatus] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      setStatus({
        loading: true,
        error: ""
      });

      if (!session?.token) {
        if (isMounted) {
          setStudents([]);
          setStatus({
            loading: false,
            error: "Log in as an admin to view students."
          });
        }
        return;
      }

      try {
        const params = new URLSearchParams({
          role: "student"
        });

        if (filters.search.trim()) {
          params.set("search", filters.search.trim());
        }

        const response = await fetch(`${apiBaseUrl}/users?${params.toString()}`, {
          headers: {
            ...getAuthHeaders(session.token)
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load students.");
        }

        if (isMounted) {
          setStudents(data);
          setStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [filters.search, session?.token]);

  return (
    <main className="detail-page admin-detail-page">
      <section className="detail-card admin-detail-card">
        <div className="list-header">
          <div>
            <p className="auth-kicker">Student Directory</p>
            <h1>View all students on the platform.</h1>
            <p className="detail-copy">
              Search the student roster, check activity totals, and open each submission history.
            </p>
          </div>
          <span className="question-count">{students.length} students</span>
        </div>

        <div className="filter-bar">
          <input
            aria-label="Search students"
            className="filter-input"
            name="search"
            placeholder="Search by student name or email"
            type="search"
            value={filters.search}
            onChange={(event) => {
              setFilters({
                search: event.target.value
              });
            }}
          />
        </div>

        {status.loading ? <p className="dashboard-copy">Loading students...</p> : null}
        {status.error ? <p className="form-status error">{status.error}</p> : null}

        {!status.loading && !status.error ? (
          <>
            {students.length === 0 ? (
              <p className="dashboard-copy">No students matched the current search.</p>
            ) : (
              <div className="question-list">
                {students.map((student) => (
                  <article className="question-card" key={student.id}>
                    <div className="question-card-top">
                      <span className="difficulty-pill easy">student</span>
                      <span className="question-meta">
                        Joined {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3>{student.full_name}</h3>
                    <p>{student.email}</p>
                    <div className="stats-inline">
                      <span>{student.submission_count} submissions</span>
                      <span>{student.accepted_count} accepted</span>
                    </div>
                    <Link
                      className="auth-button admin-button detail-link inline-link-button"
                      to={`/admin/students/${student.id}/submissions`}
                    >
                      View submissions
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}

        <div className="detail-actions">
          <Link className="auth-button admin-button detail-link" to="/admin/dashboard">
            Back to admin dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
