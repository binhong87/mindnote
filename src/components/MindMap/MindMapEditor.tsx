import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAppStore } from '../../store/appStore'

const NODE_COLORS = ['#89b4fa', '#a6e3a1', '#f9e2af', '#f38ba8', '#cba6f7', '#fab387', '#94e2d5']

let idCounter = 0
function nextId() {
  return `mm-${Date.now()}-${idCounter++}`
}

function makeNode(x: number, y: number, label: string, color = NODE_COLORS[0]): Node {
  return {
    id: nextId(),
    data: { label, color },
    position: { x, y },
    style: {
      background: color,
      color: '#1e1e2e',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'grab',
    },
  }
}

interface Props {
  initialData?: { nodes: Node[]; edges: Edge[] }
  filePath?: string
}

export default function MindMapEditor({ initialData, filePath }: Props) {
  useAppStore() // Keep store connection for reactivity
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || [])
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const savePath = filePath || null

  // Save to file
  const save = useCallback(async () => {
    if (!savePath) return
    const data = {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.data.label,
        x: n.position.x,
        y: n.position.y,
        color: n.data.color || NODE_COLORS[0],
      })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
    }
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('write_file', { path: savePath, content: JSON.stringify(data, null, 2) })
    } catch {}
  }, [nodes, edges, savePath])

  // Auto-save on change
  useEffect(() => {
    if (savePath) {
      const t = setTimeout(save, 1000)
      return () => clearTimeout(t)
    }
  }, [nodes, edges, savePath, save])

  // Double click canvas → new node
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      const node = makeNode(x, y, 'New Node')
      setNodes(ns => [...ns, node])
    },
    [setNodes]
  )

  // Double click node → edit label
  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setEditingNode(node.id)
      setEditLabel(node.data.label as string)
      setTimeout(() => inputRef.current?.focus(), 50)
    },
    []
  )

  const finishEdit = useCallback(() => {
    if (editingNode) {
      setNodes(ns =>
        ns.map(n =>
          n.id === editingNode
            ? { ...n, data: { ...n.data, label: editLabel } }
            : n
        )
      )
      setEditingNode(null)
    }
  }, [editingNode, editLabel, setNodes])

  // Connect nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds => addEdge({ ...params, style: { stroke: '#585b70', strokeWidth: 2 } }, eds))
    },
    [setEdges]
  )

  // Right click node → context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id })
    },
    []
  )

  const addChild = useCallback(() => {
    if (!contextMenu) return
    const parent = nodes.find(n => n.id === contextMenu.nodeId)
    if (!parent) return
    const child = makeNode(parent.position.x + 200, parent.position.y + 80, 'Child')
    setNodes(ns => [...ns, child])
    setEdges(es => [
      ...es,
      {
        id: `${parent.id}-${child.id}`,
        source: parent.id,
        target: child.id,
        style: { stroke: '#585b70', strokeWidth: 2 },
      },
    ])
    setContextMenu(null)
  }, [contextMenu, nodes, setNodes, setEdges])

  const deleteNode = useCallback(() => {
    if (!contextMenu) return
    setNodes(ns => ns.filter(n => n.id !== contextMenu.nodeId))
    setEdges(es => es.filter(e => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId))
    setContextMenu(null)
  }, [contextMenu, setNodes, setEdges])

  const changeColor = useCallback(() => {
    if (!contextMenu) return
    setNodes(ns =>
      ns.map(n => {
        if (n.id !== contextMenu.nodeId) return n
        const currentIdx = NODE_COLORS.indexOf(n.data.color || NODE_COLORS[0])
        const nextColor = NODE_COLORS[(currentIdx + 1) % NODE_COLORS.length]
        return {
          ...n,
          data: { ...n.data, color: nextColor },
          style: { ...n.style, background: nextColor },
        }
      })
    )
    setContextMenu(null)
  }, [contextMenu, setNodes])

  // Close context menu on click elsewhere
  useEffect(() => {
    const handler = () => setContextMenu(null)
    if (contextMenu) window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [contextMenu])

  return (
    <div className="h-full w-full relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={save}
          className="px-3 py-1 text-xs rounded bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:opacity-80"
        >
          💾 Save
        </button>
      </div>

      {/* Edit label overlay */}
      {editingNode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[var(--bg-surface)] p-4 rounded-lg shadow-xl">
          <input
            ref={inputRef}
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && finishEdit()}
            onBlur={finishEdit}
            className="bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-2 rounded border border-[var(--border)] outline-none"
          />
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="absolute z-20 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={addChild} className="w-full px-3 py-1.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)]">
            ➕ Add Child
          </button>
          <button onClick={changeColor} className="w-full px-3 py-1.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)]">
            🎨 Change Color
          </button>
          <button onClick={deleteNode} className="w-full px-3 py-1.5 text-left text-sm text-[#f38ba8] hover:bg-[var(--bg-primary)]">
            🗑 Delete
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => setContextMenu(null)}
        onDoubleClick={onPaneDoubleClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#45475a" gap={20} />
        <Controls style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
      </ReactFlow>
    </div>
  )
}
