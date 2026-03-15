import type { ReactNode } from 'react'

interface AuxSidebarProps {
  visible: boolean
  children: ReactNode
  width?: number
}

export function AuxSidebar({ visible, children, width = 280 }: AuxSidebarProps) {
  if (!visible) return null

  return (
    <div
      className="no-print"
      style={{
        width: `${width}px`,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        flexShrink: 0,
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  )
}
