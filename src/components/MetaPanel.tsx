import { useAppStore } from '../store/appStore'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function MetaPanel() {
  const { noteMetadata, activeFile, content, files, noteContents, metaPanelOpen, setMetaPanelOpen } = useAppStore()

  // Count backlinks
  const activeName = activeFile?.split('/').pop()?.replace('.md', '') || ''
  const backlinks: string[] = []
  const scan = (nodes: typeof files) => {
    for (const n of nodes) {
      if (n.isDir) { if (n.children) scan(n.children); continue }
      if (n.path === activeFile) continue
      const raw = noteContents[n.path] || ''
      if (raw.includes(`[[${activeName}]]`)) backlinks.push(n.name)
    }
  }
  scan(files)

  const wordCount = countWords(content.replace(/<[^>]+>/g, ' '))

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setMetaPanelOpen(!metaPanelOpen)}
        className="fixed top-3 right-3 z-30 text-xs px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition"
        title="Toggle note info"
      >
        ℹ️
      </button>

      {/* Panel */}
      {metaPanelOpen && activeFile && (
        <div className="w-56 h-full bg-[var(--bg-secondary)] border-l border-[var(--border)] p-3 flex flex-col gap-3 overflow-y-auto text-xs shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--accent)]">Note Info</span>
            <button onClick={() => setMetaPanelOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✕</button>
          </div>

          <div>
            <div className="text-[var(--text-secondary)] mb-0.5">Title</div>
            <div className="text-[var(--text-primary)] font-medium">{noteMetadata.title || activeFile.split('/').pop()?.replace('.md', '')}</div>
          </div>

          {noteMetadata.created && (
            <div>
              <div className="text-[var(--text-secondary)] mb-0.5">Created</div>
              <div className="text-[var(--text-primary)]">{noteMetadata.created}</div>
            </div>
          )}

          {noteMetadata.modified && (
            <div>
              <div className="text-[var(--text-secondary)] mb-0.5">Modified</div>
              <div className="text-[var(--text-primary)]">{noteMetadata.modified}</div>
            </div>
          )}

          <div>
            <div className="text-[var(--text-secondary)] mb-0.5">Word Count</div>
            <div className="text-[var(--text-primary)]">{wordCount} words</div>
          </div>

          {noteMetadata.tags.length > 0 && (
            <div>
              <div className="text-[var(--text-secondary)] mb-1">Tags</div>
              <div className="flex flex-wrap gap-1">
                {noteMetadata.tags.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--accent)]">#{t}</span>
                ))}
              </div>
            </div>
          )}

          {backlinks.length > 0 && (
            <div>
              <div className="text-[var(--text-secondary)] mb-1">Backlinks ({backlinks.length})</div>
              <div className="flex flex-col gap-1">
                {backlinks.map(name => (
                  <span key={name} className="text-[var(--accent)] cursor-pointer hover:opacity-80"
                    onClick={() => window.dispatchEvent(new CustomEvent('wiki-navigate', { detail: name.replace('.md', '') }))}
                  >← {name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
