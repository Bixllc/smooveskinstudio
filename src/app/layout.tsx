import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smooveskinstudio.com"),
  title: {
    default: "Smoove Skin Studio | Waxing in Fort Worth & DFW",
    template: "%s | Smoove Skin Studio",
  },
  description:
    "Award-winning waxing studio in Watauga, TX — serving Fort Worth, Dallas & the entire DFW area. Brazilian wax, full-body waxing, brow shaping & skin care. Book online today.",
  keywords: [
    "waxing Fort Worth",
    "waxing Dallas",
    "Brazilian wax Fort Worth",
    "Brazilian wax DFW",
    "waxing near me",
    "wax studio Fort Worth",
    "body waxing Texas",
    "brow waxing Fort Worth",
    "Watauga waxing",
    "DFW waxing specialist",
    "full body wax Fort Worth",
    "waxing studio near me",
    "professional waxing DFW",
    "vajacial Fort Worth",
    "skin care Fort Worth",
  ],
  authors: [{ name: "Smoove Skin Studio" }],
  creator: "Smoove Skin Studio",
  publisher: "Smoove Skin Studio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smooveskinstudio.com",
    siteName: "Smoove Skin Studio",
    title: "Smoove Skin Studio | Waxing in Fort Worth & DFW",
    description:
      "Award-winning waxing studio in Watauga, TX — serving Fort Worth, Dallas & the DFW area. Book your Brazilian wax, full-body wax, or brow service today.",
    images: [
      {
        url: "/images/hero-image.webp",
        width: 1200,
        height: 630,
        alt: "Smoove Skin Studio — Professional Waxing in Fort Worth, TX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smoove Skin Studio | Waxing in Fort Worth & DFW",
    description:
      "Award-winning waxing studio in Watauga, TX — serving Fort Worth, Dallas & the DFW area. Book online today.",
    images: ["/images/hero-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("scroll-smooth", inter.variable, "font-sans")}>
      <body className="font-[family-name:var(--font-inter)] font-normal leading-relaxed">
        {children}
      </body>
    </html>
  );
}
