/**
 * Workbench — main application shell.
 * This is the VS Code-style layout container that replaces App.tsx.
 *
 * Step 2: Basic shell with layout zones.
 * Subsequent steps will wire real services into each zone.
 */

import { useState, useCallback, useEffect } from 'react'
import { ActivityBar } from './layout/ActivityBar'
import { SidebarShell } from './layout/SidebarShell'
import { EditorArea } from './layout/EditorArea'
import { AuxSidebar } from './layout/AuxSidebar'
// Panel will be used in Step 8
// import { Panel } from './layout/Panel'
import { StatusBar, type StatusBarItem } from './layout/StatusBar'

// Existing components — still used directly for now (migrated in Step 6)
import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'
import MetaPanel from '../components/MetaPanel'
import KnowledgeGraph from '../components/Graph/KnowledgeGraph'
import MindMapEditor from '../components/MindMap/MindMapEditor'
import CommandPalette from '../components/CommandPalette'
import SettingsPanel from '../components/Settings/SettingsPanel'
import { Toast } from '../components/Toast'
import { useAppStore } from '../store/appStore'
import { registerBuiltinPlugins } from '../plugins/registry'
import { useTheme } from '../hooks/useTheme'
import { exportToHTML, exportToPDF } from '../utils/export'
import type { Node, Edge } from 'reactflow'

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
  const [mindMapData, setMindMapData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [auxSidebarVisible, _setAuxSidebarVisible] = useState(false)
  const [activeActivity, setActiveActivity] = useState<string>('explorer')
  const { theme, toggleTheme } = useTheme()

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load mind map data
  useEffect(() => {
    if (!activeMindMap) { setMindMapData(null); return }
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke<string>('read_file', { path: activeMindMap })
        .then(content => {
          const data = JSON.parse(content)
          const nodes: Node[] = data.nodes.map((n: { id: string; label: string; x: number; y: number; color?: string }) => ({
            id: n.id,
            data: { label: n.label, color: n.color || '#89b4fa' },
            position: { x: n.x, y: n.y },
            style: { background: n.color || '#89b4fa', color: '#1e1e2e', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600 },
          }))
          const edges: Edge[] = data.edges.map((e: { id: string; source: string; target: string }) => ({
            id: e.id, source: e.source, target: e.target,
            style: { stroke: '#585b70', strokeWidth: 2 },
          }))
          setMindMapData({ nodes, edges })
        })
        .catch(() => setMindMapData(null))
    })
  }, [activeMindMap])

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
    // Map certain activities to view modes
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

  const renderMain = () => {
    switch (viewMode) {
      case 'graph': return <KnowledgeGraph />
      case 'crm': return <KnowledgeGraph filterCRM />
      case 'mindmap': return <MindMapEditor initialData={mindMapData || undefined} filePath={activeMindMap || undefined} />
      default: return <Editor />
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Activity Bar */}
        <ActivityBar
          items={ACTIVITY_ITEMS}
          activeId={activeActivity}
          onSelect={handleActivitySelect}
          bottomItems={[
            { id: 'settings', icon: '⚙️', label: 'Settings', onClick: () => setShowSettings(true) },
          ]}
        />

        {/* Sidebar */}
        <SidebarShell visible={sidebarVisible} title={ACTIVITY_ITEMS.find(i => i.id === activeActivity)?.label}>
          <Sidebar />
        </SidebarShell>

        {/* Editor area + panel */}
        <EditorArea>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {renderMain()}
          </div>
        </EditorArea>

        {/* Aux sidebar (meta panel) */}
        <AuxSidebar visible={auxSidebarVisible}>
          <MetaPanel />
        </AuxSidebar>
      </div>

      {/* Status Bar */}
      <StatusBar items={statusBarItems} />

      {/* Overlays */}
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
