'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/scrape', label: '抓取', icon: '⚡' },
  { href: '/results', label: '结果', icon: '📊' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Logo */}
        <Link href="/" className="header-logo group">
          <div className="header-logo-icon">
            <span>灵</span>
          </div>
          <div className="header-logo-text">
            <div className="header-logo-title">灵枢热点</div>
            <div className="header-logo-subtitle">全网资讯聚合</div>
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="header-search">
          <SearchBar variant="header" />
        </div>

        {/* Desktop Nav */}
        <nav className="header-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`header-nav-item ${pathname === item.href ? 'header-nav-item-active' : ''}`}
            >
              <span className="header-nav-icon">{item.icon}</span>
              <span className="header-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="header-mobile-btn"
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
            ) : (
              <><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="header-mobile-menu">
          <div className="header-mobile-search">
            <SearchBar variant="header" />
          </div>
          <div className="header-mobile-nav">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`header-mobile-nav-item ${pathname === item.href ? 'header-mobile-nav-item-active' : ''}`}
              >
                <span className="header-mobile-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
