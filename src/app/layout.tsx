import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Guard Attendance System",
  description: "Digital workforce monitoring platform for security companies to track guard attendance and verify patrol activities using QR code scanning.",
  keywords: ["Security", "Guard Attendance", "QR Code", "Patrol System", "Security Management"],
  authors: [{ name: "Guard Security Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "QR Guard Attendance System",
    description: "Digital workforce monitoring platform for security companies",
    url: "https://chat.z.ai",
    siteName: "QR Guard System",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Guard Attendance System",
    description: "Digital workforce monitoring platform for security companies",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
