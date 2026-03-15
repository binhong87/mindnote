/**
 * IViewService — manages activity bar, sidebar views, and panel visibility.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'
import type { Emitter } from '../instantiation/Emitter'

export interface ViewDescriptor {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly order: number
  /** 'sidebar' | 'panel' | 'auxSidebar' */
  readonly location: 'sidebar' | 'panel' | 'auxSidebar'
}

export interface IViewService {
  /** Register a view (used by plugins and built-in features) */
  registerView(descriptor: ViewDescriptor): void
  unregisterView(id: string): void

  /** Currently active sidebar view id */
  readonly activeSidebarView: string | null
  setActiveSidebarView(id: string | null): void

  /** Panel visibility */
  readonly panelVisible: boolean
  setPanelVisible(visible: boolean): void
  readonly activePanelView: string | null
  setActivePanelView(id: string | null): void

  /** Sidebar visibility */
  readonly sidebarVisible: boolean
  setSidebarVisible(visible: boolean): void

  /** Aux sidebar visibility */
  readonly auxSidebarVisible: boolean
  setAuxSidebarVisible(visible: boolean): void

  /** Get all registered views */
  getViews(location?: ViewDescriptor['location']): ViewDescriptor[]

  readonly onDidChangeActiveSidebarView: Emitter<string | null>['event']
  readonly onDidChangePanelVisible: Emitter<boolean>['event']
  readonly onDidChangeSidebarVisible: Emitter<boolean>['event']
}

export const IViewService = createServiceIdentifier<IViewService>('IViewService')
