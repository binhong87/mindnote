import { useAppStore } from '../store/appStore'
import type { FileNode } from '../store/appStore'

function FileTreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const { activeFile, setActiveFile, setContent } = useAppStore()
  const isActive = activeFile === node.path

  const handleClick = async () => {
    if (node.isDir) return
    setActiveFile(node.path)
    // In Tauri, we'd invoke read_file here. For now, set placeholder.
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const content = await invoke<string>('read_file', { path: node.path })
      setContent(content)
    } catch {
      setContent(`<p>Could not load ${node.name}</p>`)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm rounded mx-1 ${
          isActive
            ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium'
            : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="text-xs">{node.isDir ? '📁' : '📄'}</span>
        <span className="truncate">{node.name}</span>
      </div>
      {node.isDir && node.children?.map((child) => (
        <FileTreeItem key={child.path} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function Sidebar() {
  const { files, setFiles, setVaultPath } = useAppStore()

  const loadFiles = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const { homeDir } = await import('@tauri-apps/api/path')
      const home = await homeDir()
      const vaultPath = `${home}MindNotes`
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
      setFiles(mapEntries(entries))
    } catch {
      // Not running in Tauri — show demo data
      setFiles([
        { id: '1', name: 'Welcome.md', path: '/Welcome.md', isDir: false },
        { id: '2', name: 'Ideas', path: '/Ideas', isDir: true, children: [
          { id: '3', name: 'Project.md', path: '/Ideas/Project.md', isDir: false },
        ]},
      ])
    }
  }

  return (
    <div className="w-64 h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
      <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
        <h1 className="text-sm font-semibold text-[var(--accent)]">MindNotes</h1>
        <button
          onClick={loadFiles}
          className="text-xs px-2 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition"
        >
          Reload
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] p-3">Click Reload to load notes</p>
        ) : (
          files.map((node) => <FileTreeItem key={node.id} node={node} />)
        )}
      </div>
    </div>
  )
}
