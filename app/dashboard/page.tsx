'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { MODEL_DATABASE, getModelsForProvider, getModelInfo, getCapabilityLabel, ModelCapability } from '@/lib/model-database';
import { useTheme, ThemeMode } from '@/hooks/useTheme';
import { useI18n, Language } from '@/hooks/useI18n';

interface AIConfig { apiKey: string; apiSecret?: string; baseURL: string; model: string }
interface StoryboardScene { id: number; shotType: string; cameraMovement: string; cameraAngle: string; duration: string; lighting: string; visualDescription: string; characterAction: string; dialogue: string; mood: string; colorTone: string }

// ===== Text area with clipboard toolbar =====
function ClipTextArea(props: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string; rows?: number;
  allowPaste?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { value, onChange, placeholder, className = '', rows = 6, allowPaste = true } = props;

  const exec = useCallback((cmd: string) => {
    const el = taRef.current;
    if (!el) return;
    if (cmd === 'selectAll') el.select();
    else document.execCommand(cmd, false);
    el.focus();
    setTimeout(() => onChange(el.value), 0);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key === 'a') { e.preventDefault(); (e.target as HTMLTextAreaElement).select(); }
  }, []);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex gap-1 mb-1 flex-wrap">
        {[
          { cmd: 'selectAll', label: '全选', icon: <span className="text-[9px]">Aa</span> },
          { cmd: 'cut', label: '剪切', icon: '✂' },
          { cmd: 'copy', label: '复制', icon: '⧉' },
        ].map(b => (
          <button key={b.cmd} type="button" onClick={() => exec(b.cmd)} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-elevated)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] transition-colors flex items-center gap-1">
            {b.icon} {b.label}
          </button>
        ))}
        {allowPaste && (
          <button type="button" onClick={() => navigator.clipboard.readText().then(t => { const el = taRef.current; if (el) { const s = el.selectionStart, e = el.selectionEnd; el.value = el.value.substring(0, s) + t + el.value.substring(e); onChange(el.value); el.focus(); } })} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-elevated)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] transition-colors">
            粘贴
          </button>
        )}
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input font-mono text-xs leading-relaxed min-h-[140px] resize-y flex-1"
        rows={rows}
        style={{ fontFamily: 'monospace', tabSize: 2 }}
        onPaste={e => {
          setTimeout(() => onChange((e.target as HTMLTextAreaElement).value), 0);
        }}
      />
    </div>
  );
}

// Provider definition with correct tags matching model capabilities
const PROVIDERS: { group: string; items: Array<{ value: string; label: string; icon: any; tags: string[]; models: string[] }> }[] = [
  { group: 'Cloud', items: [
    { value: 'https://api.openai.com/v1', label: 'OpenAI', icon: Icons.zap, tags: ['图像'], models: ['o1', 'o1-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'dall-e-3'] },
    { value: 'https://api.anthropic.com/v1', label: 'Anthropic', icon: Icons.sparkles, tags: ['图像'], models: ['claude-3-5-haiku-latest', 'claude-sonnet-4-20250514', 'claude-opus-4-20250514'] },
    { value: 'https://generativelanguage.googleapis.com/v1beta', label: 'Google', icon: Icons.globe, tags: ['免费', '图像'], models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-pro-exp-02-05'] },
  ]},
  { group: 'China', items: [
    { value: 'https://api.deepseek.com/v1', label: 'DeepSeek', icon: Icons.zap, tags: ['代码'], models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'] },
    { value: 'https://api.moonshot.cn/v1', label: 'Moonshot', icon: Icons.moonshot, tags: ['文本'], models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
    { value: 'https://open.bigmodel.cn/api/paas/v4', label: '智谱', icon: Icons.cpu, tags: ['免费', '图像'], models: ['glm-4', 'glm-4-flash', 'glm-4-air', 'glm-4-plus', 'glm-4-long', 'glm-4v-flash'] },
    { value: 'https://dashscope.aliyuncs.com/compatible-mode/v1', label: '通义千问', icon: Icons.cloud, tags: ['免费', '图像'], models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long', 'qwen-vl-max', 'wanx-v1'] },
  ]},
  { group: 'Gateway', items: [
    { value: 'https://openrouter.ai/api/v1', label: 'OpenRouter', icon: Icons.globe, tags: ['免费', '图像'], models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4', 'google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-405b-instruct'] },
  ]},
  { group: 'ImageGen', items: [
    { value: 'https://openapi.liblibai.cloud', label: 'LiblibAI (哩布哩布)', icon: Icons.liblibai, tags: ['免费', '图像'], models: ['star-3', 'sdxl', 'sd-v1-5'] },
  ]},
  { group: 'Local', items: [
    { value: 'http://localhost:11434/v1', label: 'Ollama', icon: Icons.cpu, tags: ['免费'], models: ['mistral', 'phi3', 'gemma2', 'llama3.2', 'llama3.1', 'codellama', 'qwen2.5', 'deepseek-v2'] },
    { value: 'http://localhost:1234/v1', label: 'LM Studio', icon: Icons.cpu, tags: ['免费'], models: ['local-model'] },
    { value: 'http://localhost:8000/v1', label: 'vLLM', icon: Icons.cpu, tags: ['免费'], models: ['custom-model'] },
  ]},
];

// Storyboard styles
const SB_STYLES = [
  { value: 'comic', label: '漫画', mode: 'image' as const, desc: '日式漫画风格' },
  { value: 'realistic', label: '电影', mode: 'image' as const, desc: '电影剧照风格' },
  { value: 'concept', label: '概念', mode: 'image' as const, desc: '概念艺术风格' },
  { value: 'text', label: '文字', mode: 'text' as const, desc: '纯文字分镜' },
  { value: 'anime', label: '动漫', mode: 'image' as const, desc: '日系动漫风格' },
  { value: 'cinematic', label: '影视', mode: 'image' as const, desc: '电影质感分镜' },
];

// Video generation styles
const VIDEO_STYLES = [
  { value: 'cinematic', label: '电影质感', desc: '电影级光影和调色' },
  { value: 'anime', label: '动漫风格', desc: '日系/国风动画风格' },
  { value: 'realistic', label: '写实摄影', desc: '真实摄影机效果' },
  { value: 'animation_3d', label: '3D动画', desc: '3D渲染动画风格' },
  { value: 'pixel', label: '像素风', desc: '复古像素动画' },
  { value: 'watercolor', label: '水彩', desc: '水彩画风格动画' },
  { value: 'oil', label: '油画', desc: '油画笔触风格' },
  { value: 'cyberpunk', label: '赛博朋克', desc: '霓虹科幻风格' },
  { value: 'vintage', label: '复古胶片', desc: '老电影胶片感' },
  { value: 'minimal', label: '极简', desc: '干净简约风格' },
];

function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>({ apiKey: '', baseURL: '', model: '' });
  const [ready, setReady] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  useEffect(() => {
    try {
      const s = localStorage.getItem('ls_ai');
      if (s) {
        const parsed = { ...{ apiKey: '', apiSecret: '', baseURL: '', model: '' }, ...JSON.parse(s) };
        setConfig(parsed);
        // Load model list from PROVIDERS based on saved baseURL
        if (parsed.baseURL) {
          const providerItem = PROVIDERS.flatMap(g => g.items).find(it => it.value === parsed.baseURL);
          const providerModels = providerItem?.models || [];
          setModels(providerModels);
        }
      }
    } catch {}
    setReady(true);
  }, []);
  const update = useCallback((u: Partial<AIConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...u };
      try { localStorage.setItem('ls_ai', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return { config, update, ready, models, setModels };
}

export default function Dashboard() {
  const { config, update, ready, models, setModels } = useAIConfig();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [tab, setTab] = useState('analyze');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState<'analyze' | 'storyboard' | 'video' | null>(null);
  const [result, setResult] = useState<any>(null);
  const [sbStyle, setSbStyle] = useState('comic');
  const [sbOutputMode, setSbOutputMode] = useState('grid_3x2');
  const [sceneCount, setSceneCount] = useState(6);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [videoMode, setVideoMode] = useState<'text2video' | 'img2video' | 'firstlast'>('text2video');
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoRefImage, setVideoRefImage] = useState('');
  const [videoFirstFrame, setVideoFirstFrame] = useState('');
  const [videoLastFrame, setVideoLastFrame] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);
  const [videoAgent, setVideoAgent] = useState(false);

  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 3000); return () => clearTimeout(timer); } }, [toast]);
  const notify = useCallback((m: string) => setToast(m), []);

  const testAPI = useCallback(async () => {
    if (!config.apiKey || !config.baseURL) { notify('API Key 不能为空'); return; }
    setTesting(true); setTestMsg(null);
    try {
      const r = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: config.apiKey, apiSecret: config.apiSecret, baseURL: config.baseURL, model: config.model }) });
      const d = await r.json();
      if (d.success) { setTestMsg({ ok: true, text: '连接成功' }); notify('连接成功'); }
      else { setTestMsg({ ok: false, text: d.error || '连接失败' }); notify(d.error || '连接失败'); }
    } catch (e: any) { setTestMsg({ ok: false, text: e.message }); notify(e.message); }
    finally { setTesting(false); }
  }, [config, notify]);



  const handleProviderChange = useCallback((val: string) => {
    // Get models from PROVIDERS definition directly
    const providerItem = PROVIDERS.flatMap(g => g.items).find(it => it.value === val);
    const providerModels = providerItem?.models || [];
    
    if (providerModels.length) update({ baseURL: val, model: providerModels[0] });
    else update({ baseURL: val, model: '' });
    
    setModels(providerModels); setTestMsg(null);
  }, [update]);

  const analyze = useCallback(async () => {
    if (!script.trim() || !config.apiKey || !config.baseURL || !config.model) { notify('请填写剧本和 API 配置'); return; }
    setLoading('analyze'); setResult(null);
    try {
      const r = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script, apiKey: config.apiKey, baseURL: config.baseURL, model: config.model }) });
      const d = await r.json();
      if (d.error) { notify(d.error); return; }
      setResult(d.analysis || d); notify('分析完成');
    } catch (e: any) { notify(e.message); }
    finally { setLoading(null); }
  }, [script, config, notify]);

  const genStoryboard = useCallback(async () => {
    if (!script.trim() || !config.apiKey || !config.baseURL || !config.model) { notify('请填写剧本和 API 配置'); return; }
    setLoading('storyboard'); setResult(null);
    try {
      const r = await fetch('/api/storyboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script, style: sbStyle, outputMode: sbOutputMode, apiKey: config.apiKey, baseURL: config.baseURL, model: config.model }) });
      const d = await r.json();
      if (d.error) { notify(d.error); return; }
      setResult(d.storyboard); notify('分镜生成完成');
    } catch (e: any) { notify(e.message); }
    finally { setLoading(null); }
  }, [script, sbStyle, sbOutputMode, config, notify]);

  const genVideo = useCallback(async () => {
    if (!videoPrompt.trim() || !config.apiKey || !config.baseURL) { notify('请填写视频描述和 API 配置'); return; }
    setLoading('video'); setVideoResult(null);
    try {
      const r = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: videoPrompt, style: videoStyle, duration: videoDuration, mode: videoMode, referenceImage: videoRefImage, firstFrame: videoFirstFrame, lastFrame: videoLastFrame, agent: videoAgent, apiKey: config.apiKey, apiSecret: config.apiSecret, baseURL: config.baseURL, model: config.model }) });
      const d = await r.json();
      if (d.error) { notify(d.error); return; }
      setVideoResult(d.video); notify('视频生成完成');
    } catch (e: any) { notify(e.message); }
    finally { setLoading(null); }
  }, [videoPrompt, videoStyle, videoDuration, videoMode, videoRefImage, videoFirstFrame, videoLastFrame, videoAgent, config, notify]);

  const genImage = useCallback(async () => {
    if (!videoPrompt.trim() || !config.apiKey || !config.baseURL) { notify('请填写图片描述和 API 配置'); return; }
    setLoading('video'); setVideoResult(null);
    try {
      const r = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: videoPrompt, style: videoStyle, apiKey: config.apiKey, apiSecret: config.apiSecret, baseURL: config.baseURL, model: config.model }) });
      const d = await r.json();
      if (d.error) { notify(d.error); return; }
      setVideoResult(d); notify('图片生成完成');
    } catch (e: any) { notify(e.message); }
    finally { setLoading(null); }
  }, [videoPrompt, videoStyle, config, notify]);

  if (!ready) return <div className="min-h-screen bg-[var(--bg)]" />;
  const mi = getModelInfo(config.model);

  const TABS = [
    { id: 'analyze', label: t('nav.tabs.analyze'), icon: Icons.type },
    { id: 'storyboard', label: t('nav.tabs.storyboard'), icon: Icons.film },
    { id: 'video', label: '视频生成', icon: Icons.video },
    { id: 'settings', label: t('nav.tabs.settings'), icon: Icons.settings },
  ];

  const badgeTag = (tag: string) => tag === '图像' ? 'badge-image' : tag === '视频' ? 'badge-video' : tag === '代码' ? 'badge-code' : tag === '文本' ? 'badge-text' : 'badge-free';
  const badgeText = (tag: string) => tag === '图像' ? '图像' : tag === '视频' ? '视频' : tag === '代码' ? '代码' : tag === '免费' ? '免费' : tag;

  const THEMES_OPTIONS: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: t('settings.theme.system') },
    { value: 'light', label: t('settings.theme.light') },
    { value: 'dark', label: t('settings.theme.dark') },
    { value: 'eye-care', label: t('settings.theme.eye-care') },
  ];
  const LANG_OPTIONS: { value: Language; label: string }[] = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {toast && <div className="fixed top-4 right-4 z-50 animate-fadeIn card px-4 py-2.5 text-xs max-w-xs">{toast}</div>}

      <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold tracking-tight no-underline text-[var(--text)]">{t('site.name')}</Link>
            <div className="flex gap-0.5">
              {TABS.map(tb => (
                <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${tab === tb.id ? 'bg-[var(--bg-surface)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                  <span className="opacity-60">{tb.icon}</span>{tb.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {config.apiKey && config.baseURL && <span className="text-[10px] text-[var(--success)] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[var(--success)]" />{t('nav.connected')}</span>}
            <button onClick={() => setTab('settings')}>{Icons.settings}</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 animate-fadeIn">

        {/* ====== ANALYZE ====== */}
        {tab === 'analyze' && (
          <div className="animate-slideUp space-y-6">
            <div className="card p-5 space-y-4">
              <ClipTextArea value={script} onChange={setScript} placeholder={t('analyze.placeholder')} className="w-full" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)]">{script.length} {t('analyze.chars')}</span>
                <button onClick={analyze} disabled={loading === 'analyze' || !script.trim()} className="btn btn-primary text-xs">
                  {loading === 'analyze' ? t('analyze.loading') : t('analyze.button')}
                </button>
              </div>
            </div>
            {loading === 'analyze' && <div className="space-y-3"><div className="skeleton h-5 w-32" /><div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-3/4" /></div>}
            {result && loading !== 'analyze' && (
              <div className="space-y-4 animate-slideUp">
                {result.genre?.primaryGenre && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('analyze.genre')}</div>
                    <div className="flex gap-2"><span className="badge badge-text">{result.genre.primaryGenre}</span>{result.genre.subGenres?.map((g: string, i: number) => <span key={i} className="badge badge-code">{g}</span>)}</div></div>
                )}
                {result.characters?.list?.length > 0 && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('analyze.characters')}（{result.characters.list.length}）</div>
                    <div className="grid grid-cols-2 gap-2">{result.characters.list.map((c: any, i: number) => (
                      <div key={i} className="bg-[var(--bg-elevated)] rounded p-2.5"><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium">{c.name}</span><span className="badge badge-text text-[9px]">{c.role}</span></div>{c.description && <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{c.description}</p>}</div>
                    ))}</div></div>
                )}
                {result.directorMatch?.topRecommendation && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('analyze.director')}</div>
                    <div className="text-sm font-medium">{result.directorMatch.topRecommendation.name}</div>{result.directorMatch.topRecommendation.matchReason && <div className="text-[10px] text-[var(--text-secondary)] mt-1">{result.directorMatch.topRecommendation.matchReason}</div>}</div>
                )}
                {result.tone?.overallTone && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('analyze.tone')}</div>
                    <div className="text-sm">{result.tone.overallTone}</div>{result.tone.pace && <span className="badge badge-code mt-2">{result.tone.pace}</span>}</div>
                )}
                {result.conflicts?.mainConflict && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('analyze.conflict')}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{result.conflicts.mainConflict}</div></div>
                )}
                {result.suggestions?.length > 0 && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('analyze.suggestions')}</div>
                    <ul className="space-y-1.5">{result.suggestions.map((s: string, i: number) => <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-2"><span className="text-[var(--accent)]">·</span>{s}</li>)}</ul></div>
                )}
                {result.structure?.threeActStructure && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">剧本结构</div>
                    <div className="space-y-2 text-xs text-[var(--text-secondary)]">{Object.entries(result.structure.threeActStructure).map(([k, v]: [string, any]) => <div key={k}><span className="text-[var(--text)] font-medium">{k}</span>: {v}</div>)}</div></div>
                )}
                {result.visualStyle && (
                  <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">视觉风格</div>
                    <div className="text-xs text-[var(--text-secondary)]">{result.visualStyle}</div></div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== STORYBOARD ====== */}
        {tab === 'storyboard' && (
          <div className="animate-slideUp space-y-6">
            {!script.trim() && <div className="card p-4 text-xs text-[var(--text-secondary)]">{t('analyze.no-script')}</div>}
            <div className="card p-5 space-y-4">
              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">输出模式</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'text', label: '纯文字分镜', desc: '详细文字描述', icon: Icons.type },
                    { value: 'grid_2x2', label: '2×2 宫格', desc: '4 帧', icon: Icons.image },
                    { value: 'grid_3x2', label: '3×2 宫格', desc: '6 帧', icon: Icons.image },
                    { value: 'grid_3x3', label: '3×3 宫格', desc: '9 帧', icon: Icons.image },
                    { value: 'grid_4x3', label: '4×3 宫格', desc: '12 帧', icon: Icons.image },
                    { value: 'grid_5x5', label: '5×5 宫格', desc: '25 帧', icon: Icons.image },
                  ].map(m => (
                    <button key={m.value} onClick={() => setSbOutputMode(m.value)} className={`card p-2.5 text-center text-xs transition-colors ${sbOutputMode === m.value ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>
                      <div className="flex items-center justify-center gap-1">{m.icon}{m.label}</div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">分镜风格</label>
                <div className="grid grid-cols-3 gap-2">
                  {SB_STYLES.map(s => (
                    <button key={s.value} onClick={() => setSbStyle(s.value)} className={`card p-2.5 text-center text-xs transition-colors ${sbStyle === s.value ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>
                      <div className="flex items-center justify-center gap-1">{s.mode === 'image' ? Icons.image : Icons.type}{s.label}</div>
                      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={genStoryboard} disabled={loading === 'storyboard' || !script.trim()} className="btn btn-primary text-xs px-6">
                  {loading === 'storyboard' ? t('storyboard.loading') : t('storyboard.button')}
                </button>
              </div>
            </div>
            {loading === 'storyboard' && (
              <div className={result?.gridCols ? `grid gap-2 grid-cols-2 sm:grid-cols-${Math.min(result.gridCols, 4)}` : 'space-y-2'}>
                {Array.from({ length: result?.gridTotal || 6 }).map((_, i) => (
                  <div key={i} className="aspect-video skeleton rounded" />
                ))}
              </div>
            )}
            {result?.scenes && loading !== 'storyboard' && (
              <div className="animate-slideUp">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{result.title || t('storyboard.title')} · {result.scenes.length} 场景</div>
                  {result.gridLayout && <span className="badge badge-image text-[10px]">{result.gridLayout} · {result.visualStyle}</span>}
                </div>
                {sbOutputMode === 'text' ? (
                  <div className="space-y-3">
                    {result.scenes.map((s: StoryboardScene, i: number) => (
                      <div key={s.id || i} className="card p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">Scene {s.id || i + 1}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{s.shotType} · {s.duration}</span>
                        </div>
                        {s.visualDescription && <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{s.visualDescription}</p>}
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-muted)]">
                          {s.cameraMovement && <div><span className="text-[var(--text)]">机位运动:</span> {s.cameraMovement}</div>}
                          {s.cameraAngle && <div><span className="text-[var(--text)]">镜头角度:</span> {s.cameraAngle}</div>}
                          {s.lighting && <div><span className="text-[var(--text)]">光照条件:</span> {s.lighting}</div>}
                          {s.characterAction && <div className="col-span-2"><span className="text-[var(--text)]">角色动作:</span> {s.characterAction}</div>}
                          {s.mood && <div><span className="text-[var(--text)]">情绪氛围:</span> {s.mood}</div>}
                          {s.colorTone && <div><span className="text-[var(--text)]">色调:</span> {s.colorTone}</div>}
                        </div>
                        {s.dialogue && <div className="mt-2 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--accent)] italic">&ldquo;{s.dialogue}&rdquo;</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-2 ${result.gridCols === 2 ? 'grid-cols-2' : result.gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' : result.gridCols === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {result.scenes.map((s: StoryboardScene, i: number) => (
                      <div key={s.id || i} className="card overflow-hidden group">
                        <div className="aspect-video bg-[var(--bg-elevated)] relative flex items-center justify-center">
                          <span className="text-[9px] text-[var(--text-muted)] font-mono">#{s.id || i + 1} · {s.shotType?.split('/')[0]?.trim()}</span>
                        </div>
                        <div className="p-2.5 space-y-1">
                          {s.visualDescription && <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">{s.visualDescription}</p>}
                          {s.dialogue && <p className="text-[10px] text-[var(--accent)] italic line-clamp-1">&ldquo;{s.dialogue}&rdquo;</p>}
                          <div className="flex flex-wrap gap-1">
                            {s.mood && <span className="badge badge-image text-[9px]">{s.mood.split(',')[0]}</span>}
                            {s.colorTone && <span className="badge badge-code text-[9px]">{s.colorTone.split(',')[0]}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== VIDEO GENERATION ====== */}
        {tab === 'video' && (
          <div className="animate-slideUp space-y-6">
            <div className="card p-5 space-y-4">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">生成模式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'text2video', label: '文字生视频', icon: Icons.type },
                  { value: 'img2video', label: '图片生视频', icon: Icons.image },
                  { value: 'firstlast', label: '首尾帧生成', icon: Icons.film },
                ].map(m => (
                  <button key={m.value} onClick={() => setVideoMode(m.value as any)} className={`card p-2.5 text-center text-xs transition-colors flex flex-col items-center gap-1 ${videoMode === m.value ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>
                    <span className="opacity-60">{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">视频风格</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {VIDEO_STYLES.map(s => (
                    <button key={s.value} onClick={() => setVideoStyle(s.value)} className={`card p-1.5 text-center text-[10px] transition-colors ${videoStyle === s.value ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>
                      {s.label}<div className="text-[8px] text-[var(--text-muted)]">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">内容描述</label>
                <ClipTextArea value={videoPrompt} onChange={setVideoPrompt} placeholder={videoMode === 'firstlast' ? '描述视频内容和运动方式...' : '描述你想要的视频内容...'} className="w-full" />
              </div>

              {videoMode === 'img2video' && (
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">参考图片 URL</label>
                  <input value={videoRefImage} onChange={e => setVideoRefImage(e.target.value)} placeholder="https://..." className="input font-mono text-xs" />
                </div>
              )}
              {videoMode === 'firstlast' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">首帧图片 URL</label>
                    <input value={videoFirstFrame} onChange={e => setVideoFirstFrame(e.target.value)} placeholder="https://..." className="input font-mono text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">尾帧图片 URL</label>
                    <input value={videoLastFrame} onChange={e => setVideoLastFrame(e.target.value)} placeholder="https://..." className="input font-mono text-xs" />
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-end">
                <div className="w-28">
                  <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 block">时长(秒)</label>
                  <select value={videoDuration} onChange={e => setVideoDuration(Number(e.target.value))} className="input">{[3, 5, 8, 10, 15].map(n => <option key={n} value={n}>{n}s</option>)}</select>
                </div>
                <div className="flex-1 flex items-center gap-2 pb-1">
                  <input type="checkbox" checked={videoAgent} onChange={e => setVideoAgent(e.target.checked)} className="accent-[var(--accent)]" />
                  <label className="text-[10px] text-[var(--text-secondary)]">AI Agent 增强提示词</label>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={genVideo} disabled={loading === 'video' || !videoPrompt.trim()} className="btn btn-primary text-xs flex-1">
                  {loading === 'video' ? '生成中...' : '生成视频'}
                </button>
                <button onClick={genImage} disabled={loading === 'video' || !videoPrompt.trim()} className="btn text-xs border border-[var(--border)]">
                  生成图片
                </button>
              </div>
            </div>

            {loading === 'video' && <div className="card p-8 text-center"><div className="skeleton h-48 w-full max-w-md mx-auto" /><div className="text-xs text-[var(--text-muted)] mt-3">生成中，请稍候...</div></div>}
            {videoResult && loading !== 'video' && (
              <div className="animate-slideUp space-y-4">
                {videoResult.url && (
                  <div className="card overflow-hidden">
                    {videoResult.url.match(/\.(mp4|webm|mov)/i) ? (
                      <video src={videoResult.url} controls className="w-full" />
                    ) : (
                      <img src={videoResult.url} alt="生成结果" className="w-full" />
                    )}
                  </div>
                )}
                {videoResult.base64 && (
                  <div className="card overflow-hidden">
                    <img src={`data:image/png;base64,${videoResult.base64}`} alt="生成结果" className="w-full" />
                  </div>
                )}
                {videoResult.prompt && <div className="card p-4"><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">增强提示词</div><p className="text-xs text-[var(--text-secondary)]">{videoResult.prompt}</p></div>}
                {videoResult.message && <div className="card p-4 text-xs text-[var(--text-secondary)]">{videoResult.message}</div>}
              </div>
            )}
          </div>
        )}

        {/* ====== SETTINGS ====== */}
        {tab === 'settings' && (
          <div className="animate-slideUp space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('settings.theme')}</div>
                <div className="grid grid-cols-4 gap-2">{THEMES_OPTIONS.map(th => <button key={th.value} onClick={() => setTheme(th.value)} className={`card p-2.5 text-center text-xs transition-colors ${theme === th.value ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>{th.label}</button>)}</div></div>
              <div><div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('settings.language')}</div>
                <div className="grid grid-cols-2 gap-2">{LANG_OPTIONS.map(l => <button key={l.value} onClick={() => setLang(l.value)} className={`card p-2.5 text-center text-xs transition-colors ${lang === l.value ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]' : 'hover:border-[var(--border-hover)]'}`}>{l.label}</button>)}</div></div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t('settings.provider')}</div>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.flatMap(g => g.items.map(it => (
                  <button key={it.value} onClick={() => handleProviderChange(it.value)} className={`card p-3 flex items-center gap-3 transition-colors text-left ${config.baseURL === it.value ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'hover:border-[var(--border-hover)]'}`}>
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] flex-shrink-0">{it.icon}</div>
                    <div className="flex-1 min-w-0"><div className="text-xs font-medium">{it.label}</div>{it.tags.length > 0 && <div className="flex gap-1 mt-1">{it.tags.map(tag => <span key={tag} className={`badge ${badgeTag(tag)} text-[9px]`}>{badgeText(tag)}</span>)}</div>}</div>
                  </button>
                )))}
              </div>
            </div>

            {config.baseURL && (
              <div className="card p-5 space-y-4 animate-slideUp">
                <div><label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t('settings.apikey')}</label>
                  <input type="password" value={config.apiKey} onChange={e => update({ apiKey: e.target.value })} placeholder={t('settings.apikey.placeholder')} className="input font-mono" /></div>
                {config.baseURL.includes('liblibai') && (
                  <div><label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">SecretKey</label>
                    <input type="password" value={config.apiSecret || ''} onChange={e => update({ apiSecret: e.target.value })} placeholder="请输入 SecretKey" className="input font-mono" /></div>
                )}
                <div><label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">{t('settings.model')} {models.length > 0 && <span className="text-[var(--success)]">（{models.length}）</span>}</label>
                  {models.length > 0 ? (
                    <select value={config.model} onChange={e => update({ model: e.target.value })} className="input">
                      {(() => {
                        const { imageModels, videoModels, textModels, freeModels } = getModelsForProvider(config.baseURL);
                        const extra = models.filter(m => !MODEL_DATABASE.find(d => d.id === m));
                        const capBadge = (c: string) => c === 'image' ? 'badge-image' : c === 'video' ? 'badge-video' : c === 'code' ? 'badge-code' : 'badge-text';
                        const capLabel = (c: string) => c === 'image' ? '图像' : c === 'video' ? '视频' : c === 'code' ? '代码' : '文本';
                        const allSorted = [...videoModels, ...imageModels, ...textModels].sort((a, b) => a.name.length - b.name.length);
                        const freeSorted = freeModels.filter(m => !allSorted.find(s => s.id === m.id)).sort((a, b) => a.name.length - b.name.length);
                        return (<>
                          {videoModels.length > 0 && <optgroup label="视频">{videoModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
                          {imageModels.length > 0 && <optgroup label="图像">{imageModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
                          {textModels.length > 0 && <optgroup label="文本">{textModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
                          {freeSorted.length > 0 && <optgroup label="免费">{freeSorted.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
                          {extra.length > 0 && <optgroup label="其他">{extra.map(m => <option key={m} value={m}>{m}</option>)}</optgroup>}
                        </>);
                      })()}
                    </select>
                  ) : <input value={config.model} onChange={e => update({ model: e.target.value })} placeholder="gpt-4o / claude-sonnet-4 / gemini-2.0-flash" className="input font-mono" />}
                  {mi && (
                    <div className="p-3 bg-[var(--bg-elevated)] rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{mi.name}</span>
                        <div className="flex gap-1">
                          {mi.capabilities.map(c => <span key={c} className={`badge ${c === 'image' ? 'badge-image' : c === 'video' ? 'badge-video' : c === 'code' ? 'badge-code' : 'badge-text'} text-[9px]`}>{c === 'image' ? '图像' : c === 'video' ? '视频' : c === 'code' ? '代码' : '文本'}</span>)}
                          {mi.isFree && <span className="badge badge-free text-[9px]">免费</span>}
                        </div>
                      </div>
                      {mi.pricing && <div className="text-[10px] text-[var(--text-muted)]">{mi.pricing}</div>}
                      <p className="text-[10px] text-[var(--text-secondary)]">{mi.description}</p>
                    </div>
                  )}
                </div>
                <button onClick={testAPI} disabled={testing || !config.apiKey || !config.baseURL} className="btn btn-primary w-full text-xs">{testing ? t('settings.testing') : testMsg?.ok ? t('settings.connected') : testMsg ? t('settings.retry') : t('settings.test')}</button>
                {testMsg && <div className={`text-xs p-2.5 rounded text-center ${testMsg.ok ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--error)]/10 text-[var(--error)]'}`}>{testMsg.text}</div>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
