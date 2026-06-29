"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { THEMES, type ThemeId } from "@/lib/themeList";

type Mode = "user" | "repo";

function clean(v: string): string {
  return v
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
}

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("user");
  const [value, setValue] = useState("");
  const [theme, setTheme] = useState<ThemeId>("midnight");

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    const v = clean(value);
    if (!v) return;
    const parts = v.split("/").filter(Boolean);
    if (mode === "repo") {
      if (parts.length < 2) return; // need owner/repo
      router.push(`/r/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}?theme=${theme}`);
    } else {
      router.push(`/u/${encodeURIComponent(parts[0])}?theme=${theme}`);
    }
  }

  const placeholder = mode === "repo" ? "owner/repo" : "github username";
  const tip =
    mode === "repo"
      ? "Format: owner/repo — e.g. facebook/react (paste a full link and we'll trim it)."
      : "Just the username — e.g. torvalds, not the full github.com link (we'll trim it if you do).";

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
        <p className="muted" style={{ fontSize: 18, maxWidth: 520, margin: "0 auto 24px" }}>
          Get a gorgeous, shareable recap of a developer&apos;s — or a repo&apos;s —
          commits, streaks, and persona.
        </p>

        <video
          src="/demo.mp4"
          poster="/demo-poster.png"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Dev Wrapped demo"
          style={{
            width: 210, maxWidth: "60%", borderRadius: 22, display: "block",
            border: "1px solid var(--line)", boxShadow: "0 24px 60px rgba(0,0,0,.45)",
            margin: "4px auto 26px",
          }}
        />

        {/* user / repo toggle */}
        <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 12, border: "1px solid var(--line)", marginBottom: 16 }}>
          {(["user", "repo"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={mode === m ? "btn primary" : "btn"}
              style={{ padding: "8px 18px", border: mode === m ? "none" : "1px solid transparent", background: mode === m ? undefined : "transparent" }}
            >
              {m === "user" ? "👤 User" : "📦 Repo"}
            </button>
          ))}
        </div>

        <form onSubmit={go} style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
          <input
            className="input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="btn primary" type="submit">
            Wrap it →
          </button>
        </form>
        <p className="muted" style={{ fontSize: 13, marginTop: 10, maxWidth: 460, marginInline: "auto" }}>
          {tip}
        </p>

        <div style={{ marginTop: 36 }}>
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

        <p className="muted" style={{ fontSize: 13, marginTop: 36 }}>
          Uses only public GitHub data · open source on{" "}
          <a href="https://github.com/HMAKT99/Dev_Wrapped" style={{ color: "var(--accent2)" }}>
            GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
