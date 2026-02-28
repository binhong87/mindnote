import type { ComponentType } from 'react'

export interface Note {
  path: string
  name: string
  content: string
  tags: string[]
  metadata: Record<string, unknown>
}

export interface MindNotesPlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  onLoad(app: AppAPI): void
  onUnload(): void
}

export interface AppAPI {
  registerCommand(id: string, name: string, callback: () => void): void
  registerEditorExtension(extension: unknown): void
  registerView(id: string, component: ComponentType): void
  onNoteOpen(callback: (note: Note) => void): void
  onNoteSave(callback: (note: Note) => void): void
  getNote(path: string): Promise<Note>
  getAllNotes(): Promise<Note[]>
}

export interface PluginRegistryEntry {
  plugin: MindNotesPlugin
  enabled: boolean
}
