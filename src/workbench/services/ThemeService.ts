/**
 * ThemeService — IThemeService implementation.
 */

import { Emitter } from '../../platform/instantiation/Emitter'
import type { IThemeService, ThemeKind } from '../../platform/services/IThemeService'

export class ThemeService implements IThemeService {
  private _theme: ThemeKind

  private readonly _onDidChangeTheme = new Emitter<ThemeKind>()
  readonly onDidChangeTheme = this._onDidChangeTheme.event

  constructor() {
    this._theme = (localStorage.getItem('mindnotes-theme') as ThemeKind) || 'dark'
    document.documentElement.setAttribute('data-theme', this._theme)
  }

  get theme(): ThemeKind { return this._theme }

  setTheme(theme: ThemeKind): void {
    this._theme = theme
    localStorage.setItem('mindnotes-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    this._onDidChangeTheme.fire(theme)
  }

  toggleTheme(): void {
    this.setTheme(this._theme === 'dark' ? 'light' : 'dark')
  }
}
