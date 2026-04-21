# 灵枢 Lingshu 2.0 - AI 影视创作工作流系统

灵枢是一款基于 Next.js 构建的专业影视创作 AI 工作流系统。它集成了剧本分析、导演风格匹配、分镜生成、图像生成和视频生成等功能，为影视创作者提供从剧本到视觉呈现的完整 AI 辅助工具链。

![灵枢 Logo](./public/next.svg)

## ✨ 核心功能

### 📊 剧本分析
- **深度内容解析**: 自动提取剧本类型、情感基调、角色关系、冲突分析
- **导演风格匹配**: 基于 20+ 位世界知名导演的风格数据库，智能推荐最适合的导演手法
- **专业拍摄建议**: 提供拍摄风格、美术设计、分镜镜头等专业指导
- **结构分析**: 三幕式结构识别、对白质量评估、创作改进建议

### 🎬 分镜生成
- **多种输出模式**: 纯文字分镜 / 2×2 / 3×2 / 3×3 / 4×3 / 5×5 宫格布局
- **专业风格**: 漫画 / 电影 / 概念艺术 / 动漫 / 影视等多种分镜风格
- **电影级术语**: 自动应用标准镜头类型、机位运动、光照条件等专业参数

### 🖼️ 图像生成
- **多平台支持**: LiblibAI (哩布哩布) / OpenAI DALL-E / Google Imagen / 智谱 CogView / 通义万相
- **10 种艺术风格**: 电影质感 / 动漫 / 写实 / 油画 / 水彩 / 概念设计 / 像素 / 3D渲染 / 素描 / 复古胶片
- **智能提示词增强**: 自动添加专业摄影术语和风格标签

### 🎥 视频生成
- **多模式生成**: 文字生视频 / 图片生视频 / 首尾帧动画
- **10 种视频风格**: 电影质感 / 动漫 / 写实 / 3D动画 / 像素 / 水彩 / 油画 / 赛博朋克 / 复古 / 极简
- **AI Agent 增强**: 可选 AI 提示词优化，生成更专业的视频描述

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm / yarn / pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/lingshu.git
cd lingshu

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000/dashboard 打开应用界面。

### 配置 AI API

在应用的"设置"页面配置：

1. 选择 AI 服务提供商（支持 10+ 主流平台）
2. 填写 API Key（部分平台需要 SecretKey）
3. 选择模型
4. 点击"测试连接"验证配置

### 支持的 AI 平台

| 平台 | 类型 | 能力 | 备注 |
|------|------|------|------|
| OpenAI | 文本 / 图像 | GPT-4o, DALL-E 3 | 国际主流 |
| Anthropic | 文本 | Claude 3.5/4 | 国际主流 |
| Google | 文本 / 图像 | Gemini 2.0/2.5 | 免费额度 |
| DeepSeek | 文本 / 代码 | DeepSeek V3 | 国产性价比 |
| Moonshot | 文本 | Kimi | 国产长上下文 |
| 智谱 | 文本 / 图像 | GLM-4, CogView | 国产免费 |
| 通义千问 | 文本 / 图像 | Qwen, 通义万相 | 国产免费 |
| OpenRouter | 文本 | 多模型聚合 | 多合一网关 |
| LiblibAI | 图像 | Star-3, SDXL | 国产图像平台 |
| Ollama | 文本 | 本地部署 | 完全免费 |

## 📁 项目结构

```
灵枢_2.0/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── ai/test/       # AI 连接测试
│   │   ├── analyze/       # 剧本分析
│   │   ├── image/         # 图像生成
│   │   ├── video/         # 视频生成
│   │   └── storyboard/    # 分镜生成
│   ├── dashboard/         # 主控制台
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── Icons.tsx         # SVG 图标库
├── hooks/                 # React Hooks
│   ├── useAIConfig.ts    # AI 配置管理
│   ├── useI18n.ts        # 国际化
│   └── useTheme.ts       # 主题切换
├── lib/                   # 核心库
│   ├── ai-client.ts      # AI 客户端
│   ├── model-database.ts # 模型数据库
│   └── ai-config.ts      # 配置管理
└── public/               # 静态资源
```

## 🎨 主题系统

支持 4 种主题模式：
- 系统自动（跟随系统）
- 浅色模式
- 深色模式
- 护眼模式

## 🌍 国际化

支持中文和英文界面。

## 🔧 开发指南

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 📄 技术栈

- **前端**: Next.js 16+, React 18, TypeScript
- **样式**: Tailwind CSS, CSS Variables
- **AI 集成**: 多平台 API 适配层
- **架构**: App Router, Server Components, Client Components
- **部署**: Vercel, Docker, 独立服务器

## 🔐 安全说明

- **API Key 存储**: 所有 API Key 仅存储在浏览器 localStorage 中，不会上传到服务器
- **服务端代理**: 所有 AI API 调用通过服务端代理，避免 CORS 问题
- **无硬编码密钥**: 项目中不包含任何硬编码的 API Key 或 Secret

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

感谢所有提供灵感的导演和电影理论家，以及所有 AI 平台提供的强大创作能力。

---

**灵枢** - 让 AI 成为你的副导演 🎬
