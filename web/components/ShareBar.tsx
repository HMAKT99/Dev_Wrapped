"use client";

import { useEffect, useState } from "react";

export function ShareBar({
  user,
  theme,
  win,
}: {
  user: string;
  theme: string;
  win?: string;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const q = `theme=${theme}${win ? `&window=${win}` : ""}`;
  const pageUrl = `${origin}/u/${encodeURIComponent(user)}?${q}`;
  const cardUrl = `${origin}/api/card/${encodeURIComponent(user)}?${q}`;
  const storyUrl = `${origin}/api/og/${encodeURIComponent(user)}?${q}&format=story`;
  const readmeSnippet = `[![Dev Wrapped](${cardUrl})](${pageUrl})`;
  const tweet = `My ${win || "year"} in code, wrapped 🎁`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a
          className="btn primary"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on X
        </a>
        <a
          className="btn"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <button className="btn" onClick={() => copy(pageUrl, "link")}>
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
        <a className="btn" href={storyUrl} target="_blank" rel="noopener noreferrer">
          Download image
        </a>
      </div>

      {/* README embed — the distribution lever */}
      <div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 8, letterSpacing: 2 }}>
          ADD TO YOUR README
        </div>
        <div
          className="mono"
          style={{
            fontSize: 12, background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: 10, padding: 12, wordBreak: "break-all", color: "var(--muted)",
          }}
        >
          {readmeSnippet}
        </div>
        <button className="btn" style={{ marginTop: 8 }} onClick={() => copy(readmeSnippet, "readme")}>
          {copied === "readme" ? "Copied!" : "Copy README snippet"}
        </button>
      </div>
    </div>
  );
}
