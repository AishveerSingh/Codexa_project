import React, { useState } from "react";
import {
  X,
  PlusCircle,
  FileCheck,
  Code2,
  Calendar,
  UploadCloud,
  Trophy,
  CheckCircle
} from "lucide-react";

export default function FacultyActionModals({ activeAction, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({});

  if (!activeAction) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const titles = {
    create_course: "Create New Course",
    create_assignment: "Create New Assignment",
    add_problem: "Add Coding Problem",
    schedule_class: "Schedule Lecture or Lab Class",
    upload_notes: "Upload Study Notes & Resources",
    create_contest: "Create Coding Contest",
    settings: "Faculty Dashboard Settings"
  };

  return (
    <div
      className="fd-modal-overlay"
      onClick={(e) => {
        if (e.target.className === "fd-modal-overlay") onClose();
      }}
    >
      <div className="fd-modal-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            paddingBottom: "0.8rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "#fff",
              margin: 0
            }}
          >
            {titles[activeAction] || "Faculty Action"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#A5B4C3",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <CheckCircle size={48} style={{ color: "#22C55E" }} />
            <h3 style={{ color: "#fff", fontSize: "1.2rem", margin: 0 }}>
              Successfully Created & Published!
            </h3>
            <p style={{ color: "#A5B4C3", fontSize: "0.88rem", margin: 0 }}>
              The entry has been saved to your Codexa faculty record.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleFormSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#A5B4C3",
                  display: "block",
                  marginBottom: "0.3rem"
                }}
              >
                Title / Name *
              </label>
              <input
                type="text"
                className="fd-search-input"
                placeholder="Enter title..."
                required
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{ padding: "0.65rem 1rem" }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#A5B4C3",
                  display: "block",
                  marginBottom: "0.3rem"
                }}
              >
                Description / Notes
              </label>
              <textarea
                className="fd-search-input"
                rows={3}
                placeholder="Provide instructions or detailed description..."
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                style={{ padding: "0.65rem 1rem" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.8rem",
                marginTop: "0.5rem"
              }}
            >
              <button
                type="button"
                className="fd-btn fd-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="fd-btn fd-btn-primary">
                Save & Publish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
