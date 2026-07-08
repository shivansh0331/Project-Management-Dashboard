import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
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
  title: "Zenith Flow - Premium Project Management Dashboard",
  description: "A production-grade SaaS-quality project and task management dashboard designed for EnvisionStudio. Built with Next.js 16, TypeScript, Prisma, SQLite, and Framer Motion.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full bg-background text-foreground font-sans overflow-x-hidden">
        {/* Animated Background Blobs for Visual Wow Factor */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50 dark:opacity-100">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blob-1 filter blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blob-2 filter blur-[120px]" />
        </div>

        <div className="relative z-10 min-h-full flex flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
