'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  description: string;
  url: string;
  thumbnail: string;
  popularity: number;
  fetched_at: string;
  published_at: string;
}

const CORE_CATEGORIES = ['全部', 'AI技术', '开发者社区', '科技媒体', '社交媒体', '视频平台'];

export default function ResultsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: '50',
      });
      
      if (filterCategory !== '全部') {
        params.set('category', filterCategory);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      
      const response = await fetch(`/api/news/history?${params.toString()}`);
      if (!response.ok) throw new Error('获取资讯失败');
      const data = await response.json();
      
      if (data.success && data.items) {
        setItems(data.items);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (err: any) {
      setError(err.message || '获取资讯失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        await fetchNews();
      }
    } catch (err: any) {
      console.error('刷新失败:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return '刚刚';
      if (diffMins < 60) return `${diffMins}分钟前`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}小时前`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}天前`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeInUp">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">资讯聚合</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              数据库存储 · 实时获取全球科技资讯与热点
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <span className="spinner spinner-sm" />
                获取中...
              </>
            ) : (
              <>🔄 获取最新资讯</>
            )}
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {CORE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-2 rounded-[var(--radius-md)] text-xs transition-colors ${
                  filterCategory === cat
                    ? 'bg-[var(--color-primary-500)] text-white'
                    : 'bg-[var(--color-bg-surface)]/60 text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-surface)]'
                }`}
              >
                {cat === '全部' && '📰 '}
                {cat === 'AI技术' && '🤖 '}
                {cat === '开发者社区' && '💻 '}
                {cat === '科技媒体' && '📡 '}
                {cat === '社交媒体' && '💬 '}
                {cat === '视频平台' && '🎬 '}
                {cat}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="搜索标题、描述、来源..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-sm">
              搜索
            </button>
          </form>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-32 h-20 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]/50 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-[var(--color-bg-surface)]/50 rounded w-3/4" />
                    <div className="h-3 bg-[var(--color-bg-surface)]/50 rounded w-1/2" />
                    <div className="h-3 bg-[var(--color-bg-surface)]/50 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <div className="text-lg font-medium mb-2 text-[var(--color-text-primary)]">获取资讯失败</div>
            <div className="text-sm text-[var(--color-text-secondary)] mb-4">{error}</div>
            <button
              onClick={fetchNews}
              className="btn-primary px-4 py-2 text-sm"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 结果列表 */}
        {!loading && !error && (
          <div className="space-y-4">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 flex gap-4 no-underline hover:scale-[1.01] transition-all duration-200 group"
              >
                <div className="w-32 h-20 rounded-[var(--radius-md)] overflow-hidden flex-shrink-0 bg-[var(--color-bg-surface)]">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-400)] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{item.source}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">·</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{formatDate(item.fetched_at)}</span>
                    <span className="badge badge-ghost text-[9px]">{item.category}</span>
                    <span className="badge badge-warning text-[9px]">🔥 {item.popularity}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-lg font-medium mb-2 text-[var(--color-text-secondary)]">暂无资讯数据</div>
            <div className="text-sm text-[var(--color-text-muted)]">
              点击「获取最新资讯」按钮开始获取数据
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {!loading && items.length > 0 && (
          <div className="text-center text-xs text-[var(--color-text-muted)] py-4">
            共 {items.length} 条资讯 · 存储于本地SQLite数据库
          </div>
        )}
      </main>
    </div>
  );
}
