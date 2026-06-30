import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gas Store System",
  description: "Gas Store Management System MVP",
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} h-full antialiased bg-background text-foreground`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#0284c7" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
