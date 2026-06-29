import type { Metadata } from "next";
import { THEMES, resolveTheme } from "@/lib/themeList";
import { ShareBar } from "@/components/ShareBar";

type Props = {
  params: { owner: string; name: string };
  searchParams: { theme?: string; window?: string };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = `${params.owner}/${params.name}`;
  const theme = resolveTheme(searchParams.theme);
  const q = `theme=${theme}${searchParams.window ? `&window=${searchParams.window}` : ""}`;
  const ogImage = `/api/og/repo/${params.owner}/${params.name}?${q}`;
  const title = `${slug} — Dev Wrapped`;
  const description = `${slug}'s year in code — commits, contributors, and velocity. Wrap any repo.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default function RepoWrappedPage({ params, searchParams }: Props) {
  const { owner, name } = params;
  const slug = `${owner}/${name}`;
  const theme = resolveTheme(searchParams.theme);
  const win = searchParams.window;
  const q = `theme=${theme}${win ? `&window=${win}` : ""}`;
  const wrappedSrc = `/api/wrapped/repo/${owner}/${name}?${q}`;

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <a href="/" style={{ fontWeight: 800, textDecoration: "none" }}>🎁 Dev Wrapped</a>
        <a className="btn" href="/">Make your own →</a>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", alignItems: "flex-start" }}>
        <div
          style={{
            width: 400, maxWidth: "100%", height: 760, borderRadius: 28,
            overflow: "hidden", border: "1px solid var(--line)",
            boxShadow: "0 30px 80px rgba(0,0,0,.5)", flexShrink: 0,
          }}
        >
          <iframe src={wrappedSrc} title={`${slug} Dev Wrapped`} style={{ width: "100%", height: "100%", border: "none" }} />
        </div>

        <div style={{ flex: 1, minWidth: 280, maxWidth: 420, display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 6, wordBreak: "break-all" }}>{slug}</h1>
            <p className="muted">A repo's year in code. Tap or scroll the story, then share it 👇</p>
          </div>

          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 8, letterSpacing: 2 }}>THEME</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {THEMES.map((t) => (
                <a
                  key={t.id}
                  href={`/r/${owner}/${name}?theme=${t.id}${win ? `&window=${win}` : ""}`}
                  className="btn"
                  style={{ padding: "8px 12px", fontSize: 13, borderColor: t.id === theme ? "var(--accent)" : "var(--line)" }}
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>

          <ShareBar
            pagePath={`/r/${owner}/${name}?${q}`}
            cardPath={`/api/card/repo/${owner}/${name}?${q}`}
            storyPath={`/api/og/repo/${owner}/${name}?${q}&format=story`}
            tweetText={`${slug}'s ${win || "year"} in code, wrapped 🎁 — commits, contributors & velocity. Wrap any repo:`}
          />

          <a
            className="btn primary"
            href="/"
            style={{ textAlign: "center", padding: "12px 18px" }}
          >
            ✨ Wrap your own repo
          </a>
        </div>
      </div>
    </main>
  );
}
