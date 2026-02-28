import type { ComponentType } from 'react'
import type { MindNotesPlugin, AppAPI, Note, PluginRegistryEntry } from './types'

type NoteCallback = (note: Note) => void

export class PluginManager {
  private plugins: Map<string, PluginRegistryEntry> = new Map()
  private commands: Map<string, { name: string; callback: () => void }> = new Map()
  private views: Map<string, ComponentType> = new Map()
  private noteOpenCallbacks: NoteCallback[] = []
  private noteSaveCallbacks: NoteCallback[] = []
  private editorExtensions: unknown[] = []

  private createAPI(): AppAPI {
    return {
      registerCommand: (id, name, callback) => {
        this.commands.set(id, { name, callback })
      },
      registerEditorExtension: (ext) => {
        this.editorExtensions.push(ext)
      },
      registerView: (id, component) => {
        this.views.set(id, component)
      },
      onNoteOpen: (cb) => {
        this.noteOpenCallbacks.push(cb)
      },
      onNoteSave: (cb) => {
        this.noteSaveCallbacks.push(cb)
      },
      getNote: async (path: string): Promise<Note> => {
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          const content = await invoke<string>('read_file', { path })
          return {
            path,
            name: path.split('/').pop() || '',
            content,
            tags: [],
            metadata: {},
          }
        } catch {
          return { path, name: '', content: '', tags: [], metadata: {} }
        }
      },
      getAllNotes: async (): Promise<Note[]> => {
        return []
      },
    }
  }

  register(plugin: MindNotesPlugin): void {
    this.plugins.set(plugin.id, { plugin, enabled: false })
  }

  enable(pluginId: string): boolean {
    const entry = this.plugins.get(pluginId)
    if (!entry || entry.enabled) return false
    try {
      entry.plugin.onLoad(this.createAPI())
      entry.enabled = true
      return true
    } catch (e) {
      console.error(`Failed to load plugin ${pluginId}:`, e)
      return false
    }
  }

  disable(pluginId: string): boolean {
    const entry = this.plugins.get(pluginId)
    if (!entry || !entry.enabled) return false
    try {
      entry.plugin.onUnload()
      entry.enabled = false
      return true
    } catch (e) {
      console.error(`Failed to unload plugin ${pluginId}:`, e)
      return false
    }
  }

  getAll(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values())
  }

  getCommands() {
    return this.commands
  }

  getViews() {
    return this.views
  }

  // Emit hooks
  emitNoteOpen(note: Note) {
    this.noteOpenCallbacks.forEach(cb => cb(note))
  }

  emitNoteSave(note: Note) {
    this.noteSaveCallbacks.forEach(cb => cb(note))
  }
}

export const pluginManager = new PluginManager()
