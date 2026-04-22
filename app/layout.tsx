import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '灵枢热点聚合 - 全网资讯一站式获取',
  description: '聚合100+数据源，涵盖AI技术、开发者社区、科技媒体、社交媒体、视频平台、设计创意、学术研究、产品资讯、商业财经、综合资讯等十大分类',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
