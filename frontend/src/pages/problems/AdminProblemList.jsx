import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminProblemList() {
  const [problems, setProblems] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    difficulty: ""
  });
  const [status, setStatus] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProblems() {
      setStatus((currentStatus) => ({
        ...currentStatus,
        loading: true,
        error: ""
      }));

      try {
        const params = new URLSearchParams();

        if (filters.search.trim()) {
          params.set("q", filters.search.trim());
        }

        if (filters.difficulty) {
          params.set("difficulty", filters.difficulty);
        }

        const query = params.toString();
        const response = await fetch(`${apiBaseUrl}/problems${query ? `?${query}` : ""}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load coding questions.");
        }

        if (isMounted) {
          setProblems(data);
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

    loadProblems();

    return () => {
      isMounted = false;
    };
  }, [filters.difficulty, filters.search]);

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value
    }));
  }

  return (
    <main className="detail-page admin-detail-page">
      <section className="detail-card admin-detail-card">
        <div className="list-header">
          <div>
            <p className="auth-kicker">Admin Problem List</p>
            <h1>Review and open any coding question.</h1>
            <p className="detail-copy">
              Use this list to inspect the questions admins have added before opening the admin
              detail view.
            </p>
          </div>
          <span className="question-count">{problems.length} questions</span>
        </div>

        <div className="filter-bar">
          <input
            aria-label="Search questions"
            className="filter-input"
            name="search"
            placeholder="Search by title or statement"
            type="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select
            aria-label="Filter by difficulty"
            className="filter-select"
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {status.loading ? <p className="dashboard-copy">Loading coding questions...</p> : null}
        {status.error ? <p className="form-status error">{status.error}</p> : null}

        {!status.loading && !status.error ? (
          <>
            {problems.length === 0 ? (
              <p className="dashboard-copy">
                No questions matched the current search and filter settings.
              </p>
            ) : (
              <div className="question-list">
                {problems.map((problem) => (
                  <Link
                    className="question-card question-link-card"
                    key={problem.id}
                    to={`/admin/problems/${problem.id}`}
                  >
                    <div className="question-card-top">
                      <span className={`difficulty-pill ${problem.difficulty}`}>{problem.difficulty}</span>
                      <span className="question-meta">
                        {new Date(problem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3>{problem.title}</h3>
                    <p>{problem.statement}</p>
                    <span className="question-cta">Open admin view</span>
                  </Link>
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
