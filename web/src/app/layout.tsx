import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExplainFast",
  description: "Practice explaining concepts clearly, under time pressure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-card-border">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  <span className="text-accent-light">Explain</span>Fast
                </span>
              </a>
              <nav className="flex gap-4 text-sm">
                <a
                  href="/practice"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  Practice
                </a>
                <a
                  href="/history"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  History
                </a>
              </nav>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
