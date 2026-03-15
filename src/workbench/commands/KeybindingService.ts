/**
 * KeybindingService — listens for keyboard events and dispatches to CommandService.
 */

import type { ICommandService, Command } from '../../platform/services/ICommandService'

interface ParsedKeybinding {
  ctrlOrCmd: boolean
  shift: boolean
  alt: boolean
  key: string
}

function parseKeybinding(keybinding: string): ParsedKeybinding {
  const parts = keybinding.toLowerCase().split('+').map(s => s.trim())
  return {
    ctrlOrCmd: parts.includes('cmd') || parts.includes('ctrl') || parts.includes('mod'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('opt'),
    key: parts[parts.length - 1],
  }
}

function matchesEvent(parsed: ParsedKeybinding, e: KeyboardEvent): boolean {
  const mod = e.metaKey || e.ctrlKey
  if (parsed.ctrlOrCmd && !mod) return false
  if (parsed.shift && !e.shiftKey) return false
  if (parsed.alt && !e.altKey) return false
  return e.key.toLowerCase() === parsed.key
}

export class KeybindingService {
  private _bindings: { parsed: ParsedKeybinding; commandId: string }[] = []
  private _handler: ((e: KeyboardEvent) => void) | null = null
  private readonly _commandService: ICommandService

  constructor(commandService: ICommandService) {
    this._commandService = commandService
  }

  /**
   * Rebuild bindings from all registered commands that have keybindings.
   */
  updateBindings(commands: Command[]): void {
    this._bindings = commands
      .filter(c => c.keybinding)
      .map(c => ({
        parsed: parseKeybinding(c.keybinding!),
        commandId: c.id,
      }))
  }

  /**
   * Start listening for keyboard events on window.
   */
  install(): void {
    this._handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        // Only intercept mod+key combos, not bare keys
        if (!(e.metaKey || e.ctrlKey)) return
      }

      for (const binding of this._bindings) {
        if (matchesEvent(binding.parsed, e)) {
          e.preventDefault()
          e.stopPropagation()
          this._commandService.executeCommand(binding.commandId)
          return
        }
      }
    }
    window.addEventListener('keydown', this._handler, true)
  }

  dispose(): void {
    if (this._handler) {
      window.removeEventListener('keydown', this._handler, true)
      this._handler = null
    }
  }
}
