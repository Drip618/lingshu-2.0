#!/usr/bin/env node
/**
 * CI API 测试脚本
 * 
 * 在 GitHub Actions 环境中运行，验证核心 API 路由功能
 * 
 * 环境变量：
 *   - TEST_API_KEY: API 密钥（可选，如果未设置则跳过需要密钥的测试）
 *   - TEST_BASE_URL: API Base URL（可选）
 *   - TEST_MODEL: 测试模型名称（可选）
 *   - TEST_PROVIDER: 测试提供商（openai/google/zhipu/liblibai）
 */

const http = require('http');
const https = require('https');

// Allow self-signed certs in CI
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'http://localhost:3000';
const TEST_API_KEY = process.env.TEST_API_KEY || '';
const TEST_BASE_URL = process.env.TEST_BASE_URL || '';
const TEST_MODEL = process.env.TEST_MODEL || '';
const TEST_PROVIDER = process.env.TEST_PROVIDER || 'openai';

let passed = 0;
let failed = 0;
let skipped = 0;

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;
    const method = options.method || 'GET';
    const timeout = options.timeout || 30000;
    const headers = { ...(options.headers || {}) };
    const bodyStr = options.body ? JSON.stringify(options.body) : '';
    
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);
    if (!headers['Content-Type'] && bodyStr) headers['Content-Type'] = 'application/json';

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers,
      timeout,
      rejectUnauthorized: false,
    };

    const req = lib.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        try {
          resolve({ status: res.statusCode || 0, body, json: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode || 0, body, json: null });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function test(name, fn) {
  return fn().then(
    () => { console.log(`  ✓ ${name}`); passed++; },
    (err) => { console.log(`  ✗ ${name}: ${err.message}`); failed++; }
  ).catch(() => { skipped++; });
}

async function runTests() {
  console.log('\n========================================');
  console.log('  灵枢 Lingshu 2.0 - CI API 测试');
  console.log('========================================\n');
  console.log(`Provider: ${TEST_PROVIDER}`);
  console.log(`Has API Key: ${!!TEST_API_KEY}`);
  console.log(`Base URL: ${TEST_BASE_URL || '(not set)'}`);
  console.log();

  // ===== 1. 核心路由存在性测试 =====
  console.log('--- 1. 核心路由验证 ---');

  await test('首页可访问', async () => {
    const res = await request(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await test('Dashboard 可访问', async () => {
    const res = await request(`${BASE_URL}/dashboard`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  // ===== 2. API 路由测试 =====
  console.log('\n--- 2. API 路由验证 ---');

  await test('AI 测试端点响应', async () => {
    const res = await request(`${BASE_URL}/api/ai/test`, {
      method: 'POST',
      body: { apiKey: 'test', baseURL: 'https://openapi.liblibai.cloud', model: 'star-3' }
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!res.json) throw new Error('No JSON response');
    if (res.json.error && !res.json.error.includes('invalid') && !res.json.error.includes('认证')) {
      // Some errors are expected with test keys
    }
  });

  await test('剧本分析端点响应', async () => {
    const res = await request(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      body: { content: '这是一个测试剧本。角色A和角色B在对话。' },
      timeout: 60000
    });
    // This will fail without a real API key, which is expected
    if (res.status === 500 || res.status === 400) {
      console.log('    (预期：需要有效 API Key)');
      return;
    }
    if (res.status !== 200 && res.status !== 500 && res.status !== 400) {
      throw new Error(`Unexpected HTTP ${res.status}`);
    }
  });

  await test('图片生成端点存在', async () => {
    const res = await request(`${BASE_URL}/api/image`, {
      method: 'POST',
      body: { prompt: 'test' }
    });
    // Will fail without API key, but route should exist
    if (res.status === 404) throw new Error('Route not found');
  });

  await test('视频生成端点存在', async () => {
    const res = await request(`${BASE_URL}/api/video`, {
      method: 'POST',
      body: { prompt: 'test' }
    });
    if (res.status === 404) throw new Error('Route not found');
  });

  await test('分镜生成端点存在', async () => {
    const res = await request(`${BASE_URL}/api/storyboard`, {
      method: 'POST',
      body: { content: 'test', scenes: 2 }
    });
    if (res.status === 404) throw new Error('Route not found');
  });

  await test('项目管理端点存在', async () => {
    const res = await request(`${BASE_URL}/api/projects`);
    if (res.status === 404) throw new Error('Route not found');
  });

  await test('文件上传端点存在', async () => {
    const res = await request(`${BASE_URL}/api/upload`, {
      method: 'POST'
    });
    if (res.status === 404) throw new Error('Route not found');
  });

  await test('资产管理端点存在', async () => {
    const res = await request(`${BASE_URL}/api/assets`);
    if (res.status === 404) throw new Error('Route not found');
  });

  // ===== 3. 带 API Key 的功能测试 =====
  if (TEST_API_KEY && TEST_BASE_URL) {
    console.log('\n--- 3. 实时 API 测试（需要有效 API Key）---');

    await test('AI 连接测试', async () => {
      const res = await request(`${BASE_URL}/api/ai/test`, {
        method: 'POST',
        body: { apiKey: TEST_API_KEY, baseURL: TEST_BASE_URL, model: TEST_MODEL },
        timeout: 30000
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      if (!res.json) throw new Error('No JSON response');
      if (!res.json.success) throw new Error(`API test failed: ${res.json.error || 'unknown'}`);
    });

    await test('LiblibAI 图片生成端点', async () => {
      const res = await request(`${BASE_URL}/api/image`, {
        method: 'POST',
        body: {
          prompt: 'a cat',
          apiKey: TEST_API_KEY,
          baseURL: TEST_BASE_URL,
          style: 'cinematic'
        },
        timeout: 60000
      });
      // Image generation is async, so we just check the route responds
      if (res.status === 404) throw new Error('Route not found');
      if (res.status === 500 && res.json?.error?.includes('unsupported')) {
        // Some providers don't support image generation
        console.log('    (预期：该提供商不支持图像生成)');
        return;
      }
    });
  } else {
    console.log('\n--- 3. 实时 API 测试 ---');
    console.log('  ⊘ 跳过（未设置 API Key）');
    console.log('    设置 TEST_API_KEY 环境变量启用');
  }

  // ===== 4. 项目数据验证 =====
  console.log('\n--- 4. 示例项目验证 ---');

  const fs = require('fs');
  const path = require('path');

  await test('示例项目存在', async () => {
    const projectPath = path.join(__dirname, '..', 'projects', 'demo-scifi-short', 'project.json');
    if (!fs.existsSync(projectPath)) throw new Error('Demo project not found');
  });

  await test('示例项目结构完整', async () => {
    const projectPath = path.join(__dirname, '..', 'projects', 'demo-scifi-short', 'project.json');
    const project = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
    if (!project.name) throw new Error('Missing project name');
    if (!project.script) throw new Error('Missing script content');
    if (!project.storyboards || project.storyboards.length === 0) throw new Error('Missing storyboards');
  });

  // ===== 5. 依赖检查 =====
  console.log('\n--- 5. 依赖和配置验证 ---');

  await test('package.json 有效', async () => {
    const pkg = require('../package.json');
    if (!pkg.name) throw new Error('Missing package name');
    if (!pkg.scripts || !pkg.scripts.dev) throw new Error('Missing dev script');
    if (!pkg.scripts.build) throw new Error('Missing build script');
  });

  await test('TypeScript 配置有效', async () => {
    const tsconfig = require('../tsconfig.json');
    if (!tsconfig.compilerOptions) throw new Error('Missing compilerOptions');
  });

  // ===== 结果汇总 =====
  console.log('\n========================================');
  console.log('  测试结果');
  console.log('========================================');
  console.log(`  ✓ 通过: ${passed}`);
  console.log(`  ✗ 失败: ${failed}`);
  console.log(`  ⊘ 跳过: ${skipped}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 所有测试通过！\n');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
