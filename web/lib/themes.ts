// themes.ts — server-only theme CSS loader (reads web/themes/*.css at runtime).
// Re-exports the pure catalog from themeList for convenience.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ThemeId } from "./themeList";

export * from "./themeList";

export function themeCss(id: ThemeId): string {
  return readFileSync(path.join(process.cwd(), "themes", `${id}.css`), "utf8");
}
