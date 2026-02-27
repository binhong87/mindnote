import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useAppStore } from '../store/appStore'
import { useEffect } from 'react'

export default function Editor() {
  const { content, setContent, activeFile } = useAppStore()

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || '<p></p>')
    }
  }, [activeFile])

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        <p className="text-lg">Select a note to start editing</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}
