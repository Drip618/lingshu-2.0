import { notFound } from 'next/navigation';
import { DATA_SOURCES, CATEGORIES } from '@/lib/sources';
import Header from '@/components/Header';

export function generateStaticParams() {
  return DATA_SOURCES.map(source => ({ id: source.id }));
}

export default function SourceDetailPage({ params }: { params: { id: string } }) {
  const source = DATA_SOURCES.find(s => s.id === params.id);
  if (!source) notFound();

  const categoryConfig = (CATEGORIES as any)[source.category];

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fadeInUp">
        {/* Back Button */}
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-8 no-underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          返回首页
        </a>

        {/* Hero Section */}
        <div className="glass-card overflow-hidden mb-8">
          {/* Thumbnail */}
          <div className="relative h-48 sm:h-64 bg-[var(--color-bg-surface)]">
            <img
              src={source.thumbnail}
              alt={source.name}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=256`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-[var(--color-bg-deep)]/40 to-transparent" />
            
            {/* Icon */}
            <div className="absolute bottom-6 left-6 w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)]/90 backdrop-blur-sm flex items-center justify-center text-3xl border border-[var(--color-border-subtle)] shadow-xl">
              {source.icon}
            </div>
          </div>

          {/* Info */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">{source.name}</h1>
                <p className="text-base text-[var(--color-text-secondary)] mt-2">{source.description}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex-shrink-0">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold text-[var(--color-error)]">{source.popularity}/10</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="badge badge-primary">
                <span>{categoryConfig.icon}</span>
                <span>{source.category}</span>
              </span>
              {source.hasAPI && <span className="badge badge-success">支持 API</span>}
              {source.requiresAuth && <span className="badge badge-warning">需要登录</span>}
              <span className="badge badge-ghost">抓取方式: {source.scrapeMethod}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
                </svg>
                访问网站
              </a>
              <a
                href={`/scrape`}
                className="btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                抓取此源
              </a>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="surface-card p-5">
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">域名</div>
            <div className="text-sm font-mono text-[var(--color-text-primary)] break-all">
              {new URL(source.url).hostname}
            </div>
          </div>
          <div className="surface-card p-5">
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">抓取方式</div>
            <div className="text-sm text-[var(--color-text-primary)] capitalize">
              {source.scrapeMethod === 'rss' && '📡 RSS 订阅'}
              {source.scrapeMethod === 'api' && '🔌 API 接口'}
              {source.scrapeMethod === 'html' && '🌐 HTML 解析'}
              {source.scrapeMethod === 'headless' && '🤖 无头浏览器'}
            </div>
          </div>
          <div className="surface-card p-5">
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">API 支持</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {source.hasAPI ? '✅ 支持' : '❌ 不支持'}
            </div>
          </div>
          <div className="surface-card p-5">
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">认证要求</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {source.requiresAuth ? '🔒 需要登录' : '🔓 无需认证'}
            </div>
          </div>
        </div>

        {/* URL */}
        <div className="surface-card p-5">
          <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">链接</div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] transition-colors break-all"
          >
            {source.url}
          </a>
        </div>
      </main>
    </div>
  );
}
