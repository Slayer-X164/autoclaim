
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
} from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoClaimAI",
  description: "AI-assisted vehicle insurance claim management.",
  applicationName: "AutoClaimAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${instrumentSans.variable}
        ${inter.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-dvh bg-white font-sans text-slate-900 antialiased">
        <div className="flex min-h-dvh flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
