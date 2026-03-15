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
import { CommandService } from './commands/CommandService'
import { KeybindingService } from './commands/KeybindingService'
import { ViewService } from './views/ViewService'
import { ViewContainer, registerViewComponent } from './views/ViewContainer'

// Existing components
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

// Register built-in view components (sidebar views render existing components)
registerViewComponent('explorer', Sidebar)

// Placeholder views for search, AI (will be enhanced in Step 6)
function SearchPlaceholder() {
  return <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>Search — use ⌘F to focus</div>
}
function AIPlaceholder() {
  return <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>AI Assistant</div>
}
registerViewComponent('search', SearchPlaceholder)
registerViewComponent('ai', AIPlaceholder)

export default function Workbench() {
  const { viewMode, setViewMode, activeMindMap, setActiveMindMap, activeFile, noteMetadata, content } = useAppStore()
  const [showPalette, setShowPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  // Services
  const editorService = useMemo(() => new EditorService(), [])
  const commandService = useMemo(() => new CommandService(), [])
  const keybindingService = useMemo(() => new KeybindingService(commandService), [commandService])
  const viewService = useMemo(() => {
    const vs = new ViewService()
    // Register built-in sidebar views
    vs.registerView({ id: 'explorer', label: 'Explorer', icon: '📁', order: 0, location: 'sidebar' })
    vs.registerView({ id: 'search', label: 'Search', icon: '🔍', order: 1, location: 'sidebar' })
    vs.registerView({ id: 'graph', label: 'Knowledge Graph', icon: '🕸️', order: 2, location: 'sidebar' })
    vs.registerView({ id: 'mindmap', label: 'Mind Map', icon: '🧠', order: 3, location: 'sidebar' })
    vs.registerView({ id: 'ai', label: 'AI Assistant', icon: '🤖', order: 4, location: 'sidebar' })
    return vs
  }, [])

  const [activeActivity, setActiveActivity] = useState<string>('explorer')
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [auxSidebarVisible] = useState(false)

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

    // Register commands
  useEffect(() => {
    const cmds = [
      { id: 'workbench.action.showCommandPalette', label: 'Show Command Palette', keybinding: 'Mod+P', execute: () => setShowPalette(p => !p) },
      { id: 'workbench.action.openSettings', label: 'Open Settings', keybinding: 'Mod+,', execute: () => setShowSettings(true) },
      { id: 'workbench.action.newNote', label: 'New Note', keybinding: 'Mod+N', category: 'File', execute: () => handleNewNote() },
      { id: 'workbench.action.toggleGraph', label: 'Toggle Knowledge Graph', keybinding: 'Mod+G', category: 'View', execute: () => setViewMode(useAppStore.getState().viewMode === 'graph' ? 'editor' : 'graph') },
      { id: 'workbench.action.toggleMindMap', label: 'Toggle Mind Map', keybinding: 'Mod+M', category: 'View', execute: () => { const s = useAppStore.getState(); s.setViewMode(s.viewMode === 'mindmap' ? 'editor' : 'mindmap'); if (s.viewMode !== 'mindmap') s.setActiveMindMap(null) } },
      { id: 'workbench.action.save', label: 'Save', keybinding: 'Mod+S', category: 'File', execute: () => { /* handled by Editor component */ } },
      { id: 'workbench.action.focusSearch', label: 'Focus Search', keybinding: 'Mod+F', execute: () => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus() },
      { id: 'workbench.action.toggleSidebar', label: 'Toggle Sidebar', keybinding: 'Mod+B', category: 'View', execute: () => setSidebarVisible(v => !v) },
      { id: 'workbench.action.toggleTheme', label: 'Toggle Theme', category: 'View', execute: () => toggleTheme() },
      { id: 'workbench.action.exportHTML', label: 'Export as HTML', category: 'File', execute: () => handleExportHTML() },
      { id: 'workbench.action.exportPDF', label: 'Export as PDF', category: 'File', execute: () => handleExportPDF() },
    ]
    cmds.forEach(c => commandService.registerCommand(c))
    keybindingService.updateBindings(commandService.getCommands())
    keybindingService.install()
    return () => keybindingService.dispose()
  }, [commandService, keybindingService])

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
  const sidebarViews = viewService.getViews('sidebar')
  const activityItems = sidebarViews.map(v => ({ id: v.id, icon: v.icon, label: v.label }))

  return (
    <div className="flex flex-col h-screen w-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ActivityBar
          items={activityItems}
          activeId={activeActivity}
          onSelect={handleActivitySelect}
          bottomItems={[
            { id: 'settings', icon: '⚙️', label: 'Settings', onClick: () => setShowSettings(true) },
          ]}
        />

        <SidebarShell visible={sidebarVisible} title={sidebarViews.find(v => v.id === activeActivity)?.label}>
          <ViewContainer activeViewId={activeActivity} />
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
              <EditorPane input={editorService.activeEditor} />
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
