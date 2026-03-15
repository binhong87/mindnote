/**
 * Workbench — main application shell.
 * VS Code-style layout with activity bar, sidebar, editor area, aux sidebar, status bar.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { ActivityBar } from './layout/ActivityBar'
import { SidebarShell } from './layout/SidebarShell'
import { EditorArea } from './layout/EditorArea'
import { AuxSidebar } from './layout/AuxSidebar'
import { StatusBar, type StatusBarItem } from './layout/StatusBar'
import { EditorTabs } from './editor/EditorTabs'
import { EditorPane } from './editor/EditorPane'
import { EditorService } from './editor/EditorService'

// Existing components — still used directly for now (migrated in Step 6)
import Sidebar from '../components/Sidebar'
import MetaPanel from '../components/MetaPanel'
import CommandPalette from '../components/CommandPalette'
import SettingsPanel from '../components/Settings/SettingsPanel'
import { Toast } from '../components/Toast'
import { useAppStore } from '../store/appStore'
import { registerBuiltinPlugins } from '../plugins/registry'
import { useTheme } from '../hooks/useTheme'
import { exportToHTML, exportToPDF } from '../utils/export'

// Register plugins on app start
registerBuiltinPlugins()

const ACTIVITY_ITEMS = [
  { id: 'explorer', icon: '📁', label: 'Explorer' },
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'graph', icon: '🕸️', label: 'Knowledge Graph' },
  { id: 'mindmap', icon: '🧠', label: 'Mind Map' },
  { id: 'ai', icon: '🤖', label: 'AI Assistant' },
]

export default function Workbench() {
  const { viewMode, setViewMode, activeMindMap, setActiveMindMap, activeFile, noteMetadata, content } = useAppStore()
  const [showPalette, setShowPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [auxSidebarVisible] = useState(false)
  const [activeActivity, setActiveActivity] = useState<string>('explorer')
  const { theme, toggleTheme } = useTheme()

  // EditorService singleton
  const editorService = useMemo(() => new EditorService(), [])

  // Sync appStore's activeFile → EditorService
  useEffect(() => {
    if (activeFile) {
      editorService.openEditor(activeFile, { pinned: true })
    }
  }, [activeFile, editorService])

  // Sync EditorService → appStore (when user clicks tabs)
  useEffect(() => {
    const d = editorService.onDidChangeActiveEditor((editor) => {
      if (editor && editor.typeId === 'note') {
        const store = useAppStore.getState()
        if (store.activeFile !== editor.uri) {
          // Load the file content via the existing Sidebar mechanism
          store.setActiveFile(editor.uri)
          // Load raw content if cached
          const raw = store.noteContents[editor.uri]
          if (raw) store.setRawContent(raw)
        }
      }
    })
    return () => d.dispose()
  }, [editorService])

  // Sync viewMode to activity bar
  useEffect(() => {
    if (viewMode === 'graph') setActiveActivity('graph')
    else if (viewMode === 'mindmap') setActiveActivity('mindmap')
    else setActiveActivity('explorer')
  }, [viewMode])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setShowPalette(p => !p) }
      else if (e.key === ',') { e.preventDefault(); setShowSettings(true) }
      else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); handleNewNote() }
      else if (e.key === 'g' || e.key === 'G') { e.preventDefault(); setViewMode(viewMode === 'graph' ? 'editor' : 'graph') }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setViewMode(viewMode === 'mindmap' ? 'editor' : 'mindmap'); if (viewMode !== 'mindmap') setActiveMindMap(null) }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault() }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus() }
      else if (e.key === 'b' || e.key === 'B') { e.preventDefault(); setSidebarVisible(v => !v) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [viewMode])

  const handleNewNote = useCallback(async () => {
    const name = prompt('Note name:')
    if (!name) return
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const { homeDir } = await import('@tauri-apps/api/path')
      const savedVault = localStorage.getItem('mindnotes_vault_path')
      let vaultDir = savedVault
      if (!vaultDir) { const home = await homeDir(); vaultDir = `${home}MindNotes` }
      const path = `${vaultDir}/${name}.md`
      await invoke('write_file', { path, content: `# ${name}\n\nCreated: ${new Date().toISOString().split('T')[0]}\n\n` })
      setToast(`📄 Created ${name}`)
    } catch (err) { setToast(`❌ Failed to create note: ${err}`) }
  }, [])

  const handleExportHTML = useCallback(() => {
    const title = activeFile ? activeFile.split('/').pop()?.replace('.md', '') || 'note' : 'note'
    const editorEl = document.querySelector('.tiptap')
    if (editorEl) { exportToHTML(title, editorEl.innerHTML); setToast('🌐 Exported as HTML') }
  }, [activeFile])

  const handleExportPDF = useCallback(() => {
    const title = noteMetadata?.title || activeFile?.split('/').pop()?.replace('.md', '') || 'note'
    exportToPDF(title)
  }, [activeFile, noteMetadata])

  const handleActivitySelect = (id: string) => {
    if (activeActivity === id) {
      setSidebarVisible(v => !v)
    } else {
      setActiveActivity(id)
      setSidebarVisible(true)
    }
    if (id === 'graph') setViewMode('graph')
    else if (id === 'mindmap') { setViewMode('mindmap'); setActiveMindMap(null) }
    else if (id === 'explorer') setViewMode('editor')
  }

  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length

  const statusBarItems: StatusBarItem[] = [
    { id: 'file', text: activeFile?.split('/').pop() || 'No file', alignment: 'left', priority: 0 },
    { id: 'words', text: `${wordCount} words`, alignment: 'left', priority: 1 },
    { id: 'theme', text: theme === 'dark' ? '🌙 Dark' : '☀️ Light', alignment: 'right', priority: 0, onClick: toggleTheme },
    { id: 'settings', text: '⚙️', alignment: 'right', priority: 1, onClick: () => setShowSettings(true) },
  ]

  // Determine what EditorInput to render — for now, still use viewMode as the source of truth
  const currentEditorInput = editorService.activeEditor

  return (
    <div className="flex flex-col h-screen w-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ActivityBar
          items={ACTIVITY_ITEMS}
          activeId={activeActivity}
          onSelect={handleActivitySelect}
          bottomItems={[
            { id: 'settings', icon: '⚙️', label: 'Settings', onClick: () => setShowSettings(true) },
          ]}
        />

        <SidebarShell visible={sidebarVisible} title={ACTIVITY_ITEMS.find(i => i.id === activeActivity)?.label}>
          <Sidebar />
        </SidebarShell>

        <EditorArea>
          {/* Tab bar */}
          <EditorTabs editorService={editorService} />
          {/* Editor content — still uses viewMode for graph/mindmap, EditorPane for notes */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {viewMode === 'graph' ? (
              <EditorPane input={{ uri: 'graph', label: 'Knowledge Graph', typeId: 'graph', pinned: true }} />
            ) : viewMode === 'mindmap' ? (
              <EditorPane input={{ uri: activeMindMap || 'mindmap', label: 'Mind Map', typeId: 'mindmap', pinned: true }} />
            ) : (
              <EditorPane input={currentEditorInput} />
            )}
          </div>
        </EditorArea>

        <AuxSidebar visible={auxSidebarVisible}>
          <MetaPanel />
        </AuxSidebar>
      </div>

      <StatusBar items={statusBarItems} />

      <CommandPalette
        open={showPalette}
        onClose={() => setShowPalette(false)}
        onNewNote={handleNewNote}
        onNewFolder={() => setToast('ℹ️ Use right-click in sidebar to create a folder')}
        onOpenSettings={() => setShowSettings(true)}
        onExportPDF={handleExportPDF}
        onExportHTML={handleExportHTML}
        onToggleTheme={toggleTheme}
      />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
