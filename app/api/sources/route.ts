import { NextResponse } from 'next/server';
import { DATA_SOURCES, getSourcesByCategory } from '@/lib/sources';

export async function GET() {
  return NextResponse.json({
    total: DATA_SOURCES.length,
    categories: Object.keys(getSourcesByCategory()),
    sources: DATA_SOURCES,
  });
}
