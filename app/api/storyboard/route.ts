import { NextRequest, NextResponse } from 'next/server';
import { callAIClient, AIClientConfig } from '@/lib/ai-client';

// Storyboard output modes
const OUTPUT_MODES = {
  text: 'text',
  grid_2x2: 'grid_2x2',
  grid_3x2: 'grid_3x2',
  grid_3x3: 'grid_3x3',
  grid_4x3: 'grid_4x3',
  grid_5x5: 'grid_5x5',
} as const;

// Visual style templates for image generation prompts
const VISUAL_STYLES = {
  comic: {
    name: '漫画分镜',
    promptStyle: 'Japanese manga storyboard style, clean line art, panel layout with gutters, halftone shading, speech bubble placeholders, professional storyboard format',
  },
  sketch: {
    name: '线稿分镜',
    promptStyle: 'Professional film storyboard sketch style, pencil or ink line drawing, clean composition, director notes area, shot number labels',
  },
  realistic: {
    name: '电影剧照',
    promptStyle: 'Cinematic still photography style, realistic lighting and depth of field, professional color grading, anamorphic lens look',
  },
  concept: {
    name: '概念艺术',
    promptStyle: 'Cinematic concept art style, dramatic lighting, atmospheric perspective, professional digital painting, pre-production visualization',
  },
};

// Grid layout info
const GRID_INFO: Record<string, { label: string; cols: number; rows: number; total: number }> = {
  text: { label: '纯文字', cols: 0, rows: 0, total: 0 },
  grid_2x2: { label: '2×2 宫格', cols: 2, rows: 2, total: 4 },
  grid_3x2: { label: '3×2 宫格', cols: 3, rows: 2, total: 6 },
  grid_3x3: { label: '3×3 宫格', cols: 3, rows: 3, total: 9 },
  grid_4x3: { label: '4×3 宫格', cols: 4, rows: 3, total: 12 },
  grid_5x5: { label: '5×5 宫格', cols: 5, rows: 5, total: 25 },
};

// Standard shot types in professional filmmaking
const SHOT_TYPES = [
  'Extreme Long Shot (ELS) / 极远景',
  'Long Shot (LS) / 远景',
  'Full Shot (FS) / 全景',
  'Medium Long Shot (MLS) / 中全景',
  'Medium Shot (MS) / 中景',
  'Medium Close-Up (MCU) / 中近景',
  'Close-Up (CU) / 特写',
  'Extreme Close-Up (ECU) / 大特写',
  'Over-the-Shoulder (OTS) / 过肩镜头',
  'Point of View (POV) / 主观镜头',
  'Two Shot / 双人镜头',
  'Aerial Shot / 航拍镜头',
];

// Camera movement types
const CAMERA_MOVEMENTS = [
  'Static / 固定机位',
  'Pan Left / 左摇',
  'Pan Right / 右摇',
  'Tilt Up / 上摇',
  'Tilt Down / 下摇',
  'Dolly In / 推镜头',
  'Dolly Out / 拉镜头',
  'Tracking Left / 左跟',
  'Tracking Right / 右跟',
  'Crane Up / 升摇臂',
  'Crane Down / 降摇臂',
  'Handheld / 手持晃动',
  'Steadicam / 稳定器跟随',
  'Zoom In / 推焦',
  'Zoom Out / 拉焦',
  'Orbit / 环绕',
  'Dolly Zoom / 推拉变焦',
];

// Lighting conditions
const LIGHTING_CONDITIONS = [
  'Natural daylight / 自然日光',
  'Golden hour / 黄金时段光',
  'Blue hour / 蓝色时段光',
  'Overcast / 阴天散射光',
  'Direct sunlight / 直射阳光',
  'Moonlight / 月光',
  'Street light / 街灯光',
  'Neon light / 霓虹灯光',
  'Candle light / 烛光',
  'Fire light / 火光',
  'Studio key light / 影棚主光',
  'Chiaroscuro / 明暗对比',
  'Silhouette / 剪影背光',
  'Low key / 低调照明',
  'High key / 高调照明',
  'Practical lights / 实景光源',
];

function buildStoryboardPrompt(
  script: string,
  outputMode: string,
  visualStyle: string,
  sceneCount: number
): string {
  const gridInfo = GRID_INFO[outputMode];
  const isImageMode = outputMode !== 'text';
  const actualCount = isImageMode ? (gridInfo?.total || 6) : sceneCount;
  const styleInfo = VISUAL_STYLES[visualStyle as keyof typeof VISUAL_STYLES] || VISUAL_STYLES.comic;

  return `You are a professional cinematographer and storyboard artist. Analyze the following screenplay and create a detailed, professional storyboard.

OUTPUT FORMAT REQUIREMENTS:
- Total scenes: ${actualCount}
- Output mode: ${isImageMode ? 'IMAGE GRID STORYBOARD' : 'TEXT-ONLY STORYBOARD'}
- Visual style: ${styleInfo.name}

CRITICAL INSTRUCTIONS:
1. Each scene description must be OBJECTIVE and FORMAL, suitable for both human readers and AI image generators
2. Use professional filmmaking terminology (shot types, camera movements, lighting conditions)
3. Describe ONLY what is VISIBLE in the frame - no internal thoughts, emotions, or abstract concepts
4. Each visualDescription must be a complete, self-contained prompt that an AI image generator can use
5. Specify the exact time of day, weather, and environmental conditions
6. Describe character positions relative to frame (left/center/right, foreground/midground/background)
7. Include specific color palette information using concrete color names

STRUCTURE EACH SCENE AS FOLLOWS:

**shotType**: Use standard professional notation from this list:
${SHOT_TYPES.join('\n')}

**cameraMovement**: Use precise camera movement terminology from this list:
${CAMERA_MOVEMENTS.join('\n')}

**lighting**: Use specific lighting terminology from this list:
${LIGHTING_CONDITIONS.join('\n')}

**visualDescription** (MOST IMPORTANT - ${isImageMode ? 'MUST be a complete AI image generation prompt' : 'MUST be a detailed visual description'}):
Structure: [Shot type] of [subject] in [environment], [character position in frame], [action/movement], [lighting condition], [camera angle], [depth of field], [color palette], [mood/atmosphere]
- Be extremely specific about visual elements
- Use concrete nouns and verbs, avoid abstract adjectives
- Specify exact colors: "warm amber tones" not "nice lighting"
- Specify exact positions: "character occupies the right third of frame" not "character is prominent"
- Specify exact camera angles: "eye-level" "low angle 30 degrees" "bird's eye view"
- Specify exact depth: "shallow depth of field, f/1.4" "deep focus"
- For image mode: Include style tags at the end: ${styleInfo.promptStyle}

**characterAction**: Describe physical movements and gestures precisely using verbs
**dialogue**: Exact spoken lines with speaker identification
**mood**: Use objective atmospheric terms (e.g., "tense", "melancholic", "euphoric")
**colorTone**: Specify the actual color palette (e.g., "desaturated blues and grays", "warm amber and gold")

Please return strictly valid JSON in the following format:
{
  "title": "Storyboard title",
  "outputMode": "${outputMode}",
  "visualStyle": "${styleInfo.name}",
  "gridLayout": "${isImageMode ? gridInfo?.label || '' : 'none'}",
  "gridCols": ${isImageMode ? gridInfo?.cols || 0 : 0},
  "gridRows": ${isImageMode ? gridInfo?.rows || 0 : 0},
  "gridTotal": ${actualCount},
  "scenes": [
    {
      "id": 1,
      "shotType": "Medium Shot (MS) / 中景",
      "cameraMovement": "Static / 固定机位",
      "cameraAngle": "Eye-level",
      "duration": "3.0s",
      "lighting": "Golden hour / 黄金时段光",
      "visualDescription": "Medium shot of a middle-aged man standing alone on a deserted subway platform, positioned in the left third of frame, facing right with slumped shoulders, golden hour sunlight streaming through skylight windows casting long shadows on concrete floor, eye-level camera angle, shallow depth of field blurring background tracks, desaturated concrete grays and warm amber tones, melancholic atmosphere, Japanese manga storyboard style, clean line art, panel layout with gutters, halftone shading",
      "characterAction": "Man stands motionless, shoulders slumped, hands in coat pockets, head slightly bowed",
      "dialogue": "(silence)",
      "mood": "Melancholic, isolated",
      "colorTone": "Desaturated concrete grays, warm amber highlights, muted earth tones"
    }
  ]
}

SCREENPLAY:
${script.substring(0, 12000)}

Return ONLY valid JSON. No markdown formatting. No explanations.`;
}

export async function POST(request: NextRequest) {
  try {
    const { script, style, outputMode, sceneCount, apiKey, baseURL, model } = await request.json();

    if (!script) {
      return NextResponse.json({ error: '请提供有效的剧本内容' }, { status: 400 });
    }

    if (!apiKey || !baseURL || !model) {
      return NextResponse.json({ error: '请先在设置中配置 AI API' }, { status: 400 });
    }

    const config: AIClientConfig = { apiKey, baseURL, model };
    const effectiveOutputMode = (outputMode && GRID_INFO[outputMode]) ? outputMode : 'grid_3x2';
    const visualStyle = style || 'comic';
    const count = sceneCount || GRID_INFO[effectiveOutputMode]?.total || 6;

    const storyboardPrompt = buildStoryboardPrompt(script, effectiveOutputMode, visualStyle, count);

    const response = await callAIClient(config, [
      { role: 'system', content: 'You are a professional cinematographer and storyboard artist for film production. You create precise, objective, AI-ready storyboard descriptions using professional filmmaking terminology. Always return valid JSON.' },
      { role: 'user', content: storyboardPrompt }
    ], { maxTokens: 8192, temperature: 0.5, jsonMode: true });

    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let storyboard;
    try {
      storyboard = JSON.parse(cleaned);
    } catch {
      storyboard = {
        title: '分镜',
        outputMode: effectiveOutputMode,
        visualStyle,
        gridLayout: GRID_INFO[effectiveOutputMode]?.label || '',
        gridCols: GRID_INFO[effectiveOutputMode]?.cols || 0,
        gridRows: GRID_INFO[effectiveOutputMode]?.rows || 0,
        gridTotal: GRID_INFO[effectiveOutputMode]?.total || 6,
        scenes: [{
          id: 1,
          shotType: 'Medium Shot (MS) / 中景',
          cameraMovement: 'Static / 固定机位',
          cameraAngle: 'Eye-level',
          duration: '3.0s',
          lighting: 'Natural daylight / 自然日光',
          visualDescription: response.substring(0, 500),
          characterAction: '',
          dialogue: '',
          mood: '',
          colorTone: ''
        }]
      };
    }

    if (!storyboard.scenes || !Array.isArray(storyboard.scenes)) {
      storyboard.scenes = [{
        id: 1,
        shotType: 'Medium Shot (MS) / 中景',
        cameraMovement: 'Static / 固定机位',
        cameraAngle: 'Eye-level',
        duration: '3.0s',
        lighting: 'Natural daylight / 自然日光',
        visualDescription: String(storyboard),
        characterAction: '',
        dialogue: '',
        mood: '',
        colorTone: ''
      }];
    }

    storyboard.outputMode = effectiveOutputMode;

    return NextResponse.json({
      success: true,
      storyboard
    });
  } catch (error: any) {
    console.error('Storyboard generation failed:', error);
    return NextResponse.json({ error: error.message || '分镜生成失败' }, { status: 500 });
  }
}
