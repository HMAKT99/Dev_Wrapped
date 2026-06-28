#!/usr/bin/env node
// extract-git-stats.mjs — parse `git log` into a stats.json for Dev Wrapped.
//
// Local-only: shells out to `git`, never touches the network.
// Usage:
//   node extract-git-stats.mjs [--repo PATH] [--since ISO|--year YYYY] [--until ISO]
//                              [--author EMAIL|SUBSTR] [--all-authors] [--out FILE]
//
// Defaults: the repo in CWD, the last 365 days, commits authored by your
// configured git email (`git config user.email`). Writes stats to --out
// (default ./dev-wrapped-stats.json) and prints the path.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const US = "\x1f"; // field separator
const RS = "\x1e"; // record separator

function parseArgs(argv) {
  const args = { allAuthors: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--repo") args.repo = next();
    else if (a === "--since") args.since = next();
    else if (a === "--until") args.until = next();
    else if (a === "--year") args.year = next();
    else if (a === "--author") args.author = next();
    else if (a === "--all-authors" || a === "--all") args.allAuthors = true;
    else if (a === "--out") args.out = next();
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function git(cwd, gitArgs) {
  return execFileSync("git", gitArgs, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 256,
    stdio: ["ignore", "pipe", "pipe"], // capture stderr instead of leaking it
  });
}

function tryGit(cwd, gitArgs, fallback = "") {
  try {
    return git(cwd, gitArgs);
  } catch {
    return fallback;
  }
}

// extension -> display language
const LANG = {
  js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", cjs: "JavaScript",
  ts: "TypeScript", tsx: "TypeScript",
  py: "Python", rb: "Ruby", go: "Go", rs: "Rust", java: "Java",
  kt: "Kotlin", swift: "Swift", c: "C", h: "C", cc: "C++", cpp: "C++",
  cxx: "C++", hpp: "C++", cs: "C#", php: "PHP", scala: "Scala",
  sh: "Shell", bash: "Shell", zsh: "Shell", fish: "Shell",
  html: "HTML", css: "CSS", scss: "SCSS", sass: "Sass", less: "Less",
  vue: "Vue", svelte: "Svelte", astro: "Astro",
  json: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML", xml: "XML",
  md: "Markdown", mdx: "Markdown", rst: "reStructuredText", txt: "Text",
  sql: "SQL", graphql: "GraphQL", gql: "GraphQL", proto: "Protobuf",
  lua: "Lua", r: "R", dart: "Dart", ex: "Elixir", exs: "Elixir",
  erl: "Erlang", clj: "Clojure", hs: "Haskell", ml: "OCaml", nim: "Nim",
  zig: "Zig", pl: "Perl", elm: "Elm", tf: "Terraform", dockerfile: "Docker",
};

const STOPWORDS = new Set(
  ("the a an and or but to of in on for with at by from up off this that " +
    "is are was were be been it its as into add adds added update updates " +
    "updated change changes changed make makes made use uses used new now " +
    "via not no do does done so if then than when while we i you").split(" ")
);

function extOf(file) {
  const base = path.basename(file).toLowerCase();
  if (base === "dockerfile") return "dockerfile";
  if (base === "makefile") return "makefile";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot + 1);
}

// Count grapheme-ish emoji presence in a string.
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log("Usage: node extract-git-stats.mjs [--repo PATH] [--since ISO|--year YYYY] [--until ISO] [--author X] [--all-authors] [--out FILE]");
    return;
  }

  const repo = args.repo || process.cwd();

  // Verify it's a git repo.
  const toplevel = tryGit(repo, ["rev-parse", "--show-toplevel"]).trim();
  if (!toplevel) {
    console.error(`Not a git repository: ${repo}`);
    process.exit(1);
  }

  // Date window.
  let since = args.since;
  let until = args.until;
  if (args.year) {
    since = `${args.year}-01-01T00:00:00`;
    until = `${args.year}-12-31T23:59:59`;
  }
  if (!since) {
    const d = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    since = d.toISOString();
  }

  // Who is "me"?
  const myEmail = tryGit(repo, ["config", "user.email"]).trim().toLowerCase();
  const myName = tryGit(repo, ["config", "user.name"]).trim().toLowerCase();
  const authorFilter = args.author ? args.author.toLowerCase() : null;

  const logArgs = [
    "log",
    "--no-merges",
    `--since=${since}`,
    ...(until ? [`--until=${until}`] : []),
    "--numstat",
    `--pretty=format:${RS}HDR${US}%H${US}%an${US}%ae${US}%aI${US}%s`,
  ];
  const raw = tryGit(repo, logArgs);

  const records = raw.split(RS).map((r) => r.trim()).filter(Boolean);

  // Aggregates.
  let totalCommits = 0;
  let linesAdded = 0;
  let linesDeleted = 0;
  const days = new Set();
  const byHour = new Array(24).fill(0);
  const byWeekday = new Array(7).fill(0); // 0 = Sunday
  const byMonth = {};
  const langs = {}; // lang -> {lines, files}
  const fileTouch = {}; // path -> commits count
  const words = {};
  let emojiCount = 0;
  const counters = { fix: 0, oops: 0, revert: 0, wtf: 0, hack: 0, todo: 0, wip: 0 };
  let longest = { len: 0, subject: "" };
  let shortest = { len: Infinity, subject: "" };
  let subjectLenSum = 0;
  let firstCommit = null;
  let lastCommit = null;
  const authorsSeen = new Set();

  for (const rec of records) {
    const lines = rec.split("\n");
    const header = lines[0];
    if (!header.startsWith("HDR")) continue;
    const [, hash, an, ae, iso, ...subjParts] = header.split(US);
    const subject = subjParts.join(US) || "";

    const email = (ae || "").toLowerCase();
    const name = (an || "").toLowerCase();

    // Author filtering.
    if (authorFilter) {
      if (!email.includes(authorFilter) && !name.includes(authorFilter)) continue;
    } else if (!args.allAuthors && myEmail) {
      if (email !== myEmail && name !== myName) continue;
    }
    authorsSeen.add(email || name);

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) continue;

    totalCommits++;

    // Time buckets (local time of the commit's own offset, per ISO string).
    byHour[date.getHours()]++;
    byWeekday[date.getDay()]++;
    const ymd = iso.slice(0, 10);
    const ym = iso.slice(0, 7);
    days.add(ymd);
    byMonth[ym] = (byMonth[ym] || 0) + 1;

    if (!firstCommit || iso < firstCommit.iso) firstCommit = { iso, subject, hash };
    if (!lastCommit || iso > lastCommit.iso) lastCommit = { iso, subject, hash };

    // Message vibes.
    const len = subject.length;
    subjectLenSum += len;
    if (len > longest.len) longest = { len, subject };
    if (len > 0 && len < shortest.len) shortest = { len, subject };
    const em = subject.match(EMOJI_RE);
    if (em) emojiCount += em.length;
    const lower = subject.toLowerCase();
    for (const k of Object.keys(counters)) {
      if (new RegExp(`\\b${k}\\b`).test(lower)) counters[k]++;
    }
    for (const w of lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
      if (w.length < 3 || STOPWORDS.has(w) || /^\d+$/.test(w)) continue;
      words[w] = (words[w] || 0) + 1;
    }

    // numstat lines.
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split("\t");
      if (parts.length < 3) continue;
      const [addS, delS, file] = parts;
      const add = addS === "-" ? 0 : parseInt(addS, 10) || 0;
      const del = delS === "-" ? 0 : parseInt(delS, 10) || 0;
      linesAdded += add;
      linesDeleted += del;
      fileTouch[file] = (fileTouch[file] || 0) + 1;
      const ext = extOf(file);
      const lang = LANG[ext];
      if (lang) {
        langs[lang] = langs[lang] || { lines: 0, files: new Set() };
        langs[lang].lines += add + del;
        langs[lang].files.add(file);
      }
    }
  }

  if (totalCommits === 0) {
    console.error(
      "No commits found for the selected window/author. " +
        "Try --all-authors, a wider --since, or --author <substr>."
    );
    process.exit(2);
  }

  // Streaks (consecutive calendar days).
  const sortedDays = [...days].sort();
  let longestStreak = 1;
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1] + "T00:00:00Z");
    const cur = new Date(sortedDays[i] + "T00:00:00Z");
    const diff = Math.round((cur - prev) / 86400000);
    if (diff === 1) streak++;
    else streak = 1;
    if (streak > longestStreak) longestStreak = streak;
  }

  const busiestHour = byHour.indexOf(Math.max(...byHour));
  const busiestWeekday = byWeekday.indexOf(Math.max(...byWeekday));

  const topLanguages = Object.entries(langs)
    .map(([name, v]) => ({ name, lines: v.lines, files: v.files.size }))
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 8);

  const topFiles = Object.entries(fileTouch)
    .map(([file, commits]) => ({ file, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10);

  const topWords = Object.entries(words)
    .map(([word, n]) => ({ word, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 12);

  // Repo name from remote, else folder name.
  let repoName = path.basename(toplevel);
  const remote = tryGit(repo, ["remote", "get-url", "origin"]).trim();
  if (remote) {
    const m = remote.match(/[/:]([^/]+\/[^/]+?)(?:\.git)?$/);
    if (m) repoName = m[1];
  }

  const stats = {
    schema: "dev-wrapped/1",
    repo: repoName,
    generatedFromCwd: repo,
    window: { since, until: until || null },
    authorMode: authorFilter
      ? `author~=${authorFilter}`
      : args.allAuthors
      ? "all-authors"
      : myEmail
      ? `me<${myEmail}>`
      : "all-authors(no-config)",
    distinctAuthors: authorsSeen.size,
    totals: {
      commits: totalCommits,
      activeDays: days.size,
      longestStreak,
      linesAdded,
      linesDeleted,
      net: linesAdded - linesDeleted,
    },
    time: {
      byHour,
      byWeekday,
      byMonth,
      busiestHour,
      busiestWeekday,
      busiestWeekdayName: [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday",
      ][busiestWeekday],
    },
    topLanguages,
    topFiles,
    messages: {
      topWords,
      emojiCount,
      counters,
      avgLength: Math.round(subjectLenSum / totalCommits),
      longest: longest.subject,
      shortest: shortest.subject === "" ? null : shortest.subject,
    },
    firstCommit,
    lastCommit,
  };

  const out = args.out || path.join(process.cwd(), "dev-wrapped-stats.json");
  writeFileSync(out, JSON.stringify(stats, null, 2));
  console.log(out);
}

main();
