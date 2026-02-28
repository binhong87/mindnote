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

interface AppState {
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
