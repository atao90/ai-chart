# RuoYi-Web

[English](./README_EN.md) | 简体中文

一个基于 Vue 3 + Vite + TypeScript 的本地运行 AI 聊天应用前端，支持 ChatGPT、Midjourney 等多种 AI 功能。

## ✨ 功能特性

- 🤖 **ChatGPT 对话** - 支持多轮对话，智能回复
- 🎨 **Midjourney 绘图** - AI 图像生成和编辑
- 🎵 **语音功能** - 语音识别和文字转语音
- 📱 **响应式设计** - 支持桌面端和移动端
- 🌍 **国际化** - 多语言支持
- 🎨 **主题切换** - 明暗主题切换

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Naive UI + Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: TailwindCSS + Less
- **图标**: Iconify
- **PWA**: Vite PWA Plugin

## 📋 环境要求

- **Node.js**: >= 16.0.0
- **pnpm**: 推荐使用 pnpm 安装和运行项目

## 🚀 快速开始

### 下载项目

```bash
git clone https://gitee.com/ageerle/ruoyi-web
cd ruoyi-web
```

### 安装依赖

```bash
pnpm install
```

### 配置本地环境

项目保留 `VITE_GLOB_API_URL=/api`，本地开发时由 Vite dev server 内置代理处理聊天接口。根目录 `.env` 只放前端安全变量：

```env
# 前端请求基础路径，本地由 Vite dev server 处理 /api
VITE_GLOB_API_URL=/api

# 是否支持长回复
VITE_GLOB_OPEN_LONG_REPLY=false

# 是否启用 PWA
VITE_GLOB_APP_PWA=false
```

真实模型 API Key 请放在不会提交的 `.env.local` 中，不要使用 `VITE_` 前缀：

```env
# DeepSeek 示例
AI_API_BASE_URL=https://api.deepseek.com
AI_API_KEY=replace-with-your-rotated-key
AI_MODEL=deepseek-v4-flash
AI_CUSTOM_MODELS=deepseek-v4-flash,deepseek-v4-pro

# 硅基流动示例
# AI_API_BASE_URL=https://api.siliconflow.cn
# AI_API_KEY=replace-with-your-rotated-key
# AI_MODEL=deepseek-ai/DeepSeek-V3
# AI_CUSTOM_MODELS=deepseek-ai/DeepSeek-V3,deepseek-ai/DeepSeek-R1
```

本地代理当前覆盖 `/api/session`、`/api/verify`、`/api/chat-process` 和 `/api/system/model/modelList`，用于恢复基础文本聊天能力。上传、绘图、语音、知识库等仍需要对应后端能力。

### 运行项目

```bash
pnpm dev
```

项目将在 `http://localhost:1002` 启动。

### 打包构建

```bash
pnpm build
```

### 预览构建产物

```bash
pnpm preview
```

注意：`pnpm preview` 只预览静态构建产物，不会运行 Vite dev server 的本地 AI 代理。如果构建产物仍使用 `/api` 作为请求前缀，预览或部署环境需要同源后端或额外代理实现相同接口。

## 📦 可用脚本

```bash
# 开发环境启动
pnpm dev

# 生产环境构建
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 自动修复代码格式
pnpm lint:fix
```

## 📁 项目结构

```text
ruoyi-web/
├── public/                 # 静态资源
├── src/
│   ├── api/                # 前端 API 请求模块
│   ├── assets/             # 资源文件
│   ├── components/         # 公共组件
│   ├── hooks/              # 组合式函数
│   ├── locales/            # 国际化
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   └── main.ts             # 入口文件
├── index.html              # Vite 入口 HTML
├── vite.config.ts          # Vite 本地开发和构建配置
└── package.json
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

本项目基于 MIT 许可证开源。

## 👨‍💻 作者

- **ageer** - [ageerle@163.com](mailto:ageerle@163.com)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
