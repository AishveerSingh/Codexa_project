import React from "react";
import { LogOut, AlertTriangle } from "lucide-react";

export default function FacultyLogoutModal({ isOpen, onClose, onConfirmLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fd-modal-overlay" onClick={(e) => {
      if (e.target.className === "fd-modal-overlay") onClose();
    }}>
      <div className="fd-modal-card" style={{ width: "min(440px, 92vw)", textAlign: "center" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.2rem auto",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)"
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "#fff",
            textAlign: "center",
            margin: "0 0 0.5rem 0"
          }}
        >
          Logout?
        </h2>

        <p
          style={{
            fontSize: "0.92rem",
            color: "#A5B4C3",
            textAlign: "center",
            margin: "0 0 1.8rem 0",
            lineHeight: 1.5
          }}
        >
          Are you sure you want to logout from Codexa?
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            justifyContent: "center"
          }}
        >
          <button
            type="button"
            className="fd-btn fd-btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="fd-btn"
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)"
            }}
            onClick={onConfirmLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
