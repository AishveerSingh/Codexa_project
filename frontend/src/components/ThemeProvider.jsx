import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getStudentSession, getFacultySession, getAdminSession } from "../utils/session";
import { ACCENT_PRESETS } from "./accentPresets";

const ThemeContext = createContext(null);

function getActiveRoleKey(pathname) {
  if (pathname.startsWith("/admin")) {
    const session = getAdminSession();
    return session?.user?.id ? `admin_${session.user.id}` : "admin";
  }
  if (pathname.startsWith("/faculty")) {
    const session = getFacultySession();
    return session?.user?.id ? `faculty_${session.user.id}` : "faculty";
  }
  if (pathname.startsWith("/student")) {
    const session = getStudentSession();
    return session?.user?.id ? `student_${session.user.id}` : "student";
  }
  return "global";
}

export function ThemeProvider({ children }) {
  let pathname = "/";
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (_e) {
    if (typeof window !== "undefined") {
      pathname = window.location.pathname;
    }
  }

  const activeRoleKey = getActiveRoleKey(pathname);

  const themeStorageKey = `coding_platform_theme_${activeRoleKey}`;
  const accentStorageKey = `coding_platform_accent_${activeRoleKey}`;

  const [theme, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem(themeStorageKey);
    return storedTheme === "light" ? "light" : "dark";
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem(accentStorageKey) || "#ff7e29";
  });

  // Re-sync state whenever active role or route changes
  useEffect(() => {
    const storedTheme = localStorage.getItem(themeStorageKey) || "dark";
    const storedAccent = localStorage.getItem(accentStorageKey) || "#ff7e29";
    setThemeState(storedTheme === "light" ? "light" : "dark");
    setAccentColorState(storedAccent);
  }, [activeRoleKey, themeStorageKey, accentStorageKey]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(themeStorageKey, theme);
  }, [theme, themeStorageKey]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--lc-brand", accentColor);
    root.style.setProperty("--lc-accent", accentColor);
    root.style.setProperty("--lc-brand-primary", accentColor);
    root.style.setProperty("--lc-brand-hover", accentColor);
    root.style.setProperty("--lc-accent-primary", accentColor);
    root.style.setProperty("--accent-orange", accentColor);
    root.style.setProperty("--accent-color", accentColor);
    root.style.setProperty("--primary-color", accentColor);
    root.style.setProperty("--lc-brand-glow", `${accentColor}33`);
    root.style.setProperty("--lc-brand-border", `${accentColor}66`);
    localStorage.setItem(accentStorageKey, accentColor);
  }, [accentColor, accentStorageKey]);

  const setAccentColor = (color) => {
    setAccentColorState(color);
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      accentColor,
      setAccentColor,
      toggleTheme
    }),
    [theme, accentColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}
