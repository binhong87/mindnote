import { useEffect, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import MetaPanel from './components/MetaPanel'
import KnowledgeGraph from './components/Graph/KnowledgeGraph'
import MindMapEditor from './components/MindMap/MindMapEditor'
import CommandPalette from './components/CommandPalette'
import SettingsPanel from './components/Settings/SettingsPanel'
import { Toast } from './components/Toast'
import { useAppStore, type ViewMode } from './store/appStore'
import { registerBuiltinPlugins } from './plugins/registry'
import { useTheme } from './hooks/useTheme'
import { exportToHTML, exportToPDF, exportAllToZip } from './utils/export'
import type { Node, Edge } from 'reactflow'

// Register plugins on app start
registerBuiltinPlugins()

export default function App() {
  const { viewMode, setViewMode, activeMindMap, setActiveMindMap, activeFile, noteMetadata, noteContents } = useAppStore()
  const [mindMapData, setMindMapData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile
  const { theme, toggleTheme } = useTheme()

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load mind map data when activeMindMap changes
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

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setShowPalette(p => !p)
      } else if (e.key === ',' ) {
        e.preventDefault()
        setShowSettings(true)
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        handleNewNote()
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        setViewMode(viewMode === 'graph' ? 'editor' : 'graph')
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setViewMode(viewMode === 'mindmap' ? 'editor' : 'mindmap')
        if (viewMode !== 'mindmap') setActiveMindMap(null)
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setToast('✅ Saved')
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        const search = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')
        search?.focus()
      }
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
      const home = await homeDir()
      const path = `${home}MindNotes/${name}.md`
      const templateContent = `# ${name}\n\nCreated: ${new Date().toISOString().split('T')[0]}\n\n`
      await invoke('write_file', { path, content: templateContent })
      setToast(`📄 Created ${name}`)
    } catch {
      setToast('ℹ️ Cannot create file in browser mode')
    }
  }, [])

  const handleExportHTML = useCallback(() => {
    const title = activeFile ? activeFile.split('/').pop()?.replace('.md', '') || 'note' : 'note'
    const editorEl = document.querySelector('.tiptap')
    if (editorEl) {
      exportToHTML(title, editorEl.innerHTML)
      setToast('🌐 Exported as HTML')
    }
  }, [activeFile])

  const handleExportPDF = useCallback(() => {
    const title = noteMetadata?.title || activeFile?.split('/').pop()?.replace('.md', '') || 'note'
    exportToPDF(title)
  }, [activeFile, noteMetadata])

  const handleExportAllZip = useCallback(async () => {
    await exportAllToZip(noteContents)
    setToast('📦 Exported all notes as ZIP')
  }, [noteContents])

  const views: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'editor', label: 'Editor', icon: '📝' },
    { mode: 'graph', label: 'Graph', icon: '🕸️' },
    { mode: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { mode: 'crm', label: 'CRM', icon: '👥' },
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
    <div className="flex flex-col h-screen w-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Top Bar */}
      <div
        className="no-print"
        style={{
          height: '40px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Left: hamburger (mobile) + view tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Hamburger — shown on mobile */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '16px', cursor: 'pointer', padding: '4px 6px', marginRight: '4px' }}
            title="Toggle Sidebar"
          >
            ☰
          </button>
          {views.map(v => (
            <button
              key={v.mode}
              onClick={() => { setViewMode(v.mode); if (v.mode === 'mindmap') setActiveMindMap(null) }}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === v.mode ? 'var(--accent)' : 'transparent',
                color: viewMode === v.mode ? 'var(--bg-primary)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {v.icon} <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Right: toolbar buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Command Palette button */}
          <TopBtn title="Command Palette (⌘P)" onClick={() => setShowPalette(true)}>🔍</TopBtn>
          {/* Export buttons (editor mode) */}
          {viewMode === 'editor' && (
            <>
              <TopBtn title="Export as HTML" onClick={handleExportHTML}>🌐</TopBtn>
              <TopBtn title="Export as PDF" onClick={handleExportPDF}>📤</TopBtn>
              <TopBtn title="Export All as ZIP" onClick={handleExportAllZip}>📦</TopBtn>
            </>
          )}
          {/* Theme toggle */}
          <TopBtn title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </TopBtn>
          {/* Settings */}
          <TopBtn title="Settings (⌘,)" onClick={() => setShowSettings(true)}>⚙️</TopBtn>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar — hidden on mobile unless open */}
        <div
          className="sidebar-mobile-hidden"
          style={{
            display: 'flex',
            position: window.innerWidth < 768 ? 'fixed' : 'relative',
            top: window.innerWidth < 768 ? '40px' : 'auto',
            left: 0,
            height: window.innerWidth < 768 ? 'calc(100vh - 40px)' : '100%',
            zIndex: window.innerWidth < 768 ? 50 : 'auto',
            transform: window.innerWidth < 768 ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
            transition: 'transform 0.2s ease',
          }}
        >
          <Sidebar />
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden"
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, top: '40px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          {renderMain()}
        </main>
        {viewMode === 'editor' && (
          <div className="meta-panel-hidden">
            <MetaPanel />
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div
        className="no-print"
        style={{
          display: 'none',
          // shown via CSS on mobile
        }}
      >
      </div>

      {/* Floating Action Button (mobile) */}
      <button
        className="md:hidden no-print"
        onClick={handleNewNote}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--bg-primary)',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="New Note"
      >
        +
      </button>

      {/* Mobile bottom navigation */}
      <div
        className="no-print"
        style={{
          display: window.innerWidth < 768 ? 'flex' : 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          zIndex: 30,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {[
          { mode: 'editor' as ViewMode, icon: '📝', label: 'Notes' },
          { mode: 'graph' as ViewMode, icon: '🕸️', label: 'Graph' },
          { mode: 'mindmap' as ViewMode, icon: '🧠', label: 'MindMap' },
        ].map(v => (
          <button
            key={v.mode}
            onClick={() => { setViewMode(v.mode); if (v.mode === 'mindmap') setActiveMindMap(null) }}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: viewMode === v.mode ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '20px',
              minHeight: '44px',
            }}
          >
            <span>{v.icon}</span>
            <span style={{ fontSize: '10px' }}>{v.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '20px',
            minHeight: '44px',
          }}
        >
          <span>⚙️</span>
          <span style={{ fontSize: '10px' }}>Settings</span>
        </button>
      </div>

      {/* Command Palette */}
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

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}

function TopBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 6px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        borderRadius: '4px',
        transition: 'background 0.15s',
        minHeight: '28px',
        minWidth: '28px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {children}
    </button>
  )
}
