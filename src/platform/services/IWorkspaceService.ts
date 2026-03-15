/**
 * IWorkspaceService — manages the vault/workspace context.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'
import type { Emitter } from '../instantiation/Emitter'

export interface FileNode {
  id: string
  name: string
  path: string
  isDir: boolean
  children?: FileNode[]
  tags?: string[]
}

export interface IWorkspaceService {
  /** Current vault root path */
  readonly vaultPath: string
  setVaultPath(path: string): Promise<void>

  /** File tree (reactive) */
  readonly fileTree: FileNode[]
  refreshFileTree(): Promise<void>

  readonly onDidChangeFileTree: Emitter<FileNode[]>['event']
}

export const IWorkspaceService = createServiceIdentifier<IWorkspaceService>('IWorkspaceService')
