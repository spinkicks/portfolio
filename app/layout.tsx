import type { Metadata } from "next";
import { Geist, Geist_Mono, Monoton, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

// configure sans-serif font with css variable for global use
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// configure monospace font with css variable, global use
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// display face for headings; wide and tight enough to carry the synthwave type
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

// Display face for the hero. Monoton draws its own inline stroke, which is what
// makes it read as tubing once it's lit rather than as text wearing a glow.
const monoton = Monoton({
  variable: "--font-monoton",
  subsets: ["latin"],
  weight: "400",
});

// metadata for seo and social sharing (title, description, favicon, image)
export const metadata: Metadata = {
  title: "David Ordonez | Software Engineer & Applied AI",
  description:
    "UT Austin computer science student building evaluated AI systems, agentic developer tools, and interactive engineering software.",
  icons: {
    icon: "/hooded.svg",
  },
  openGraph: {
    title: "David Ordonez | Software Engineer & Applied AI",
    description:
      "Evaluated AI systems, agentic developer tools, and interactive engineering software.",
    images: [],
  },
};

// root layout wrapper for entire app with font variables and analytics
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${monoton.variable} antialiased`}
      >
        {/* render all content on page */}
        {children}
        {/* vercel analytics for tracking page views and web vitals */}
        <Analytics />
      </body>
    </html>
  );
}
