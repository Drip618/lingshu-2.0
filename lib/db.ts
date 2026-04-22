import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径 - 使用项目根目录
const DB_DIR = process.env.DB_PATH || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'lingshu.db');

// 确保数据库目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 单例模式 - 避免多个实例导致数据库锁
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    
    // 启用 WAL 模式提高并发性能
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('busy_timeout = 5000');
    
    // 初始化数据库表
    initDatabase(dbInstance);
  }
  
  return dbInstance;
}

// 初始化数据库表
function initDatabase(db: Database.Database) {
  db.exec(`
    -- 抓取记录表
    CREATE TABLE IF NOT EXISTS scrape_sessions (
      id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'completed',
      total_items INTEGER DEFAULT 0,
      success_sources INTEGER DEFAULT 0,
      categories TEXT DEFAULT '{}',
      output TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 资讯表
    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      thumbnail TEXT DEFAULT '',
      popularity INTEGER DEFAULT 50,
      published_at TEXT DEFAULT '',
      fetched_at TEXT DEFAULT (datetime('now')),
      scrape_session_id TEXT,
      FOREIGN KEY (scrape_session_id) REFERENCES scrape_sessions(id)
    );

    -- 数据源表
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT DEFAULT '',
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 分类表
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT '',
      color TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);
    CREATE INDEX IF NOT EXISTS idx_news_source ON news_items(source);
    CREATE INDEX IF NOT EXISTS idx_news_fetched_at ON news_items(fetched_at);
    CREATE INDEX IF NOT EXISTS idx_news_session ON news_items(scrape_session_id);
    CREATE INDEX IF NOT EXISTS idx_sources_category ON sources(category);
  `);
}

// 关闭数据库连接（用于清理）
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// 默认导出获取函数
export default getDatabase;
