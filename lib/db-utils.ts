import { getDatabase } from './db';
import type { Database } from 'better-sqlite3';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  thumbnail: string;
  popularity: number;
  published_at: string;
  fetched_at: string;
  scrape_session_id?: string;
}

export interface ScrapeSession {
  id: string;
  status: string;
  total_items: number;
  success_sources: number;
  categories: string;
  output: string;
  created_at: string;
}

// 获取数据库实例
function db(): Database {
  return getDatabase();
}

// 插入资讯
export function insertNewsItem(item: NewsItem): void {
  const stmt = db().prepare(`
    INSERT OR REPLACE INTO news_items 
    (id, title, description, url, source, category, thumbnail, popularity, published_at, fetched_at, scrape_session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    item.id,
    item.title,
    item.description,
    item.url,
    item.source,
    item.category,
    item.thumbnail,
    item.popularity,
    item.published_at,
    item.fetched_at || new Date().toISOString(),
    item.scrape_session_id || null
  );
}

// 批量插入资讯
export function insertNewsItems(items: NewsItem[]): void {
  const insertStmt = db().prepare(`
    INSERT OR REPLACE INTO news_items 
    (id, title, description, url, source, category, thumbnail, popularity, published_at, fetched_at, scrape_session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db().transaction((newsItems: NewsItem[]) => {
    for (const item of newsItems) {
      insertStmt.run(
        item.id,
        item.title,
        item.description,
        item.url,
        item.source,
        item.category,
        item.thumbnail,
        item.popularity,
        item.published_at,
        item.fetched_at || new Date().toISOString(),
        item.scrape_session_id || null
      );
    }
  });
  
  insertMany(items);
}

// 创建抓取会话
export function createScrapeSession(id: string, output: string = ''): void {
  const stmt = db().prepare(`
    INSERT INTO scrape_sessions (id, status, output)
    VALUES (?, 'completed', ?)
  `);
  stmt.run(id, output);
}

// 更新抓取会话统计
export function updateScrapeSessionStats(
  sessionId: string, 
  totalItems: number, 
  successSources: number, 
  categories: Record<string, number>
): void {
  const stmt = db().prepare(`
    UPDATE scrape_sessions 
    SET total_items = ?, success_sources = ?, categories = ?
    WHERE id = ?
  `);
  stmt.run(totalItems, successSources, JSON.stringify(categories), sessionId);
}

// 获取最新抓取会话
export function getLatestScrapeSession(): ScrapeSession | null {
  const stmt = db().prepare('SELECT * FROM scrape_sessions ORDER BY created_at DESC LIMIT 1');
  return stmt.get() as ScrapeSession | null;
}

// 获取所有抓取会话
export function getScrapeSessions(limit: number = 20, offset: number = 0): ScrapeSession[] {
  const stmt = db().prepare('SELECT * FROM scrape_sessions ORDER BY created_at DESC LIMIT ? OFFSET ?');
  return stmt.all(limit, offset) as ScrapeSession[];
}

// 获取资讯列表
export function getNewsItems(options: {
  limit?: number;
  offset?: number;
  category?: string;
  source?: string;
  search?: string;
  sessionId?: string;
} = {}): NewsItem[] {
  const {
    limit = 50,
    offset = 0,
    category,
    source,
    search,
    sessionId
  } = options;

  let sql = 'SELECT * FROM news_items WHERE 1=1';
  const params: any[] = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (source) {
    sql += ' AND source = ?';
    params.push(source);
  }

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR source LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (sessionId) {
    sql += ' AND scrape_session_id = ?';
    params.push(sessionId);
  }

  sql += ' ORDER BY popularity DESC, fetched_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = db().prepare(sql);
  return stmt.all(...params) as NewsItem[];
}

// 获取资讯总数
export function getNewsCount(options: {
  category?: string;
  source?: string;
  search?: string;
  sessionId?: string;
} = {}): number {
  const { category, source, search, sessionId } = options;

  let sql = 'SELECT COUNT(*) as count FROM news_items WHERE 1=1';
  const params: any[] = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (source) {
    sql += ' AND source = ?';
    params.push(source);
  }

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR source LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (sessionId) {
    sql += ' AND scrape_session_id = ?';
    params.push(sessionId);
  }

  const stmt = db().prepare(sql);
  const result = stmt.get(...params) as { count: number };
  return result.count;
}

// 获取分类统计
export function getCategoryStats(): Record<string, number> {
  const stmt = db().prepare(`
    SELECT category, COUNT(*) as count 
    FROM news_items 
    GROUP BY category 
    ORDER BY count DESC
  `);
  const rows = stmt.all() as { category: string; count: number }[];
  const stats: Record<string, number> = {};
  for (const row of rows) {
    stats[row.category] = row.count;
  }
  return stats;
}

// 获取数据源统计
export function getSourceStats(): Record<string, number> {
  const stmt = db().prepare(`
    SELECT source, COUNT(*) as count 
    FROM news_items 
    GROUP BY source 
    ORDER BY count DESC
  `);
  const rows = stmt.all() as { source: string; count: number }[];
  const stats: Record<string, number> = {};
  for (const row of rows) {
    stats[row.source] = row.count;
  }
  return stats;
}

// 删除旧数据（保留最近N天的数据）
export function cleanOldData(daysToKeep: number = 30): void {
  const stmt = db().prepare(`
    DELETE FROM news_items 
    WHERE fetched_at < datetime('now', '-' || ? || ' days')
  `);
  stmt.run(daysToKeep);
}

// 清空所有资讯数据
export function clearAllNews(): void {
  db().exec('DELETE FROM news_items');
  db().exec('DELETE FROM scrape_sessions');
}

// 删除指定会话的资讯
export function deleteSessionNews(sessionId: string): void {
  const stmt = db().prepare('DELETE FROM news_items WHERE scrape_session_id = ?');
  stmt.run(sessionId);
}
