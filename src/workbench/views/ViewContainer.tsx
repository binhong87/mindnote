/**
 * ViewContainer — renders the appropriate sidebar content based on the active view.
 */

import type { ComponentType } from 'react'

// Registry of view ID → React component
const viewComponents = new Map<string, ComponentType>()

export function registerViewComponent(id: string, component: ComponentType): void {
  viewComponents.set(id, component)
}

interface ViewContainerProps {
  activeViewId: string | null
  fallback?: ComponentType
}

export function ViewContainer({ activeViewId, fallback: Fallback }: ViewContainerProps) {
  if (!activeViewId) {
    return Fallback ? <Fallback /> : null
  }
  const Component = viewComponents.get(activeViewId)
  if (!Component) {
    return Fallback ? <Fallback /> : <div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>View not found: {activeViewId}</div>
  }
  return <Component />
}
