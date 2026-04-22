import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const SCOUT_SCRIPT_PATH = path.join(process.cwd(), 'knowledge_scout.py');
const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'scout_config.json');

export async function POST(request: NextRequest) {
  try {
    const { sources, quickMode } = await request.json();
    
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json({ error: '请至少选择一个数据源' }, { status: 400 });
    }

    // 读取现有配置
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    
    // 更新enabled_sources
    config.enabled_sources = sources;
    
    // 写入临时配置
    const tempConfigPath = path.join(process.cwd(), 'scripts', 'scout_config_temp.json');
    fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));

    // 设置环境变量
    const env = {
      ...process.env,
      LINGSHU_SKILL_DIR: path.join(process.cwd()),
      LINGSHU_KB_PATH: path.join(process.cwd(), 'references', 'knowledge-base.md'),
      LINGSHU_BRIEFINGS_SRC: path.join(process.cwd(), 'references', 'daily-briefings'),
    };

    // 执行Python脚本
    const command = `python3 "${SCOUT_SCRIPT_PATH}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      env,
      timeout: 300000, // 5分钟超时
      maxBuffer: 1024 * 1024 * 10, // 10MB缓冲
    });

    // 解析输出获取结果
    const lines = stdout.split('\n');
    const totalMatch = lines.find(l => l.includes('Total:'));
    const totalItems = totalMatch ? parseInt(totalMatch.match(/\d+/)?.[0] || '0') : 0;

    // 获取分类统计
    const categories: Record<string, number> = {};
    lines.forEach(line => {
      const catMatch = line.match(/\s*(🔥|🎨|📚|🔨|🧠|⚙️|🤖)\s+([^:]+):\s+(\d+)/);
      if (catMatch) {
        categories[catMatch[2].trim()] = parseInt(catMatch[3]);
      }
    });

    // 读取生成的HTML文件
    const today = new Date().toISOString().split('T')[0];
    const htmlPath = path.join(process.env.LINGSHU_BRIEFINGS_SRC || path.join(process.cwd(), 'references', 'daily-briefings'), today, 'index_zh.html');
    const htmlContent = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : null;

    // 清理临时配置
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }

    return NextResponse.json({
      success: true,
      totalItems,
      categories,
      sources: sources,
      output: stdout,
      htmlContent,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[灵枢抓取] 执行失败:', error);
    
    return NextResponse.json({
      error: error.message || '抓取任务执行失败',
      details: error.stderr || '',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 读取配置
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    
    // 获取所有可用的数据源
    const allSources = [
      { id: 'github', name: 'GitHub', icon: '🔨', enabled: true, requiresToken: true },
      { id: 'huggingface', name: 'Hugging Face', icon: '🤗', enabled: true, requiresToken: false },
      { id: 'bilibili', name: 'Bilibili', icon: '📺', enabled: true, requiresToken: false },
      { id: 'youtube', name: 'YouTube', icon: '▶️', enabled: true, requiresToken: true },
      { id: 'douyin', name: '抖音', icon: '🎵', enabled: true, requiresToken: false },
      { id: 'tiktok', name: 'TikTok', icon: '🎵', enabled: true, requiresToken: false },
      { id: 'weibo', name: '微博', icon: '📝', enabled: true, requiresToken: false },
      { id: 'zhihu', name: '知乎', icon: '💡', enabled: true, requiresToken: false },
      { id: 'google_news', name: 'Google News', icon: '📰', enabled: true, requiresToken: false },
    ];

    // 获取最近7天的抓取记录
    const briefingsDir = path.join(process.cwd(), 'references', 'daily-briefings');
    const recentBriefings: Array<{ date: string, path: string }> = [];
    
    if (fs.existsSync(briefingsDir)) {
      const dates = fs.readdirSync(briefingsDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse().slice(0, 7);
      dates.forEach(date => {
        const dayDir = path.join(briefingsDir, date);
        if (fs.statSync(dayDir).isDirectory()) {
          recentBriefings.push({ date, path: dayDir });
        }
      });
    }

    return NextResponse.json({
      config,
      sources: allSources,
      recentBriefings,
    });

  } catch (error: any) {
    console.error('[灵枢配置] 读取失败:', error);
    return NextResponse.json({
      error: '配置读取失败',
    }, { status: 500 });
  }
}
