/**
 * WorkspaceService — IWorkspaceService implementation backed by Tauri + appStore.
 */

import { Emitter } from '../../platform/instantiation/Emitter'
import type { IWorkspaceService, FileNode } from '../../platform/services/IWorkspaceService'

export class WorkspaceService implements IWorkspaceService {
  private _vaultPath = ''
  private _fileTree: FileNode[] = []

  private readonly _onDidChangeFileTree = new Emitter<FileNode[]>()
  readonly onDidChangeFileTree = this._onDidChangeFileTree.event

  get vaultPath(): string { return this._vaultPath }

  async setVaultPath(path: string): Promise<void> {
    this._vaultPath = path
    localStorage.setItem('mindnotes_vault_path', path)
    await this.refreshFileTree()
  }

  get fileTree(): FileNode[] { return this._fileTree }

  async refreshFileTree(): Promise<void> {
    if (!this._vaultPath) return
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const tree = await invoke<FileNode[]>('list_files', { path: this._vaultPath })
      this._fileTree = tree
      this._onDidChangeFileTree.fire(tree)
    } catch (err) {
      console.error('Failed to refresh file tree:', err)
    }
  }
}
