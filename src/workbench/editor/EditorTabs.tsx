/**
 * EditorTabs — renders the tab bar for open editors, wired to EditorService.
 */

import { useState, useEffect } from 'react'
import { TabBar } from '../common/TabBar'
import type { EditorService } from './EditorService'

interface EditorTabsProps {
  editorService: EditorService
}

export function EditorTabs({ editorService }: EditorTabsProps) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const bump = () => forceUpdate(n => n + 1)
    const d1 = editorService.onDidOpenEditor(bump)
    const d2 = editorService.onDidCloseEditor(bump)
    const d3 = editorService.onDidChangeActiveEditor(bump)
    return () => { d1.dispose(); d2.dispose(); d3.dispose() }
  }, [editorService])

  const tabs = editorService.openEditors.map(e => ({
    id: e.uri,
    label: e.label,
    pinned: e.pinned,
    icon: e.typeId === 'mindmap' ? '🧠' : e.typeId === 'graph' ? '🕸️' : '📝',
  }))

  return (
    <TabBar
      tabs={tabs}
      activeId={editorService.activeEditor?.uri || null}
      onSelect={id => editorService.setActiveEditor(id)}
      onClose={id => editorService.closeEditor(id)}
      onDoubleClick={id => editorService.pinEditor(id)}
    />
  )
}
