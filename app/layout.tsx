import { ProjectProvider } from "@/components/ProjectState/ProjectProvider";
import TeamSessionBar from "@/components/TeamAccess/TeamSessionBar";
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
  title: "Policy Lab Studio",
  description: "Policy Lab Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <ProjectProvider>
          <TeamSessionBar>{children}</TeamSessionBar>
        </ProjectProvider>
      </body>
    </html>
  );
}