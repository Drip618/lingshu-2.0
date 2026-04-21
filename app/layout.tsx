import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "灵枢 - AI影视创作工作台",
  description: "AI驱动的专业影视剧本分析、分镜设计、资产生成工作流",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
