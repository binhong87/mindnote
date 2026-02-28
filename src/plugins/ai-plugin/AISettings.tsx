import { useState } from 'react'
import type { AIPluginSettings, AIProvider } from './llm'
import { PROVIDER_MODELS, PROVIDER_LABELS } from './llm'

interface AISettingsProps {
  settings: AIPluginSettings
  onChange: (s: AIPluginSettings) => void
}

export function AISettings({ settings, onChange }: AISettingsProps) {
  const [s, setS] = useState<AIPluginSettings>(settings)

  const update = <K extends keyof AIPluginSettings>(key: K, val: AIPluginSettings[K]) => {
    const next = { ...s, [key]: val }
    if (key === 'provider') {
      const models = PROVIDER_MODELS[val as AIProvider]
      next.model = models[0]
      next.baseUrl = ''
    }
    setS(next)
    onChange(next)
  }

  const needsBaseUrl = s.provider === 'ollama' || s.provider === 'openrouter'
  const needsApiKey = s.provider !== 'ollama'

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">🤖 AI Assistant Settings</h3>

      <div className="space-y-1">
        <label className="text-xs text-[var(--text-secondary)]">Provider</label>
        <select
          value={s.provider}
          onChange={e => update('provider', e.target.value as AIProvider)}
          className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded px-2 py-1.5 border border-[var(--border)] outline-none"
        >
          {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {needsApiKey && (
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-secondary)]">API Key</label>
          <input
            type="password"
            value={s.apiKey}
            onChange={e => update('apiKey', e.target.value)}
            placeholder="sk-..."
            className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded px-2 py-1.5 border border-[var(--border)] outline-none"
          />
        </div>
      )}

      {needsBaseUrl && (
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-secondary)]">Base URL</label>
          <input
            value={s.baseUrl}
            onChange={e => update('baseUrl', e.target.value)}
            placeholder={s.provider === 'ollama' ? 'http://localhost:11434' : 'https://openrouter.ai/api/v1'}
            className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded px-2 py-1.5 border border-[var(--border)] outline-none"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs text-[var(--text-secondary)]">Model</label>
        <select
          value={s.model}
          onChange={e => update('model', e.target.value)}
          className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded px-2 py-1.5 border border-[var(--border)] outline-none"
        >
          {PROVIDER_MODELS[s.provider].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-[var(--text-secondary)]">Temperature: {s.temperature.toFixed(1)}</label>
        <input
          type="range"
          min="0" max="1" step="0.1"
          value={s.temperature}
          onChange={e => update('temperature', parseFloat(e.target.value))}
          className="w-full accent-[#89b4fa]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-[var(--text-secondary)]">Max Tokens</label>
        <input
          type="number"
          value={s.maxTokens}
          onChange={e => update('maxTokens', parseInt(e.target.value) || 1024)}
          min={128} max={16384}
          className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded px-2 py-1.5 border border-[var(--border)] outline-none"
        />
      </div>
    </div>
  )
}
