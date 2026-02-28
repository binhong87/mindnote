import { useState, useRef, useEffect } from 'react'
import { callLLM } from './llm'
import { ragIndexer } from './rag'
import type { AIPluginSettings } from './llm'
import type { Note } from '../types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ name: string; snippet: string }>
}

interface AIChatPanelProps {
  settings: AIPluginSettings
  currentNote: Note | null
  onOpenSettings: () => void
}

export function AIChatPanel({ settings, currentNote, onOpenSettings }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const hasApiKey = settings.provider === 'ollama' || !!settings.apiKey

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      // RAG: find relevant notes
      const sources = ragIndexer.query(userMsg, 3)
      const contextParts: string[] = []

      if (currentNote) {
        contextParts.push(`Current note "${currentNote.name}":\n${currentNote.content.slice(0, 2000)}`)
      }
      if (sources.length > 0) {
        contextParts.push(
          'Relevant notes from your knowledge base:\n' +
          sources.map(s => `- ${s.name}: ${s.snippet}`).join('\n')
        )
      }

      const systemPrompt = [
        'You are an AI assistant integrated into MindNotes, a personal knowledge management app.',
        'Help the user with their notes, ideas, and questions.',
        ...contextParts,
      ].join('\n\n')

      const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      const reply = await callLLM(settings, [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMsg },
      ])

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        sources: sources.length > 0 ? sources : undefined,
      }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: msg === 'NO_API_KEY'
          ? '⚠️ No API key configured. Please open AI plugin settings to add your API key.'
          : `Error: ${msg}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-3">
        <div className="text-4xl">🤖</div>
        <p className="text-[var(--text-secondary)] text-sm">
          Configure your AI provider to start chatting
        </p>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-[#89b4fa] text-[var(--bg-primary)] rounded text-sm font-semibold"
        >
          Open Settings
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <span className="text-sm font-semibold text-[var(--text-primary)]">🤖 AI Chat</span>
        <button
          onClick={onOpenSettings}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ⚙️
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.length === 0 && (
          <p className="text-[var(--text-secondary)] text-xs text-center mt-4">
            Chat with AI about your notes. The current note is automatically included as context.
            {ragIndexer.size > 0 && ` ${ragIndexer.size} notes indexed for RAG.`}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap break-words ${
                m.role === 'user'
                  ? 'bg-[#89b4fa] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
              }`}
            >
              {m.content}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div className="max-w-[85%] text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] rounded p-2 border border-[var(--border)]">
                <div className="font-semibold mb-1">📚 Sources:</div>
                {m.sources.map((s, j) => (
                  <div key={j} className="truncate">• {s.name}</div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-[var(--bg-surface)] px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-[var(--border)] flex gap-2">
        <input
          className="flex-1 bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded px-3 py-1.5 outline-none border border-[var(--border)] focus:border-[#89b4fa]"
          placeholder="Ask about your notes…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-3 py-1.5 bg-[#89b4fa] text-[var(--bg-primary)] rounded text-sm font-semibold disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  )
}
