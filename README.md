# RuoYi-Web

[English](./README_EN.md) | 简体中文

一个基于 Vue 3 + Vite + TypeScript 的 AI 聊天应用前端，支持 ChatGPT 风格对话、Midjourney 等多种 AI 功能。

本项目现在包含两部分：

1. **前端静态应用**：通过 Vite 打包生成 `dist`
2. **生产 API 服务**：通过 `service/ai-api-server.mjs` 读取服务器 API Key，并转发请求到 DeepSeek / SiliconFlow

本地开发时，Vite dev server 会处理部分 `/api` 接口；生产部署时，需要启动 Node API 服务，并让 nginx 把 `/api/*` 转发到 Node 服务。

---

## ✨ 功能特性

- 🤖 **AI 对话** - 支持多轮对话和流式回复
- 🎨 **Midjourney 绘图** - AI 图像生成和编辑
- 🎵 **语音功能** - 语音识别和文字转语音
- 📱 **响应式设计** - 支持桌面端和移动端
- 🌍 **国际化** - 多语言支持
- 🎨 **主题切换** - 明暗主题切换

---

## 🛠️ 技术栈

- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI 组件**：Naive UI + Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router
- **样式**：TailwindCSS + Less
- **图标**：Iconify
- **生产 API 服务**：Node.js 原生 `http` + `fetch`

---

## 📋 环境要求

- **Node.js**：建议 `>= 18.0.0`
  - 生产 API 服务使用 Node 内置 `fetch`，Node 版本太低会启动失败
- **包管理器**：使用 `npm`
- **生产部署推荐**：nginx + pm2

---

## 🚀 本地快速开始

### 1. 下载项目

```bash
git clone https://github.com/atao90/ai-chart
cd ai-chart
```

如果你的目录名不是 `ai-chart`，进入你实际的项目目录即可。

### 2. 安装依赖

```bash
npm install
```

如果 npm 下载慢，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 3. 配置环境变量

项目根目录的 `.env` 至少需要保留：

```env
# 前端请求基础路径。本地开发和生产部署都保持 /api。
VITE_GLOB_API_URL=/api

# 是否支持长回复
VITE_GLOB_OPEN_LONG_REPLY=false

# 是否启用 PWA
VITE_GLOB_APP_PWA=false
```

模型 API Key 不能使用 `VITE_` 前缀。`VITE_` 变量会进入前端打包产物，可能暴露在浏览器里。

推荐使用 DeepSeek：

```env
AI_PROVIDER=deepseek

DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=你的key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_CUSTOM_MODELS=deepseek-v4-flash,deepseek-v4-pro
```

也支持 SiliconFlow：

```env
AI_PROVIDER=siliconflow

SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn
SILICONFLOW_API_KEY=你的key
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3
SILICONFLOW_CUSTOM_MODELS=deepseek-ai/DeepSeek-V3,deepseek-ai/DeepSeek-R1
```

可选配置：

```env
# 是否开启访问口令。为空表示不校验。
AI_AUTH_TOKEN=

# 首页通知文案。为空表示不显示。
AI_SESSION_NOTIFY=

# Node API 服务端口，默认 5001。
PORT=5001
```

### 4. 本地开发启动前端

```bash
npm run dev
```

对应 [package.json](./package.json) 中的脚本：

```json
"dev": "vite"
```

本地开发时，Vite dev server 会处理以下接口：

```txt
/api/session
/api/verify
/api/system/model/modelList
/api/chat-process
/api/chat/send
```

### 5. 本地启动生产 API 服务测试

如果你想在本地单独测试 Node API 服务：

```bash
npm run api:start
```

对应 [package.json](./package.json) 中的脚本：

```json
"api:start": "node service/ai-api-server.mjs"
```

服务默认监听：

```txt
http://0.0.0.0:5001
```

测试：

```bash
curl http://127.0.0.1:5001/healthz
curl -X POST http://127.0.0.1:5001/api/session
```

---

## 📦 npm 脚本说明

当前 [package.json](./package.json) 中的脚本如下：

```json
{
  "dev": "vite",
  "build": "run-p build-only",
  "preview": "vite preview",
  "api:start": "node service/ai-api-server.mjs",
  "start": "node service/ai-api-server.mjs",
  "build-only": "vite build",
  "type-check": "vue-tsc --noEmit",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

### `npm run dev`

启动 Vite 本地开发服务。

适用场景：本地开发、调试页面。

```bash
npm run dev
```

### `npm run build`

生产环境打包命令。

它会执行 `run-p build-only`，最终调用：

```bash
vite build
```

生成目录：

```txt
dist/
```

生产部署时，nginx 的 `root` 应该指向这个 `dist` 目录。

```bash
npm run build
```

### `npm run build-only`

直接执行 Vite 打包：

```bash
npm run build-only
```

一般情况下使用 `npm run build` 即可。

### `npm run preview`

本地预览 `dist` 静态产物：

```bash
npm run preview
```

注意：`preview` 只预览前端静态文件，不等于生产部署。生产部署还需要 Node API 服务处理 `/api/*`。

### `npm run api:start`

启动生产 API 服务：

```bash
npm run api:start
```

它会运行：

```bash
node service/ai-api-server.mjs
```

默认端口：

```txt
5001
```

生产环境推荐用 pm2 后台运行这个服务。

### `npm run start`

和 `npm run api:start` 一样，也是启动 Node API 服务：

```bash
npm run start
```

### `npm run type-check`

执行 TypeScript 类型检查：

```bash
npm run type-check
```

### `npm run lint`

执行 ESLint 检查：

```bash
npm run lint
```

### `npm run lint:fix`

自动修复部分 ESLint 问题：

```bash
npm run lint:fix
```

---

## 🧩 生产部署说明

### Q：只上传 `dist` 可以吗？

不建议。

现在生产环境需要：

1. `dist`：前端静态文件
2. `service/ai-api-server.mjs`：Node API 服务
3. `.env`：服务器 API Key 配置
4. `package.json`：用于安装依赖和启动脚本

所以推荐把整个项目上传到服务器，不上传 `node_modules`。

推荐服务器目录：

```bash
/home/web/ai-chart
```

nginx 访问：

```bash
/home/web/ai-chart/dist
```

Node 服务运行：

```bash
/home/web/ai-chart/service/ai-api-server.mjs
```

### 生产部署步骤

#### 1. 上传项目

把项目上传到服务器：

```bash
/home/web/ai-chart
```

确保服务器上结构类似：

```txt
/home/web/ai-chart/package.json
/home/web/ai-chart/.env
/home/web/ai-chart/service/ai-api-server.mjs
/home/web/ai-chart/src
/home/web/ai-chart/vite.config.ts
```

#### 2. 安装依赖

```bash
cd /home/web/ai-chart
npm install --registry=https://registry.npmmirror.com
```

#### 3. 打包前端

使用 [package.json](./package.json) 中的打包命令：

```bash
npm run build
```

打包成功后会生成：

```txt
/home/web/ai-chart/dist
```

#### 4. 测试 Node API 服务

```bash
npm run api:start
```

看到类似输出表示启动成功：

```txt
[ai-api] listening on http://0.0.0.0:5001
[ai-api] provider=deepseek model=deepseek-v4-flash
```

另开一个终端测试：

```bash
curl http://127.0.0.1:5001/healthz
curl -X POST http://127.0.0.1:5001/api/session
curl http://127.0.0.1:5001/api/system/model/modelList
```

测试成功后，按 `Ctrl + C` 停掉临时服务。

#### 5. 用 pm2 后台启动 Node API 服务

```bash
npm install -g pm2
cd /home/web/ai-chart
pm2 start service/ai-api-server.mjs --name ai-chart-api
pm2 save
```

查看状态：

```bash
pm2 list
```

查看日志：

```bash
pm2 logs ai-chart-api
```

#### 6. 配置开机自启

```bash
pm2 startup
```

执行命令后，pm2 会输出一条 `sudo env ...` 命令，把那条命令复制出来再执行一遍。

然后再次保存：

```bash
pm2 save
```

#### 7. 配置 nginx

示例配置：

```nginx
server {
    listen 8001;
    server_name 117.72.58.153;

    keepalive_requests 120;
    charset utf-8;

    root /home/web/ai-chart/dist;

    location / {
        index index.html;
        try_files $uri $uri/ @router;
    }

    location /api/ {
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;

        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection "";
        add_header X-Accel-Buffering no;

        proxy_connect_timeout 60s;
        proxy_send_timeout 1200s;
        proxy_read_timeout 1200s;

        proxy_pass http://127.0.0.1:5001;
    }

    location @router {
        rewrite ^.*$ /index.html last;
    }

    location ~ .*\.(html)$ {
        add_header Cache-Control no-cache;
        add_header Pragma no-cache;
    }

    error_page 500 502 503 504 /50x.html;
}
```

注意：`proxy_pass` 这里不要写最后的 `/`。

正确：

```nginx
proxy_pass http://127.0.0.1:5001;
```

错误：

```nginx
proxy_pass http://127.0.0.1:5001/;
```

如果写了最后的 `/`，nginx 可能会把 `/api/` 前缀去掉，导致 `/api/system/model/modelList` 转发成 `/system/model/modelList`，从而接口 404。

#### 8. 检查并重载 nginx

```bash
nginx -t
nginx -s reload
```

如果使用 systemctl：

```bash
systemctl reload nginx
```

#### 9. 浏览器验证

打开：

```txt
http://117.72.58.153:8001
```

浏览器 Network 中应看到请求：

```txt
/api/session
/api/system/model/modelList
/api/chat-process
```

不应该再请求：

```txt
web.pandarobot.chat
```

也不应该在浏览器请求中看到 DeepSeek / SiliconFlow 的 API Key。

---

## 🔁 后续更新代码

### 只改前端代码

```bash
cd /home/web/ai-chart
npm run build
nginx -s reload
```

### 改了 Node API 服务

```bash
cd /home/web/ai-chart
pm2 restart ai-chart-api
```

### 改了 `.env` 中的 API Key 或模型配置

```bash
cd /home/web/ai-chart
pm2 restart ai-chart-api
```

### 改了依赖

```bash
cd /home/web/ai-chart
npm install --registry=https://registry.npmmirror.com
npm run build
pm2 restart ai-chart-api
```

---

## ✅ 第一次部署简化命令

```bash
cd /home/web/ai-chart

npm install --registry=https://registry.npmmirror.com

npm run build

npm install -g pm2

pm2 start service/ai-api-server.mjs --name ai-chart-api

pm2 save

nginx -t

nginx -s reload
```

测试：

```bash
curl http://127.0.0.1:5001/healthz
curl -X POST http://127.0.0.1:5001/api/session
curl http://127.0.0.1:5001/api/system/model/modelList
```

---

## 📁 项目结构

```text
ai-chart/
├── public/                    # 静态资源
├── service/
│   └── ai-api-server.mjs      # 生产 Node API 服务
├── src/
│   ├── api/                   # 前端 API 请求模块
│   ├── assets/                # 资源文件
│   ├── components/            # 公共组件
│   ├── hooks/                 # 组合式函数
│   ├── locales/               # 国际化
│   ├── router/                # 路由配置
│   ├── store/                 # 状态管理
│   ├── styles/                # 样式文件
│   ├── utils/                 # 工具函数
│   ├── views/                 # 页面组件
│   └── main.ts                # 入口文件
├── dist/                      # npm run build 后生成的前端静态产物
├── index.html                 # Vite 入口 HTML
├── vite.config.ts             # Vite 本地开发和构建配置
├── package.json               # npm 脚本和依赖
└── 部署问答.md                 # 更详细的部署问答
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

本项目基于 MIT 许可证开源。

## 👨‍💻 作者

- **atao** - [396416959@qq.com](396416959@qq.com)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
