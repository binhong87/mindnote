import { create } from 'zustand'

export interface FileNode {
  id: string
  name: string
  path: string
  isDir: boolean
  children?: FileNode[]
  tags?: string[]
}

export interface NoteMetadata {
  title: string
  tags: string[]
  created?: string
  modified?: string
}

export type ViewMode = 'editor' | 'graph' | 'mindmap' | 'crm'

export interface MindMapData {
  nodes: { id: string; label: string; x: number; y: number; color?: string }[]
  edges: { id: string; source: string; target: string }[]
}

interface AppState {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  activeMindMap: string | null
  setActiveMindMap: (path: string | null) => void
  vaultPath: string
  setVaultPath: (path: string) => void
  files: FileNode[]
  setFiles: (files: FileNode[]) => void
  activeFile: string | null
  setActiveFile: (path: string | null) => void
  content: string
  setContent: (content: string) => void
  rawContent: string
  setRawContent: (raw: string) => void
  noteMetadata: NoteMetadata
  setNoteMetadata: (meta: NoteMetadata) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  metaPanelOpen: boolean
  setMetaPanelOpen: (open: boolean) => void
  noteContents: Record<string, string> // path -> raw content cache
  setNoteContent: (path: string, content: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'editor' as ViewMode,
  setViewMode: (mode) => set({ viewMode: mode }),
  activeMindMap: null,
  setActiveMindMap: (path) => set({ activeMindMap: path }),
  vaultPath: '',
  setVaultPath: (path) => set({ vaultPath: path }),
  files: [],
  setFiles: (files) => set({ files }),
  activeFile: null,
  setActiveFile: (path) => set({ activeFile: path }),
  content: '',
  setContent: (content) => set({ content }),
  rawContent: '',
  setRawContent: (raw) => set({ rawContent: raw }),
  noteMetadata: { title: '', tags: [] },
  setNoteMetadata: (meta) => set({ noteMetadata: meta }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  selectedTags: [],
  toggleTag: (tag) => set((state) => ({
    selectedTags: state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag]
  })),
  metaPanelOpen: false,
  setMetaPanelOpen: (open) => set({ metaPanelOpen: open }),
  noteContents: {},
  setNoteContent: (path, content) => set((state) => ({
    noteContents: { ...state.noteContents, [path]: content }
  })),
}))
