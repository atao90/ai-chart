# RuoYi-Web

English | [简体中文](./README.md)

A Vue 3 + Vite + TypeScript AI chat application frontend, supporting ChatGPT-style conversations, Midjourney and other AI features.

This project now contains two parts:

1. **Frontend static app**: built by Vite into `dist`
2. **Production API service**: `service/ai-api-server.mjs`, which reads server-side API keys and forwards requests to DeepSeek / SiliconFlow

During local development, the Vite dev server handles some `/api` endpoints. In production, you need to start the Node API service and configure nginx to proxy `/api/*` to that service.

---

## ✨ Features

- 🤖 **AI Conversations** - Multi-turn conversations with streaming responses
- 🎨 **Midjourney Drawing** - AI image generation and editing
- 🎵 **Voice Features** - Speech recognition and text-to-speech
- 📱 **Responsive Design** - Desktop and mobile support
- 🌍 **Internationalization** - Multi-language support
- 🎨 **Theme Switching** - Light and dark theme toggle

---

## 🛠️ Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Naive UI + Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: TailwindCSS + Less
- **Icons**: Iconify
- **Production API Service**: Native Node.js `http` + `fetch`

---

## 📋 Requirements

- **Node.js**: recommended `>= 18.0.0`
  - The production API service uses Node's built-in `fetch`; older Node versions may fail to start.
- **Package Manager**: `npm`
- **Recommended Production Stack**: nginx + pm2

---

## 🚀 Local Quick Start

### 1. Download Project

```bash
git clone https://github.com/atao90/ai-chart
cd ai-chart
```

If your local folder name is different, enter your actual project directory.

### 2. Install Dependencies

```bash
npm install
```

If npm is slow in your environment, you can use a mirror:

```bash
npm install --registry=https://registry.npmmirror.com
```

### 3. Configure Environment Variables

The root `.env` file should at least keep:

```env
# Frontend API base path. Keep /api in both local development and production.
VITE_GLOB_API_URL=/api

# Whether long replies are supported.
VITE_GLOB_OPEN_LONG_REPLY=false

# Whether to enable PWA.
VITE_GLOB_APP_PWA=false
```

Model API keys must not use the `VITE_` prefix. `VITE_` variables are bundled into frontend assets and may be visible in the browser.

Recommended DeepSeek configuration:

```env
AI_PROVIDER=deepseek

DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=your-key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_CUSTOM_MODELS=deepseek-v4-flash,deepseek-v4-pro
```

SiliconFlow is also supported:

```env
AI_PROVIDER=siliconflow

SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn
SILICONFLOW_API_KEY=your-key
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3
SILICONFLOW_CUSTOM_MODELS=deepseek-ai/DeepSeek-V3,deepseek-ai/DeepSeek-R1
```

Optional variables:

```env
# Optional access token. Empty means no token verification.
AI_AUTH_TOKEN=

# Optional homepage/session notification text.
AI_SESSION_NOTIFY=

# Node API service port. Defaults to 5001.
PORT=5001
```

### 4. Start Frontend Development Server

```bash
npm run dev
```

This uses the script from [package.json](./package.json):

```json
"dev": "vite"
```

During local development, the Vite dev server handles these endpoints:

```txt
/api/session
/api/verify
/api/system/model/modelList
/api/chat-process
/api/chat/send
```

### 5. Test the Production API Service Locally

To start the standalone Node API service locally:

```bash
npm run api:start
```

This uses the script from [package.json](./package.json):

```json
"api:start": "node service/ai-api-server.mjs"
```

The service listens on:

```txt
http://0.0.0.0:5001
```

Test it with:

```bash
curl http://127.0.0.1:5001/healthz
curl -X POST http://127.0.0.1:5001/api/session
```

---

## 📦 npm Scripts

Current scripts in [package.json](./package.json):

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

Starts the Vite development server.

Use this for local development and page debugging.

```bash
npm run dev
```

### `npm run build`

Builds the frontend for production.

It runs `run-p build-only`, which eventually calls:

```bash
vite build
```

Output directory:

```txt
dist/
```

In production, nginx should use this `dist` directory as its static root.

```bash
npm run build
```

### `npm run build-only`

Runs the Vite build directly:

```bash
npm run build-only
```

Usually, `npm run build` is enough.

### `npm run preview`

Previews the static `dist` output locally:

```bash
npm run preview
```

Note: `preview` only serves frontend static files. It is not the same as production deployment. Production also needs the Node API service for `/api/*`.

### `npm run api:start`

Starts the production API service:

```bash
npm run api:start
```

It runs:

```bash
node service/ai-api-server.mjs
```

Default port:

```txt
5001
```

In production, it is recommended to run this service with pm2.

### `npm run start`

Same as `npm run api:start`; it starts the Node API service:

```bash
npm run start
```

### `npm run type-check`

Runs TypeScript type checking:

```bash
npm run type-check
```

### `npm run lint`

Runs ESLint checks:

```bash
npm run lint
```

### `npm run lint:fix`

Automatically fixes some ESLint issues:

```bash
npm run lint:fix
```

---

## 🧩 Production Deployment

### Q: Can I upload only `dist`?

Not recommended.

Production now needs:

1. `dist`: frontend static files
2. `service/ai-api-server.mjs`: Node API service
3. `.env`: server-side API key configuration
4. `package.json`: scripts and dependencies

So it is recommended to upload the whole project to the server, excluding `node_modules`.

Recommended server directory:

```bash
/home/web/ai-chart
```

nginx serves:

```bash
/home/web/ai-chart/dist
```

Node API service runs:

```bash
/home/web/ai-chart/service/ai-api-server.mjs
```

### Production Steps

#### 1. Upload Project

Upload the project to:

```bash
/home/web/ai-chart
```

Make sure the server structure looks like:

```txt
/home/web/ai-chart/package.json
/home/web/ai-chart/.env
/home/web/ai-chart/service/ai-api-server.mjs
/home/web/ai-chart/src
/home/web/ai-chart/vite.config.ts
```

#### 2. Install Dependencies

```bash
cd /home/web/ai-chart
npm install --registry=https://registry.npmmirror.com
```

#### 3. Build Frontend

Use the build command from [package.json](./package.json):

```bash
npm run build
```

After a successful build, this directory will be generated:

```txt
/home/web/ai-chart/dist
```

#### 4. Test Node API Service

```bash
npm run api:start
```

Expected output:

```txt
[ai-api] listening on http://0.0.0.0:5001
[ai-api] provider=deepseek model=deepseek-v4-flash
```

Open another terminal and test:

```bash
curl http://127.0.0.1:5001/healthz
curl -X POST http://127.0.0.1:5001/api/session
curl http://127.0.0.1:5001/api/system/model/modelList
```

After testing, press `Ctrl + C` to stop the temporary service.

#### 5. Start Node API Service with pm2

```bash
npm install -g pm2
cd /home/web/ai-chart
pm2 start service/ai-api-server.mjs --name ai-chart-api
pm2 save
```

Check status:

```bash
pm2 list
```

Check logs:

```bash
pm2 logs ai-chart-api
```

#### 6. Configure Auto Startup

```bash
pm2 startup
```

pm2 will print a `sudo env ...` command. Copy and run that command.

Then save again:

```bash
pm2 save
```

#### 7. Configure nginx

Example configuration:

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

Important: do not add a trailing `/` to `proxy_pass`.

Correct:

```nginx
proxy_pass http://127.0.0.1:5001;
```

Wrong:

```nginx
proxy_pass http://127.0.0.1:5001/;
```

If you add the trailing `/`, nginx may strip the `/api/` prefix. For example, `/api/system/model/modelList` may be forwarded as `/system/model/modelList`, causing a 404.

#### 8. Test and Reload nginx

```bash
nginx -t
nginx -s reload
```

If nginx is managed by systemctl:

```bash
systemctl reload nginx
```

#### 9. Verify in Browser

Open:

```txt
http://117.72.58.153:8001
```

In the browser Network panel, you should see requests such as:

```txt
/api/session
/api/system/model/modelList
/api/chat-process
```

It should no longer request:

```txt
web.pandarobot.chat
```

Your DeepSeek / SiliconFlow API key should not appear in browser requests.

---

## 🔁 Updating Code Later

### Frontend-only changes

```bash
cd /home/web/ai-chart
npm run build
nginx -s reload
```

### Node API service changes

```bash
cd /home/web/ai-chart
pm2 restart ai-chart-api
```

### `.env` API key or model configuration changes

```bash
cd /home/web/ai-chart
pm2 restart ai-chart-api
```

### Dependency changes

```bash
cd /home/web/ai-chart
npm install --registry=https://registry.npmmirror.com
npm run build
pm2 restart ai-chart-api
```

---

## ✅ First Deployment Short Command List

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

Test:

```bash
curl http://127.0.0.1:5001/healthz
curl -X POST http://127.0.0.1:5001/api/session
curl http://127.0.0.1:5001/api/system/model/modelList
```

---

## 📁 Project Structure

```text
ai-chart/
├── public/                    # Static assets
├── service/
│   └── ai-api-server.mjs      # Production Node API service
├── src/
│   ├── api/                   # Frontend API request modules
│   ├── assets/                # Asset files
│   ├── components/            # Common components
│   ├── hooks/                 # Composition functions
│   ├── locales/               # Internationalization
│   ├── router/                # Router configuration
│   ├── store/                 # State management
│   ├── styles/                # Style files
│   ├── utils/                 # Utility functions
│   ├── views/                 # Page components
│   └── main.ts                # Entry file
├── dist/                      # Frontend static output generated by npm run build
├── index.html                 # Vite entry HTML
├── vite.config.ts             # Vite local development and build config
├── package.json               # npm scripts and dependencies
└── 部署问答.md                 # More detailed deployment Q&A
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome to improve the project.

## 📄 License

This project is open source under the MIT License.

## 👨‍💻 Author

- **atao** - [396416959@qq.com](396416959@qq.com)

---

⭐ If this project helps you, please give it a star!
