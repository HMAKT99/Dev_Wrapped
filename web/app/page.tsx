"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { THEMES, type ThemeId } from "@/lib/themeList";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [theme, setTheme] = useState<ThemeId>("midnight");

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    const u = user.trim().replace(/^@/, "");
    if (!u) return;
    router.push(`/u/${encodeURIComponent(u)}?theme=${theme}`);
  }

  return (
    <main className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
        <div className="muted" style={{ letterSpacing: 6, textTransform: "uppercase", fontSize: 13 }}>
          🎁 Dev Wrapped
        </div>
        <h1 style={{ fontSize: "clamp(38px,7vw,72px)", lineHeight: 1.02, margin: "16px 0" }}>
          Your year in code,{" "}
          <span
            style={{
              background: "linear-gradient(120deg,var(--accent),var(--accent2))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            wrapped
          </span>
          .
        </h1>
        <p className="muted" style={{ fontSize: 18, maxWidth: 520, margin: "0 auto 32px" }}>
          Enter a GitHub username and get a gorgeous, shareable recap of your
          commits, streaks, and your developer persona.
        </p>

        <form onSubmit={go} style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
          <input
            className="input"
            placeholder="github username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="btn primary" type="submit">
            Wrap it →
          </button>
        </form>

        <div style={{ marginTop: 40 }}>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12, letterSpacing: 2 }}>
            PICK A THEME
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                style={{
                  width: 92, height: 60, borderRadius: 12, cursor: "pointer",
                  background: `linear-gradient(135deg, ${t.swatch[2]} 0%, ${t.swatch[2]} 55%, ${t.swatch[0]} 100%)`,
                  border: theme === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                  outline: theme === t.id ? "none" : "1px solid var(--line)",
                  position: "relative",
                  display: "flex", alignItems: "flex-end", padding: 8,
                }}
              >
                <span style={{ display: "flex", gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 99, background: t.swatch[0] }} />
                  <span style={{ width: 12, height: 12, borderRadius: 99, background: t.swatch[1] }} />
                </span>
                <span
                  style={{
                    position: "absolute", top: 6, left: 8, fontSize: 11, fontWeight: 700,
                    color: ["editorial", "bubblegum"].includes(t.id) ? "#1a1714" : "#fff",
                    opacity: 0.9,
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="muted" style={{ fontSize: 13, marginTop: 40 }}>
          Uses only public GitHub data · open source on{" "}
          <a href="https://github.com/HMAKT99/Dev_Wrapped" style={{ color: "var(--accent2)" }}>
            GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
