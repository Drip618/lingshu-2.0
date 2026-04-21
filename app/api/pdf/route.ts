import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// PDF生成API
export async function POST(request: NextRequest) {
  try {
    const { projectData } = await request.json();
    
    // 如果没有项目数据，使用默认数据
    const project = projectData || {
      name: '未命名项目',
      type: '剧情',
      style: '未匹配',
      description: '',
      status: '进行中',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        script: '',
        analysis: null,
        assets: [],
        storyboard: []
      }
    };

    // 生成分析数据的显示内容
    const analysisHtml = project.data.analysis ? `
      <div class="bg-gray-800/50 rounded-lg p-6">
        <h3 class="text-xl font-bold mb-4 text-red-400">剧本分析结果</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-900/50 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">项目类型</p>
            <p class="font-bold">${project.data.analysis.type || '-'}</p>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">推荐风格</p>
            <p class="font-bold text-red-400">${project.data.analysis.style || '-'}</p>
          </div>
        </div>
        
        ${project.data.analysis.conflicts?.length > 0 ? `
          <div class="bg-gray-900/50 rounded-lg p-4 mb-4">
            <p class="text-gray-400 text-sm mb-2">核心冲突</p>
            <ul class="list-disc list-inside space-y-1">
              ${project.data.analysis.conflicts.map((conflict: string) => `<li>${conflict}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${project.data.analysis.characters?.length > 0 ? `
          <div class="bg-gray-900/50 rounded-lg p-4 mb-4">
            <p class="text-gray-400 text-sm mb-2">主要角色</p>
            <div class="space-y-2">
              ${project.data.analysis.characters.map((char: any) => `
                <div class="text-sm">
                  <span class="font-bold">${char.name}</span>
                  <span class="text-gray-400"> - ${char.role}</span>
                  ${char.description ? `<p class="text-gray-400 ml-4 mt-1">${char.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${project.data.analysis.settings?.length > 0 ? `
          <div class="bg-gray-900/50 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-2">场景设置</p>
            <ul class="list-disc list-inside space-y-1">
              ${project.data.analysis.settings.map((setting: string) => `<li>${setting}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    ` : `
      <div class="bg-gray-800/50 rounded-lg p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-400">尚未进行剧本分析</h3>
        <p class="text-gray-500">在项目中输入剧本内容并进行分析后，分析结果将显示在这里</p>
      </div>
    `;

    // 创建HTML内容
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${project.name} - 灵枢影视创作项目报告</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
            line-height: 1.8;
            color: #ffffff;
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            padding: 0;
            min-height: 100vh;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 60px 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 3px solid;
            border-image: linear-gradient(90deg, transparent, #dc2626, #f59e0b, #dc2626, transparent) 1;
          }
          .header .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #dc2626, #f59e0b);
            border-radius: 50%;
            margin-bottom: 20px;
          }
          .header .logo span {
            font-size: 36px;
            font-weight: bold;
            color: #ffffff;
          }
          .header h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
            background: linear-gradient(90deg, #dc2626, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .header .subtitle {
            font-size: 16px;
            color: #71717a;
          }
          .section {
            margin-bottom: 50px;
          }
          .section h2 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 25px;
            color: #f59e0b;
            display: flex;
            align-items: center;
          }
          .section h2::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 24px;
            background: linear-gradient(180deg, #dc2626, #f59e0b);
            border-radius: 3px;
            margin-right: 12px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 25px;
          }
          .info-card {
            background: rgba(38, 38, 38, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid #3f3f46;
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
          }
          .info-card:hover {
            border-color: #dc2626;
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.1);
          }
          .info-card .label {
            font-size: 13px;
            color: #71717a;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-card .value {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
          }
          .description-box {
            background: rgba(38, 38, 38, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid #3f3f46;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 25px;
          }
          .description-box .label {
            font-size: 13px;
            color: #71717a;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .description-box .value {
            font-size: 15px;
            color: #e4e4e7;
            line-height: 1.8;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 8px;
          }
          .status-进行中 {
            background: rgba(220, 38, 38, 0.2);
            color: #fca5a5;
          }
          .status-已完成 {
            background: rgba(22, 163, 74, 0.2);
            color: #86efac;
          }
          .status-已暂停 {
            background: rgba(234, 179, 8, 0.2);
            color: #fde047;
          }
          .list {
            list-style: none;
            padding: 0;
          }
          .list li {
            padding: 12px 0;
            border-bottom: 1px solid #27272a;
            position: relative;
            padding-left: 24px;
          }
          .list li:last-child {
            border-bottom: none;
          }
          .list li::before {
            content: '•';
            color: #dc2626;
            font-weight: bold;
            position: absolute;
            left: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #27272a;
            color: #71717a;
            font-size: 13px;
          }
          .footer .footer-logo {
            display: inline-flex;
            align-items: center;
            margin-bottom: 15px;
          }
          .footer .footer-logo-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #dc2626, #f59e0b);
            border-radius: 50%;
            margin-right: 10px;
          }
          .footer .footer-logo-icon span {
            font-size: 18px;
            font-weight: bold;
            color: #ffffff;
          }
          .footer .footer-logo-text {
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(90deg, #dc2626, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>灵</span>
            </div>
            <h1>${project.name}</h1>
            <p class="subtitle">灵枢影视创作项目报告 · ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="section">
            <h2>项目基本信息</h2>
            <div class="info-grid">
              <div class="info-card">
                <div class="label">项目名称</div>
                <div class="value">${project.name}</div>
              </div>
              <div class="info-card">
                <div class="label">项目类型</div>
                <div class="value">${project.type}</div>
              </div>
              <div class="info-card">
                <div class="label">创作风格</div>
                <div class="value">${project.style}</div>
              </div>
              <div class="info-card">
                <div class="label">项目状态</div>
                <div class="value">
                  <span class="status-badge status-${project.status}">${project.status}</span>
                </div>
              </div>
            </div>
            
            ${project.description ? `
              <div class="description-box">
                <div class="label">项目描述</div>
                <div class="value">${project.description}</div>
              </div>
            ` : ''}
          </div>

          ${analysisHtml}

          ${project.data.script ? `
            <div class="section">
              <h2>剧本内容</h2>
              <div class="description-box">
                <div class="label">剧本</div>
                <div class="value" style="white-space: pre-wrap; word-break: break-word;">${project.data.script.substring(0, 3000)}${project.data.script.length > 3000 ? '...' : ''}</div>
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <div class="footer-logo">
              <div class="footer-logo-icon">
                <span>灵</span>
              </div>
              <div class="footer-logo-text">灵枢影视创作</div>
            </div>
            <p>© ${new Date().getFullYear()} 灵枢影视创作 · 您的专业影视创作助手</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 生成PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    // 返回PDF
    const response = new NextResponse(Buffer.from(pdfBuffer));
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(project.name)}-项目报告.pdf"`);
    
    return response;
  } catch (error) {
    console.error('PDF生成失败:', error);
    return NextResponse.json({ error: 'PDF生成失败' }, { status: 500 });
  }
}
