// build.ts — splice stats + theme into the self-contained base.html.
// Ported from scripts/build-wrapped.mjs.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Stats } from "./types";

let cachedTemplate: string | null = null;

function template(): string {
  if (cachedTemplate) return cachedTemplate;
  cachedTemplate = readFileSync(
    path.join(process.cwd(), "templates", "base.html"),
    "utf8"
  );
  return cachedTemplate;
}

export function buildWrappedHtml(
  stats: Stats,
  css: string,
  opts: { credit?: string; label?: string } = {}
): string {
  const data: Stats = { ...stats };
  if (opts.credit) data.credit = opts.credit;
  if (opts.label) data.window = { ...data.window, label: opts.label };
  const json = JSON.stringify(data, null, 2);

  let html = template();
  html = html.replace(
    /(<style id="theme">)[\s\S]*?(<\/style>)/,
    (_m, open, close) => `${open}\n${css.trim()}\n${close}`
  );
  html = html.replace(
    /(<script id="data" type="application\/json">)[\s\S]*?(<\/script>)/,
    (_m, open, close) => `${open}\n${json}\n${close}`
  );
  return html;
}
