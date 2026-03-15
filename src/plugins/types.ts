import type { ComponentType } from 'react'

export interface Note {
  path: string
  name: string
  content: string
  tags: string[]
  metadata: Record<string, unknown>
}

export interface Command {
  id: string
  name: string
  callback: () => void
}

export interface SidebarPanel {
  id: string
  title: string
  icon: string
  component: ComponentType
}

export interface MindNotesPlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  settingsComponent?: ComponentType
  contributions?: import('./contributions').PluginContribution
  onLoad(app: AppAPI): void | Promise<void>
  onUnload(): void | Promise<void>
}

export interface AppAPI {
  registerCommand(id: string, name: string, callback: () => void): void
  registerEditorExtension(extension: unknown): void
  registerView(id: string, component: ComponentType): void
  registerSidebarPanel(panel: SidebarPanel): void
  onNoteOpen(callback: (note: Note) => void): () => void
  onNoteSave(callback: (note: Note) => void): () => void
  getNote(path: string): Promise<Note>
  getAllNotes(): Promise<Note[]>
  showNotification(message: string, type?: 'info' | 'success' | 'error'): void
}

export interface PluginRegistryEntry {
  plugin: MindNotesPlugin
  enabled: boolean
  api?: AppAPI
}
