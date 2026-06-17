import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuthHeaders, getStudentSession } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const initialEditor = {
  language: "python",
  sourceCode: ""
};

export default function StudentProblemDetails() {
  const { problemId } = useParams();
  const session = getStudentSession();
  const student = session?.user;
  const [problem, setProblem] = useState(null);
  const [status, setStatus] = useState({
    loading: true,
    error: ""
  });
  const [editor, setEditor] = useState(initialEditor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [historyStatus, setHistoryStatus] = useState({
    loading: Boolean(student?.id),
    error: ""
  });
  const [problemOrder, setProblemOrder] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProblem() {
      try {
        const response = await fetch(`${apiBaseUrl}/problems/${problemId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load coding question.");
        }

        if (isMounted) {
          setProblem(data);
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

    loadProblem();

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  useEffect(() => {
    let isMounted = true;

    async function loadProblemOrder() {
      try {
        const response = await fetch(`${apiBaseUrl}/problems`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load coding questions.");
        }

        if (isMounted) {
          setProblemOrder(data);
        }
      } catch (_error) {
        if (isMounted) {
          setProblemOrder([]);
        }
      }
    }

    loadProblemOrder();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissionHistory() {
      if (!student?.id || !session?.token) {
        setHistoryStatus({
          loading: false,
          error: student?.id ? "Log in again to view submission history." : ""
        });
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/submissions/student/${student.id}?problemId=${problemId}`,
          {
            headers: {
              ...getAuthHeaders(session.token)
            }
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load submission history.");
        }

        if (isMounted) {
          setSubmissionHistory(data);
          setHistoryStatus({
            loading: false,
            error: ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setHistoryStatus({
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadSubmissionHistory();

    return () => {
      isMounted = false;
    };
  }, [problemId, session?.token, student?.id]);

  function handleEditorChange(event) {
    const { name, value } = event.target;

    setEditor((currentEditor) => ({
      ...currentEditor,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!student?.id || !session?.token) {
      setSubmissionMessage("Student session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(session.token)
        },
        body: JSON.stringify({
          studentId: student.id,
          problemId,
          language: editor.language,
          sourceCode: editor.sourceCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit solution.");
      }

      setSubmissionHistory((currentHistory) => [data.submission, ...currentHistory]);
      setSubmissionMessage(`Latest result: ${data.submission.status.replaceAll("_", " ")}.`);
      setEditor((currentEditor) => ({
        ...currentEditor,
        sourceCode: ""
      }));
    } catch (error) {
      setSubmissionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentProblemIndex = problemOrder.findIndex((entry) => entry.id === problemId);
  const previousProblem =
    currentProblemIndex > 0 ? problemOrder[currentProblemIndex - 1] : null;
  const nextProblem =
    currentProblemIndex >= 0 && currentProblemIndex < problemOrder.length - 1
      ? problemOrder[currentProblemIndex + 1]
      : null;

  return (
    <main className="detail-page student-detail-page">
      <section className="detail-card student-detail-card student-workspace-card">
        <div className="workspace-page-header">
          <div className="workspace-page-title">
            <p className="auth-kicker">Question Heading</p>
            <h1>
              {currentProblemIndex >= 0 && problem
                ? `${currentProblemIndex + 1}. ${problem.title}`
                : problem?.title || "Question"}
            </h1>
          </div>
          <div className="workspace-nav-arrows">
            <Link
              className={`workspace-arrow ${previousProblem ? "" : "disabled"}`}
              to={previousProblem ? `/student/problems/${previousProblem.id}` : "#"}
              aria-disabled={previousProblem ? "false" : "true"}
              onClick={(event) => {
                if (!previousProblem) {
                  event.preventDefault();
                }
              }}
            >
              Prev
            </Link>
            <Link
              className={`workspace-arrow ${nextProblem ? "" : "disabled"}`}
              to={nextProblem ? `/student/problems/${nextProblem.id}` : "#"}
              aria-disabled={nextProblem ? "false" : "true"}
              onClick={(event) => {
                if (!nextProblem) {
                  event.preventDefault();
                }
              }}
            >
              Next
            </Link>
          </div>
        </div>
        {status.loading ? <h1>Loading question...</h1> : null}
        {status.error ? <p className="form-status error">{status.error}</p> : null}

        {problem ? (
          <section className="student-workspace-grid">
            <article className="detail-block workspace-column">
              <p className="auth-kicker">Problem Statement</p>
              <h2 className="workspace-problem-title">{problem.title}</h2>
              <div className="workspace-meta-row">
                <span className={`difficulty-pill ${problem.difficulty}`}>{problem.difficulty}</span>
              </div>
              <div className="pill-row">
                {(problem.tags || []).map((tag) => (
                  <span className="tag-pill" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="workspace-subsection">
                <p>{problem.statement}</p>
              </div>

              <div className="workspace-subsection">
                <h3>Input format</h3>
                <p>{problem.input_format || "No input format provided yet."}</p>
              </div>

              <div className="workspace-subsection">
                <h3>Output format</h3>
                <p>{problem.output_format || "No output format provided yet."}</p>
              </div>

              <div className="workspace-subsection">
                <h3>Constraints</h3>
                <p>{problem.constraints_text || "No constraints provided yet."}</p>
              </div>

              <div className="workspace-subsection">
                <h3>Examples</h3>
                <p>{problem.examples_text || "No examples provided yet."}</p>
              </div>

              <div className="workspace-subsection">
                <h3>Sample test cases</h3>
                {problem.sample_test_cases?.length ? (
                  <div className="sample-case-list">
                    {problem.sample_test_cases.map((testCase, index) => (
                      <article className="sample-case-card" key={testCase.id || index}>
                        <strong>Sample {index + 1}</strong>
                        <p className="history-snippet">{testCase.input_data}</p>
                        <strong>Expected output</strong>
                        <p className="history-snippet">{testCase.expected_output}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>No sample cases shared yet.</p>
                )}
              </div>
            </article>

            <section className="detail-block workspace-column editor-column">
              <div className="workspace-column-header">
                <div>
                  <p className="auth-kicker">Code Editor</p>
                  <h2>Solve this problem</h2>
                </div>
                <div className="editor-toolbar">
                  <label className="form-field editor-toolbar-label" htmlFor="language">
                    Language
                  </label>
                  <select id="language" name="language" value={editor.language} onChange={handleEditorChange}>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
              </div>

              <form className="auth-form editor-form" onSubmit={handleSubmit}>
                <label className="form-field" htmlFor="sourceCode">
                  Source code
                </label>
                <textarea
                  id="sourceCode"
                  name="sourceCode"
                  rows="18"
                  placeholder="Write your solution here..."
                  value={editor.sourceCode}
                  onChange={handleEditorChange}
                  required
                />

                <button className="auth-button student-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit solution"}
                </button>
              </form>

              {submissionMessage ? <p className="form-status success">{submissionMessage}</p> : null}
            </section>

            <aside className="detail-block workspace-column submission-column">
              <div className="workspace-column-header">
                <div>
                  <p className="auth-kicker">Submission Panel</p>
                  <h2>Success or failed</h2>
                </div>
                <span className="question-count">{submissionHistory.length} submissions</span>
              </div>

              {historyStatus.loading ? <p className="dashboard-copy">Loading submission history...</p> : null}
              {historyStatus.error ? <p className="form-status error">{historyStatus.error}</p> : null}
              {!historyStatus.loading && !historyStatus.error && submissionHistory.length === 0 ? (
                <p className="dashboard-copy">No submissions yet. Send your first solution above.</p>
              ) : null}
              {!historyStatus.loading && !historyStatus.error && submissionHistory.length > 0 ? (
                <div className="history-list workspace-history-list">
                  {submissionHistory.map((submission) => (
                    <article className="history-card" key={submission.id}>
                      <div className="question-card-top">
                        <span className={`status-pill ${submission.status}`}>
                          {submission.status.replaceAll("_", " ")}
                        </span>
                        <span className="question-meta">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      <strong>{submission.language.toUpperCase()}</strong>
                      <p className="question-meta">
                        {submission.passed_test_cases}/{submission.total_test_cases} test cases -{" "}
                        {submission.execution_time_ms ?? "-"} ms
                      </p>
                      <p className="history-snippet">{submission.source_code}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </aside>
          </section>
        ) : null}

        <div className="detail-actions">
          <Link className="auth-button student-button detail-link" to="/student/problems">
            Back to question list
          </Link>
          <Link className="auth-button ghost-button detail-link" to="/student/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
