#!/usr/bin/env node
// export-png.mjs — render the Dev Wrapped share card to PNGs for social.
//
// The wrapped.html itself is zero-dependency. PNG export is the one optional
// extra and needs Playwright:  npm i playwright  (or: npx playwright install chromium)
//
// Usage: node export-png.mjs --html wrapped.html [--out-dir .] [--formats story,og]
//   story = 1080x1920 (IG/X story)   og = 1200x630 (link preview / OG image)

import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const a = { outDir: process.cwd(), formats: "story,og" };
  for (let i = 2; i < argv.length; i++) {
    const n = () => argv[++i];
    if (argv[i] === "--html") a.html = n();
    else if (argv[i] === "--out-dir") a.outDir = n();
    else if (argv[i] === "--formats") a.formats = n();
  }
  return a;
}

const SIZES = {
  story: { w: 1080, h: 1920 },
  og: { w: 1200, h: 630 },
};

async function main() {
  const a = parseArgs(process.argv);
  if (!a.html || !existsSync(a.html)) {
    console.error("Pass --html path/to/wrapped.html");
    process.exit(1);
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "Playwright not found. Install it for PNG export:\n  npm i playwright && npx playwright install chromium\n(The wrapped.html works on its own without this.)"
    );
    process.exit(1);
  }

  const fileUrl = pathToFileURL(path.resolve(a.html)).href;
  const browser = await chromium.launch();
  const written = [];

  for (const fmt of a.formats.split(",").map((s) => s.trim()).filter(Boolean)) {
    const size = SIZES[fmt];
    if (!size) {
      console.error(`Unknown format: ${fmt} (use story,og)`);
      continue;
    }
    const page = await browser.newPage({
      viewport: { width: size.w, height: size.h },
      deviceScaleFactor: 2,
    });
    await page.goto(`${fileUrl}?export=${fmt}&scene=card`, { waitUntil: "load" });
    await page.waitForTimeout(1100); // let count-ups / bar fills settle
    const out = path.join(a.outDir, `dev-wrapped-${fmt}.png`);
    const shot = await page.$(".scene.shot");
    if (shot) await shot.screenshot({ path: out });
    else await page.screenshot({ path: out });
    written.push(out);
    await page.close();
  }

  await browser.close();
  written.forEach((w) => console.log(w));
}

main();
