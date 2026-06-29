"use client";

import { useEffect, useState } from "react";

export function ShareBar({
  pagePath,
  cardPath,
  storyPath,
  tweetText,
}: {
  pagePath: string; // e.g. /u/HMAKT99?theme=midnight
  cardPath: string; // e.g. /api/card/HMAKT99?theme=midnight
  storyPath: string; // e.g. /api/og/HMAKT99?theme=midnight&format=story
  tweetText: string;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const pageUrl = `${origin}${pagePath}`;
  const cardUrl = `${origin}${cardPath}`;
  const storyUrl = `${origin}${storyPath}`;
  const readmeSnippet = `[![Dev Wrapped](${cardUrl})](${pageUrl})`;
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(pageUrl)}`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {}
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Dev Wrapped", text: tweetText, url: pageUrl });
    } catch {
      // user cancelled or share failed — no-op
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {canNativeShare ? (
          <button className="btn primary" onClick={nativeShare}>
            📤 Share my card
          </button>
        ) : (
          <a
            className="btn primary"
            href={xIntent}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on X
          </a>
        )}
        {canNativeShare && (
          <a
            className="btn"
            href={xIntent}
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
        )}
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
