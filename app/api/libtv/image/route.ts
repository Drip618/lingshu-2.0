import { NextRequest, NextResponse } from 'next/server';

interface LiblibRequestBody {
  templateUuid: string;
  generateParams: Record<string, any>;
}

interface LiblibStyleConfig {
  name: string;
  templateUuid: string;
  description: string;
  aspectRatio: string;
  defaultSteps: number;
  tags: string[];
}

const LIBLIB_STYLES: Record<string, LiblibStyleConfig> = {
  cinematic: {
    name: '电影质感',
    templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
    description: '电影级画质，戏剧性光影，专业调色',
    aspectRatio: 'landscape',
    defaultSteps: 30,
    tags: ['高清', '电影感']
  },
  anime: {
    name: '动漫风格',
    templateUuid: 'e10adc3949ba59abbe56e057f20f883e',
    description: '日系动漫风格，赛璐珞上色，鲜艳色彩',
    aspectRatio: 'portrait',
    defaultSteps: 20,
    tags: ['动漫', '二次元']
  },
  realistic: {
    name: '写实摄影',
    templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
    description: '超写实摄影，8K细节，专业人像/风景',
    aspectRatio: 'landscape',
    defaultSteps: 30,
    tags: ['写实', '摄影']
  },
  oil_painting: {
    name: '油画风格',
    templateUuid: 'e10adc3949ba59abbe56e057f20f883e',
    description: '经典油画质感，厚涂笔触，丰富纹理',
    aspectRatio: 'portrait',
    defaultSteps: 25,
    tags: ['油画', '艺术']
  },
  watercolor: {
    name: '水彩风格',
    templateUuid: 'e10adc3949ba59abbe56e057f20f883e',
    description: '水彩画风格，柔和边缘，流动色彩',
    aspectRatio: 'portrait',
    defaultSteps: 20,
    tags: ['水彩', '艺术']
  },
  concept_art: {
    name: '概念设计',
    templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
    description: '影视概念艺术，戏剧性光影，史诗级场景',
    aspectRatio: 'landscape',
    defaultSteps: 30,
    tags: ['概念', '设计']
  },
  portrait: {
    name: '人像写真',
    templateUuid: 'e10adc3949ba59abbe56e057f20f883e',
    description: '专业人像摄影，细腻肤质，自然光影',
    aspectRatio: 'portrait',
    defaultSteps: 20,
    tags: ['人像', '写真']
  },
  landscape: {
    name: '风景画',
    templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
    description: '壮丽风景，自然光影，大气透视',
    aspectRatio: 'landscape',
    defaultSteps: 30,
    tags: ['风景', '自然']
  },
};

async function liblibRequest(
  endpoint: string,
  body: Record<string, any>,
  apiKey: string,
  apiSecret: string,
  timeoutMs = 120000
): Promise<any> {
  const url = `https://openapi.liblibai.cloud${endpoint}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Liblab-Secret': apiSecret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.message || data.error?.message || `HTTP ${resp.status}`);
    }
    return data;
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('请求超时(120秒)');
    throw e;
  }
}

async function pollLiblibStatus(
  generateUuid: string,
  apiKey: string,
  apiSecret: string,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const resp = await fetch(
        `https://openapi.liblibai.cloud/generate/status?generateUuid=${generateUuid}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Liblab-Secret': apiSecret,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timer);
      const data = await resp.json();

      if (data.code === 200 && data.data) {
        const status = data.data.generateStatus;
        if (status === 5) return { success: true, images: data.data.images || [] };
        if (status === 6) throw new Error(data.data.message || '生成失败');
        if (status === 7) throw new Error('生成超时');
      }
    } catch (e: any) {
      clearTimeout(timer);
      if (e.name === 'AbortError') throw new Error('状态查询超时');
      throw e;
    }
  }
  throw new Error('轮询超时(3分钟)');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      negativePrompt,
      style = 'cinematic',
      aspectRatio = 'landscape',
      steps = 30,
      seed = -1,
      imgCount = 1,
      referenceImage,
      apiKey,
      apiSecret,
    } = body;

    if (!prompt) return NextResponse.json({ error: '请提供图像描述' }, { status: 400 });
    if (!apiKey || !apiSecret) return NextResponse.json({ error: '请提供 liblib API Key 和 Secret' }, { status: 400 });

    const styleConfig = LIBLIB_STYLES[style] || LIBLIB_STYLES.cinematic;

    const requestBody: LiblibRequestBody = {
      templateUuid: styleConfig.templateUuid,
      generateParams: {
        prompt: `${prompt}, masterpiece, best quality, highly detailed`,
        negativePrompt: negativePrompt || 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
        aspectRatio: aspectRatio || styleConfig.aspectRatio,
        imageSize: undefined,
        imgCount: Math.min(Math.max(imgCount, 1), 4),
        steps: steps || styleConfig.defaultSteps,
        cfgScale: 7,
        sampler: 15,
        seed: seed || -1,
        clipSkip: 2,
        restoreFaces: 1,
        additionalNetwork: [],
        controlNet: [],
      },
    };

    if (referenceImage) {
      requestBody.generateParams.controlNet = [
        {
          unitOrder: 1,
          sourceImage: referenceImage,
          preprocessor: 3,
          model: '6349e9dae8814084bd9c1585d335c24c',
          controlWeight: 0.8,
          startingControlStep: 0,
          endingControlStep: 1,
          pixelPerfect: 1,
          controlMode: 0,
          resizeMode: 1,
        }
      ];
    }

    const submitResult = await liblibRequest('/generate/submit', requestBody, apiKey, apiSecret);

    if (submitResult.code !== 200 || !submitResult.data?.generateUuid) {
      return NextResponse.json({
        error: submitResult.message || '提交生成任务失败'
      }, { status: 500 });
    }

    const generateUuid = submitResult.data.generateUuid;

    const pollResult = await pollLiblibStatus(generateUuid, apiKey, apiSecret);

    return NextResponse.json({
      success: true,
      images: pollResult.images || [],
      generateUuid,
      style: styleConfig.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '图像生成失败' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    styles: Object.entries(LIBLIB_STYLES).map(([key, val]) => ({
      value: key,
      name: val.name,
      description: val.description,
      aspectRatio: val.aspectRatio,
      tags: val.tags,
    })),
  });
}
