/**
 * ViewService — concrete implementation of IViewService.
 * Manages registered views and active sidebar/panel state.
 */

import { Emitter } from '../../platform/instantiation/Emitter'
import type { IViewService, ViewDescriptor } from '../../platform/services/IViewService'

export class ViewService implements IViewService {
  private readonly _views = new Map<string, ViewDescriptor>()
  private _activeSidebarView: string | null = 'explorer'
  private _panelVisible = false
  private _activePanelView: string | null = null
  private _sidebarVisible = true
  private _auxSidebarVisible = false

  private readonly _onDidChangeActiveSidebarView = new Emitter<string | null>()
  private readonly _onDidChangePanelVisible = new Emitter<boolean>()
  private readonly _onDidChangeSidebarVisible = new Emitter<boolean>()

  readonly onDidChangeActiveSidebarView = this._onDidChangeActiveSidebarView.event
  readonly onDidChangePanelVisible = this._onDidChangePanelVisible.event
  readonly onDidChangeSidebarVisible = this._onDidChangeSidebarVisible.event

  registerView(descriptor: ViewDescriptor): void {
    this._views.set(descriptor.id, descriptor)
  }

  unregisterView(id: string): void {
    this._views.delete(id)
  }

  get activeSidebarView(): string | null { return this._activeSidebarView }
  setActiveSidebarView(id: string | null): void {
    this._activeSidebarView = id
    this._onDidChangeActiveSidebarView.fire(id)
  }

  get panelVisible(): boolean { return this._panelVisible }
  setPanelVisible(visible: boolean): void {
    this._panelVisible = visible
    this._onDidChangePanelVisible.fire(visible)
  }

  get activePanelView(): string | null { return this._activePanelView }
  setActivePanelView(id: string | null): void { this._activePanelView = id }

  get sidebarVisible(): boolean { return this._sidebarVisible }
  setSidebarVisible(visible: boolean): void {
    this._sidebarVisible = visible
    this._onDidChangeSidebarVisible.fire(visible)
  }

  get auxSidebarVisible(): boolean { return this._auxSidebarVisible }
  setAuxSidebarVisible(visible: boolean): void { this._auxSidebarVisible = visible }

  getViews(location?: ViewDescriptor['location']): ViewDescriptor[] {
    const all = Array.from(this._views.values())
    if (location) return all.filter(v => v.location === location).sort((a, b) => a.order - b.order)
    return all.sort((a, b) => a.order - b.order)
  }
}
