// window.ts — map a ?window= param to fetch options + a display label.
import type { FetchOpts } from "./github";

export function windowOpts(w: string | null): { opts: FetchOpts; label: string } {
  if (w && /^\d{4}$/.test(w)) {
    return { opts: { year: Number(w) }, label: w };
  }
  // default: trailing 12 months
  return { opts: {}, label: "Last 12 months" };
}
