import type { ComponentType } from 'react'
import type { MindNotesPlugin, AppAPI, Note, PluginRegistryEntry, SidebarPanel } from './types'

type NoteCallback = (note: Note) => void

export class PluginManager {
  private plugins: Map<string, PluginRegistryEntry> = new Map()
  private commands: Map<string, { name: string; callback: () => void }> = new Map()
  private views: Map<string, ComponentType> = new Map()
  private sidebarPanels: Map<string, SidebarPanel> = new Map()
  private noteOpenCallbacks: Set<NoteCallback> = new Set()
  private noteSaveCallbacks: Set<NoteCallback> = new Set()
  private editorExtensions: unknown[] = []
  private notificationHandler: ((msg: string, type?: 'info' | 'success' | 'error') => void) | null = null

  setNotificationHandler(handler: (msg: string, type?: 'info' | 'success' | 'error') => void) {
    this.notificationHandler = handler
  }

  private createAPI(pluginId: string): AppAPI {
    const noteOpenUnsubs: Set<NoteCallback> = new Set()
    const noteSaveUnsubs: Set<NoteCallback> = new Set()

    return {
      registerCommand: (id, name, callback) => {
        this.commands.set(`${pluginId}:${id}`, { name, callback })
      },
      registerEditorExtension: (ext) => {
        this.editorExtensions.push(ext)
      },
      registerView: (id, component) => {
        this.views.set(id, component)
      },
      registerSidebarPanel: (panel) => {
        this.sidebarPanels.set(panel.id, panel)
      },
      onNoteOpen: (cb) => {
        this.noteOpenCallbacks.add(cb)
        noteOpenUnsubs.add(cb)
        return () => this.noteOpenCallbacks.delete(cb)
      },
      onNoteSave: (cb) => {
        this.noteSaveCallbacks.add(cb)
        noteSaveUnsubs.add(cb)
        return () => this.noteSaveCallbacks.delete(cb)
      },
      getNote: async (path: string): Promise<Note> => {
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          const content = await invoke<string>('read_file', { path })
          return {
            path,
            name: path.split('/').pop()?.replace(/\.md$/, '') || '',
            content,
            tags: [],
            metadata: {},
          }
        } catch {
          return { path, name: '', content: '', tags: [], metadata: {} }
        }
      },
      getAllNotes: async (): Promise<Note[]> => {
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          const files = await invoke<string[]>('list_notes', {})
          return files.map(p => ({
            path: p,
            name: p.split('/').pop()?.replace(/\.md$/, '') || '',
            content: '',
            tags: [],
            metadata: {},
          }))
        } catch {
          return []
        }
      },
      showNotification: (msg, type = 'info') => {
        this.notificationHandler?.(msg, type)
      },
    }
  }

  load(plugin: MindNotesPlugin): void {
    if (this.plugins.has(plugin.id)) return
    this.plugins.set(plugin.id, { plugin, enabled: false })
  }

  /** @alias load */
  register(plugin: MindNotesPlugin): void {
    this.load(plugin)
  }

  unload(pluginId: string): void {
    this.disable(pluginId)
    this.plugins.delete(pluginId)
  }

  enable(pluginId: string): boolean {
    const entry = this.plugins.get(pluginId)
    if (!entry || entry.enabled) return false
    try {
      const api = this.createAPI(pluginId)
      entry.api = api
      const result = entry.plugin.onLoad(api)
      if (result instanceof Promise) {
        result.catch(e => console.error(`Plugin ${pluginId} onLoad error:`, e))
      }
      entry.enabled = true
      return true
    } catch (e) {
      console.error(`Failed to enable plugin ${pluginId}:`, e)
      return false
    }
  }

  disable(pluginId: string): boolean {
    const entry = this.plugins.get(pluginId)
    if (!entry || !entry.enabled) return false
    try {
      const result = entry.plugin.onUnload()
      if (result instanceof Promise) {
        result.catch(e => console.error(`Plugin ${pluginId} onUnload error:`, e))
      }
      entry.enabled = false
      return true
    } catch (e) {
      console.error(`Failed to disable plugin ${pluginId}:`, e)
      return false
    }
  }

  getAll(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values())
  }

  getById(id: string): PluginRegistryEntry | undefined {
    return this.plugins.get(id)
  }

  getCommands() {
    return this.commands
  }

  getViews() {
    return this.views
  }

  getSidebarPanels(): SidebarPanel[] {
    return Array.from(this.sidebarPanels.values())
  }

  emitNoteOpen(note: Note) {
    this.noteOpenCallbacks.forEach(cb => cb(note))
  }

  emitNoteSave(note: Note) {
    this.noteSaveCallbacks.forEach(cb => cb(note))
  }
}

export const pluginManager = new PluginManager()
