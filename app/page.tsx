'use client';
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { DATA_SOURCES, CATEGORIES, getSourcesByCategory, DataSource } from '@/lib/sources';
import SourceCard from '@/components/SourceCard';

const CORE_CATEGORIES = ['AI技术', '开发者社区', '科技媒体', '社交媒体', '视频平台'];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const sourcesByCategory = useMemo(() => getSourcesByCategory(), []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { sources: [] as DataSource[], matchedCategory: null as string | null };
    const q = searchQuery.toLowerCase().trim();
    
    const matchedCategory = Object.keys(CATEGORIES).find(cat => cat.toLowerCase().includes(q));
    
    if (matchedCategory) {
      return { sources: sourcesByCategory[matchedCategory] || [], matchedCategory };
    }
    
    const sources = DATA_SOURCES.filter(
      s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
    return { sources, matchedCategory: null };
  }, [searchQuery, sourcesByCategory]);

  const displayCategories = showAllCategories ? Object.keys(CATEGORIES) : CORE_CATEGORIES;

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] relative">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-title-gradient">灵枢热点</span>
          </h1>
          <p className="hero-subtitle">
            聚合 {DATA_SOURCES.length} 个数据源，覆盖 AI、科技、开发等核心领域
          </p>
          <div className="hero-search">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Search Results */}
        {searchQuery.trim() && (
          <section className="search-section animate-fadeIn">
            <div className="section-header">
              <span className="section-icon">🔍</span>
              <h2 className="section-title">
                {searchResults.matchedCategory 
                  ? `分类匹配: ${searchResults.matchedCategory}` 
                  : `搜索结果`}
              </h2>
              <span className="section-count">({searchResults.sources.length})</span>
            </div>
            {searchResults.sources.length > 0 ? (
              <div className="source-grid">
                {searchResults.sources.map((source, idx) => (
                  <SourceCard key={source.id} source={source} index={idx} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">未找到匹配结果</div>
                <div className="empty-desc">试试其他关键词</div>
              </div>
            )}
          </section>
        )}

        {/* Core Categories */}
        {!searchQuery.trim() && (
          <div className="categories-wrapper">
            {displayCategories.map(category => {
              const sources = sourcesByCategory[category] || [];
              const catConfig = (CATEGORIES as any)[category];
              if (sources.length === 0) return null;
              
              return (
                <section key={category} className="category-section animate-fadeIn">
                  <div className="category-header">
                    <span className="category-icon">{catConfig?.icon}</span>
                    <h2 className="category-name">{category}</h2>
                    <span className="category-count">{sources.length}</span>
                    <div className="category-divider" />
                  </div>
                  <div className="source-grid">
                    {sources.map((source, idx) => (
                      <SourceCard key={source.id} source={source} index={idx} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Show More Categories Button */}
            {!showAllCategories && (
              <div className="show-more-wrapper">
                <button
                  onClick={() => setShowAllCategories(true)}
                  className="show-more-btn"
                >
                  展开全部 {Object.keys(CATEGORIES).length - CORE_CATEGORIES.length} 个分类 ↓
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
