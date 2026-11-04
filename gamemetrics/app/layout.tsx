import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/src/components/ui/Sidebar";
import TopNav from "@/src/components/ui/TopNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GameMetrics — Evolution of Gaming & Gamer Behaviour",
  description:
    "An interactive data analytics dashboard exploring gaming habits, platform migration, gamer segmentation, and future preferences from a survey of 205 respondents.",
  keywords: ["gaming", "data science", "analytics", "survey", "gaming behaviour"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#F4EFE6] text-[#231C18]`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto bg-[#F4EFE6] p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
