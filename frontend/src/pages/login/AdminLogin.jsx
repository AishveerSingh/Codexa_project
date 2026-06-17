import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAdminSession } from "../../utils/session";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const initialForm = {
  fullName: "",
  email: "",
  password: ""
};

export default function AdminLogin() {
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

    const endpoint = mode === "register" ? "/users/admin-register" : "/users/admin-login";
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
        throw new Error(data.message || "Unable to authenticate admin.");
      }

      const session = {
        token: data.token,
        user: data.user
      };

      saveAdminSession(session);
      setForm(initialForm);
      setStatus({
        type: "success",
        message: data.message
      });

      navigate("/admin/dashboard", {
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
    <main className="auth-page admin-auth-page">
      <aside className="auth-side admin-side">
        <p className="auth-side-label">Control room</p>
        <h2>Review the platform from the operations seat.</h2>
        <p className="login-copy">
          Use real password authentication for admin access, then continue into the protected
          dashboard.
        </p>
      </aside>

      <section className="auth-panel admin-panel">
        <div className="auth-intro">
          <p className="auth-kicker">Admin Access</p>
          <h1>Configure, review, and steer the platform.</h1>
          <p className="auth-copy">
            Register a protected admin account or log in with your existing credentials.
          </p>
        </div>

        <div className="auth-badge-row">
          <span className="auth-badge">Role oversight</span>
          <span className="auth-badge">Password auth</span>
          <span className="auth-badge">JWT session</span>
        </div>

        <div className="panel-action-row">
          <button
            className={`auth-button ${mode === "login" ? "admin-button" : "ghost-button"} panel-action-button`}
            type="button"
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={`auth-button ${mode === "register" ? "admin-button" : "ghost-button"} panel-action-button`}
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
            placeholder="Enter your admin email"
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

          <button className="auth-button admin-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "register"
                ? "Create admin account"
                : "Enter admin dashboard"}
          </button>
        </form>

        {status.message ? <p className={`form-status ${status.type}`}>{status.message}</p> : null}
      </section>
    </main>
  );
}
