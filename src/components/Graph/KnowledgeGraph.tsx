import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ELK from 'elkjs/lib/elk.bundled.js'
import { useAppStore } from '../../store/appStore'
import type { FileNode } from '../../store/appStore'
import matter from 'gray-matter'

const elk = new ELK()

const TAG_COLORS: Record<string, string> = {
  person: '#f38ba8',
  contact: '#f38ba8',
  project: '#a6e3a1',
  idea: '#f9e2af',
  reference: '#89b4fa',
  journal: '#cba6f7',
  default: '#89b4fa',
}

function getColor(tags: string[]): string {
  for (const t of tags) {
    if (TAG_COLORS[t.toLowerCase()]) return TAG_COLORS[t.toLowerCase()]
  }
  return TAG_COLORS.default
}

function buildGraph(
  files: FileNode[],
  noteContents: Record<string, string>
): { nodes: Node[]; edges: Edge[] } {
  const allFiles: FileNode[] = []
  const collect = (nodes: FileNode[]) => {
    for (const n of nodes) {
      if (n.isDir) { if (n.children) collect(n.children); continue }
      if (n.name.endsWith('.md')) allFiles.push(n)
    }
  }
  collect(files)

  const nameToPath: Record<string, string> = {}
  for (const f of allFiles) {
    nameToPath[f.name.replace('.md', '')] = f.path
  }

  const nodes: Node[] = []
  const edges: Edge[] = []
  const edgeSet = new Set<string>()

  for (const f of allFiles) {
    const raw = noteContents[f.path] || ''
    let tags: string[] = []
    try {
      const parsed = matter(raw)
      const t = parsed.data?.tags
      if (Array.isArray(t)) tags = t
      else if (typeof t === 'string') tags = t.split(',').map(s => s.trim())
    } catch {}

    const color = getColor(tags)
    const title = f.name.replace('.md', '')

    nodes.push({
      id: f.path,
      data: { label: title, tags },
      position: { x: 0, y: 0 },
      style: {
        background: color,
        color: '#1e1e2e',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: 600,
      },
    })

    // Extract wiki links
    const wikiLinks = raw.matchAll(/\[\[([^\]]+)\]\]/g)
    for (const m of wikiLinks) {
      const target = m[1]
      const targetPath = nameToPath[target]
      if (targetPath && targetPath !== f.path) {
        const edgeId = [f.path, targetPath].sort().join('--')
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId)
          edges.push({
            id: edgeId,
            source: f.path,
            target: targetPath,
            style: { stroke: '#585b70', strokeWidth: 2 },
          })
        }
      }
    }
  }

  return { nodes, edges }
}

async function layoutGraph(nodes: Node[], edges: Edge[]): Promise<Node[]> {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.force.temperature': '0.1',
      'elk.spacing.nodeNode': '100',
    },
    children: nodes.map(n => ({
      id: n.id,
      width: 150,
      height: 40,
    })),
    edges: edges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  }

  const laid = await elk.layout(graph)
  return nodes.map(n => {
    const child = laid.children?.find(c => c.id === n.id)
    return {
      ...n,
      position: { x: child?.x ?? 0, y: child?.y ?? 0 },
    }
  })
}

interface Props {
  filterCRM?: boolean
}

export default function KnowledgeGraph({ filterCRM = false }: Props) {
  const { files, noteContents, setActiveFile, setViewMode, setRawContent } = useAppStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let { nodes: gNodes, edges: gEdges } = buildGraph(files, noteContents)

    if (filterCRM) {
      // Only show person/contact tagged notes
      const crmIds = new Set(
        gNodes
          .filter(n => {
            const tags = (n.data.tags as string[]) || []
            return tags.some(t => ['person', 'contact'].includes(t.toLowerCase()))
          })
          .map(n => n.id)
      )
      gNodes = gNodes.filter(n => crmIds.has(n.id))

      // Rebuild edges from frontmatter `knows` field
      gEdges = []
      const nameToPath: Record<string, string> = {}
      for (const n of gNodes) {
        nameToPath[n.data.label as string] = n.id
      }
      for (const n of gNodes) {
        const raw = noteContents[n.id] || ''
        try {
          const parsed = matter(raw)
          const knows = parsed.data?.knows
          if (typeof knows === 'string') {
            const refs = knows.matchAll(/\[\[([^\]]+)\]\]/g)
            for (const m of refs) {
              const tp = nameToPath[m[1]]
              if (tp && tp !== n.id) {
                gEdges.push({
                  id: `${n.id}--${tp}`,
                  source: n.id,
                  target: tp,
                  style: { stroke: '#f38ba8', strokeWidth: 2 },
                  label: 'knows',
                  labelStyle: { fill: '#a6adc8', fontSize: 10 },
                })
              }
            }
          }
        } catch {}
      }
    }

    layoutGraph(gNodes, gEdges).then(laid => {
      setNodes(laid)
      setEdges(gEdges)
      setLoading(false)
    })
  }, [files, noteContents, filterCRM])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setActiveFile(node.id)
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke<string>('read_file', { path: node.id }).then(setRawContent))
        .catch(() => {})
      setViewMode('editor')
    },
    [setActiveFile, setViewMode, setRawContent]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        Building graph...
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ background: 'var(--bg-primary)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#45475a" gap={20} />
        <Controls
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        />
        <MiniMap
          nodeColor={(n) => (n.style?.background as string) || '#89b4fa'}
          maskColor="rgba(30,30,46,0.8)"
          style={{ background: 'var(--bg-secondary)' }}
        />
      </ReactFlow>
    </div>
  )
}
