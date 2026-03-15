/**
 * FileService — IFileService backed by Tauri invoke commands.
 */

import { Emitter } from '../../platform/instantiation/Emitter'
import type { IFileService, FileChange } from '../../platform/services/IFileService'

export class TauriFileService implements IFileService {
  private readonly _onDidChangeFile = new Emitter<FileChange>()
  readonly onDidChangeFile = this._onDidChangeFile.event

  private async tauri() {
    return import('@tauri-apps/api/core')
  }

  async readFile(path: string): Promise<string> {
    const { invoke } = await this.tauri()
    return invoke<string>('read_file', { path })
  }

  async writeFile(path: string, content: string): Promise<void> {
    const { invoke } = await this.tauri()
    await invoke('write_file', { path, content })
    this._onDidChangeFile.fire({ path, type: 'modified' })
  }

  async deleteFile(path: string): Promise<void> {
    const { invoke } = await this.tauri()
    await invoke('delete_file', { path })
    this._onDidChangeFile.fire({ path, type: 'deleted' })
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const { invoke } = await this.tauri()
    await invoke('rename_file', { oldPath, newPath })
    this._onDidChangeFile.fire({ path: oldPath, type: 'deleted' })
    this._onDidChangeFile.fire({ path: newPath, type: 'created' })
  }

  async createDirectory(path: string): Promise<void> {
    const { invoke } = await this.tauri()
    await invoke('create_dir', { path })
  }

  async listDirectory(path: string): Promise<{ name: string; path: string; isDir: boolean }[]> {
    const { invoke } = await this.tauri()
    return invoke('list_dir', { path })
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.readFile(path)
      return true
    } catch {
      return false
    }
  }
}
