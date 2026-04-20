import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
