import { Command } from 'cmdk'
import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/appStore'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNewNote: () => void
  onNewFolder: () => void
  onOpenSettings: () => void
  onExportPDF: () => void
  onExportHTML: () => void
  onToggleTheme: () => void
}

export default function CommandPalette({
  open,
  onClose,
  onNewNote,
  onNewFolder,
  onOpenSettings,
  onExportPDF,
  onExportHTML,
  onToggleTheme,
}: CommandPaletteProps) {
  const { files, setActiveFile, setRawContent, setViewMode, setActiveMindMap } = useAppStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  // Flatten all notes for quick open
  const allNotes: { path: string; name: string }[] = []
  const flatten = (nodes: typeof files) => {
    for (const n of nodes) {
      if (!n.isDir) allNotes.push({ path: n.path, name: n.name.replace('.md', '') })
      if (n.children) flatten(n.children)
    }
  }
  flatten(files)

  const openNote = async (path: string) => {
    setActiveFile(path)
    setActiveMindMap(null)
    setViewMode('editor')
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const content = await invoke<string>('read_file', { path })
      setRawContent(content)
    } catch {
      setRawContent('')
    }
    onClose()
  }

  const run = (fn: () => void) => { fn(); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[560px] max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      >
        <Command
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search notes..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              padding: '14px 16px',
              fontSize: '15px',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            autoFocus
          />
          <Command.List style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
            <Command.Empty style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No results found.
            </Command.Empty>

            {/* Commands group */}
            <Command.Group
              heading="Commands"
              style={{ padding: 0 }}
            >
              <CmdItem icon="📄" label="New Note" shortcut="⌘N" onSelect={() => run(onNewNote)} />
              <CmdItem icon="📁" label="New Folder" onSelect={() => run(onNewFolder)} />
              <CmdItem icon="🕸️" label="Toggle Graph View" shortcut="⌘G" onSelect={() => run(() => setViewMode('graph'))} />
              <CmdItem icon="🧠" label="Toggle Mind Map" shortcut="⌘M" onSelect={() => run(() => setViewMode('mindmap'))} />
              <CmdItem icon="🎨" label="Toggle Theme (Light/Dark)" onSelect={() => run(onToggleTheme)} />
              <CmdItem icon="📤" label="Export as PDF" onSelect={() => run(onExportPDF)} />
              <CmdItem icon="🌐" label="Export as HTML" onSelect={() => run(onExportHTML)} />
              <CmdItem icon="⚙️" label="Open Settings" shortcut="⌘," onSelect={() => run(onOpenSettings)} />
            </Command.Group>

            {/* Notes group */}
            {allNotes.length > 0 && (
              <Command.Group heading="Notes">
                {allNotes.map(note => (
                  <CmdItem
                    key={note.path}
                    icon="📄"
                    label={note.name}
                    onSelect={() => openNote(note.path)}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}

function CmdItem({ icon, label, shortcut, onSelect }: { icon: string; label: string; shortcut?: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        color: 'var(--text-primary)',
        justifyContent: 'space-between',
      }}
      className="cmdk-item-hover"
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      {shortcut && (
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
          {shortcut}
        </span>
      )}
    </Command.Item>
  )
}
