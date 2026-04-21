import React from 'react';
import Link from 'next/link';
import { Icons } from '../components/Icons';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-sm font-bold text-white">灵</span>
            </div>
            <span className="text-base font-semibold">灵枢</span>
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">AI影视创作</span>
          </div>
          <Link href="/dashboard" className="btn btn-primary">
            {Icons.sparkles}
            <span>进入工作台</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="text-center max-w-2xl" style={{ animation: 'fadeIn 0.6s ease' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            连接AI模型，开始创作
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            用AI重新定义
            <br />
            <span className="text-[var(--accent)]">影视创作流程</span>
          </h1>

          <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
            上传剧本，AI自动分析角色、冲突、风格；一键生成宫格分镜；支持OpenAI、Gemini、DeepSeek、Ollama等任意模型。
          </p>

          <Link href="/dashboard" className="btn btn-primary text-sm">
            开始使用
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full mt-20" style={{ animation: 'slideUp 0.6s ease 0.2s both' }}>
          {[
            { icon: Icons.type, title: '智能剧本分析', desc: 'AI深度分析剧本，提取角色、冲突、情感基调' },
            { icon: Icons.film, title: '宫格分镜生成', desc: '根据剧本自动生成专业宫格分镜图' },
            { icon: Icons.zap, title: '任意模型接入', desc: '支持OpenAI/Claude/Gemini/DeepSeek/Ollama' }
          ].map((item, i) => (
            <div key={i} className="card p-5 hover:border-[var(--border-hover)] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center mb-3 text-[var(--text-secondary)]">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-5 text-center text-xs text-[var(--text-muted)]">
        灵枢 · AI影视创作系统
      </footer>
    </div>
  );
}
