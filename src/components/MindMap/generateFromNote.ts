import type { Node, Edge } from 'reactflow'

const NODE_COLORS = ['#89b4fa', '#a6e3a1', '#f9e2af', '#f38ba8', '#cba6f7']

interface Heading {
  level: number
  text: string
}

export function generateMindMapFromMarkdown(markdown: string, title: string): { nodes: Node[]; edges: Edge[] } {
  const lines = markdown.split('\n')
  const headings: Heading[] = []

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim() })
    }
  }

  if (headings.length === 0) {
    // Create a single root node with the title
    return {
      nodes: [
        {
          id: 'root',
          data: { label: title, color: NODE_COLORS[0] },
          position: { x: 400, y: 50 },
          style: {
            background: NODE_COLORS[0],
            color: '#1e1e2e',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 700,
          },
        },
      ],
      edges: [],
    }
  }

  const nodes: Node[] = []
  const edges: Edge[] = []
  let idCounter = 0

  // Root node
  const rootId = `gen-${idCounter++}`
  nodes.push({
    id: rootId,
    data: { label: title, color: NODE_COLORS[0] },
    position: { x: 400, y: 30 },
    style: {
      background: NODE_COLORS[0],
      color: '#1e1e2e',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 20px',
      fontSize: '15px',
      fontWeight: 700,
    },
  })

  let lastH1 = rootId
  let lastH2 = rootId
  let h1Count = 0
  let h2Count = 0

  for (const h of headings) {
    const id = `gen-${idCounter++}`
    const colorIdx = h.level % NODE_COLORS.length
    const xBase = h.level === 1 ? 200 : h.level === 2 ? 400 : 600
    const yBase = h.level === 1 ? (++h1Count) * 120 + 80 : h.level === 2 ? (++h2Count) * 100 + 80 : idCounter * 80

    nodes.push({
      id,
      data: { label: h.text, color: NODE_COLORS[colorIdx] },
      position: { x: xBase + Math.random() * 50, y: yBase },
      style: {
        background: NODE_COLORS[colorIdx],
        color: '#1e1e2e',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 600,
      },
    })

    if (h.level === 1) {
      edges.push({ id: `e-${rootId}-${id}`, source: rootId, target: id, style: { stroke: '#585b70', strokeWidth: 2 } })
      lastH1 = id
      lastH2 = id
      h2Count = 0
    } else if (h.level === 2) {
      edges.push({ id: `e-${lastH1}-${id}`, source: lastH1, target: id, style: { stroke: '#585b70', strokeWidth: 2 } })
      lastH2 = id
    } else if (h.level === 3) {
      edges.push({ id: `e-${lastH2}-${id}`, source: lastH2, target: id, style: { stroke: '#585b70', strokeWidth: 2 } })
    }
  }

  return { nodes, edges }
}
