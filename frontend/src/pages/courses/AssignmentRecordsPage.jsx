import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { getAdminSession, getFacultySession } from "../../utils/session";

export default function AssignmentRecordsPage({ role }) {
  const { courseId, assignmentId } = useParams();
  const session = role === "admin" ? getAdminSession() : getFacultySession();
  
  const [assignment, setAssignment] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const asgRes = await apiRequest(`/assignments/${assignmentId}`, {}, session?.token);
        setAssignment(asgRes);

        const recRes = await apiRequest(`/assignments/${assignmentId}/attempts`, {}, session?.token);
        setRecords(recRes);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
  }, [assignmentId, session?.token]);

  const viewAttemptDetails = async (attemptId) => {
    try {
      const details = await apiRequest(`/assignments/${assignmentId}/attempts/${attemptId}`, {}, session?.token);
      setSelectedAttempt(details);
    } catch (err) {
      alert("Failed to load attempt details.");
    }
  };

  const backLink = role === "admin" ? `/admin/courses/${courseId}` : `/faculty/courses/${courseId}`;

  if (loading) return <div style={{ padding: "2rem" }}>Loading records...</div>;
  if (error) return <div className="form-status error">{error}</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <Link to={backLink} className="auth-button faculty-button" style={{ display: "inline-block", marginBottom: "1rem" }}>← Back to Course</Link>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1>Records: {assignment?.title}</h1>
          <p>Total Submissions: {records.length}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedAttempt ? "1fr 1fr" : "1fr", gap: "2rem" }}>
        
        {/* Table View */}
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Student</th>
                <th style={{ padding: "0.5rem" }}>Email</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Score</th>
                <th style={{ padding: "0.5rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.attempt_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.5rem" }}>{r.full_name}</td>
                  <td style={{ padding: "0.5rem" }}>{r.email}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "4px", 
                      fontSize: "0.85rem",
                      background: r.status === 'submitted' ? "#dcfce7" : "#fef9c3",
                      color: r.status === 'submitted' ? "#166534" : "#854d0e"
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{r.total_score} / {assignment?.max_score}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button 
                      className="auth-button" 
                      style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}
                      onClick={() => viewAttemptDetails(r.attempt_id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>No attempts recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail View */}
        {selectedAttempt && (
          <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2>Attempt Details</h2>
              <button onClick={() => setSelectedAttempt(null)} style={{ cursor: "pointer", background: "none", border: "none", fontSize: "1.5rem" }}>×</button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
               <strong>Total Score:</strong> {selectedAttempt.attempt.total_score} <br/>
               <strong>Status:</strong> {selectedAttempt.attempt.status} <br/>
               <strong>Submitted:</strong> {new Date(selectedAttempt.attempt.submitted_at).toLocaleString()}
            </div>

            <h3>MCQ Answers</h3>
            {selectedAttempt.mcqAnswers.map((ans, i) => (
               <div key={i} style={{ padding: "1rem", border: "1px solid #cbd5e1", borderRadius: "4px", marginBottom: "1rem", background: "white" }}>
                 <p><strong>Q-ID:</strong> {ans.assignment_question_id}</p>
                 <p>Selected Option: {ans.selected_option_index !== null ? ans.selected_option_index + 1 : 'None'}</p>
                 <p>Correct Option: {ans.correct_option_index + 1}</p>
                 <p>Marks Obtained: <span style={{ color: ans.is_correct ? "green" : "red" }}>{ans.marks_obtained}</span></p>
               </div>
            ))}

            <h3 style={{ marginTop: "2rem" }}>Coding Answers</h3>
            {selectedAttempt.codingAnswers.map((ans, i) => (
               <div key={i} style={{ padding: "1rem", border: "1px solid #cbd5e1", borderRadius: "4px", marginBottom: "1rem", background: "white" }}>
                 <p><strong>Q-ID:</strong> {ans.assignment_question_id}</p>
                 <p>Language: {ans.language}</p>
                 <p>Marks Obtained: {ans.marks_obtained}</p>
                 <div style={{ background: "#1e293b", color: "#f8fafc", padding: "1rem", borderRadius: "4px", overflowX: "auto" }}>
                   <pre><code>{ans.source_code}</code></pre>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
