# 灵枢 Lingshu 2.0 完整使用手册

> 🎬 让 AI 成为你的副导演 —— 专业影视创作工作流系统

---

## 📖 目录

1. [项目简介](#项目简介)
2. [快速开始](#快速开始)
3. [功能详解](#功能详解)
   - [剧本分析](#剧本分析)
   - [分镜生成](#分镜生成)
   - [图像生成](#图像生成)
   - [视频生成](#视频生成)
4. [AI 平台配置](#ai-平台配置)
5. [项目结构](#项目结构)
6. [开发指南](#开发指南)
7. [部署方案](#部署方案)
8. [常见问题](#常见问题)

---

## 项目简介

灵枢是一款基于 Next.js 构建的专业影视创作 AI 工作流系统。它集成了剧本分析、导演风格匹配、分镜生成、图像生成和视频生成等功能，为影视创作者提供从剧本到视觉呈现的完整 AI 辅助工具链。

### 核心特性

- **智能剧本分析**：自动提取类型、情感基调、角色关系、冲突分析
- **导演风格匹配**：内置 20+ 位世界知名导演风格数据库
- **专业分镜生成**：支持多种宫格布局，电影级术语自动应用
- **多平台图像生成**：LiblibAI / OpenAI DALL-E / Google Imagen / 智谱 CogView / 通义万相
- **视频生成**：文字生视频 / 图片生视频 / 首尾帧动画
- **10+ AI 平台支持**：OpenAI / Anthropic / Google / DeepSeek / Moonshot / 智谱 / 通义千问 / OpenRouter / LiblibAI / Ollama
- **主题系统**：4 种主题模式（系统/浅色/深色/护眼）
- **国际化**：支持中文和英文界面

---

## 快速开始

### 环境要求

- **Node.js**：18.0 或更高版本
- **包管理器**：npm / yarn / pnpm（推荐 npm）
- **浏览器**：Chrome / Edge / Safari（推荐最新版）

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Drip618/lingshu-2.0.git
cd lingshu-2.0

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

启动成功后，访问 http://localhost:3000/dashboard 打开应用界面。

### 首次配置

1. 打开应用后，点击右上角 **⚙️ 设置** 图标
2. 在"AI 服务提供商"中选择你的 AI 平台
3. 填写对应的 API Key（部分平台需要 SecretKey）
4. 选择要使用的模型
5. 点击 **测试连接** 验证配置是否成功

---

## 功能详解

### 剧本分析

#### 使用方法

1. 进入 **📊 剧本分析** 面板
2. 在文本框中粘贴或输入你的剧本内容
3. 点击 **开始分析**

#### 分析结果包含

| 模块 | 内容说明 |
|------|----------|
| **概览** | 剧本类型、情感基调、主题分析、三幕式结构 |
| **角色提取** | 角色名称、性格特征、关系图谱 |
| **冲突分析** | 主要冲突类型、紧张度曲线、冲突解决方式 |
| **拍摄建议** | 镜头风格推荐、美术设计、色彩基调、场景布置 |
| **导演风格匹配** | 推荐最适合的导演及其拍摄风格 |
| **对白质量** | 对白风格评估、改进建议 |
| **创作改进** | 结构优化建议、角色深化建议 |

#### 使用技巧

- 剧本内容建议至少 500 字以上，分析结果更准确
- 支持中文和英文剧本
- 分析结果会自动保存到当前项目配置中

### 分镜生成

#### 使用方法

1. 进入 **🎬 分镜** 面板
2. 选择分镜风格（漫画 / 电影 / 概念艺术 / 动漫 / 影视）
3. 选择输出模式（纯文字 / 2×2 / 3×2 / 3×3 / 4×3 / 5×5）
4. 可选：上传参考图片启用图生分镜模式
5. 点击 **开始生成**

#### 输出模式说明

| 模式 | 适用场景 | 图片数量 |
|------|----------|----------|
| **纯文字** | 快速预览，不需要生成图片 | 0 |
| **2×2** | 简单场景，4 个分镜 | 4 |
| **3×2** | 标准场景，6 个分镜 | 6 |
| **3×3** | 复杂场景，9 个分镜 | 9 |
| **4×3** | 大型场景，12 个分镜 | 12 |
| **5×5** | 完整场景，25 个分镜 | 25 |

#### 专业术语自动应用

系统会自动在生成的分镜中应用以下电影级术语：

- **镜头类型**：Extreme Close-up, Medium Close-up, Wide Shot, Establishing Shot, Two Shot, Over-the-shoulder
- **机位运动**：Pan, Tilt, Dolly, Truck, Zoom, Crane
- **光照条件**：Golden Hour, Rembrandt Lighting, Hard Side Light, Soft Diffused, Backlit Silhouette, Chiaroscuro

### 图像生成

#### 使用方法

1. 进入 **🖼️ 图像** 面板
2. 输入图片描述（Prompt）
3. 选择艺术风格（10 种可选）
4. 选择输出尺寸
5. 可选：上传参考图片启用图生图模式
6. 点击 **开始生成**

#### 支持的平台

| 平台 | 模型 | 特点 |
|------|------|------|
| **LiblibAI** | Star-3, SDXL, SD 1.5 | 国产图像平台，质量高 |
| **OpenAI** | DALL-E 3 | 理解能力强，细节好 |
| **Google** | Imagen 3 | 免费额度，速度快 |
| **智谱** | CogView | 国产免费，中文优化 |
| **通义千问** | 通义万相 | 国产免费，风格多样 |

#### 艺术风格一览

| 风格 | 适用场景 |
|------|----------|
| **电影质感** | 专业影视项目 |
| **动漫** | 动画风格项目 |
| **写实** | 真实感需求 |
| **油画** | 艺术感项目 |
| **水彩** | 柔和风格 |
| **概念设计** | 前期概念图 |
| **像素** | 复古游戏风 |
| **3D渲染** | 现代科技感 |
| **素描** | 草图风格 |
| **复古胶片** | 怀旧风格 |

### 视频生成

#### 使用方法

1. 进入 **🎥 视频** 面板
2. 选择生成模式（文字生视频 / 图片生视频 / 首尾帧动画）
3. 输入视频描述或上传参考图片
4. 选择视频风格
5. 可选：启用 AI Agent 提示词优化
6. 点击 **开始生成**

#### 生成模式说明

| 模式 | 输入要求 | 说明 |
|------|----------|------|
| **文字生视频** | 文字描述 | AI 根据描述生成视频 |
| **图片生视频** | 文字 + 图片 | 以图片为基础生成动态视频 |
| **首尾帧动画** | 起始帧 + 结束帧 | AI 自动补全中间过渡 |

#### 视频风格

支持 10 种视频风格：电影质感、动漫、写实、3D动画、像素、水彩、油画、赛博朋克、复古、极简。

> ⚠️ **注意**：LiblibAI 是图像生成平台，不支持视频生成。如需视频生成，请使用 OpenAI、Kling 等支持视频的平台。

---

## AI 平台配置

### 各平台 API 配置指南

#### OpenAI

| 配置项 | 值 |
|--------|------|
| Base URL | `https://api.openai.com/v1` |
| API Key | `sk-proj-xxxxxxxxxx` |
| 模型 | gpt-4o-mini, gpt-4o |
| 图像 | DALL-E 3（自动识别） |

获取地址：https://platform.openai.com/api-keys

#### Anthropic (Claude)

| 配置项 | 值 |
|--------|------|
| Base URL | `https://api.anthropic.com` |
| API Key | `sk-ant-xxxxxxxxxx` |
| 模型 | claude-3-5-sonnet-latest, claude-3-opus-latest |

获取地址：https://console.anthropic.com/settings/keys

#### Google Gemini

| 配置项 | 值 |
|--------|------|
| Base URL | `https://generativelanguage.googleapis.com/v1beta` |
| API Key | `AIzaSy-xxxxxxxxxx` |
| 模型 | gemini-2.0-flash, gemini-1.5-flash, gemini-2.5-pro |

获取地址：https://aistudio.google.com/apikey

#### DeepSeek

| 配置项 | 值 |
|--------|------|
| Base URL | `https://api.deepseek.com` |
| API Key | `sk-xxxxxxxxxx` |
| 模型 | deepseek-chat, deepseek-coder |

获取地址：https://platform.deepseek.com/api_keys

#### Moonshot (Kimi)

| 配置项 | 值 |
|--------|------|
| Base URL | `https://api.moonshot.cn/v1` |
| API Key | `sk-xxxxxxxxxx` |
| 模型 | moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k |

获取地址：https://platform.moonshot.cn/console/api-keys

#### 智谱 AI

| 配置项 | 值 |
|--------|------|
| Base URL | `https://open.bigmodel.cn/api/paas/v4` |
| API Key | `{ID}.{SECRET}`（格式：点号分隔） |
| 模型 | glm-4-flash, glm-4-air, glm-4 |
| 图像 | CogView（自动识别） |

获取地址：https://open.bigmodel.cn/usercenter/api-keys

#### 通义千问

| 配置项 | 值 |
|--------|------|
| Base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| API Key | `sk-xxxxxxxxxx` |
| 模型 | qwen-turbo, qwen-plus, qwen-max |
| 图像 | 通义万相（自动识别） |

获取地址：https://bailian.console.aliyun.com/?apiKey=1

#### OpenRouter

| 配置项 | 值 |
|--------|------|
| Base URL | `https://openrouter.ai/api/v1` |
| API Key | `sk-or-v1-xxxxxxxxxx` |
| 模型 | openai/gpt-4o-mini, google/gemini-2.0-flash-001, meta-llama/llama-3.1-8b-instruct:free |

获取地址：https://openrouter.ai/keys

#### LiblibAI (哩布哩布)

| 配置项 | 值 |
|--------|------|
| Base URL | `https://openapi.liblibai.cloud` |
| API Key | 你的 AccessKey |
| 模型 | star-3, sdxl, sd-v1-5 |
| 说明 | 图像生成平台，不支持文本对话和视频 |

获取地址：https://www.liblibai.cloud/

#### Ollama (本地部署)

| 配置项 | 值 |
|--------|------|
| Base URL | `http://localhost:11434/v1` |
| API Key | `ollama`（任意值即可） |
| 模型 | llama3.1, mistral, qwen2.5 |

获取地址：https://ollama.ai

### 测试连接

配置完成后，点击 **测试连接** 按钮。系统会：

1. 向 API 发送一个简短的测试请求
2. 验证 API Key 是否有效
3. 返回可用的模型列表
4. 自动切换到第一个可用模型

---

## 项目结构

```
灵枢_2.0/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由（服务端）
│   │   ├── ai/test/          # AI 连接测试端点
│   │   ├── analyze/          # 剧本分析端点
│   │   ├── assets/           # 资产管理端点
│   │   ├── filesystem/       # 文件系统端点
│   │   ├── image/            # 图像生成端点
│   │   ├── libtv/image/      # LiblibAI 图像生成端点
│   │   ├── pdf/              # PDF 导出端点
│   │   ├── projects/         # 项目管理端点
│   │   ├── storyboard/       # 分镜生成端点
│   │   ├── upload/           # 文件上传端点
│   │   └── video/            # 视频生成端点
│   ├── dashboard/            # 主控制台页面
│   ├── favicon.ico           # 网站图标
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局组件
│   └── page.tsx              # 首页
├── components/               # React 组件
│   └── Icons.tsx            # SVG 图标库
├── hooks/                    # React Hooks
│   ├── useAIConfig.ts       # AI 配置管理 Hook
│   ├── useI18n.ts           # 国际化 Hook
│   └── useTheme.ts          # 主题切换 Hook
├── lib/                      # 核心工具库
│   ├── ai-client.ts         # AI 客户端封装（支持多平台）
│   ├── ai-config.ts         # AI 配置管理（localStorage）
│   └── model-database.ts    # 模型数据库（提供商/模型/能力）
├── projects/                 # 项目数据存储目录
├── public/                   # 静态资源
│   ├── file.svg             # 文件图标
│   ├── globe.svg            # 地球图标
│   ├── next.svg             # Next.js Logo
│   ├── vercel.svg           # Vercel Logo
│   └── window.svg           # 窗口图标
├── .env.example             # 环境变量模板
├── .gitignore               # Git 忽略规则
├── LICENSE                  # MIT 许可证
├── README.md                # 项目说明
├── eslint.config.mjs        # ESLint 配置
├── next.config.ts           # Next.js 配置
├── package.json             # 项目依赖
├── package-lock.json        # 依赖锁定文件
├── postcss.config.mjs       # PostCSS 配置
└── tsconfig.json            # TypeScript 配置
```

---

## 开发指南

### 开发环境搭建

```bash
# 1. 克隆项目
git clone https://github.com/Drip618/lingshu-2.0.git
cd lingshu-2.0

# 2. 安装依赖
npm install

# 3. 启动开发服务器（热重载）
npm run dev

# 4. 访问应用
# http://localhost:3000
```

### 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查（Lint）
npm run lint

# 类型检查
npx tsc --noEmit
```

### 添加新的 AI 平台

1. 在 `lib/model-database.ts` 中添加新的提供商：

```typescript
export const PROVIDERS: ProviderGroup[] = [
  // ... 现有提供商
  {
    name: '新平台',
    icon: 'new-provider',
    items: [{
      value: 'https://api.new-provider.com/v1',
      models: ['model-1', 'model-2'],
      tags: ['text', 'code'],
      description: '新平台描述'
    }]
  }
]
```

2. 在 `lib/ai-client.ts` 中添加 API 适配逻辑（如果需要特殊协议）

3. 在 `components/Icons.tsx` 中添加新平台的图标

### 添加新的功能模块

1. 在 `app/api/` 下创建新的 API 路由
2. 在 `app/dashboard/page.tsx` 中添加对应的 UI 面板
3. 使用 `useAIConfig` Hook 获取 AI 配置

---

## 部署方案

### 方案一：Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
vercel --prod
```

或在 GitHub 仓库设置中连接 Vercel，自动部署。

### 方案二：Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t lingshu-2.0 .

# 运行容器
docker run -p 3000:3000 lingshu-2.0
```

### 方案三：独立服务器

```bash
# 1. 构建
npm run build

# 2. 启动（使用 PM2 管理进程）
pm2 start npm --name "lingshu" -- start -p 3000
```

---

## 常见问题

### Q: 测试连接失败，显示 404 错误？

A: 检查以下几点：
1. API Key 是否正确（注意不要有多余空格）
2. Base URL 是否正确
3. 网络是否可以访问该 API 端点（国内可能需要代理）
4. 部分平台需要特殊格式（如智谱 AI 的 API Key 格式为 `{ID}.{SECRET}`）

### Q: 图像生成一直加载或失败？

A: 可能原因：
1. API 额度不足
2. 网络超时（图像生成通常较慢）
3. 提示词过长或包含违规内容
4. LiblibAI 需要 AccessKey 和 SecretKey 两个值

### Q: 视频生成不支持 LiblibAI？

A: 这是预期行为。LiblibAI 是图像生成平台，不支持视频生成。如需视频生成，请使用 OpenAI、Kling 等支持视频的平台。

### Q: 如何保存我的配置？

A: 所有配置自动保存在浏览器 localStorage 中，刷新页面后配置仍然有效。如需清除，点击设置面板中的清除按钮。

### Q: 支持哪些浏览器？

A: 支持所有现代浏览器：
- Chrome 90+
- Edge 90+
- Safari 14+
- Firefox 88+

### Q: 可以在手机上使用吗？

A: 可以。界面响应式设计，支持手机浏览器访问，但建议使用电脑以获得最佳体验。

### Q: 数据安全吗？

A: 是的。所有 API Key 仅存储在你的浏览器 localStorage 中，不会上传到任何服务器。所有 AI API 调用通过服务端代理，不会暴露你的 Key 到前端。

### Q: 如何贡献代码？

A: 欢迎贡献！请：
1. Fork 本仓库
2. 创建功能分支
3. 提交 Pull Request
4. 详细描述你的改动

---

## 更新日志

### v2.0.0 (2026-04-22)

- 完整重构为 Next.js 16 + React 18 架构
- 支持 10+ AI 平台
- 新增剧本深度分析功能
- 新增分镜生成功能
- 新增图像生成功能
- 新增视频生成功能
- 新增主题系统（4 种模式）
- 新增国际化支持（中/英）
- 优化 UI 设计

---

**灵枢** - 让 AI 成为你的副导演 🎬

如有问题或建议，请提交 [Issue](https://github.com/Drip618/lingshu-2.0/issues) 或 [Pull Request](https://github.com/Drip618/lingshu-2.0/pulls)。
