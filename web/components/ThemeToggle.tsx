"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
      "dark";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("site-theme", next);
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      title="Toggle light/dark"
      style={{
        position: "fixed", top: 16, right: 16, zIndex: 50,
        width: 40, height: 40, borderRadius: 999, cursor: "pointer",
        border: "1px solid var(--line)", background: "var(--bg2)",
        color: "var(--fg)", fontSize: 18, lineHeight: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
