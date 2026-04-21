import { NextRequest, NextResponse } from 'next/server';
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

function nodeFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string>; buffer: () => Promise<Buffer> }> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const method = options?.method || 'GET';
      const timeout = options?.timeout || 60000;
      const bodyStr = options?.body || '';
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const reqOptions: http.RequestOptions = {
        hostname: '127.0.0.1',
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
          const buf = Buffer.concat(chunks);
          const status = res.statusCode || 0;
          resolve({ ok: status >= 200 && status < 300, status, json: async () => { try { return JSON.parse(body); } catch { return {}; } }, text: async () => body, buffer: async () => buf });
        });
      });
      req.on('error', (err) => reject(err));
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      if (bodyStr) req.write(bodyStr);
      req.end();
    } catch (e: any) { reject(new Error(e.message)); }
  });
}

function curlFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string>; buffer: () => Promise<Buffer> }> {
  const method = options?.method || 'GET';
  const timeout = options?.timeout || 60000;
  const headers = options?.headers || {};
  const bodyStr = options?.body || undefined;

  const args: string[] = ['-s', '-k', '-4', '--max-time', String(Math.floor(timeout / 1000)), '-X', method, '-w', '\n__HTTP_STATUS__%{http_code}__'];
  for (const [key, value] of Object.entries(headers)) { args.push('-H', `${key}: ${value}`); }

  let tmpFile: string | undefined;
  if (bodyStr) {
    if (bodyStr.length < 8000) { args.push('-d', bodyStr); }
    else {
      tmpFile = join(tmpdir(), `lingshu_img_${Date.now()}.json`);
      writeFileSync(tmpFile, bodyStr, 'utf-8');
      args.push('-d', `@${tmpFile}`);
    }
  }

  args.push(url);

  try {
    const result = spawnSync('curl', args, { encoding: 'utf-8', timeout: timeout + 5000, maxBuffer: 100 * 1024 * 1024 });
    if (tmpFile) { try { unlinkSync(tmpFile); } catch {} }

    if (result.error) {
      const errMsg = result.error.message || '';
      if (errMsg.includes('timed out') || errMsg.includes('ETIMEDOUT')) throw new Error('请求超时');
      if (errMsg.includes('ENOTFOUND')) throw new Error('DNS解析失败');
      if (errMsg.includes('ECONNREFUSED')) throw new Error('连接被拒绝');
      throw new Error(errMsg);
    }

    const output = (result.stdout || '').trim();
    let httpStatus = 200;
    let bodyOutput = output;
    const statusMatch = output.match(/__HTTP_STATUS__(\d+)__$/);
    if (statusMatch) { httpStatus = parseInt(statusMatch[1], 10); bodyOutput = output.replace(/__HTTP_STATUS__\d+__$/, '').trim(); }

    return Promise.resolve({ ok: httpStatus >= 200 && httpStatus < 300, status: httpStatus, json: async () => { try { return JSON.parse(bodyOutput); } catch { return {}; } }, text: async () => bodyOutput, buffer: async () => Buffer.from(bodyOutput) });
  } catch (e: any) {
    if (tmpFile) { try { unlinkSync(tmpFile); } catch {} }
    throw e;
  }
}

function rawFetch(url: string, options?: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number }): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string>; buffer: () => Promise<Buffer> }> {
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

// Image generation styles matching AI video platforms
const IMAGE_STYLES: Record<string, { name: string; promptSuffix: string; negativePrompt: string }> = {
  cinematic: { name: '电影质感', promptSuffix: ', cinematic lighting, film grain, anamorphic lens flare, shot on ARRI Alexa, professional color grading', negativePrompt: 'cartoon, anime, illustration, drawing, painting, low quality, blurry' },
  anime: { name: '动漫风格', promptSuffix: ', anime style, cel shading, vibrant colors, Japanese animation, studio ghibli inspired, detailed lineart', negativePrompt: 'photorealistic, 3d render, low quality, blurry, deformed' },
  realistic: { name: '写实摄影', promptSuffix: ', photorealistic, ultra detailed, 8k, shot on DSLR, natural lighting, depth of field, professional photography', negativePrompt: 'cartoon, anime, illustration, drawing, painting, low quality, blurry, deformed' },
  oil_painting: { name: '油画风格', promptSuffix: ', oil painting style, thick brushstrokes, rich textures, classical art, Rembrandt lighting, museum quality', negativePrompt: 'photorealistic, 3d render, digital art, low quality, blurry' },
  watercolor: { name: '水彩风格', promptSuffix: ', watercolor painting style, soft edges, flowing colors, paper texture, delicate, artistic, gallery quality', negativePrompt: 'photorealistic, 3d render, sharp edges, low quality, blurry' },
  concept_art: { name: '概念设计', promptSuffix: ', concept art style, dramatic lighting, epic scale, detailed environment, industry standard, artstation trending', negativePrompt: 'photorealistic, low quality, blurry, deformed' },
  pixel_art: { name: '像素风格', promptSuffix: ', pixel art style, retro game aesthetic, 16-bit, crisp pixels, nostalgic, game sprite', negativePrompt: 'photorealistic, 3d render, smooth, blurry, low quality' },
  render_3d: { name: '3D渲染', promptSuffix: ', 3D render, octane render, unreal engine 5, ray tracing, volumetric lighting, hyper detailed, CGI', negativePrompt: '2d, flat, illustration, low quality, blurry' },
  sketch: { name: '素描手绘', promptSuffix: ', pencil sketch style, hand drawn, graphite on paper, crosshatching, artistic sketch, detailed linework', negativePrompt: 'photorealistic, 3d render, color, low quality, blurry' },
  vintage: { name: '复古胶片', promptSuffix: ', vintage film photography, 1970s aesthetic, warm tones, film grain, nostalgic, Kodak Portra', negativePrompt: 'modern, digital, low quality, blurry, deformed' },
};

// Image size presets
const IMAGE_SIZES = [
  { value: '1024x1024', label: '1:1 方形' },
  { value: '1024x768', label: '4:3 横屏' },
  { value: '768x1024', label: '3:4 竖屏' },
  { value: '1920x1080', label: '16:9 宽屏' },
  { value: '1080x1920', label: '9:16 竖屏' },
];

async function generateImage(prompt: string, style: string, size: string, apiKey: string, apiSecret: string, baseURL: string): Promise<{ url?: string; base64?: string; error?: string }> {
  const styleInfo = IMAGE_STYLES[style] || IMAGE_STYLES.cinematic;
  const fullPrompt = prompt + styleInfo.promptSuffix;
  const [width, height] = size.split('x').map(Number);

  const provider = baseURL.toLowerCase();
  
  // OpenAI DALL-E
  if (provider.includes('openai.com')) {
    const url = `${baseURL.replace(/\/$/, '')}/images/generations`;
    const response = await rawFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: size === '1920x1080' ? '1792x1024' : size === '1080x1920' ? '1024x1792' : '1024x1024',
        quality: 'hd',
      }),
      timeout: 120000,
    });
    const data = await response.json();
    if (data.data?.[0]?.url) return { url: data.data[0].url };
    if (data.data?.[0]?.b64_json) return { base64: data.data[0].b64_json };
    return { error: data.error?.message || '生成失败' };
  }

  // Google Gemini (Imagen)
  if (provider.includes('googleapis.com') || provider.includes('generativelanguage')) {
    // Try Imagen via Vertex AI compatible endpoint
    const model = 'imagen-3.0-generate-001';
    const url = `${baseURL.replace(/\/$/, '')}/models/${model}:predict?key=${apiKey}`;
    const response = await rawFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: fullPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: width > height ? '16:9' : width < height ? '9:16' : '1:1',
        }
      }),
      timeout: 120000,
    });
    const data = await response.json();
    if (data.predictions?.[0]?.bytesBase64Encoded) return { base64: data.predictions[0].bytesBase64Encoded };
    return { error: data.error?.message || 'Google Imagen 生成失败' };
  }

  // 智谱 GLM (CogView)
  if (provider.includes('bigmodel.cn')) {
    const url = `${baseURL.replace(/\/$/, '')}/images/generations`;
    const response = await rawFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'cogview-3-plus',
        prompt: fullPrompt,
      }),
      timeout: 120000,
    });
    const data = await response.json();
    if (data.data?.[0]?.url) return { url: data.data[0].url };
    if (data.data?.[0]?.b64_json) return { base64: data.data[0].b64_json };
    return { error: data.error?.message || '智谱图像生成失败' };
  }

  // 通义千问 (通义万相)
  if (provider.includes('dashscope') || provider.includes('aliyuncs')) {
    // Use DashScope API for Wanx
    const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
    const response = await rawFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: { prompt: fullPrompt },
        parameters: { size: `${width}*${height}`, n: 1 },
      }),
      timeout: 120000,
    });
    const data = await response.json();
    if (data.output?.task_id) {
      // Poll for result
      const taskId = data.output.task_id;
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
        const statusRes = await rawFetch(statusUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          timeout: 15000,
        });
        const statusData = await statusRes.json();
        if (statusData.output?.task_status === 'SUCCEEDED') {
          const resultUrl = statusData.output.results?.[0]?.url;
          if (resultUrl) return { url: resultUrl };
        }
        if (statusData.output?.task_status === 'FAILED') {
          return { error: statusData.output.message || '通义万相生成失败' };
        }
      }
      return { error: '通义万相生成超时' };
    }
    return { error: data.message || '通义万相提交失败' };
  }

  // LiblibAI (哩布哩布)
  if (provider.includes('liblibai') || provider.includes('liblib')) {
    if (!apiSecret || !apiSecret.trim()) return { error: 'LiblibAI 需要 SecretKey，请在设置中填写 SecretKey' };
    const uri = '/api/generate/webui/text2img';
    const requestBody = JSON.stringify({
      templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
      generateParams: {
        prompt: fullPrompt,
        negativePrompt: styleInfo.negativePrompt,
        aspectRatio: width > height ? 'landscape' : width < height ? 'portrait' : 'square',
        imgCount: 1,
        steps: 20,
      }
    });

    const submitUrl = buildLiblibUrl(apiKey, apiSecret, 'POST', uri, requestBody);
    
    const submitResponse = await rawFetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      timeout: 120000,
    });

    const submitData = await submitResponse.json();

    if (submitData.code !== 0 && submitData.code !== 200 || !submitData.data?.generateUuid) {
      return { error: submitData.msg || submitData.message || 'LiblibAI 图像提交失败' };
    }

    const generateUuid = submitData.data.generateUuid;
    const statusUri = '/api/generate/webui/status';

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusBody = JSON.stringify({ generateUuid });
      const statusUrl = buildLiblibUrl(apiKey, apiSecret, 'POST', statusUri, statusBody);
      
      const statusResponse = await rawFetch(statusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: statusBody,
        timeout: 15000,
      });

      const statusData = await statusResponse.json();

      if (statusData.code === 0 || statusData.code === 200 && statusData.data) {
        const status = statusData.data.generateStatus;
        if (status === 5) {
          const images = statusData.data.images || [];
          if (images.length > 0) {
            return { url: images[0]?.imageUrl || images[0] };
          }
        }
        if (status === 6) {
          return { error: statusData.data.message || 'LiblibAI 图像生成失败' };
        }
      }
    }
    return { error: 'LiblibAI 图像生成超时' };
  }

  return { error: '当前服务商不支持图像生成，请使用 OpenAI、智谱、通义千问或 LiblibAI' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style, size, apiKey, apiSecret, baseURL, referenceImage } = body;

    if (!prompt) return NextResponse.json({ error: '请提供图像描述' }, { status: 400 });
    if (!apiKey || !baseURL) return NextResponse.json({ error: '请先配置 AI API' }, { status: 400 });

    const result = await generateImage(prompt, style || 'cinematic', size || '1024x1024', apiKey, apiSecret, baseURL);

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ success: true, url: result.url, base64: result.base64 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '图像生成失败' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    styles: Object.entries(IMAGE_STYLES).map(([key, val]) => ({ value: key, ...val })),
    sizes: IMAGE_SIZES,
  });
}
