/**
 * EditorService — concrete implementation of IEditorService.
 * Manages open tabs, active editor, and editor lifecycle.
 */

import { Emitter } from '../../platform/instantiation/Emitter'
import type { IEditorService, EditorInput } from '../../platform/services/IEditorService'

export class EditorService implements IEditorService {
  private _openEditors: EditorInput[] = []
  private _activeEditor: EditorInput | null = null

  private readonly _onDidChangeActiveEditor = new Emitter<EditorInput | null>()
  private readonly _onDidOpenEditor = new Emitter<EditorInput>()
  private readonly _onDidCloseEditor = new Emitter<EditorInput>()

  readonly onDidChangeActiveEditor = this._onDidChangeActiveEditor.event
  readonly onDidOpenEditor = this._onDidOpenEditor.event
  readonly onDidCloseEditor = this._onDidCloseEditor.event

  get openEditors(): EditorInput[] {
    return [...this._openEditors]
  }

  get activeEditor(): EditorInput | null {
    return this._activeEditor
  }

  openEditor(uri: string, options?: { typeId?: string; pinned?: boolean }): void {
    let existing = this._openEditors.find(e => e.uri === uri)
    if (existing) {
      if (options?.pinned) existing.pinned = true
      this._setActive(existing)
      return
    }

    // If there's an unpinned preview tab, replace it
    const previewIdx = this._openEditors.findIndex(e => !e.pinned)
    const label = uri.split('/').pop()?.replace('.md', '') || uri
    const typeId = options?.typeId || this._inferTypeId(uri)
    const input: EditorInput = { uri, label, typeId, pinned: options?.pinned ?? false }

    if (previewIdx >= 0 && !options?.pinned) {
      const old = this._openEditors[previewIdx]
      this._openEditors[previewIdx] = input
      this._onDidCloseEditor.fire(old)
    } else {
      this._openEditors.push(input)
    }

    this._onDidOpenEditor.fire(input)
    this._setActive(input)
  }

  closeEditor(uri: string): void {
    const idx = this._openEditors.findIndex(e => e.uri === uri)
    if (idx < 0) return
    const [removed] = this._openEditors.splice(idx, 1)
    this._onDidCloseEditor.fire(removed)

    if (this._activeEditor?.uri === uri) {
      const next = this._openEditors[Math.min(idx, this._openEditors.length - 1)] || null
      this._setActive(next)
    }
  }

  closeAllEditors(): void {
    const editors = [...this._openEditors]
    this._openEditors = []
    editors.forEach(e => this._onDidCloseEditor.fire(e))
    this._setActive(null)
  }

  setActiveEditor(uri: string): void {
    const editor = this._openEditors.find(e => e.uri === uri) || null
    if (editor) this._setActive(editor)
  }

  pinEditor(uri: string): void {
    const editor = this._openEditors.find(e => e.uri === uri)
    if (editor) editor.pinned = true
  }

  private _setActive(editor: EditorInput | null): void {
    this._activeEditor = editor
    this._onDidChangeActiveEditor.fire(editor)
  }

  private _inferTypeId(uri: string): string {
    if (uri.endsWith('.mindmap.json')) return 'mindmap'
    if (uri === 'welcome') return 'welcome'
    if (uri === 'graph') return 'graph'
    return 'note'
  }
}
