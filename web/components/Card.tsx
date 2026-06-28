/* Card.tsx — the share/OG/README card as a satori-friendly element.
   Used by the image routes via next/og ImageResponse. Inline styles only,
   every container is display:flex (satori requirement). */
import type { Stats } from "@/lib/types";
import type { ThemeColors } from "@/lib/themeColors";

export type Variant = "og" | "story" | "readme";

const LIGHT = new Set(["editorial", "bubblegum"]);

interface Cfg {
  w: number; h: number; card: number; pad: number; cellPad: number;
  emoji: number; title: number; kicker: number;
  num: number; label: number; gap: number; radius: number;
}

const CFG: Record<Variant, Cfg> = {
  og:     { w: 1200, h: 630,  card: 1060, pad: 40, cellPad: 18, emoji: 70, title: 40, kicker: 16, num: 40, label: 14, gap: 14, radius: 24 },
  story:  { w: 1080, h: 1920, card: 920,  pad: 56, cellPad: 26, emoji: 96, title: 50, kicker: 19, num: 58, label: 18, gap: 22, radius: 38 },
  readme: { w: 900,  h: 440,  card: 864,  pad: 26, cellPad: 13, emoji: 52, title: 28, kicker: 13, num: 30, label: 11, gap: 11, radius: 18 },
};

function cells(s: Stats): [string, string][] {
  const d = s.derived!;
  const fmt = (n: number) => n.toLocaleString();
  const peak: [string, string] =
    d.busiestHourLabel !== "—"
      ? [d.busiestHourLabel, "PEAK HOUR"]
      : [s.time.busiestWeekdayName, "POWER DAY"];
  if (s.source === "repo") {
    const rm = s.repoMeta || { stars: 0, contributors: 0, forks: 0 };
    return [
      [fmt(s.totals.commits), "COMMITS"],
      [fmt(rm.contributors), "CONTRIBUTORS"],
      [fmt(rm.stars), "STARS"],
      peak,
      [`+${fmt(s.totals.linesAdded)}`, "LINES ADDED"],
      [d.topLang || "—", "TOP LANGUAGE"],
    ];
  }
  return [
    [fmt(s.totals.commits), "COMMITS"],
    [fmt(s.totals.activeDays), "ACTIVE DAYS"],
    [`${s.totals.longestStreak}`, "DAY STREAK 🔥"],
    peak,
    s.totals.linesAdded > 0
      ? [`+${fmt(s.totals.linesAdded)}`, "LINES ADDED"]
      : [`${d.commitsPerActiveDay}`, "COMMITS / DAY"],
    [d.topLang || "—", "TOP LANGUAGE"],
  ];
}

export function Card({
  stats,
  colors,
  themeId,
  variant,
  credit,
}: {
  stats: Stats;
  colors: ThemeColors;
  themeId: string;
  variant: Variant;
  credit: string;
}) {
  const c = CFG[variant];
  const isLight = LIGHT.has(themeId);
  const cellBg = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
  const cellBorder = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)";
  const persona = stats.persona!;
  const all = cells(stats);
  const rows = [all.slice(0, 2), all.slice(2, 4), all.slice(4, 6)];

  return (
    <div
      style={{
        width: c.w, height: c.h, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: colors.bg, fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: c.card, display: "flex", flexDirection: "column",
          gap: c.gap + 4, padding: c.pad, borderRadius: c.radius,
          background: colors.card, border: `1px solid ${cellBorder}`,
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: c.emoji, display: "flex" }}>{persona.emoji}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: colors.muted, fontSize: c.kicker, letterSpacing: 3 }}>
              {stats.repo} · {(stats.window.label || "").toUpperCase()}
            </div>
            <div style={{ display: "flex", color: colors.fg, fontSize: c.title, fontWeight: 800 }}>
              {persona.title}
            </div>
            {persona.odds && (
              <div style={{ display: "flex", color: colors.muted, fontSize: c.label, marginTop: 2 }}>
                Rarer than {(100 - persona.odds.sharePct).toFixed(1)}% of devs
              </div>
            )}
          </div>
          {persona.rarity !== "common" && (
            <div
              style={{
                display: "flex", marginLeft: "auto", alignSelf: "flex-start",
                padding: "6px 14px", borderRadius: 999, color: "#fff",
                fontSize: c.label, fontWeight: 800, letterSpacing: 2,
                background:
                  persona.rarity === "legendary"
                    ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                    : "linear-gradient(90deg,#3b82f6,#06b6d4)",
              }}
            >
              {persona.rarity.toUpperCase()}
            </div>
          )}
        </div>

        {/* stat grid: explicit rows of 2 */}
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: c.gap }}>
            {row.map(([n, l], i) => (
              <div
                key={i}
                style={{
                  display: "flex", flexDirection: "column", flex: "1 1 0",
                  gap: 4, padding: c.cellPad, borderRadius: c.radius * 0.6,
                  background: cellBg,
                }}
              >
                <div style={{ display: "flex", color: colors.fg, fontSize: c.num, fontWeight: 800 }}>{n}</div>
                <div style={{ display: "flex", color: colors.muted, fontSize: c.label, letterSpacing: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        ))}

        {/* credit */}
        <div style={{ display: "flex", color: colors.muted, fontSize: c.kicker }}>
          made with Dev Wrapped · {credit}
        </div>
      </div>
    </div>
  );
}

export const cardSize = (v: Variant) => ({ width: CFG[v].w, height: CFG[v].h });
