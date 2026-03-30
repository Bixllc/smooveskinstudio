import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Smoove Skin Studio | Professional Waxing",
  description:
    "Award-winning waxing specialist in the DFW area. Specializing in Brazilian & full-body waxing with precision, care, and results you can feel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="font-[family-name:var(--font-inter)] font-normal leading-relaxed">
        {children}
      </body>
    </html>
  );
}
