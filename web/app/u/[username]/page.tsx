import type { Metadata } from "next";
import { THEMES, resolveTheme } from "@/lib/themeList";
import { ShareBar } from "@/components/ShareBar";

type Props = {
  params: { username: string };
  searchParams: { theme?: string; window?: string };
};

const hiddenWarm: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none",
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const user = decodeURIComponent(params.username);
  const theme = resolveTheme(searchParams.theme);
  const q = `theme=${theme}${searchParams.window ? `&window=${searchParams.window}` : ""}`;
  const ogImage = `/api/og/${encodeURIComponent(user)}?${q}`;
  const title = `${user}'s Dev Wrapped`;
  const description = `See @${user}'s year in code — commits, streaks, and developer persona. Make your own.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default function WrappedPage({ params, searchParams }: Props) {
  const user = decodeURIComponent(params.username);
  const theme = resolveTheme(searchParams.theme);
  const win = searchParams.window;
  const q = `theme=${theme}${win ? `&window=${win}` : ""}`;
  const wrappedSrc = `/api/wrapped/${encodeURIComponent(user)}?${q}`;

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <a href="/" style={{ fontWeight: 800, textDecoration: "none" }}>🎁 Dev Wrapped</a>
        <a className="btn" href="/">Make your own →</a>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", alignItems: "flex-start" }}>
        {/* the interactive wrapped, phone-framed */}
        <div
          style={{
            width: 400, maxWidth: "100%", height: 760, borderRadius: 28,
            overflow: "hidden", border: "1px solid var(--line)",
            boxShadow: "0 30px 80px rgba(0,0,0,.5)", flexShrink: 0,
          }}
        >
          <iframe src={wrappedSrc} title={`${user} Dev Wrapped`} style={{ width: "100%", height: "100%", border: "none" }} />
        </div>

        {/* controls + share */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 420, display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <h1 style={{ fontSize: 30, marginBottom: 6 }}>@{user}</h1>
            <p className="muted">Tap or scroll through the story on the left. Then share it 👇</p>
          </div>

          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 8, letterSpacing: 2 }}>THEME</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {THEMES.map((t) => (
                <a
                  key={t.id}
                  href={`/u/${encodeURIComponent(user)}?theme=${t.id}${win ? `&window=${win}` : ""}`}
                  className="btn"
                  style={{
                    padding: "8px 12px", fontSize: 13,
                    borderColor: t.id === theme ? "var(--accent)" : "var(--line)",
                  }}
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>

          <ShareBar
            pagePath={`/u/${encodeURIComponent(user)}?${q}`}
            cardPath={`/api/card/${encodeURIComponent(user)}?${q}`}
            storyPath={`/api/og/${encodeURIComponent(user)}?${q}&format=story`}
            tweetText={`My ${win || "year"} in code, wrapped 🎁 — commits, streaks & my dev persona. What's yours?`}
          />

          <a
            className="btn primary"
            href="/"
            style={{ textAlign: "center", padding: "12px 18px" }}
          >
            ✨ Make your own Dev Wrapped
          </a>
        </div>
      </div>

      {/* Pre-warm the edge cache for the share images so they load instantly
          (and social crawlers don't time out) once the user hits share. */}
      <img src={`/api/og/${encodeURIComponent(user)}?${q}`} alt="" aria-hidden width={1} height={1} style={hiddenWarm} />
      <img src={`/api/og/${encodeURIComponent(user)}?${q}&format=story`} alt="" aria-hidden width={1} height={1} style={hiddenWarm} />
    </main>
  );
}
