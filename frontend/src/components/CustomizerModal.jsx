import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { ACCENT_PRESETS } from "./accentPresets";

export default function CustomizerModal({ isOpen, onClose }) {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
      padding: "1.5rem"
    }}>
      <div style={{
        background: "var(--lc-card-bg)",
        border: "1px solid var(--lc-border)",
        borderRadius: "20px",
        padding: "2rem",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--lc-text-primary)" }}>
              🎨 Customize Interface Theme & Colors
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--lc-text-muted)", marginTop: "0.2rem" }}>
              Personalize your workspace colors and appearance mode.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "var(--lc-text-muted)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1.1rem"
            }}
          >
            ✕
          </button>
        </div>

        {/* Theme Mode Selector */}
        <div style={{ marginBottom: "1.75rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--lc-text-primary)", display: "block", marginBottom: "0.75rem" }}>
            Appearance Mode
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              style={{
                background: theme === "dark" ? "var(--lc-accent, #ff7e29)" : "rgba(255, 255, 255, 0.05)",
                color: theme === "dark" ? "#fff" : "var(--lc-text-muted)",
                border: "1px solid",
                borderColor: theme === "dark" ? "var(--lc-accent, #ff7e29)" : "var(--lc-border)",
                borderRadius: "10px",
                padding: "0.75rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              🌙 Dark Mode
            </button>
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              style={{
                background: theme === "light" ? "var(--lc-accent, #ff7e29)" : "rgba(255, 255, 255, 0.05)",
                color: theme === "light" ? "#fff" : "var(--lc-text-muted)",
                border: "1px solid",
                borderColor: theme === "light" ? "var(--lc-accent, #ff7e29)" : "var(--lc-border)",
                borderRadius: "10px",
                padding: "0.75rem",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              ☀️ Light Mode
            </button>
          </div>
        </div>

        {/* Primary Accent Color Presets */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--lc-text-primary)", display: "block", marginBottom: "0.75rem" }}>
            Primary Accent Color
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase();
              return (
                <button
                  key={preset.id}
                  onClick={() => setAccentColor(preset.color)}
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    border: isSelected ? `2px solid ${preset.color}` : "1px solid var(--lc-border)",
                    borderRadius: "10px",
                    padding: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    cursor: "pointer",
                    boxShadow: isSelected ? `0 0 12px ${preset.color}66` : "none"
                  }}
                >
                  <span style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: preset.color,
                    display: "inline-block",
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? preset.color : "var(--lc-text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "var(--lc-accent, #ff7e29)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.65rem 1.5rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
