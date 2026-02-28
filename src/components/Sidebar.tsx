import { useAppStore } from '../store/appStore'
import type { FileNode } from '../store/appStore'
import { useState, useRef, useEffect, useMemo } from 'react'
import matter from 'gray-matter'

// Collect all tags from files
function collectTags(files: FileNode[], noteContents: Record<string, string>): string[] {
  const tags = new Set<string>()
  const scan = (nodes: FileNode[]) => {
    for (const n of nodes) {
      if (n.isDir) { if (n.children) scan(n.children); continue }
      const raw = noteContents[n.path]
      if (!raw) continue
      try {
        const parsed = matter(raw)
        const t = parsed.data?.tags
        if (Array.isArray(t)) t.forEach((x: string) => tags.add(x))
        else if (typeof t === 'string') t.split(',').forEach((x: string) => tags.add(x.trim()))
      } catch {}
    }
  }
  scan(files)
  return Array.from(tags).filter(Boolean)
}

function getNoteTags(raw: string): string[] {
  if (!raw) return []
  try {
    const parsed = matter(raw)
    const t = parsed.data?.tags
    if (Array.isArray(t)) return t
    if (typeof t === 'string') return t.split(',').map((x: string) => x.trim())
  } catch {}
  return []
}

interface ContextMenu { x: number; y: number; node: FileNode }

function FileTreeItem({ node, depth = 0, onContextMenu }: { node: FileNode; depth?: number; onContextMenu: (e: React.MouseEvent, node: FileNode) => void }) {
  const { activeFile, setActiveFile, setRawContent, noteContents } = useAppStore()
  const isActive = activeFile === node.path
  const [expanded, setExpanded] = useState(true)
  const tags = !node.isDir ? getNoteTags(noteContents[node.path] || '') : []

  const handleClick = async () => {
    if (node.isDir) { setExpanded(e => !e); return }
    setActiveFile(node.path)
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const content = await invoke<string>('read_file', { path: node.path })
      setRawContent(content)
    } catch {
      setRawContent(`# ${node.name}\n\nStart writing here...`)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, node) }}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm rounded mx-1 group ${
          isActive
            ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium'
            : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="text-xs shrink-0">{node.isDir ? (expanded ? '📂' : '📁') : '📄'}</span>
        <span className="truncate flex-1">{node.name.replace('.md', '')}</span>
        {tags.length > 0 && (
          <div className="flex gap-0.5 shrink-0">
            {tags.slice(0, 2).map(t => (
              <span key={t} className={`text-[10px] px-1 rounded ${isActive ? 'bg-white/20' : 'bg-[var(--bg-primary)] text-[var(--accent)]'}`}>{t}</span>
            ))}
          </div>
        )}
      </div>
      {node.isDir && expanded && node.children?.map((child) => (
        <FileTreeItem key={child.path} node={child} depth={depth + 1} onContextMenu={onContextMenu} />
      ))}
    </div>
  )
}

function flattenFiles(files: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  const scan = (nodes: FileNode[]) => {
    for (const n of nodes) {
      if (!n.isDir) result.push(n)
      if (n.children) scan(n.children)
    }
  }
  scan(files)
  return result
}

export default function Sidebar() {
  const { files, setFiles, setVaultPath, searchQuery, setSearchQuery, selectedTags, toggleTag, noteContents, setNoteContent } = useAppStore()
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const contextRef = useRef<HTMLDivElement>(null)

  const loadFiles = async (pathOverride?: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const { homeDir } = await import('@tauri-apps/api/path')
      const home = await homeDir()
      const vaultPath = pathOverride || `${home}MindNotes`
      setVaultPath(vaultPath)
      const entries = await invoke<any[]>('list_directory', { path: vaultPath })
      const mapEntries = (items: any[]): FileNode[] =>
        items.map((item: any) => ({
          id: item.path,
          name: item.name,
          path: item.path,
          isDir: item.is_dir,
          children: item.children ? mapEntries(item.children) : undefined,
        }))
      const mapped = mapEntries(entries)
      setFiles(mapped)
      // Pre-load content for search
      const flat = flattenFiles(mapped)
      for (const f of flat) {
        try {
          const c = await invoke<string>('read_file', { path: f.path })
          setNoteContent(f.path, c)
        } catch {}
      }
    } catch {
      const demoFiles: FileNode[] = [
        { id: '1', name: 'Welcome.md', path: '/Welcome.md', isDir: false },
        { id: '2', name: 'Ideas', path: '/Ideas', isDir: true, children: [
          { id: '3', name: 'Project.md', path: '/Ideas/Project.md', isDir: false },
        ]},
      ]
      setFiles(demoFiles)
    }
  }

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const allTags = useMemo(() => collectTags(files, noteContents), [files, noteContents])

  // Filter files by search and tags
  const filteredFiles = useMemo(() => {
    if (!searchQuery && selectedTags.length === 0) return files
    const q = searchQuery.toLowerCase()
    const filterNode = (node: FileNode): FileNode | null => {
      if (node.isDir) {
        const children = node.children?.map(filterNode).filter(Boolean) as FileNode[]
        if (children?.length) return { ...node, children }
        return null
      }
      const raw = noteContents[node.path] || ''
      const tags = getNoteTags(raw)
      const matchesTag = selectedTags.length === 0 || selectedTags.every(t => tags.includes(t))
      const matchesSearch = !q || node.name.toLowerCase().includes(q) || raw.toLowerCase().includes(q)
      return matchesTag && matchesSearch ? node : null
    }
    return files.map(filterNode).filter(Boolean) as FileNode[]
  }, [files, searchQuery, selectedTags, noteContents])

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const handleNewNote = async () => {
    setContextMenu(null)
    const name = prompt('Note name:')
    if (!name) return
    // In real Tauri app we'd invoke write_file
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const basePath = contextMenu?.node.isDir ? contextMenu.node.path : (contextMenu?.node.path.split('/').slice(0, -1).join('/') || '/')
      const path = `${basePath}/${name}.md`
      await invoke('write_file', { path, content: `# ${name}\n\nStart writing here...\n` })
      loadFiles()
    } catch {
      alert('Cannot create file outside Tauri')
    }
  }

  const handleDelete = async () => {
    if (!contextMenu) return
    if (!confirm(`Delete ${contextMenu.node.name}?`)) return
    setContextMenu(null)
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('delete_file', { path: contextMenu.node.path })
      loadFiles()
    } catch {
      alert('Cannot delete outside Tauri')
    }
  }

  const handleRename = () => {
    if (!contextMenu) return
    setRenaming(contextMenu.node.path)
    setRenameValue(contextMenu.node.name.replace('.md', ''))
    setContextMenu(null)
  }

  return (
    <div className="w-64 h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col relative">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
        <h1 className="text-sm font-semibold text-[var(--accent)]">MindNotes</h1>
        <button
          onClick={() => loadFiles()}
          className="text-xs px-2 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition"
        >
          ↻
        </button>
      </div>

      {/* Search */}
      <div className="px-2 pt-2">
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="px-2 pt-2 flex flex-wrap gap-1">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                selectedTags.includes(tag)
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
              }`}
            >#{tag}</button>
          ))}
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredFiles.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] p-3">
            {files.length === 0 ? 'Click ↻ to load notes' : 'No matching notes'}
          </p>
        ) : (
          filteredFiles.map((node) => (
            <div key={node.id}>
              {renaming === node.path ? (
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  setRenaming(null)
                  // In Tauri would invoke rename
                }} className="px-3 py-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => setRenaming(null)}
                    className="text-xs w-full px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--text-primary)] focus:outline-none"
                  />
                </form>
              ) : (
                <FileTreeItem node={node} onContextMenu={handleContextMenu} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextRef}
          className="fixed z-50 bg-[var(--bg-surface)] border border-[var(--border)] rounded shadow-lg py-1 text-xs text-[var(--text-primary)] min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-secondary)]" onClick={handleNewNote}>📄 New Note</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-secondary)]" onClick={() => { /* new folder */ setContextMenu(null) }}>📁 New Folder</button>
          <button className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-secondary)]" onClick={handleRename}>✏️ Rename</button>
          <div className="border-t border-[var(--border)] my-1" />
          <button className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-secondary)] text-red-400" onClick={handleDelete}>🗑️ Delete</button>
        </div>
      )}
    </div>
  )
}
