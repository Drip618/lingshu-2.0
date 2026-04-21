// AI API 配置管理
// 支持多种大模型API接口

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
  enabled: boolean;
}

export interface AIConfig {
  providers: {
    openai?: AIProviderConfig;
    anthropic?: AIProviderConfig;
    google?: AIProviderConfig;
    custom?: AIProviderConfig[];
  };
  defaultProvider: string;
}

// 默认配置
const DEFAULT_CONFIG: AIConfig = {
  providers: {
    custom: []
  },
  defaultProvider: 'custom'
};

// 获取AI配置（从环境变量或localStorage）
export function getAIConfig(): AIConfig {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lingshu_ai_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('解析AI配置失败:', e);
      }
    }
  }

  // 尝试从环境变量读取（服务端）
  if (process.env.OPENAI_API_KEY) {
    return {
      providers: {
        openai: {
          name: 'OpenAI',
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: 'https://api.openai.com/v1',
          model: 'gpt-4-turbo-preview',
          enabled: true
        }
      },
      defaultProvider: 'openai'
    };
  }

  return DEFAULT_CONFIG;
}

// 保存AI配置
export function saveAIConfig(config: AIConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lingshu_ai_config', JSON.stringify(config));
  }
}

// 通用的AI API调用函数
export async function callAI(
  prompt: string,
  systemPrompt?: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    provider?: string;
  }
): Promise<string> {
  const config = getAIConfig();
  const providerName = options?.provider || config.defaultProvider;

  let provider: AIProviderConfig | undefined;

  if (providerName === 'openai') {
    provider = config.providers.openai;
  } else if (providerName === 'anthropic') {
    provider = config.providers.anthropic;
  } else if (providerName === 'google') {
    provider = config.providers.google;
  } else if (providerName === 'custom' && (config.providers.custom?.length ?? 0) > 0) {
    provider = config.providers.custom![0];
  }

  if (!provider || !provider.apiKey || !provider.enabled) {
    throw new Error(`未配置有效的AI提供商: ${providerName}`);
  }

  try {
    // OpenAI格式API
    if (provider.baseURL.includes('openai.com') ||
        provider.baseURL.includes('api.openai')) {
      return await callOpenAICompatible(provider, prompt, systemPrompt, options);
    }

    // Anthropic Claude API
    if (provider.baseURL.includes('anthropic.com')) {
      return await callAnthropic(provider, prompt, systemPrompt, options);
    }

    // Google Gemini API
    if (provider.baseURL.includes('googleapis.com') ||
        provider.baseURL.includes('generativelanguage')) {
      return await callGoogleGemini(provider, prompt, systemPrompt, options);
    }

    // 默认尝试OpenAI兼容格式
    return await callOpenAICompatible(provider, prompt, systemPrompt, options);

  } catch (error) {
    console.error(`AI API调用失败 (${providerName}):`, error);
    throw new Error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// OpenAI兼容格式API调用（支持大多数国内大模型）
async function callOpenAICompatible(
  provider: AIProviderConfig,
  prompt: string,
  systemPrompt?: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${provider.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Anthropic Claude API调用
async function callAnthropic(
  provider: AIProviderConfig,
  prompt: string,
  systemPrompt?: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const response = await fetch(`${provider.baseURL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: options?.maxTokens || 4096,
      messages: [
        { role: 'user', content: prompt }
      ],
      ...(systemPrompt ? { system: systemPrompt } : {})
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// Google Gemini API调用
async function callGoogleGemini(
  provider: AIProviderConfig,
  prompt: string,
  systemPrompt?: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const contents = [];
  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: `System instruction: ${systemPrompt}` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood.' }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const url = `${provider.baseURL}/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}
