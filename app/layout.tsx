import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

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

// metadata for seo and social sharing (title, description, favicon, image)
export const metadata: Metadata = {
  title: "David's Portfolio",
  description: "Motivated software engineer.",
  icons: {
    icon: "/hooded.svg",
  },
  openGraph: {
    title: "David's Portfolio",
    description: "Motivated software engineer.",
    images: [

    ],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* render all content on page */}
        {children}
        {/* vercel analytics for tracking page views and web vitals */}
        <Analytics />
      </body>
    </html>
  );
}
