/**
 * IThemeService — theme state management.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'
import type { Emitter } from '../instantiation/Emitter'

export type ThemeKind = 'dark' | 'light'

export interface IThemeService {
  readonly theme: ThemeKind
  setTheme(theme: ThemeKind): void
  toggleTheme(): void

  readonly onDidChangeTheme: Emitter<ThemeKind>['event']
}

export const IThemeService = createServiceIdentifier<IThemeService>('IThemeService')
