import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';
import { spawnSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

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
      tmpFile = join(tmpdir(), `lingshu_video_${Date.now()}.json`);
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

// Video generation styles matching mainstream AI video platforms
const VIDEO_STYLES: Record<string, { name: string; promptSuffix: string; negativePrompt: string }> = {
  cinematic: { name: '电影质感', promptSuffix: ', cinematic lighting, film grain, anamorphic lens flare, professional color grading, movie scene', negativePrompt: 'cartoon, anime, low quality, blurry, deformed, static' },
  anime: { name: '动漫风格', promptSuffix: ', anime style animation, cel shading, vibrant colors, Japanese animation style, smooth motion', negativePrompt: 'photorealistic, 3d render, low quality, blurry, deformed, static' },
  realistic: { name: '写实摄影', promptSuffix: ', photorealistic video, natural camera movement, real world lighting, documentary style, smooth motion', negativePrompt: 'cartoon, anime, illustration, low quality, blurry, deformed, static' },
  animation_3d: { name: '3D动画', promptSuffix: ', 3D animated video, Pixar style animation, smooth rendering, volumetric lighting, cinematic motion', negativePrompt: '2d, flat, illustration, low quality, blurry, static' },
  pixel: { name: '像素风', promptSuffix: ', pixel art animation, retro game style, 16-bit aesthetic, smooth pixel animation, nostalgic', negativePrompt: 'photorealistic, 3d render, smooth, blurry, low quality, static' },
  watercolor: { name: '水彩', promptSuffix: ', watercolor animation, flowing colors, soft edges, paper texture, artistic motion, painterly animation', negativePrompt: 'photorealistic, 3d render, sharp edges, low quality, blurry, static' },
  oil: { name: '油画', promptSuffix: ', oil painting animation, thick brushstrokes motion, classical art style, Rembrandt lighting, museum quality animation', negativePrompt: 'photorealistic, 3d render, digital art, low quality, blurry, static' },
  cyberpunk: { name: '赛博朋克', promptSuffix: ', cyberpunk aesthetic, neon lights, futuristic cityscape, sci-fi atmosphere, dramatic lighting, blade runner style', negativePrompt: 'vintage, natural, low quality, blurry, deformed, static' },
  vintage: { name: '复古胶片', promptSuffix: ', vintage film aesthetic, 1970s style, warm color grading, film grain, nostalgic motion, Kodak Portra tones', negativePrompt: 'modern, digital, low quality, blurry, deformed, static' },
  minimal: { name: '极简', promptSuffix: ', minimal design, clean composition, simple color palette, smooth elegant motion, modern aesthetic', negativePrompt: 'cluttered, busy, low quality, blurry, deformed, static' },
};

// AI platforms video models
const VIDEO_PROVIDERS = {
  openai: { endpoint: '/videos/generations', model: 'gpt-4o-video-alpha', timeout: 300000 },
  Kling: { endpoint: '/v1/videos/generations', model: 'kling-v1', timeout: 300000 },
  Runway: { endpoint: '/v1/generate', model: 'gen3a_turbo', timeout: 300000 },
  liblibai: { endpoint: '/generate/video', model: 'liblib-video', timeout: 300000 },
};

async function enhancePrompt(prompt: string, style: string, mode: string, apiKey: string, baseURL: string, model: string): Promise<string> {
  const styleInfo = VIDEO_STYLES[style] || VIDEO_STYLES.cinematic;
  const systemPrompt = `You are a professional video director and prompt engineer. Enhance the user's video description into a detailed, professional video generation prompt. Include camera movement, lighting, color grading, composition, and motion details. Keep it under 200 words. Output only the enhanced prompt, nothing else.`;
  
  const userPrompt = `Create a professional video generation prompt for: ${prompt}\n\nStyle: ${styleInfo.name}${styleInfo.promptSuffix}\nMode: ${mode === 'img2video' ? 'Image to Video' : mode === 'firstlast' ? 'First/Last Frame Animation' : 'Text to Video'}\n\nEnhanced prompt:`;

  try {
    const url = `${baseURL.replace(/\/$/, '')}/chat/completions`;
    const response = await rawFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
      timeout: 30000,
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || prompt;
  } catch {
    return prompt;
  }
}

async function generateVideoWithOpenAI(prompt: string, baseURL: string, apiKey: string, duration: number): Promise<{ url?: string; error?: string }> {
  const url = `${baseURL.replace(/\/$/, '')}/videos/generations`;
  const response = await rawFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-video-alpha',
      prompt: prompt,
      duration: Math.min(duration, 15),
    }),
    timeout: 300000,
  });
  const data = await response.json();
  if (data.data?.[0]?.url) return { url: data.data[0].url };
  return { error: data.error?.message || 'OpenAI 视频生成失败' };
}

async function generateVideoWithLiblibAI(prompt: string, apiKey: string, apiSecret: string, mode: string, referenceImage?: string, firstFrame?: string, lastFrame?: string, duration?: number): Promise<{ url?: string; error?: string }> {
  const baseUrl = 'https://openapi.liblibai.cloud';
  
  const submitPayload: Record<string, any> = {
    prompt: prompt,
    duration: duration || 5,
  };

  if (mode === 'img2video' && referenceImage) {
    submitPayload.imageUrl = referenceImage;
  } else if (mode === 'firstlast' && firstFrame && lastFrame) {
    submitPayload.firstFrameUrl = firstFrame;
    submitPayload.lastFrameUrl = lastFrame;
  }

  const submitResponse = await rawFetch(`${baseUrl}/generate/video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Liblab-Secret': apiSecret,
    },
    body: JSON.stringify(submitPayload),
    timeout: 30000,
  });

  const submitData = await submitResponse.json();
  
  if (submitData.code !== 200 || !submitData.data?.generateUuid) {
    return { error: submitData.message || 'LiblibAI 视频提交失败' };
  }

  const generateUuid = submitData.data.generateUuid;
  return await pollLiblibStatus(generateUuid, apiKey, apiSecret);
}

async function pollLiblibStatus(generateUuid: string, apiKey: string, apiSecret: string, maxAttempts = 60, intervalMs = 5000): Promise<{ url?: string; error?: string }> {
  const baseUrl = 'https://openapi.liblibai.cloud';
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    
    const resp = await rawFetch(
      `${baseUrl}/generate/status?generateUuid=${generateUuid}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Liblab-Secret': apiSecret,
        },
        timeout: 15000,
      }
    );
    
    const data = await resp.json();
    
    if (data.code === 200 && data.data) {
      const status = data.data.generateStatus;
      if (status === 5) {
        const videoUrl = data.data.videoUrl || data.data.video_urls?.[0];
        if (videoUrl) return { url: videoUrl };
      }
      if (status === 6) {
        return { error: data.data.message || '视频生成失败' };
      }
    }
  }
  
  return { error: '视频生成超时(5分钟)' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { prompt, style, duration, mode, referenceImage, firstFrame, lastFrame, agent, apiKey, baseURL, model, apiSecret } = body;

    if (!prompt) return NextResponse.json({ error: '请提供视频描述' }, { status: 400 });
    if (!apiKey || !baseURL) return NextResponse.json({ error: '请先配置 AI API' }, { status: 400 });

    style = style || 'cinematic';
    mode = mode || 'text2video';
    duration = duration || 5;

    const styleInfo = VIDEO_STYLES[style] || VIDEO_STYLES.cinematic;
    
    // AI Agent prompt enhancement
    if (agent) {
      const enhancedPrompt = await enhancePrompt(prompt, style, mode, apiKey, baseURL, model);
      prompt = enhancedPrompt;
    } else {
      prompt = prompt + styleInfo.promptSuffix;
    }

    const provider = baseURL.toLowerCase();

    // LiblibAI - 不支持视频生成
    if (provider.includes('liblibai') || provider.includes('liblib')) {
      return NextResponse.json({ error: 'LiblibAI 仅支持图像生成，请使用 OpenAI、Kling 等视频生成服务商', availableProviders: ['openai.com', 'klingai.com'] }, { status: 400 });
    }

    // OpenAI
    if (provider.includes('openai.com')) {
      const result = await generateVideoWithOpenAI(prompt, baseURL, apiKey, duration);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ success: true, video: { url: result.url, prompt } });
    }

    // Kling AI (OpenAI compatible)
    if (provider.includes('klingai.com') || provider.includes('kuaishou')) {
      const url = `${baseURL.replace(/\/$/, '')}/v1/videos/generations`;
      const payload: Record<string, any> = {
        model: 'kling-v1',
        prompt: prompt,
        duration: Math.min(duration, 10),
      };
      if (mode === 'img2video' && referenceImage) {
        payload.image_url = referenceImage;
      } else if (mode === 'firstlast' && firstFrame && lastFrame) {
        payload.first_frame_url = firstFrame;
        payload.last_frame_url = lastFrame;
      }
      const response = await rawFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
        timeout: 300000,
      });
      const data = await response.json();
      if (data.data?.task_id) {
        // Poll for result
        const taskId = data.data.task_id;
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 5000));
          const statusUrl = `${baseURL.replace(/\/$/, '')}/v1/videos/${taskId}`;
          const statusRes = await rawFetch(statusUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            timeout: 15000,
          });
          const statusData = await statusRes.json();
          if (statusData.data?.status === 'succeed') {
            const videoUrl = statusData.data?.video_url;
            if (videoUrl) return NextResponse.json({ success: true, video: { url: videoUrl, prompt } });
          }
          if (statusData.data?.status === 'failed') {
            return NextResponse.json({ error: 'Kling 视频生成失败' }, { status: 500 });
          }
        }
        return NextResponse.json({ error: 'Kling 视频生成超时' }, { status: 500 });
      }
      return NextResponse.json({ error: data.message || 'Kling 视频提交失败' }, { status: 500 });
    }

    return NextResponse.json({ error: '当前服务商不支持视频生成，请使用 OpenAI 或 Kling', availableProviders: ['openai.com', 'klingai.com'] }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '视频生成失败' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    styles: Object.entries(VIDEO_STYLES).map(([key, val]) => ({ value: key, ...val })),
    modes: [
      { value: 'text2video', label: '文字生视频', description: '通过文字描述生成视频' },
      { value: 'img2video', label: '图片生视频', description: '通过参考图片生成视频' },
      { value: 'firstlast', label: '首尾帧生成', description: '通过首尾帧生成过渡动画' },
    ],
    durations: [
      { value: 3, label: '3秒' },
      { value: 5, label: '5秒' },
      { value: 8, label: '8秒' },
      { value: 10, label: '10秒' },
      { value: 15, label: '15秒' },
    ],
  });
}
