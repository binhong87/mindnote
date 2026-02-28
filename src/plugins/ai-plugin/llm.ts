export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openrouter'

export interface AIPluginSettings {
  provider: AIProvider
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
}

export const DEFAULT_SETTINGS: AIPluginSettings = {
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2048,
}

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  ollama: ['llama3.2', 'mistral', 'phi3', 'custom'],
  openrouter: ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro', 'custom'],
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  ollama: 'Ollama (Local)',
  openrouter: 'OpenRouter',
}

export async function callLLM(
  settings: AIPluginSettings,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const { provider, apiKey, baseUrl, model, temperature, maxTokens } = settings

  if (provider !== 'ollama' && !apiKey) {
    throw new Error('NO_API_KEY')
  }

  if (provider === 'openai' || provider === 'openrouter') {
    const url = baseUrl || (provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1')
    const res = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://mindnotes.app' } : {}),
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.choices[0]?.message?.content ?? ''
  }

  if (provider === 'anthropic') {
    const system = messages.find(m => m.role === 'system')?.content
    const userMsgs = messages.filter(m => m.role !== 'system')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages: userMsgs,
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.content[0]?.text ?? ''
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const geminiMsgs = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const system = messages.find(m => m.role === 'system')?.content
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMsgs,
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.candidates[0]?.content?.parts[0]?.text ?? ''
  }

  if (provider === 'ollama') {
    const url = (baseUrl || 'http://localhost:11434') + '/api/chat'
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    })
    if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.message?.content ?? ''
  }

  throw new Error(`Unknown provider: ${provider}`)
}
