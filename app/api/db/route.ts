import { NextResponse } from 'next/server';
import { getScrapeSessions, deleteSessionNews, clearAllNews, cleanOldData } from '@/lib/db-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'sessions') {
      const sessions = getScrapeSessions(20);
      return NextResponse.json({ success: true, sessions });
    }

    if (action === 'stats') {
      const { getDatabase } = await import('@/lib/db');
      const db = getDatabase();
      const newsCount = db.prepare('SELECT COUNT(*) as count FROM news_items').get() as { count: number };
      const sessionCount = db.prepare('SELECT COUNT(*) as count FROM scrape_sessions').get() as { count: number };
      
      return NextResponse.json({
        success: true,
        stats: {
          totalNews: newsCount.count,
          totalSessions: sessionCount.count,
        }
      });
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, sessionId, daysToKeep } = body;

  try {
    if (action === 'clear') {
      clearAllNews();
      return NextResponse.json({ success: true, message: '已清空所有数据' });
    }

    if (action === 'clean') {
      cleanOldData(daysToKeep || 30);
      return NextResponse.json({ success: true, message: `已清理${daysToKeep || 30}天前的数据` });
    }

    if (action === 'delete-session' && sessionId) {
      deleteSessionNews(sessionId);
      return NextResponse.json({ success: true, message: '已删除会话数据' });
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
