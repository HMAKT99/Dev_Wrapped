#!/usr/bin/env node
// build-wrapped.mjs — splice a stats.json + a theme into templates/base.html
// to produce a single self-contained wrapped.html.
//
// Usage: node build-wrapped.mjs --stats stats.json [--theme NAME] [--out wrapped.html]
//   --theme defaults to "midnight". Theme files live in ../themes/<name>.css
//   relative to this script (override with --theme-file PATH).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function parseArgs(argv) {
  const a = { theme: "midnight" };
  for (let i = 2; i < argv.length; i++) {
    const n = () => argv[++i];
    if (argv[i] === "--stats") a.stats = n();
    else if (argv[i] === "--theme") a.theme = n();
    else if (argv[i] === "--theme-file") a.themeFile = n();
    else if (argv[i] === "--out") a.out = n();
    else if (argv[i] === "--template") a.template = n();
  }
  return a;
}

function main() {
  const a = parseArgs(process.argv);
  if (!a.stats) {
    console.error("Usage: node build-wrapped.mjs --stats stats.json [--theme NAME] [--out wrapped.html]");
    process.exit(1);
  }

  const templatePath = a.template || path.join(root, "templates", "base.html");
  const themePath = a.themeFile || path.join(root, "themes", `${a.theme}.css`);

  let html = readFileSync(templatePath, "utf8");
  const data = readFileSync(a.stats, "utf8").trim();
  let themeCss;
  try {
    themeCss = readFileSync(themePath, "utf8");
  } catch {
    console.error(`Theme not found: ${themePath}`);
    process.exit(1);
  }

  // 1) Replace the theme <style id="theme"> ... </style> body with the theme CSS.
  html = html.replace(
    /(<style id="theme">)[\s\S]*?(<\/style>)/,
    (_, open, close) => `${open}\n${themeCss.trim()}\n${close}`
  );

  // 2) Replace the data <script id="data" ...> ... </script> body with the JSON.
  html = html.replace(
    /(<script id="data" type="application\/json">)[\s\S]*?(<\/script>)/,
    (_, open, close) => `${open}\n${data}\n${close}`
  );

  const out = a.out || path.join(process.cwd(), "wrapped.html");
  writeFileSync(out, html);
  console.log(out);
}

main();
