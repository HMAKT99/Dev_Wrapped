// Cache headers for the dynamically-rendered share images (OG / story / readme card).
// Without these every request re-fetches GitHub + re-renders with satori (multi-second
// cold cost), so social crawlers and the download button time out and appear "broken".
// s-maxage caches the rendered PNG at the Vercel edge for a day; stale-while-revalidate
// keeps serving the cached image (instantly) while a fresh one renders in the background.
export const IMAGE_CACHE_HEADERS = {
  "cache-control":
    "public, no-transform, s-maxage=86400, stale-while-revalidate=604800",
};
