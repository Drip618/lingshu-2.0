'use client';
import { DataSource, CATEGORIES } from '@/lib/sources';
import Link from 'next/link';

interface Props {
  source: DataSource;
  index?: number;
}

export default function SourceCard({ source, index = 0 }: Props) {
  const categoryConfig = (CATEGORIES as any)[source.category] || { icon: '🌐', color: '#64748b' };
  const staggerDelay = Math.min(index % 12, 12) * 30;

  return (
    <Link
      href={`/source/${source.id}`}
      className="source-card group block animate-fadeInUp"
      style={{ animationDelay: `${staggerDelay}ms` } as React.CSSProperties}
    >
      {/* 顶部渐变条 */}
      <div className="source-card-accent" style={{ background: categoryConfig.color || '#6366f1' }} />

      <div className="p-4 flex flex-col h-full">
        {/* 头部：图标 + 名称 */}
        <div className="flex items-start gap-3 mb-2.5">
          <div className="source-icon flex-shrink-0">
            {source.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="source-title group-hover:text-[var(--color-primary-400)]">
              {source.name}
            </h3>
            <p className="source-desc line-clamp-2">
              {source.description}
            </p>
          </div>
        </div>

        {/* 标签行 */}
        <div className="source-tags flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-ghost text-[10px]">
            {categoryConfig.icon} {source.category}
          </span>
          {source.hasAPI && <span className="badge badge-success text-[10px]">API</span>}
          {source.requiresAuth && <span className="badge badge-warning text-[10px]">需登录</span>}
          <span className="badge badge-ghost text-[10px]">{source.scrapeMethod}</span>
        </div>

        {/* 底部：域名 + 热度 - 始终固定在底部 */}
        <div className="source-footer mt-auto pt-2.5">
          <div className="source-domain truncate" title={new URL(source.url).hostname}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span className="truncate">{new URL(source.url).hostname}</span>
          </div>
          <div className="source-popularity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>{source.popularity}/10</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
