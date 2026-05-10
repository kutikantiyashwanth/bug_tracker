import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackendWakeup } from "@/components/BackendWakeup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Student Bug Tracker — Project & Bug Management",
  description:
    "A lightweight project management and bug tracking platform designed for student teams and hackathons.",
  keywords: [
    "bug tracker",
    "project management",
    "student",
    "hackathon",
    "kanban",
    "task management",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to backend — opens TCP before first API call */}
        <link rel="preconnect" href="https://bug-tracker-api-d117.onrender.com" />
        <link rel="dns-prefetch" href="https://bug-tracker-api-d117.onrender.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <BackendWakeup />
        {children}
      </body>
    </html>
  );
}
