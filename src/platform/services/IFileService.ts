/**
 * IFileService — abstracts filesystem operations.
 * Backed by Tauri on desktop, could be backed by IndexedDB/OPFS on web.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'
import type { Emitter } from '../instantiation/Emitter'

export interface FileChange {
  path: string
  type: 'created' | 'modified' | 'deleted'
}

export interface IFileService {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  deleteFile(path: string): Promise<void>
  renameFile(oldPath: string, newPath: string): Promise<void>
  createDirectory(path: string): Promise<void>
  listDirectory(path: string): Promise<{ name: string; path: string; isDir: boolean }[]>
  exists(path: string): Promise<boolean>

  readonly onDidChangeFile: Emitter<FileChange>['event']
}

export const IFileService = createServiceIdentifier<IFileService>('IFileService')
