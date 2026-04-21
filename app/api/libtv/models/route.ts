import { NextRequest, NextResponse } from 'next/server';
import { spawnSync } from 'child_process';

// Fetch available models from LiblibAI official API
export async function GET(request: NextRequest) {
  try {
    // LiblibAI 官方模型列表（来自 https://www.liblib.art/apis）
    const models = [
      { value: 'star-3', label: '星流 Star-3', desc: '星流大模型，搭载LoRA推荐算法，适合通用风格，高质量出图' },
      { value: 'sdxl', label: 'SDXL', desc: 'Stable Diffusion XL，适合高度自由和精准控制的场景' },
      { value: 'sd-v1-5', label: 'SD 1.5', desc: '经典SD 1.5模型，快速出图' },
      { value: 'wanx-v1', label: '通义万相', desc: '阿里通义万相图像生成模型' },
    ];

    return NextResponse.json({ success: true, models: models.map(m => m.value) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取模型列表失败' }, { status: 500 });
  }
}
