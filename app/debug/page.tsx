'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  });

  const testConnection = async () => {
    setLoading(true);
    setResult('正在测试连接...\n\n');
    
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ 连接成功！\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ 连接失败\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setResult(`❌ 请求异常: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#fff', marginBottom: '20px' }}>🔧 API连接调试工具</h1>
      
      <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3 style={{ color: '#00d9ff', marginTop: 0 }}>配置</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>API Base URL</label>
          <select 
            value={config.baseURL}
            onChange={(e) => setConfig({...config, baseURL: e.target.value})}
            style={{ width: '100%', padding: '10px', background: '#0f0f23', color: '#fff', border: '1px solid #444', borderRadius: '5px' }}
          >
            <optgroup label="🇨🇳 国内大模型（推荐）">
              <option value="https://api.deepseek.com/v1">🔴 DeepSeek (deepseek-chat)</option>
              <option value="https://api.moonshot.cn/v1">🟡 Moonshot Kimi</option>
              <option value="https://open.bigmodel.cn/api/paas/v4">🟤 智谱GLM-4</option>
              <option value="https://dashscope.aliyuncs.com/compatible-mode/v1">🟠 通义千问</option>
            </optgroup>
            <optgroup label="☁️ 国际主流">
              <option value="https://api.openai.com/v1">🟢 OpenAI (GPT-4o)</option>
              <option value="https://api.anthropic.com/v1">🟣 Anthropic Claude</option>
              <option value="https://generativelanguage.googleapis.com/v1beta">🔵 Google Gemini</option>
            </optgroup>
            <optgroup label="💻 本地部署">
              <option value="http://localhost:11434/v1">🦙 Ollama (本地)</option>
              <option value="http://localhost:1234/v1">🖥️ LM Studio (本地)</option>
              <option value="http://localhost:8000/v1">⚡ vLLM (本地)</option>
            </optgroup>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>API Key</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({...config, apiKey: e.target.value})}
            placeholder="sk-xxx 或 ollama可留空"
            style={{ width: '100%', padding: '10px', background: '#0f0f23', color: '#fff', border: '1px solid #444', borderRadius: '5px' }}
          />
          <small style={{ color: '#666' }}>{config.baseURL.includes(':11434') ? '⚠️ Ollama不需要真实Key，随意填写即可' : ''}</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>模型名称</label>
          <input
            type="text"
            value={config.model}
            onChange={(e) => setConfig({...config, model: e.target.value})}
            placeholder="选择URL后自动填充"
            style={{ width: '100%', padding: '10px', background: '#0f0f23', color: '#fff', border: '1px solid #444', borderRadius: '5px' }}
          />
        </div>

        <button
          onClick={testConnection}
          disabled={loading || !config.baseURL}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#666' : '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ 测试中...' : '🧪 测试连接'}
        </button>
      </div>

      <div style={{ background: '#0f0f23', padding: '20px', borderRadius: '10px' }}>
        <h3 style={{ color: '#00d9ff', marginTop: 0 }}>结果</h3>
        <pre style={{ 
          color: result.includes('✅') ? '#00ff88' : result.includes('❌') ? '#ff4444' : '#fff',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          fontSize: '13px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {result || '点击"测试连接"按钮开始...'}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#1a1a2e', borderRadius: '10px', borderLeft: '4px solid #7c3aed' }}>
        <h4 style={{ color: '#7c3aed', margin: '0 0 10px 0' }}>📖 使用说明</h4>
        <ul style={{ color: '#aaa', paddingLeft: '20px', margin: 0 }}>
          <li><strong>DeepSeek</strong>: 注册 → https://platform.deepseek.com/ → 获取API Key</li>
          <li><strong>Ollama本地</strong>: 安装 → brew install ollama → 运行 ollama serve → 下载模型 ollama pull llama3.2</li>
          <li><strong>其他服务商</strong>: 填入对应的API地址和Key即可</li>
        </ul>
      </div>
    </div>
  );
}
