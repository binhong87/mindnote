/**
 * CommandService — concrete implementation of ICommandService.
 */

import type { ICommandService, Command } from '../../platform/services/ICommandService'

export class CommandService implements ICommandService {
  private readonly _commands = new Map<string, Command>()

  registerCommand(command: Command): void {
    this._commands.set(command.id, command)
  }

  unregisterCommand(id: string): void {
    this._commands.delete(id)
  }

  async executeCommand(id: string, ...args: unknown[]): Promise<void> {
    const cmd = this._commands.get(id)
    if (!cmd) {
      console.warn(`Command not found: ${id}`)
      return
    }
    await cmd.execute(...args)
  }

  getCommand(id: string): Command | undefined {
    return this._commands.get(id)
  }

  getCommands(): Command[] {
    return Array.from(this._commands.values())
  }
}
