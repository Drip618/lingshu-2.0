'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { DATA_SOURCES, CATEGORIES, DataSource } from '@/lib/sources';
import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
  variant?: 'header' | 'hero' | 'inline';
}

export default function SearchBar({ className = '', variant = 'hero' }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return DATA_SOURCES.filter(
      s => s.name.toLowerCase().includes(q) ||
           s.description.toLowerCase().includes(q) ||
           s.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      router.push(`/source/${results[selectedIndex].id}`);
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (source: DataSource) => {
    router.push(`/source/${source.id}`);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const sizeClasses = {
    header: 'search-input search-input-header',
    hero: 'search-input search-input-hero',
    inline: 'search-input search-input-inline',
  };

  return (
    <div ref={containerRef} className={`search-container ${className}`}>
      <div className="search-wrapper">
        <span className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索数据源、分类、描述..."
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(-1); }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={sizeClasses[variant]}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); setSelectedIndex(-1); }}
            className="search-clear"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-dropdown animate-fadeInDown">
          <div className="search-dropdown-header">
            搜索结果 · {results.length} 个匹配
          </div>
          {results.map((source, idx) => {
            const catConfig = (CATEGORIES as any)[source.category];
            return (
              <button
                key={source.id}
                onClick={() => handleSelect(source)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`search-dropdown-item ${
                  idx === selectedIndex ? 'search-dropdown-item-active' : ''
                }`}
              >
                <div className="search-dropdown-item-icon">
                  {source.icon}
                </div>
                <div className="search-dropdown-item-content">
                  <div className="search-dropdown-item-title">
                    {source.name}
                  </div>
                  <div className="search-dropdown-item-desc">
                    {catConfig?.icon} {source.category} · {source.description}
                  </div>
                </div>
                <div className="search-dropdown-item-badges">
                  {source.hasAPI && <span className="badge badge-success text-[9px]">API</span>}
                  <span className="badge badge-ghost text-[9px]">{source.scrapeMethod}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="search-empty animate-fadeInDown">
          <div className="search-empty-icon">🔍</div>
          <div className="search-empty-title">未找到匹配的数据源</div>
          <div className="search-empty-desc">尝试其他关键词</div>
        </div>
      )}
    </div>
  );
}
