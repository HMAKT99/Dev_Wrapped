#!/usr/bin/env node
// update-readme.mjs — insert/refresh the Dev Wrapped block in a README between
// <!-- DEV-WRAPPED:START --> and <!-- DEV-WRAPPED:END --> markers.
// If the markers are absent, a section is appended to the end of the file.
//
// Usage: node update-readme.mjs --readme README.md --image .github/dev-wrapped.png --link https://site/u/USER
// Exits 0 always; prints "changed" or "unchanged".

import { readFileSync, writeFileSync, existsSync } from "node:fs";

function arg(name, def = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

const readme = arg("readme", "README.md");
const image = arg("image");
const link = arg("link");
const START = "<!-- DEV-WRAPPED:START -->";
const END = "<!-- DEV-WRAPPED:END -->";

const block = `${START}
[![Dev Wrapped](${image})](${link})
${END}`;

let content = existsSync(readme) ? readFileSync(readme, "utf8") : "";
let next;

if (content.includes(START) && content.includes(END)) {
  next = content.replace(
    new RegExp(`${START}[\\s\\S]*?${END}`),
    block
  );
} else {
  const sep = content.endsWith("\n") || content === "" ? "" : "\n";
  next = `${content}${sep}\n## My Dev Wrapped\n\n${block}\n`;
}

if (next === content) {
  console.log("unchanged");
} else {
  writeFileSync(readme, next);
  console.log("changed");
}
