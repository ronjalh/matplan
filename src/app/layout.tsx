import type { Metadata } from "next";
import { Inter, Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matplan",
  description: "Norsk matplanlegger og budsjett",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={cn(inter.variable, fraunces.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen bg-[#FAF7F2] text-[#2D3436] font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
