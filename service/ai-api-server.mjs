import http from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const env = loadEnv(projectRoot)
const host = env.HOST || '0.0.0.0'
const port = Number(env.PORT || 5001)

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res, env)
  }
  catch (error) {
    if (!res.headersSent)
      sendJson(res, 500, fail(500, sanitizeError(error?.message || 'Internal server error')))
    else
      res.end()
  }
})

server.listen(port, host, () => {
  const provider = getAiProviderConfig(env)
  console.log(`[ai-api] listening on http://${host}:${port}`)
  console.log(`[ai-api] provider=${provider.provider} model=${provider.model || '(not configured)'}`)
})

function loadEnv(rootDir) {
  const fileEnv = {
    ...readEnvFile(path.join(rootDir, '.env')),
    ...readEnvFile(path.join(rootDir, '.env.local')),
  }

  return {
    ...fileEnv,
    ...process.env,
  }
}

function readEnvFile(filePath) {
  if (!existsSync(filePath))
    return {}

  const result = {}
  const raw = readFileSync(filePath, 'utf8')

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#'))
      continue

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex === -1)
      continue

    const key = trimmed.slice(0, equalIndex).trim()
    let value = trimmed.slice(equalIndex + 1).trim()

    if (!key)
      continue

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1)

    result[key] = value
  }

  return result
}

async function handleRequest(req, res, env) {
  setCommonHeaders(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const url = new URL(req.url || '/', 'http://localhost')
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  if (req.method === 'GET' && pathname === '/healthz') {
    sendJson(res, 200, ok({ status: 'ok', provider: getAiProviderConfig(env).provider }))
    return
  }

  if (pathname === '/api/session') {
    const provider = getAiProviderConfig(env)
    sendJson(res, 200, ok({
      auth: Boolean(env.AI_AUTH_TOKEN),
      model: 'ChatGPTAPI',
      amodel: provider.model,
      notify: env.AI_SESSION_NOTIFY || '',
      isCloseMdPreview: false,
      cmodels: provider.customModels,
    }))
    return
  }

  if (pathname === '/api/verify') {
    if (!env.AI_AUTH_TOKEN) {
      sendJson(res, 200, ok(true))
      return
    }

    const body = await readJsonBody(req)
    if (body.token === env.AI_AUTH_TOKEN)
      sendJson(res, 200, ok(true))
    else
      sendJson(res, 200, fail(401, 'Invalid token', false))
    return
  }

  if (pathname === '/api/system/model/modelList') {
    const models = getAiModels(env).map(model => ({
      modelName: model,
      modelDescribe: model,
      maxToken: 4096,
      modelCapability: '["TEXT"]',
      modelAbilities: [{ name: 'TEXT', description: 'Text chat' }],
    }))

    sendJson(res, 200, ok(models))
    return
  }

  if (pathname === '/api/chat-process') {
    await handleChatProcess(req, res, env)
    return
  }

  if (pathname === '/api/chat/send') {
    await handleChatSend(req, res, env)
    return
  }

  sendJson(res, 404, fail(404, `Not found: ${pathname}`))
}

async function handleChatProcess(req, res, env) {
  const body = await readJsonBody(req)
  const messages = [
    body.systemMessage && { role: 'system', content: body.systemMessage },
    body.prompt?.trim() && { role: 'user', content: body.prompt.trim() },
  ].filter(Boolean)

  if (!body.prompt?.trim()) {
    const provider = getAiProviderConfig(env)
    writeChatError(res, {
      conversationId: body.options?.conversationId || createId('conv'),
      parentMessageId: body.options?.parentMessageId || createId('parent'),
      messageId: createId('chat'),
      model: provider.model,
      text: 'Prompt is required.',
    })
    return
  }

  await proxyOpenAiChatCompletion(req, res, env, {
    model: getAiProviderConfig(env).model,
    stream: true,
    messages,
    temperature: body.temperature,
    top_p: body.top_p,
  }, {
    mode: 'json-line',
    conversationId: body.options?.conversationId,
    parentMessageId: body.options?.parentMessageId,
  })
}

async function handleChatSend(req, res, env) {
  const body = await readJsonBody(req)
  const provider = getAiProviderConfig(env)

  await proxyOpenAiChatCompletion(req, res, env, {
    ...body,
    model: resolveProviderModel(provider, body.model),
    stream: true,
    messages: body.messages || [],
  }, { mode: 'sse' })
}

async function proxyOpenAiChatCompletion(req, res, env, payload, options) {
  const provider = getAiProviderConfig(env)
  const model = payload.model || provider.model
  const conversationId = options.conversationId || createId('conv')
  const parentMessageId = options.parentMessageId || createId('parent')
  const messageId = createId('chat')
  const apiKey = provider.apiKey

  if (!apiKey) {
    writeProxyError(res, options.mode, { conversationId, parentMessageId, messageId, model, text: 'AI_API_KEY 未配置。请在服务器 .env 或环境变量中配置非 VITE_ 前缀的模型 Key。' })
    return
  }

  if (!payload.messages?.length) {
    writeProxyError(res, options.mode, { conversationId, parentMessageId, messageId, model, text: 'Messages are required.' })
    return
  }

  const baseUrl = normalizeBaseUrl(provider.baseUrl)
  const controller = new AbortController()
  let streamStarted = false
  let responseEnded = false

  res.on('close', () => {
    if (!responseEnded)
      controller.abort()
  })

  try {
    const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        max_tokens: payload.max_tokens,
        model,
        temperature: payload.temperature,
        top_p: payload.top_p,
        presence_penalty: payload.presence_penalty,
        frequency_penalty: payload.frequency_penalty,
        messages: payload.messages,
        stream: true,
      }),
      signal: controller.signal,
    })

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => '')
      writeProxyError(res, options.mode, {
        conversationId,
        parentMessageId,
        messageId,
        model,
        text: `Provider request failed: ${upstream.status} ${upstream.statusText}${errorText ? ` - ${sanitizeError(errorText)}` : ''}`,
      })
      return
    }

    streamStarted = true
    res.statusCode = 200
    res.setHeader('Content-Type', options.mode === 'sse' ? 'text/event-stream; charset=utf-8' : 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let accumulatedText = ''
    let hasFinalChunk = false

    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const data = line.trim().replace(/^data:\s*/, '')
        if (!data)
          continue

        if (data === '[DONE]') {
          writeProxyDone(res, options.mode, { conversationId, parentMessageId, messageId, model, text: accumulatedText })
          hasFinalChunk = true
          continue
        }

        try {
          const chunk = JSON.parse(data)
          const choice = chunk.choices?.[0]
          const text = choice?.delta?.content || choice?.delta?.reasoning_content || choice?.text || ''
          const finishReason = choice?.finish_reason ?? null

          if (!text && !finishReason)
            continue

          accumulatedText += text
          writeProxyChunk(res, options.mode, {
            conversationId,
            parentMessageId,
            messageId: chunk.id || messageId,
            model: chunk.model || model,
            text: accumulatedText,
            deltaText: text,
            finishReason,
            upstream: chunk,
            choice,
          })
        }
        catch {
          // Ignore non-JSON heartbeat lines from providers.
        }
      }
    }

    if (!hasFinalChunk)
      writeProxyDone(res, options.mode, { conversationId, parentMessageId, messageId, model, text: accumulatedText })

    responseEnded = true
    res.end()
  }
  catch (error) {
    if (error?.name === 'AbortError')
      return

    if (streamStarted) {
      writeProxyChunk(res, options.mode, {
        conversationId,
        parentMessageId,
        messageId,
        model,
        text: `请求失败：${sanitizeError(error?.message || 'Provider stream error')}`,
        deltaText: `请求失败：${sanitizeError(error?.message || 'Provider stream error')}`,
        finishReason: 'stop',
      })
      responseEnded = true
      res.end()
      return
    }

    writeProxyError(res, options.mode, {
      conversationId,
      parentMessageId,
      messageId,
      model,
      text: `Provider request failed: ${sanitizeError(error?.message || 'Unknown error')}`,
    })
  }
}

function writeChatError(res, { conversationId, parentMessageId, messageId, model, text }) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  writeChatChunk(res, createChatChunk({ conversationId, parentMessageId, messageId, model, text, finishReason: 'stop' }))
  res.end()
}

function writeProxyError(res, mode, payload) {
  res.statusCode = 200
  res.setHeader('Content-Type', mode === 'sse' ? 'text/event-stream; charset=utf-8' : 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  writeProxyChunk(res, mode, { ...payload, deltaText: payload.text, finishReason: 'stop' })
  res.end()
}

function writeProxyChunk(res, mode, payload) {
  if (mode === 'sse') {
    const chunk = createOpenAIChunk(payload)
    res.write(`data: ${JSON.stringify(chunk)}\n\n`)
    return
  }

  writeChatChunk(res, createChatChunk(payload))
}

function writeProxyDone(res, mode, payload) {
  if (mode === 'sse') {
    res.write('data: [DONE]\n\n')
    return
  }

  writeChatChunk(res, createChatChunk({ ...payload, finishReason: 'stop' }))
}

function createOpenAIChunk({ messageId, model, deltaText, finishReason, upstream, choice }) {
  return {
    id: upstream?.id || messageId,
    object: upstream?.object || 'chat.completion.chunk',
    created: upstream?.created || Math.floor(Date.now() / 1000),
    model: upstream?.model || model,
    choices: [{
      index: choice?.index ?? 0,
      delta: deltaText ? { content: deltaText } : {},
      logprobs: choice?.logprobs ?? null,
      finish_reason: finishReason,
    }],
    usage: upstream?.usage,
  }
}

function createChatChunk({ conversationId, parentMessageId, messageId, model, text, finishReason, upstream, choice }) {
  return {
    conversationId,
    id: messageId,
    parentMessageId,
    role: 'assistant',
    text,
    detail: {
      id: upstream?.id || messageId,
      object: upstream?.object || 'chat.completion.chunk',
      created: upstream?.created || Math.floor(Date.now() / 1000),
      model: upstream?.model || model,
      choices: [{
        text,
        index: choice?.index ?? 0,
        logprobs: choice?.logprobs ?? null,
        finish_reason: finishReason,
      }],
      usage: {
        completion_tokens: upstream?.usage?.completion_tokens || 0,
        prompt_tokens: upstream?.usage?.prompt_tokens || 0,
        total_tokens: upstream?.usage?.total_tokens || 0,
      },
    },
  }
}

function writeChatChunk(res, chunk) {
  res.write(`${JSON.stringify(chunk)}\n`)
}

function getAiProviderConfig(env) {
  const provider = (env.AI_PROVIDER || 'deepseek').toLowerCase()

  if (provider === 'siliconflow') {
    const model = env.SILICONFLOW_MODEL || env.AI_MODEL || ''
    return {
      provider: 'siliconflow',
      apiKey: env.SILICONFLOW_API_KEY || env.AI_API_KEY,
      baseUrl: env.SILICONFLOW_API_BASE_URL || env.AI_API_BASE_URL || 'https://api.siliconflow.cn',
      model,
      customModels: env.SILICONFLOW_CUSTOM_MODELS || env.AI_CUSTOM_MODELS || model,
    }
  }

  const model = env.DEEPSEEK_MODEL || env.AI_MODEL || ''
  return {
    provider: 'deepseek',
    apiKey: env.DEEPSEEK_API_KEY || env.AI_API_KEY,
    baseUrl: env.DEEPSEEK_API_BASE_URL || env.AI_API_BASE_URL || 'https://api.deepseek.com',
    model,
    customModels: env.DEEPSEEK_CUSTOM_MODELS || env.AI_CUSTOM_MODELS || model,
  }
}

function resolveProviderModel(provider, requestedModel) {
  return requestedModel || provider.model
}

function getAiModels(env) {
  const provider = getAiProviderConfig(env)
  const models = provider.customModels || provider.model
  return models.split(',').map(model => model.trim()).filter(Boolean)
}

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, '')
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''

    req.on('data', chunk => {
      raw += chunk
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Request body too large'))
        req.destroy()
      }
    })

    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      }
      catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function ok(data) {
  return { code: 200, msg: 'success', data, rows: [] }
}

function fail(code, msg, data = null) {
  return { code, msg, data, rows: [] }
}

function sanitizeError(message) {
  return String(message).replace(/Bearer\s+[\w.-]+/gi, 'Bearer ***')
}

function setCommonHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', env.CORS_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-ptoken')
}
