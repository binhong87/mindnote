import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import MetaPanel from './components/MetaPanel'
import KnowledgeGraph from './components/Graph/KnowledgeGraph'
import MindMapEditor from './components/MindMap/MindMapEditor'
import PluginSettings from './components/Settings/PluginSettings'
import { useAppStore, type ViewMode } from './store/appStore'
import { registerBuiltinPlugins } from './plugins/registry'
import type { Node, Edge } from 'reactflow'

// Register plugins on app start
registerBuiltinPlugins()

function TopBar() {
  const { viewMode, setViewMode, setActiveMindMap } = useAppStore()
  const [showSettings, setShowSettings] = useState(false)

  const views: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'editor', label: 'Editor', icon: '📝' },
    { mode: 'graph', label: 'Graph', icon: '🕸️' },
    { mode: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { mode: 'crm', label: 'CRM', icon: '👥' },
  ]

  return (
    <>
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center px-3 gap-2 justify-between">
        <div className="flex gap-1">
          {views.map(v => (
            <button
              key={v.mode}
              onClick={() => {
                setViewMode(v.mode)
                if (v.mode === 'mindmap') setActiveMindMap(null)
              }}
              className={`px-3 py-1 text-xs rounded font-medium transition ${
                viewMode === v.mode
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSettings(s => !s)}
          className="px-2 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Settings"
        >
          ⚙️
        </button>
      </div>
      {showSettings && (
        <div className="absolute top-10 right-0 w-96 max-h-[80vh] overflow-auto bg-[var(--bg-secondary)] border-l border-b border-[var(--border)] z-50 shadow-xl">
          <div className="flex justify-between items-center p-3 border-b border-[var(--border)]">
            <span className="font-semibold text-[var(--text-primary)]">Settings</span>
            <button onClick={() => setShowSettings(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✕</button>
          </div>
          <PluginSettings />
        </div>
      )}
    </>
  )
}

export default function App() {
  const { viewMode, activeMindMap } = useAppStore()
  const [mindMapData, setMindMapData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)

  // Load mind map data when activeMindMap changes
  useEffect(() => {
    if (!activeMindMap) {
      setMindMapData(null)
      return
    }
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke<string>('read_file', { path: activeMindMap })
        .then(content => {
          const data = JSON.parse(content)
          // Convert stored format to ReactFlow format
          const nodes: Node[] = data.nodes.map((n: { id: string; label: string; x: number; y: number; color?: string }) => ({
            id: n.id,
            data: { label: n.label, color: n.color || '#89b4fa' },
            position: { x: n.x, y: n.y },
            style: {
              background: n.color || '#89b4fa',
              color: '#1e1e2e',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
            },
          }))
          const edges: Edge[] = data.edges.map((e: { id: string; source: string; target: string }) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            style: { stroke: '#585b70', strokeWidth: 2 },
          }))
          setMindMapData({ nodes, edges })
        })
        .catch(() => setMindMapData(null))
    })
  }, [activeMindMap])

  const renderMain = () => {
    switch (viewMode) {
      case 'graph':
        return <KnowledgeGraph />
      case 'crm':
        return <KnowledgeGraph filterCRM />
      case 'mindmap':
        return <MindMapEditor initialData={mindMapData || undefined} filePath={activeMindMap || undefined} />
      default:
        return <Editor />
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-primary)] relative">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden">
          {renderMain()}
        </main>
        {viewMode === 'editor' && <MetaPanel />}
      </div>
    </div>
  )
}
