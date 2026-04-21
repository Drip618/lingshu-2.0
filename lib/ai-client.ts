import http from 'http';
import https from 'https';
import { spawnSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function isLocalURL(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '::1';
  } catch { return false; }
}

function nodeFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string> }> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const method = options?.method || 'GET';
      const timeout = options?.timeout || 120000;
      const bodyStr = options?.body || '';
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      const isLocal = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === '::1';

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
      req.on('error', (err) => {
        const msg = err.message;
        if (msg.includes('ECONNREFUSED')) reject(new Error('连接被拒绝，请检查服务是否运行'));
        else if (msg.includes('ENOTFOUND')) reject(new Error('DNS解析失败，请检查网络连接或API地址'));
        else if (msg.includes('ETIMEDOUT') || msg.includes('timed out')) reject(new Error('请求超时'));
        else reject(new Error(msg));
      });
      req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
      if (bodyStr) req.write(bodyStr);
      req.end();
    } catch (e: any) { reject(new Error(e.message)); }
  });
}

function curlFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string> }> {
  const method = options?.method || 'GET';
  const timeout = options?.timeout || 120000;
  const headers = options?.headers || {};
  const bodyStr = options?.body || undefined;

  const args: string[] = ['-s', '-k', '-4', '--max-time', String(Math.floor(timeout / 1000)), '-X', method, '-w', '\n__HTTP_STATUS__%{http_code}__'];
  for (const [key, value] of Object.entries(headers)) { args.push('-H', `${key}: ${value}`); }

  let tmpFile: string | undefined;
  if (bodyStr) {
    if (bodyStr.length < 8000) { args.push('-d', bodyStr); }
    else {
      tmpFile = join(tmpdir(), `lingshu_ai_${Date.now()}.json`);
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
      if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) throw new Error('DNS解析失败，请检查网络连接或API地址');
      if (errMsg.includes('ECONNREFUSED')) throw new Error('连接被拒绝，请检查服务是否运行');
      throw new Error(errMsg);
    }

    const output = (result.stdout || '').trim();
    let httpStatus = 200;
    let bodyOutput = output;
    const statusMatch = output.match(/__HTTP_STATUS__(\d+)__$/);
    if (statusMatch) { httpStatus = parseInt(statusMatch[1], 10); bodyOutput = output.replace(/__HTTP_STATUS__\d+__$/, '').trim(); }

    if (result.status !== 0 && !output) throw new Error(`请求失败 (curl退出码: ${result.status})`);

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

export interface AIClientConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export type ProviderType = 'openai' | 'anthropic' | 'google' | 'ollama' | 'lmstudio' | 'vllm' | 'openrouter' | 'deepseek' | 'moonshot' | 'zhipu' | 'qwen' | 'custom';

export const PROVIDER_PRESETS: Record<ProviderType, { name: string; baseURL: string; models: string[]; description: string }> = {
  openai: { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'], description: 'GPT-4o/4-Turbo/3.5' },
  anthropic: { name: 'Anthropic Claude', baseURL: 'https://api.anthropic.com/v1', models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-haiku-4-20250514', 'claude-3-5-sonnet-latest'], description: 'Claude Opus/Sonnet/Haiku' },
  google: { name: 'Google Gemini', baseURL: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'], description: 'Gemini 2.0/1.5 系列' },
  ollama: { name: 'Ollama (本地)', baseURL: 'http://localhost:11434/v1', models: ['llama3.2', 'qwen2.5', 'mistral', 'codellama', 'yi', 'deepseek-v2', 'phi3', 'gemma2', 'command-r', 'nemotron'], description: '本地运行的开源大模型' },
  lmstudio: { name: 'LM Studio (本地)', baseURL: 'http://localhost:1234/v1', models: ['local-model', 'custom-model'], description: 'LM Studio 本地推理服务器' },
  vllm: { name: 'vLLM (本地)', baseURL: 'http://localhost:8000/v1', models: ['custom-model'], description: 'vLLM 高性能推理引擎' },
  openrouter: { name: 'OpenRouter', baseURL: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-405b-instruct', 'deepseek/deepseek-chat'], description: '统一AI网关，聚合所有模型' },
  deepseek: { name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'], description: 'DeepSeek V3/Coder/Reasoner' },
  moonshot: { name: 'Moonshot (Kimi)', baseURL: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'], description: '月之暗面 Kimi 模型' },
  zhipu: { name: '智谱 GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-plus', 'glm-4-0520', 'glm-4-air', 'glm-4-flash', 'glm-4-long'], description: '智谱AI GLM-4系列' },
  qwen: { name: '通义千问', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long', 'qwen-vl-max'], description: '阿里通义千问系列' },
  custom: { name: '自定义 (OpenAI兼容)', baseURL: '', models: [], description: '输入自定义API地址，支持任何OpenAI兼容接口' }
};

export function detectProviderFromURL(baseURL: string): { type: ProviderType; preset: typeof PROVIDER_PRESETS[ProviderType] } {
  if (!baseURL) return { type: 'custom', preset: PROVIDER_PRESETS.custom };
  const url = baseURL.toLowerCase();
  if (url.includes('openai.com')) return { type: 'openai', preset: PROVIDER_PRESETS.openai };
  if (url.includes('anthropic.com')) return { type: 'anthropic', preset: PROVIDER_PRESETS.anthropic };
  if (url.includes('googleapis.com') || url.includes('generativelanguage')) return { type: 'google', preset: PROVIDER_PRESETS.google };
  if (url.includes(':11434') || url.includes('ollama')) return { type: 'ollama', preset: PROVIDER_PRESETS.ollama };
  if (url.includes(':1234') || url.includes('lmstudio')) return { type: 'lmstudio', preset: PROVIDER_PRESETS.lmstudio };
  if (url.includes(':8000')) return { type: 'vllm', preset: PROVIDER_PRESETS.vllm };
  if (url.includes('openrouter.ai')) return { type: 'openrouter', preset: PROVIDER_PRESETS.openrouter };
  if (url.includes('deepseek.com')) return { type: 'deepseek', preset: PROVIDER_PRESETS.deepseek };
  if (url.includes('moonshot.cn')) return { type: 'moonshot', preset: PROVIDER_PRESETS.moonshot };
  if (url.includes('bigmodel.cn') || url.includes('zhipu')) return { type: 'zhipu', preset: PROVIDER_PRESETS.zhipu };
  if (url.includes('dashscope') || url.includes('aliyuncs')) return { type: 'qwen', preset: PROVIDER_PRESETS.qwen };
  return { type: 'custom', preset: PROVIDER_PRESETS.custom };
}

export async function callAIClient(
  config: AIClientConfig,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { maxTokens?: number; temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const { type } = detectProviderFromURL(config.baseURL);
  switch (type) {
    case 'anthropic': return await callAnthropicAPI(config, messages, options);
    case 'google': return await callGoogleAPI(config, messages, options);
    default: return await callOpenAICompatible(config, messages, options);
  }
}

async function callOpenAICompatible(
  config: AIClientConfig,
  messages: Array<{ role: string; content: string }>,
  options?: { maxTokens?: number; temperature?: number; jsonMode?: boolean }
): Promise<string> {
  const url = `${config.baseURL.replace(/\/$/, '')}/chat/completions`;
  const body: Record<string, any> = { model: config.model, messages, max_tokens: options?.maxTokens || 4096, temperature: options?.temperature ?? 0.7 };
  if (options?.jsonMode) body.response_format = { type: 'json_object' };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

  try {
    const response = await rawFetch(url, { method: 'POST', headers, body: JSON.stringify(body), timeout: 120000 });
    const responseText = await response.text().catch(() => '');
    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try { const errJson = JSON.parse(responseText); errorMsg = errJson.error?.message || errJson.message || errJson.error?.type || errorMsg; } catch {}
      throw new Error(errorMsg);
    }
    const data = await response.json();
    if (data.choices && data.choices[0]) return data.choices[0].message?.content || data.choices[0].text || '';
    if (data.output) return data.output;
    if (data.response) return data.response;
    if (typeof data === 'string') return data;
    throw new Error('无法解析API响应');
  } catch (error: any) {
    if (error.message?.includes('超时')) throw new Error('请求超时(120秒)');
    throw error;
  }
}

async function callAnthropicAPI(
  config: AIClientConfig,
  messages: Array<{ role: string; content: string }>,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  const url = `${config.baseURL.replace(/\/$/, '')}/messages`;
  const response = await rawFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: config.model, max_tokens: options?.maxTokens || 4096, system: systemMsg?.content || '', messages: userMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })) })
  });
  const responseText = await response.text().catch(() => '');
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try { const errJson = JSON.parse(responseText); errorMsg = errJson.error?.message || errJson.message || errorMsg; } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data.content?.map((block: any) => block.text).join('') || '';
}

async function callGoogleAPI(
  config: AIClientConfig,
  messages: Array<{ role: string; content: string }>,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system');
  const contents = [];
  for (const msg of messages.filter(m => m.role !== 'system')) {
    contents.push({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] });
  }
  const url = `${config.baseURL.replace(/\/$/, '')}/models/${config.model}:generateContent?key=${config.apiKey}`;
  const response = await rawFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg.content }] } } : {}),
      generationConfig: { maxOutputTokens: options?.maxTokens || 4096, temperature: options?.temperature ?? 0.7 }
    })
  });
  const responseText = await response.text().catch(() => '');
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try { const errJson = JSON.parse(responseText); errorMsg = errJson.error?.message || errJson.message || errorMsg; } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function testConnection(config: AIClientConfig): Promise<{ success: boolean; message: string; providerName: string; availableModels?: string[] }> {
  const { type, preset } = detectProviderFromURL(config.baseURL);
  try {
    const result = await callAIClient(config, [{ role: 'user', content: '请回复"连接成功"这四个字即可。' }], { maxTokens: 20 });
    return { success: true, message: `连接成功！模型回复: "${result.substring(0, 30)}${result.length > 30 ? '...' : ''}"`, providerName: preset.name, availableModels: preset.models.length > 0 ? preset.models : undefined };
  } catch (error: any) {
    return { success: false, message: `连接失败: ${error.message || '未知错误'}`, providerName: preset.name };
  }
}
