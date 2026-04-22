import { NextResponse } from 'next/server';
import { insertNewsItems, createScrapeSession, updateScrapeSessionStats } from '@/lib/db-utils';
import { getRSSSources, getRSSSourceUrl } from '@/lib/sources';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  timestamp: string;
  thumbnail: string;
  popularity: number;
}

async function fetchRSSFeed(feedUrl: string): Promise<Array<{ title: string; description: string; url: string; pubDate: string }>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    const items: Array<{ title: string; description: string; url: string; pubDate: string }> = [];
    
    // 解析XML
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const matches = xml.match(itemRegex) || [];
    
    for (const match of matches.slice(0, 5)) {
      const title = match.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    match.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = match.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const desc = match.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                   match.match(/<description>(.*?)<\/description>/)?.[1]?.replace(/<[^>]*>/g, '').slice(0, 200) || '';
      const date = match.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      
      if (title && link) {
        items.push({ title, description: desc.slice(0, 150), url: link, pubDate: date });
      }
    }
    
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const sessionId = `session-${Date.now()}`;
  const allNews: NewsItem[] = [];
  const categories: Record<string, number> = {};
  const successfulSources = new Set<string>();
  
  // 并行获取所有RSS源
  const rssSources = getRSSSources();
  const results = await Promise.allSettled(
    rssSources.map(async (source) => {
      const rssUrl = getRSSSourceUrl(source.id);
      if (!rssUrl) return { source, items: [] };
      
      const items = await fetchRSSFeed(rssUrl);
      return { source, items };
    })
  );
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { source, items } = result.value;
      for (const item of items) {
        const newsItem: NewsItem = {
          id: `${source.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: item.title,
          description: item.description || '暂无描述',
          url: item.url,
          source: source.name,
          category: source.category,
          timestamp: item.pubDate || new Date().toISOString(),
          thumbnail: source.thumbnail,
          popularity: source.popularity,
        };
        allNews.push(newsItem);
        successfulSources.add(source.name);
        categories[source.category] = (categories[source.category] || 0) + 1;
      }
    }
  }
  
  // 按热度排序
  allNews.sort((a, b) => b.popularity - a.popularity);
  
  // 保存到数据库
  if (allNews.length > 0) {
    try {
      // 创建抓取会话
      createScrapeSession(sessionId);
      
      // 准备数据库格式的数据
      const dbItems = allNews.slice(0, 50).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        source: item.source,
        category: item.category,
        thumbnail: item.thumbnail,
        popularity: item.popularity,
        published_at: item.timestamp,
        fetched_at: new Date().toISOString(),
        scrape_session_id: sessionId,
      }));
      
      // 批量插入
      insertNewsItems(dbItems);
      
      // 更新会话统计
      updateScrapeSessionStats(sessionId, allNews.length, successfulSources.size, categories);
    } catch (dbError) {
      console.error('数据库保存失败:', dbError);
    }
  }
  
  return NextResponse.json({
    success: true,
    total: allNews.length,
    items: allNews.slice(0, 50),
    sessionId,
    timestamp: new Date().toISOString(),
  });
}
