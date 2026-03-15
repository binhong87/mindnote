/**
 * PluginContributions — defines what a plugin can contribute to the workbench.
 * This is the VS Code-style contribution points system.
 */

import type { ComponentType } from 'react'

export interface PluginContribution {
  /** Commands contributed by the plugin */
  commands?: {
    id: string
    label: string
    category?: string
    keybinding?: string
    execute: (...args: unknown[]) => void | Promise<void>
  }[]

  /** Sidebar views contributed by the plugin */
  views?: {
    id: string
    label: string
    icon: string
    order?: number
    location?: 'sidebar' | 'panel' | 'auxSidebar'
    component: ComponentType
  }[]

  /** Status bar items contributed by the plugin */
  statusBarItems?: {
    id: string
    text: string
    icon?: string
    tooltip?: string
    alignment: 'left' | 'right'
    priority?: number
    onClick?: () => void
  }[]
}

export interface ContributingPlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  settingsComponent?: ComponentType
  /** New contribution-point system */
  contributions?: PluginContribution
  /** Legacy onLoad/onUnload still supported */
  onLoad?(api: unknown): void | Promise<void>
  onUnload?(): void | Promise<void>
}
