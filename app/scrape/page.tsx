'use client';
import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import { DATA_SOURCES, CATEGORIES } from '@/lib/sources';

const CORE_CATEGORIES = ['AI技术', '开发者社区', '科技媒体', '社交媒体', '视频平台'];

interface ScrapeResult {
  success: boolean;
  totalItems: number;
  categories: Record<string, number>;
  sources: string[];
  output: string;
  timestamp: string;
}

export default function ScrapePage() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(CORE_CATEGORIES));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const runScrape = useCallback(async () => {
    if (selectedCategories.size === 0) {
      setError('请至少选择一个分类');
      return;
    }

    // 获取选中分类下的所有数据源
    const selectedSources = DATA_SOURCES
      .filter(s => selectedCategories.has(s.category))
      .map(s => s.id);

    if (selectedSources.length === 0) {
      setError('所选分类下暂无数据源');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: selectedSources }),
      });
      const data = await r.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories]);

  const totalSources = DATA_SOURCES.filter(s => selectedCategories.has(s.category)).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeInUp">
        {/* 头部 */}
        <div>
          <h1 className="text-2xl font-bold mb-2">执行抓取</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">选择分类，一键获取全网热点资讯</p>
        </div>

        {/* 分类选择 */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">选择分类</h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              已选 <span className="text-[var(--color-primary-400)] font-semibold">{selectedCategories.size}</span> / {CORE_CATEGORIES.length}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CORE_CATEGORIES.map(cat => {
              const isSelected = selectedCategories.has(cat);
              const config = CATEGORIES[cat] as { icon: string; color: string } | undefined;
              const sourceCount = DATA_SOURCES.filter(s => s.category === cat).length;
              
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border text-left transition-all ${
                    isSelected
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10'
                      : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/60 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  <span className="text-lg">{config?.icon || '📰'}</span>
                  <div>
                    <div className="text-sm font-medium">{cat}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">{sourceCount} 个数据源</div>
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-[var(--color-primary-400)] text-sm">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 执行按钮 */}
        <button
          onClick={runScrape}
          disabled={loading || selectedCategories.size === 0}
          className="btn btn-primary btn-lg w-full"
        >
          {loading ? (
            <>
              <span className="spinner spinner-sm" />
              正在抓取中...
            </>
          ) : (
            <>⚡ 开始抓取 ({totalSources} 个数据源)</>
          )}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="glass-card p-4 border-[var(--color-error)]/20 bg-[var(--color-error)]/5">
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-error)]">✕</span>
              <div className="text-sm text-[var(--color-error)]">{error}</div>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="glass-card p-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-[var(--color-primary-500)]/20 border-t-[var(--color-primary-400)] rounded-full animate-spin" />
            <div className="text-base font-medium">正在抓取数据...</div>
            <div className="text-sm text-[var(--color-text-muted)]">这可能需要几分钟时间，请耐心等待</div>
          </div>
        )}

        {/* 抓取结果 */}
        {result && !loading && (
          <div className="glass-card p-5 space-y-4 animate-fadeInUp">
            <h3 className="text-sm font-semibold">抓取结果</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="surface-card p-4 text-center">
                <div className="text-2xl font-bold text-[var(--color-primary-400)]">{result.totalItems}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">总资讯数</div>
              </div>
              <div className="surface-card p-4 text-center">
                <div className="text-2xl font-bold text-[var(--color-success)]">{result.sources.length}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">成功数据源</div>
              </div>
              <div className="surface-card p-4 text-center col-span-2 sm:col-span-1">
                <div className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {new Date(result.timestamp).toLocaleString('zh-CN')}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">抓取时间</div>
              </div>
            </div>
            {result.output && (
              <pre className="bg-[var(--color-bg-surface)] p-4 rounded-[var(--radius-md)] text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap border border-[var(--color-border-subtle)]">
                {result.output}
              </pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
