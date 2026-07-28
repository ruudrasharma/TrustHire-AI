import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustHire AI — Campus Placement Platform",
  description:
    "Evidence-based campus placement: cryptographically signed eligibility, hash-chained audit trail, and verifiable receipts. Every claim is backed by proof.",
  keywords: ["campus placement", "placement drive", "eligibility", "TrustHire", "AI career assistant"],
  openGraph: {
    title: "TrustHire AI",
    description: "Trust, but verify. Every eligibility result is signed. Every status change is chained.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
