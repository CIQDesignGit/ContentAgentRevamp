import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter: used for all body text, UI labels, and headings (--font-sans / --font-heading)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// JetBrains Mono: used for code blocks, data values, and logs (--font-mono)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Agent V2",
  description: "AI-powered product content management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
