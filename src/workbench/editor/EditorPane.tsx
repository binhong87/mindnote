/**
 * EditorPane — renders the appropriate editor based on the active EditorInput's typeId.
 * Wraps existing Editor, MindMapEditor, KnowledgeGraph components.
 */

import type { EditorInput } from '../../platform/services/IEditorService'
import Editor from '../../components/Editor'
import KnowledgeGraph from '../../components/Graph/KnowledgeGraph'
import MindMapEditor from '../../components/MindMap/MindMapEditor'

interface EditorPaneProps {
  input: EditorInput | null
}

export function EditorPane({ input }: EditorPaneProps) {
  if (!input) {
    return <WelcomeView />
  }

  switch (input.typeId) {
    case 'graph':
      return <KnowledgeGraph />
    case 'mindmap':
      return <MindMapEditor filePath={input.uri} />
    case 'welcome':
      return <WelcomeView />
    case 'note':
    default:
      return <Editor />
  }
}

function WelcomeView() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ color: 'var(--text-secondary)' }}
    >
      <h1 style={{ fontSize: '28px', fontWeight: 300, marginBottom: '12px' }}>MindNote</h1>
      <p style={{ fontSize: '13px', opacity: 0.7 }}>Open a file from the sidebar to get started</p>
      <div style={{ marginTop: '24px', fontSize: '12px', opacity: 0.5 }}>
        <p>⌘N — New note</p>
        <p>⌘P — Command palette</p>
        <p>⌘B — Toggle sidebar</p>
      </div>
    </div>
  )
}
