'use client';
import { useState, useEffect, useCallback } from 'react';

export type Language = 'zh' | 'en';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  zh: {
    'site.name': '灵枢',
    'site.subtitle': 'AI影视创作',
    'nav.dashboard': '进入工作台',
    'home.badge': '连接AI模型，开始创作',
    'home.title.1': '用AI重新定义',
    'home.title.2': '影视创作流程',
    'home.desc': '上传剧本，AI自动分析角色、冲突、风格；一键生成宫格分镜；支持OpenAI、Gemini、DeepSeek、Ollama等任意模型。',
    'home.start': '开始使用',
    'home.features.analysis.title': '智能剧本分析',
    'home.features.analysis.desc': 'AI深度分析剧本，提取角色、冲突、情感基调',
    'home.features.storyboard.title': '宫格分镜生成',
    'home.features.storyboard.desc': '根据剧本自动生成专业宫格分镜图',
    'home.features.models.title': '任意模型接入',
    'home.features.models.desc': '支持OpenAI/Claude/Gemini/DeepSeek/Ollama',
    'home.footer': '灵枢 · AI影视创作系统',
    'nav.tabs.analyze': '剧本分析',
    'nav.tabs.storyboard': '分镜设计',
    'nav.tabs.settings': '设置',
    'nav.connected': '已连接',
    'analyze.placeholder': '在此粘贴剧本内容...',
    'analyze.chars': '字',
    'analyze.button': '开始分析',
    'analyze.loading': '分析中...',
    'analyze.genre': '类型',
    'analyze.characters': '角色',
    'analyze.director': '导演推荐',
    'analyze.tone': '情感基调',
    'analyze.conflict': '核心冲突',
    'analyze.suggestions': '建议',
    'analyze.no-script': '还没有剧本，先去分析页面输入内容',
    'storyboard.style': '风格',
    'storyboard.frames': '帧数',
    'storyboard.button': '生成分镜',
    'storyboard.loading': '生成中...',
    'storyboard.title': '分镜',
    'storyboard.frame': '帧',
    'settings.provider': '服务提供商',
    'settings.apikey': 'API Key',
    'settings.apikey.placeholder': 'sk-...（Ollama 可填任意内容）',
    'settings.model': '模型',
    'settings.test': '测试连接',
    'settings.testing': '测试中...',
    'settings.connected': '已连接',
    'settings.retry': '重新测试',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.theme.system': '跟随系统',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.eye-care': '护眼',
    'style.comic': '漫画',
    'style.sketch': '素描',
    'style.realistic': '写实',
    'style.concept': '概念艺术',
    'badge.video': '视频',
    'badge.image': '图像',
    'badge.text': '文本',
    'badge.free': '免费',
  },
  en: {
    'site.name': 'Lingshu',
    'site.subtitle': 'AI Filmmaking',
    'nav.dashboard': 'Dashboard',
    'home.badge': 'Connect AI model to start',
    'home.title.1': 'Redefine Filmmaking',
    'home.title.2': 'with AI',
    'home.desc': 'Upload script, AI analyzes characters, conflicts, style; generate storyboards instantly; supports OpenAI, Gemini, DeepSeek, Ollama and more.',
    'home.start': 'Get Started',
    'home.features.analysis.title': 'Script Analysis',
    'home.features.analysis.desc': 'AI deep analysis of characters, conflicts, emotional tone',
    'home.features.storyboard.title': 'Storyboard Generation',
    'home.features.storyboard.desc': 'Auto-generate professional storyboard grids',
    'home.features.models.title': 'Any Model Support',
    'home.features.models.desc': 'OpenAI/Claude/Gemini/DeepSeek/Ollama and more',
    'home.footer': 'Lingshu · AI Filmmaking System',
    'nav.tabs.analyze': 'Analysis',
    'nav.tabs.storyboard': 'Storyboard',
    'nav.tabs.settings': 'Settings',
    'nav.connected': 'Connected',
    'analyze.placeholder': 'Paste your script here...',
    'analyze.chars': 'chars',
    'analyze.button': 'Analyze',
    'analyze.loading': 'Analyzing...',
    'analyze.genre': 'Genre',
    'analyze.characters': 'Characters',
    'analyze.director': 'Director Match',
    'analyze.tone': 'Tone',
    'analyze.conflict': 'Conflict',
    'analyze.suggestions': 'Suggestions',
    'analyze.no-script': 'No script yet. Write one in the Analysis tab first.',
    'storyboard.style': 'Style',
    'storyboard.frames': 'Frames',
    'storyboard.button': 'Generate',
    'storyboard.loading': 'Generating...',
    'storyboard.title': 'Storyboard',
    'storyboard.frame': 'frames',
    'settings.provider': 'Provider',
    'settings.apikey': 'API Key',
    'settings.apikey.placeholder': 'sk-... (Ollama: any)',
    'settings.model': 'Model',
    'settings.test': 'Test Connection',
    'settings.testing': 'Testing...',
    'settings.connected': 'Connected',
    'settings.retry': 'Retry',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.system': 'System',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.eye-care': 'Eye-care',
    'style.comic': 'Comic',
    'style.sketch': 'Sketch',
    'style.realistic': 'Realistic',
    'style.concept': 'Concept Art',
    'badge.video': 'Video',
    'badge.image': 'Image',
    'badge.text': 'Text',
    'badge.free': 'Free',
  },
};

export function useI18n() {
  const [lang, setLang] = useState<Language>('zh');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ls_lang') as Language | null;
      if (saved) setLang(saved);
    } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[lang]?.[key] ?? key;
  }, [lang]);

  const updateLang = useCallback((l: Language) => {
    setLang(l);
    try { localStorage.setItem('ls_lang', l); } catch {}
  }, []);

  return { lang, setLang: updateLang, t };
}
