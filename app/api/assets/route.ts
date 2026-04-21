import { NextRequest, NextResponse } from 'next/server';
import { callAIClient, AIClientConfig } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, apiKey, baseURL, model } = await request.json();

    if (!apiKey || !baseURL || !model) {
      return NextResponse.json({ error: '请先在设置中配置AI API' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: '请提供生成提示词' }, { status: 400 });
    }

    const config: AIClientConfig = { apiKey, baseURL, model };

    if (type === 'image') {
      const imagePrompt = `You are a professional film concept artist. Generate a detailed visual description for the following scene that could be used as an image generation prompt. Focus on: composition, lighting, color palette, camera angle, mood, and visual style. Output ONLY the image generation prompt, nothing else.\n\nScene: ${prompt}`;

      const response = await callAIClient(config, [
        { role: 'system', content: 'You are a professional film visual effects artist and concept designer. You create detailed image generation prompts for film production.' },
        { role: 'user', content: imagePrompt }
      ], { maxTokens: 1000, temperature: 0.7 });

      return NextResponse.json({
        success: true,
        type: 'image',
        prompt: prompt,
        enhancedPrompt: response,
        message: 'AI已生成图片描述提示词。如需实际生成图片，请使用支持图片生成的模型（如DALL-E 3、Stable Diffusion等）。'
      });
    }

    if (type === 'video') {
      const videoPrompt = `You are a professional film director and cinematographer. Generate a detailed shot-by-shot description for a video sequence based on the following scene. Include: camera movement, duration, transitions, and visual effects. Output ONLY the video description.\n\nScene: ${prompt}`;

      const response = await callAIClient(config, [
        { role: 'system', content: 'You are a professional film director specializing in shot design and visual storytelling.' },
        { role: 'user', content: videoPrompt }
      ], { maxTokens: 1500, temperature: 0.7 });

      return NextResponse.json({
        success: true,
        type: 'video',
        prompt: prompt,
        enhancedPrompt: response,
        message: 'AI已生成视频分镜描述。如需实际生成视频，请使用支持视频生成的模型。'
      });
    }

    return NextResponse.json({ error: '无效的类型，请使用 image 或 video' }, { status: 400 });
  } catch (error: any) {
    console.error('资产生成失败:', error);
    return NextResponse.json({ error: error.message || '生成失败' }, { status: 500 });
  }
}
