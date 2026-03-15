/**
 * IEditorService — manages open editors, tabs, and editor groups.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'
import type { Emitter } from '../instantiation/Emitter'

export interface EditorInput {
  /** Unique resource identifier (usually file path) */
  readonly uri: string
  /** Display label for the tab */
  readonly label: string
  /** Editor type key (e.g. 'note', 'mindmap', 'graph', 'welcome') */
  readonly typeId: string
  /** Whether the tab is pinned (edited or double-clicked) */
  pinned: boolean
}

export interface IEditorService {
  /** All open editor inputs */
  readonly openEditors: EditorInput[]
  /** Currently active editor (focused tab) */
  readonly activeEditor: EditorInput | null

  openEditor(uri: string, options?: { typeId?: string; pinned?: boolean }): void
  closeEditor(uri: string): void
  closeAllEditors(): void
  setActiveEditor(uri: string): void
  pinEditor(uri: string): void

  readonly onDidChangeActiveEditor: Emitter<EditorInput | null>['event']
  readonly onDidOpenEditor: Emitter<EditorInput>['event']
  readonly onDidCloseEditor: Emitter<EditorInput>['event']
}

export const IEditorService = createServiceIdentifier<IEditorService>('IEditorService')
