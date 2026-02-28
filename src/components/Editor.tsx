import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { createLowlight, common } from 'lowlight'
import { useAppStore } from '../store/appStore'
import { useEffect, useMemo } from 'react'
import matter from 'gray-matter'

const lowlight = createLowlight(common)

// Wiki Link extension
const WikiLinkExtension = Extension.create({
  name: 'wikiLink',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('wikiLink'),
        props: {
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement
            if (target.classList.contains('wiki-link')) {
              const noteName = target.getAttribute('data-note')
              if (noteName) {
                // Dispatch custom event for navigation
                window.dispatchEvent(new CustomEvent('wiki-navigate', { detail: noteName }))
              }
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})

function transformWikiLinks(html: string): string {
  return html.replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
    return `<span class="wiki-link" data-note="${name}" style="color:var(--accent);cursor:pointer;text-decoration:underline">[[${name}]]</span>`
  })
}

function getBacklinks(files: import('../store/appStore').FileNode[], noteContents: Record<string, string>, activeFile: string | null): string[] {
  if (!activeFile) return []
  const activeName = activeFile.split('/').pop()?.replace('.md', '') || ''
  const backlinks: string[] = []
  const scan = (nodes: import('../store/appStore').FileNode[]) => {
    for (const n of nodes) {
      if (n.isDir) { if (n.children) scan(n.children); continue }
      if (n.path === activeFile) continue
      const content = noteContents[n.path] || ''
      if (content.includes(`[[${activeName}]]`)) {
        backlinks.push(n.name)
      }
    }
  }
  scan(files)
  return backlinks
}

export default function Editor() {
  const { content, setContent, rawContent, setRawContent, activeFile, setNoteMetadata, files, noteContents, setActiveFile } = useAppStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      Link.configure({ openOnClick: false }),
      WikiLinkExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'tiptap' },
    },
  })

  // Parse frontmatter and load content when activeFile changes
  useEffect(() => {
    if (!editor || !activeFile) return
    try {
      const parsed = matter(rawContent || '')
      const tags = Array.isArray(parsed.data?.tags) ? parsed.data.tags : 
        (typeof parsed.data?.tags === 'string' ? parsed.data.tags.split(',').map((t: string) => t.trim()) : [])
      setNoteMetadata({
        title: parsed.data?.title || activeFile.split('/').pop()?.replace('.md', '') || '',
        tags,
        created: parsed.data?.created,
        modified: parsed.data?.modified,
      })
      const bodyHtml = transformWikiLinks(parsed.content)
      editor.commands.setContent(bodyHtml || '<p></p>')
    } catch {
      editor.commands.setContent(rawContent || '<p></p>')
    }
  }, [activeFile, rawContent])

  // Handle wiki navigation
  useEffect(() => {
    const handler = (e: Event) => {
      const noteName = (e as CustomEvent).detail as string
      // Find file by name
      const find = (nodes: typeof files): typeof files[0] | null => {
        for (const n of nodes) {
          if (!n.isDir && n.name.replace('.md', '') === noteName) return n
          if (n.children) { const r = find(n.children); if (r) return r }
        }
        return null
      }
      const target = find(files)
      if (target) {
        setActiveFile(target.path)
        // Load content
        import('@tauri-apps/api/core').then(({ invoke }) => {
          invoke<string>('read_file', { path: target.path }).then(setRawContent).catch(() => setRawContent(''))
        }).catch(() => {})
      }
    }
    window.addEventListener('wiki-navigate', handler)
    return () => window.removeEventListener('wiki-navigate', handler)
  }, [files])

  const backlinks = useMemo(() => getBacklinks(files, noteContents, activeFile), [files, noteContents, activeFile])

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        <p className="text-lg">Select a note to start editing</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
      {backlinks.length > 0 && (
        <div className="border-t border-[var(--border)] p-3 bg-[var(--bg-secondary)]">
          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">🔗 Backlinks</div>
          <div className="flex flex-wrap gap-2">
            {backlinks.map(name => (
              <span key={name} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--accent)] cursor-pointer hover:opacity-80"
                onClick={() => window.dispatchEvent(new CustomEvent('wiki-navigate', { detail: name.replace('.md', '') }))}
              >{name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
