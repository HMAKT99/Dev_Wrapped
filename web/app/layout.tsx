import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Dev Wrapped — your year in code",
  description:
    "Turn any GitHub account into a gorgeous, shareable Spotify-Wrapped-style year-in-review of your coding. Discover your developer persona.",
  metadataBase: new URL(siteUrl()),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
