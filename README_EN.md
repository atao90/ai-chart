# RuoYi-Web

English | [简体中文](./README.md)

A local Vue 3 + Vite + TypeScript AI chat application frontend, supporting ChatGPT, Midjourney and other AI features.

## ✨ Features

- 🤖 **ChatGPT Conversations** - Multi-turn dialogues with intelligent responses
- 🎨 **Midjourney Drawing** - AI image generation and editing
- 🎵 **Voice Features** - Speech recognition and text-to-speech
- 📱 **Responsive Design** - Desktop and mobile support
- 🌍 **Internationalization** - Multi-language support
- 🎨 **Theme Switching** - Light and dark theme toggle

## 🛠️ Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Naive UI + Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: TailwindCSS + Less
- **Icons**: Iconify
- **PWA**: Vite PWA Plugin

## 📋 Requirements

- **Node.js**: >= 16.0.0
- **pnpm**: recommended for installing dependencies and running scripts

## 🚀 Quick Start

### Download Project

```bash
git clone https://github.com/ageerle/ruoyi-web
cd ruoyi-web
```

### Install Dependencies

```bash
pnpm install
```

### Configure Local Environment

The project keeps `VITE_GLOB_API_URL=/api`. During local development, the Vite dev server handles the chat API proxy. The root `.env` file should only contain frontend-safe variables:

```env
# Frontend API base path. Locally, the Vite dev server handles /api.
VITE_GLOB_API_URL=/api

# Whether long replies are supported.
VITE_GLOB_OPEN_LONG_REPLY=false

# Whether to enable PWA.
VITE_GLOB_APP_PWA=false
```

Put real model API keys in `.env.local`, which should not be committed. Do not use the `VITE_` prefix for secrets:

```env
# DeepSeek example
AI_API_BASE_URL=https://api.deepseek.com
AI_API_KEY=replace-with-your-rotated-key
AI_MODEL=deepseek-v4-flash
AI_CUSTOM_MODELS=deepseek-v4-flash,deepseek-v4-pro

# SiliconFlow example
# AI_API_BASE_URL=https://api.siliconflow.cn
# AI_API_KEY=replace-with-your-rotated-key
# AI_MODEL=deepseek-ai/DeepSeek-V3
# AI_CUSTOM_MODELS=deepseek-ai/DeepSeek-V3,deepseek-ai/DeepSeek-R1
```

The local proxy currently covers `/api/session`, `/api/verify`, `/api/chat-process` and `/api/system/model/modelList` to restore basic text chat. Uploads, drawing, voice and knowledge-base features still need corresponding backend services.

### Run Project

```bash
pnpm dev
```

The project will start at `http://localhost:1002`.

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

Note: `pnpm preview` only previews the static build output. It does not run the Vite dev server local AI proxy. If the build still uses `/api` as the request prefix, the preview or deployment environment needs a same-origin backend or an extra proxy implementing the same endpoints.

## 📦 Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm type-check

# Lint code
pnpm lint

# Auto-fix code formatting
pnpm lint:fix
```

## 📁 Project Structure

```text
ruoyi-web/
├── public/                 # Static assets
├── src/
│   ├── api/                # Frontend API request modules
│   ├── assets/             # Asset files
│   ├── components/         # Common components
│   ├── hooks/              # Composition functions
│   ├── locales/            # Internationalization
│   ├── router/             # Router configuration
│   ├── store/              # State management
│   ├── styles/             # Style files
│   ├── utils/              # Utility functions
│   ├── views/              # Page components
│   └── main.ts             # Entry file
├── index.html              # Vite entry HTML
├── vite.config.ts          # Vite local development and build config
└── package.json
```

## 🤝 Contributing

Issues and Pull Requests are welcome to improve the project.

## 📄 License

This project is open source under the MIT License.

## 👨‍💻 Author

- **ageer** - [ageerle@163.com](mailto:ageerle@163.com)

---

⭐ If this project helps you, please give it a star!
