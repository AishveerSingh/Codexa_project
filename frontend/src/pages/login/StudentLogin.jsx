import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveStudentSession } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const initialForm = {
  fullName: "",
  email: "",
  password: ""
};

export default function StudentLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    type: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({
      type: "",
      message: ""
    });

    const endpoint = mode === "register" ? "/users/student-register" : "/users/student-login";
    const payload =
      mode === "register"
        ? form
        : {
            email: form.email,
            password: form.password
          };

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to authenticate student.");
      }

      const session = {
        token: data.token,
        user: data.user
      };

      saveStudentSession(session);
      setForm(initialForm);
      setStatus({
        type: "success",
        message: data.message
      });

      navigate("/student/dashboard", {
        state: {
          session
        }
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page student-auth-page">
      <section className="auth-panel student-panel">
        <div className="auth-intro">
          <p className="auth-kicker">Student Access</p>
          <h1>Start solving, shipping, and learning.</h1>
          <p className="auth-copy">
            Register a student account with a password or log in with your existing credentials.
          </p>
        </div>

        <div className="auth-badge-row">
          <span className="auth-badge">Practice tracks</span>
          <span className="auth-badge">Password auth</span>
          <span className="auth-badge">JWT session</span>
        </div>

        <div className="panel-action-row">
          <button
            className={`auth-button ${mode === "login" ? "student-button" : "ghost-button"} panel-action-button`}
            type="button"
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={`auth-button ${mode === "register" ? "student-button" : "ghost-button"} panel-action-button`}
            type="button"
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <label className="form-field" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </>
          ) : null}

          <label className="form-field" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="form-field" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button className="auth-button student-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "register"
                ? "Create student account"
                : "Enter student dashboard"}
          </button>
        </form>

        {status.message ? <p className={`form-status ${status.type}`}>{status.message}</p> : null}
      </section>

      <aside className="auth-side student-side">
        <p className="auth-side-label">Student space</p>
        <h2>Build consistency before complexity.</h2>
        <p className="login-copy">
          Sign in securely, keep your student identity in the database, and move into the
          dashboard with a JWT-backed session.
        </p>
      </aside>
    </main>
  );
}
