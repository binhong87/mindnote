/**
 * React integration for the service layer.
 * Provides the ServiceCollection via context and typed hooks for each service.
 */

import { createContext, useContext, useSyncExternalStore } from 'react'
import type { ServiceCollection, ServiceIdentifier } from './ServiceCollection'
import type { Emitter } from './Emitter'

// ── Context ──

const ServiceContext = createContext<ServiceCollection | null>(null)

export const ServiceProvider = ServiceContext.Provider

export function useServiceCollection(): ServiceCollection {
  const ctx = useContext(ServiceContext)
  if (!ctx) throw new Error('useServiceCollection must be used within a ServiceProvider')
  return ctx
}

/**
 * Generic hook to retrieve any service by its identifier.
 */
export function useService<T>(id: ServiceIdentifier<T>): T {
  return useServiceCollection().get(id)
}

/**
 * Subscribe to an Emitter-based service property reactively.
 *
 * Usage:
 *   const theme = useServiceState(themeService.onDidChangeTheme, () => themeService.theme)
 */
export function useServiceState<T>(
  subscribe: Emitter<unknown>['event'],
  getSnapshot: () => T,
): T {
  return useSyncExternalStore(
    (callback) => {
      const disposable = subscribe(callback)
      return () => disposable.dispose()
    },
    getSnapshot,
    getSnapshot, // server snapshot (same for now)
  )
}
