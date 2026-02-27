import { create } from 'zustand'

export interface FileNode {
  id: string
  name: string
  path: string
  isDir: boolean
  children?: FileNode[]
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
}))
