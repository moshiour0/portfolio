import type { Metadata, Viewport } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Scene from "@/components/three/Scene";
import VideoBackdrop from "@/components/VideoBackdrop";
import { links, profile } from "@/lib/content";

// Display: Sora — geometric and technical, with more character than a
// neutral grotesk. Body: Manrope — warm, humanist, highly readable at length.
// Mono: JetBrains Mono, a real mono rather than whatever the OS supplies.
const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const SITE = "https://moshiour.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${profile.displayName} | Data Science, AI & Earth Observation`,
    template: `%s — ${profile.displayName}`,
  },
  description: profile.metaDescription,
  // Keywords the content genuinely covers — no stuffing.
  keywords: [
    "Moshiour Rahman Sarker",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Python",
    "Data Analytics",
    "Earth Observation",
    "Remote Sensing",
    "Sentinel-1",
    "InSAR",
    "Geospatial Intelligence",
    "Software Engineering",
    "Distributed Systems",
    "Scientific Computing",
  ],
  authors: [{ name: profile.displayName }],
  creator: profile.displayName,
  openGraph: {
    type: "profile",
    url: SITE,
    title: `${profile.displayName} | Data Science, AI & Earth Observation`,
    description: profile.metaDescription,
    siteName: profile.displayName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.displayName} | Data Science, AI & Earth Observation`,
    description: profile.metaDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  colorScheme: "dark",
};

/** Person structured data — verified identity fields only. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.displayName,
  jobTitle: "Aspiring Data Scientist",
  email: `mailto:${profile.email}`,
  url: SITE,
  description: profile.shortBio,
  sameAs: links.filter((l) => l.href.startsWith("http")).map((l) => l.href),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mymensingh",
    addressCountry: "BD",
  },
  knowsAbout: [
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Data Analytics",
    "Earth Observation",
    "Remote Sensing",
    "InSAR",
    "Geospatial Intelligence",
    "Scientific Computing",
    "Software Engineering",
    "Distributed Systems",
  ],
};

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: profile.displayName,
  url: SITE,
  description: profile.metaDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body className="grain antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <SmoothScroll />
        {/* Lives behind every section, not just the hero. */}
        <Scene />
        {/* Cinematic clips crossfade above the mesh, per section. */}
        <VideoBackdrop />
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-text focus:px-5 focus:py-2.5 focus:text-sm focus:text-bg"
        >
          Skip to content
        </a>
        <Nav />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
