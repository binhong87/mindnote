import { useState, useCallback } from 'react'
import type { MindNotesPlugin, AppAPI, Note } from '../types'
import type { AIPluginSettings } from './llm'
import { DEFAULT_SETTINGS, callLLM } from './llm'
import { ragIndexer } from './rag'
import { AIChatPanel } from './AIChatPanel'
import { AISettings } from './AISettings'

const STORAGE_KEY = 'mindnotes-ai-settings'

function loadSettings(): AIPluginSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch { return DEFAULT_SETTINGS }
}

function saveSettings(s: AIPluginSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

let _currentNote: Note | null = null
let _appApi: AppAPI | null = null

// Standalone AI actions that can be triggered from context menu / commands
async function aiAction(action: 'summarize' | 'rewrite' | 'improve' | 'continue' | 'autotag', selectedText?: string) {
  const settings = loadSettings()
  if (settings.provider !== 'ollama' && !settings.apiKey) {
    _appApi?.showNotification('Please configure your AI API key in plugin settings', 'error')
    return null
  }

  const noteCtx = _currentNote ? `Note "${_currentNote.name}":\n${_currentNote.content.slice(0, 2000)}` : ''

  const prompts: Record<string, string> = {
    summarize: `Summarize the following text concisely:\n\n${selectedText}`,
    rewrite: `Rewrite the following text to be clearer and more polished. Return only the rewritten text:\n\n${selectedText}`,
    improve: `Improve the writing of the following text. Return only the improved version:\n\n${selectedText}`,
    continue: `Continue writing from where this text leaves off. Match the style and tone:\n\n${noteCtx}`,
    autotag: `Suggest 3-5 relevant tags for this note. Return only comma-separated tags without #:\n\n${noteCtx}`,
  }

  try {
    return await callLLM(settings, [
      { role: 'system', content: 'You are a helpful writing assistant.' },
      { role: 'user', content: prompts[action] },
    ])
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    _appApi?.showNotification(`AI error: ${msg}`, 'error')
    return null
  }
}

// React component wrapper for the chat sidebar
export function AIChatSidebar() {
  const [settings, setSettings] = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [note] = useState<Note | null>(_currentNote)

  const handleSettingsChange = useCallback((s: AIPluginSettings) => {
    saveSettings(s)
    setSettings(s)
  }, [])

  if (showSettings) {
    return (
      <div className="h-full flex flex-col">
        <button
          onClick={() => setShowSettings(false)}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 text-left"
        >
          ← Back to Chat
        </button>
        <AISettings settings={settings} onChange={handleSettingsChange} />
      </div>
    )
  }

  return (
    <AIChatPanel
      settings={settings}
      currentNote={note}
      onOpenSettings={() => setShowSettings(true)}
    />
  )
}

// Settings component for plugin settings page
export function AIPluginSettingsView() {
  const [settings, setSettings] = useState(loadSettings)
  return <AISettings settings={settings} onChange={s => { saveSettings(s); setSettings(s) }} />
}

export const aiPlugin: MindNotesPlugin = {
  id: 'ai-assistant',
  name: 'AI Assistant',
  version: '1.0.0',
  description: 'AI-powered note assistance with multiple LLM provider support',
  author: 'MindNotes',
  settingsComponent: AIPluginSettingsView,

  onLoad(app: AppAPI) {
    _appApi = app

    app.registerCommand('ai-summarize', 'AI Summarize', () => {
      const sel = window.getSelection()?.toString()
      if (!sel) { app.showNotification('Select some text first', 'info'); return }
      aiAction('summarize', sel).then(r => r && app.showNotification(r, 'info'))
    })
    app.registerCommand('ai-rewrite', 'AI Rewrite', () => {
      const sel = window.getSelection()?.toString()
      if (!sel) { app.showNotification('Select some text first', 'info'); return }
      aiAction('rewrite', sel).then(r => r && app.showNotification(r, 'info'))
    })
    app.registerCommand('ai-improve', 'AI Improve Writing', () => {
      const sel = window.getSelection()?.toString()
      if (!sel) { app.showNotification('Select some text first', 'info'); return }
      aiAction('improve', sel).then(r => r && app.showNotification(r, 'info'))
    })
    app.registerCommand('ai-continue', 'AI Continue Writing', () => {
      aiAction('continue').then(r => r && app.showNotification(r, 'info'))
    })
    app.registerCommand('ai-autotag', 'AI Auto-tag', () => {
      aiAction('autotag').then(r => r && app.showNotification(`Suggested tags: ${r}`, 'info'))
    })

    app.registerSidebarPanel({
      id: 'ai-chat',
      title: 'AI Chat',
      icon: '🤖',
      component: AIChatSidebar,
    })

    app.onNoteOpen((note: Note) => { _currentNote = note })

    // Build RAG index
    app.getAllNotes().then(async notes => {
      const notesWithContent = await Promise.all(
        notes.slice(0, 100).map(async n => {
          try {
            const full = await app.getNote(n.path)
            return { path: n.path, name: n.name, content: full.content }
          } catch { return { path: n.path, name: n.name, content: '' } }
        })
      )
      ragIndexer.buildIndex(notesWithContent.filter(n => n.content))
      console.log(`RAG index built: ${ragIndexer.size} notes`)
    })
  },

  onUnload() {
    _appApi = null
    _currentNote = null
  },
}

export default aiPlugin
