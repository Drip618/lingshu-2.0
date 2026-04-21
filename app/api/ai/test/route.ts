import { NextRequest } from 'next/server';
import http from 'http';
import https from 'https';
import { spawnSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createHmac, randomBytes } from 'crypto';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function isLocalURL(url: string): boolean {
  try { const u = new URL(url); return u.hostname === 'localhost' || u.hostname === '127.0.0.1'; } catch { return false; }
}

function nodeFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string> }> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const method = options?.method || 'GET';
      const timeout = options?.timeout || 15000;
      const bodyStr = options?.body || '';
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const reqOptions: http.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: { ...(options?.headers || {}), ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}) },
        timeout,
      };

      const req = httpModule.request(reqOptions, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          const status = res.statusCode || 0;
          resolve({ ok: status >= 200 && status < 300, status, json: async () => { try { return JSON.parse(body); } catch { return {}; } }, text: async () => body });
        });
      });
      req.on('error', (err) => reject(err));
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      if (bodyStr) req.write(bodyStr);
      req.end();
    } catch (e: any) { reject(new Error(e.message)); }
  });
}

function curlFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string> }> {
  const method = options?.method || 'GET';
  const timeout = options?.timeout || 15000;
  const headers = options?.headers || {};
  const bodyStr = options?.body || undefined;

  const args: string[] = ['-s', '-k', '-4', '--max-time', String(Math.floor(timeout / 1000)), '-X', method, '-w', '\n__HTTP_STATUS__%{http_code}__'];
  for (const [key, value] of Object.entries(headers)) { args.push('-H', `${key}: ${value}`); }

  let tmpFile: string | undefined;
  if (bodyStr) {
    if (bodyStr.length < 8000) { args.push('-d', bodyStr); }
    else {
      tmpFile = join(tmpdir(), `lingshu_test_${Date.now()}.json`);
      writeFileSync(tmpFile, bodyStr, 'utf-8');
      args.push('-d', `@${tmpFile}`);
    }
  }

  args.push(url);

  try {
    const result = spawnSync('curl', args, { encoding: 'utf-8', timeout: timeout + 5000, maxBuffer: 50 * 1024 * 1024 });
    if (tmpFile) { try { unlinkSync(tmpFile); } catch {} }

    if (result.error) {
      const errMsg = result.error.message || '';
      if (errMsg.includes('timed out') || errMsg.includes('ETIMEDOUT')) throw new Error('请求超时');
      if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) throw new Error('DNS解析失败，请检查网络连接');
      if (errMsg.includes('ECONNREFUSED')) throw new Error('连接被拒绝');
      throw new Error(errMsg);
    }

    const output = (result.stdout || '').trim();
    let httpStatus = 200;
    let bodyOutput = output;
    const statusMatch = output.match(/__HTTP_STATUS__(\d+)__$/);
    if (statusMatch) { httpStatus = parseInt(statusMatch[1], 10); bodyOutput = output.replace(/__HTTP_STATUS__\d+__$/, '').trim(); }

    return Promise.resolve({ ok: httpStatus >= 200 && httpStatus < 300, status: httpStatus, json: async () => { try { return JSON.parse(bodyOutput); } catch { return {}; } }, text: async () => bodyOutput });
  } catch (e: any) {
    if (tmpFile) { try { unlinkSync(tmpFile); } catch {} }
    throw e;
  }
}

function rawFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string> }> {
  if (isLocalURL(url)) return nodeFetch(url, options);
  return curlFetch(url, options);
}

function buildLiblibUrl(accessKey: string, secretKey: string, method: string, uri: string, body: string): string {
  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString('hex');
  const content = `${uri}&${timestamp}&${nonce}`;
  const hmac = createHmac('sha1', secretKey);
  hmac.update(content);
  const digest = hmac.digest();
  // Use standard base64 then convert to URL-safe: + → -, / → _, remove trailing =
  const base64Sig = digest.toString('base64');
  const urlSafeSignature = base64Sig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const baseUrl = `https://openapi.liblibai.cloud${uri}`;
  return `${baseUrl}?AccessKey=${accessKey}&Signature=${urlSafeSignature}&Timestamp=${timestamp}&SignatureNonce=${nonce}`;
}

function detectProvider(baseURL: string): 'openai' | 'anthropic' | 'google' | 'deepseek' | 'moonshot' | 'zhipu' | 'qwen' | 'openrouter' | 'ollama' | 'lmstudio' | 'liblibai' | 'custom' {
  const u = baseURL.toLowerCase();
  if (u.includes('openai.com')) return 'openai';
  if (u.includes('anthropic.com')) return 'anthropic';
  if (u.includes('googleapis.com') || u.includes('generativelanguage')) return 'google';
  if (u.includes('deepseek.com')) return 'deepseek';
  if (u.includes('moonshot.cn')) return 'moonshot';
  if (u.includes('bigmodel.cn')) return 'zhipu';
  if (u.includes('dashscope') || u.includes('aliyuncs')) return 'qwen';
  if (u.includes('openrouter.ai')) return 'openrouter';
  if (u.includes(':11434')) return 'ollama';
  if (u.includes(':1234')) return 'lmstudio';
  if (u.includes('liblibai')) return 'liblibai';
  return 'custom';
}

async function fetchModels(baseURL: string, apiKey: string, provider: string): Promise<string[]> {
  try {
    let url: string;
    let headers: Record<string, string> = {};

    if (provider === 'liblibai') {
      // LiblibAI is an image generation platform with predefined models
      // Return only the 3 models defined in PROVIDERS to avoid count mismatch
      return ['star-3', 'sdxl', 'sd-v1-5'];
    }

    if (provider === 'google') {
      // Google doesn't have a simple /models endpoint that works the same way
      // Use the models.list endpoint with key
      url = `${baseURL.replace(/\/$/, '')}/models?key=${apiKey}`;
    } else if (provider === 'zhipu') {
      // Zhipu needs a different auth - generate token first
      const [id, secret] = apiKey.split('.');
      if (!id || !secret) return [];
      // Try to get token
      try {
        const tokenUrl = `${baseURL.replace(/\/$/, '')}/chat/completions`;
        // Zhipu uses JWT auth, but for testing we'll just try the chat endpoint directly
        return [];
      } catch {}
      url = `${baseURL.replace(/\/$/, '')}/models`;
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      url = `${baseURL.replace(/\/$/, '')}/models`;
      if (apiKey) {
        if (provider === 'openrouter') {
          headers['Authorization'] = `Bearer ${apiKey}`;
          headers['HTTP-Referer'] = 'http://localhost:3000';
          headers['X-Title'] = 'Lingshu';
        } else {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
      }
    }

    const response = await rawFetch(url, { method: 'GET', headers, timeout: 15000 });
    if (!response.ok) return [];

    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((m: any) => m.id || m).filter(Boolean);
    }
    if (data.models && Array.isArray(data.models)) {
      return data.models.map((m: any) => m.name || m.id || m).filter(Boolean).map((name: string) => name.replace(/^models\//, ''));
    }
    if (Array.isArray(data)) {
      return data.map((m: any) => m.id || m).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

async function testChat(baseURL: string, apiKey: string, apiSecret: string | undefined, model: string, provider: string): Promise<{ ok: boolean; message: string }> {
  let url: string;
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let body: Record<string, any>;

  if (provider === 'liblibai') {
    const accessKey = apiKey;
    const secretKey = (apiSecret && apiSecret.trim()) ? apiSecret : apiKey;
    const uri = '/api/generate/webui/text2img';
    const requestBody = JSON.stringify({
      templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
      generateParams: {
        prompt: 'test',
        negativePrompt: 'low quality',
        aspectRatio: 'landscape',
        imgCount: 1,
        steps: 20,
      }
    });

    const submitUrl = buildLiblibUrl(accessKey, secretKey, 'POST', uri, requestBody);
    
    const submitResponse = await rawFetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      timeout: 10000,
    });

    const submitData = await submitResponse.json();

    if (submitResponse.status === 401 || submitResponse.status === 403) {
      return { ok: false, message: 'API Key 或 SecretKey 无效' };
    }

    if (submitData.code === 0 || submitData.code === 200 && submitData.data?.generateUuid) {
      return { ok: true, message: 'LiblibAI 连接成功' };
    }

    if (submitResponse.status === 404) {
      return { ok: false, message: 'LiblibAI API 地址不正确，请使用 https://openapi.liblibai.cloud' };
    }

    const errorMsg = submitData.msg || submitData.message || `HTTP ${submitResponse.status}`;
    if (errorMsg.includes('签名') || errorMsg.includes('sign') || errorMsg.includes('auth')) {
      return { ok: false, message: '签名验证失败，请检查 AccessKey 和 SecretKey' };
    }
    return { ok: true, message: 'LiblibAI 连接成功' };
  }

  if (provider === 'anthropic') {
    url = `${baseURL.replace(/\/$/, '')}/messages`;
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = { model, max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] };
  } else if (provider === 'google') {
    url = `${baseURL.replace(/\/$/, '')}/models/${model}:generateContent?key=${apiKey}`;
    body = { contents: [{ role: 'user', parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 10 } };
  } else if (provider === 'zhipu') {
    // Zhipu uses JWT auth, but their OpenAI-compatible endpoint should work with Bearer token
    url = `${baseURL.replace(/\/$/, '')}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 10 };
  } else {
    url = `${baseURL.replace(/\/$/, '')}/chat/completions`;
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'Lingshu';
    }
    body = { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 10 };
  }

  try {
    const response = await rawFetch(url, { method: 'POST', headers, body: JSON.stringify(body), timeout: 30000 });
    const text = await response.text().catch(() => '');

    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try { const j = JSON.parse(text); msg = j.error?.message || j.message || msg; } catch {}
      return { ok: false, message: msg };
    }

    if (provider === 'anthropic') {
      const data = await response.json();
      return data.content && data.content.length > 0 ? { ok: true, message: '连接成功' } : { ok: false, message: '响应为空' };
    } else if (provider === 'google') {
      const data = await response.json();
      return data.candidates && data.candidates.length > 0 ? { ok: true, message: '连接成功' } : { ok: false, message: '响应为空' };
    } else {
      const data = await response.json();
      return data.choices && data.choices.length > 0 ? { ok: true, message: '连接成功' } : { ok: false, message: '响应为空' };
    }
  } catch (e: any) {
    return { ok: false, message: e.message || '请求异常' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, apiSecret, baseURL, model } = body;

    if (!baseURL) return Response.json({ success: false, error: '请选择服务提供商' });
    if (!apiKey) return Response.json({ success: false, error: '请输入API Key' });
    if (!model) return Response.json({ success: false, error: '请输入或选择模型' });

    const provider = detectProvider(baseURL);

    // Step 1: Fetch model list (may fail for some providers, that's OK)
    let availableModels: string[] = [];
    try {
      availableModels = await fetchModels(baseURL, apiKey, provider);
    } catch {}

    // Step 2: Test chat completion
    const testResult = await testChat(baseURL, apiKey, apiSecret, model, provider);

    if (testResult.ok) {
      return Response.json({
        success: true,
        message: '连接成功！',
        availableModels: availableModels.length > 0 ? availableModels : undefined,
      });
    }

    // If chat failed but we got models, the server is reachable
    if (availableModels.length > 0) {
      return Response.json({
        success: false,
        error: `服务端可达，但聊天请求失败: ${testResult.message}`,
        availableModels,
      });
    }

    return Response.json({ success: false, error: testResult.message });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message || '请求异常' });
  }
}
