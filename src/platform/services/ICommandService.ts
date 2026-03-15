/**
 * ICommandService — command registry and execution.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'

export interface Command {
  readonly id: string
  readonly label: string
  readonly category?: string
  readonly keybinding?: string // e.g. 'Cmd+P', 'Ctrl+Shift+N'
  readonly icon?: string
  execute(...args: unknown[]): void | Promise<void>
}

export interface ICommandService {
  registerCommand(command: Command): void
  unregisterCommand(id: string): void
  executeCommand(id: string, ...args: unknown[]): Promise<void>
  getCommand(id: string): Command | undefined
  getCommands(): Command[]
}

export const ICommandService = createServiceIdentifier<ICommandService>('ICommandService')
