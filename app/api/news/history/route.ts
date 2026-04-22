import { NextResponse } from 'next/server';
import { getNewsItems, getNewsCount, getCategoryStats, getSourceStats, getScrapeSessions } from '@/lib/db-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const category = searchParams.get('category') || undefined;
  const source = searchParams.get('source') || undefined;
  const search = searchParams.get('search') || undefined;
  const sessionId = searchParams.get('sessionId') || undefined;
  
  try {
    const items = getNewsItems({
      limit,
      offset,
      category,
      source,
      search,
      sessionId,
    });
    
    const total = getNewsCount({
      category,
      source,
      search,
      sessionId,
    });
    
    const categoryStats = getCategoryStats();
    const sourceStats = getSourceStats();
    const sessions = getScrapeSessions(10);
    
    return NextResponse.json({
      success: true,
      total,
      items,
      categoryStats,
      sourceStats,
      sessions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '查询失败',
    }, { status: 500 });
  }
}
