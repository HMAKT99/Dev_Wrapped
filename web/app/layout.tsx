import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/siteUrl";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Dev Wrapped — your year in code",
  description:
    "Turn any GitHub account into a gorgeous, shareable Spotify-Wrapped-style year-in-review of your coding. Discover your developer persona.",
  metadataBase: new URL(siteUrl()),
};

// Set the theme before paint to avoid a flash of the wrong mode.
const noFlash = `(function(){try{var t=localStorage.getItem('site-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
