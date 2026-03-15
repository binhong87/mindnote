import type { ReactNode } from 'react'

interface SidebarShellProps {
  visible: boolean
  children: ReactNode
  title?: string
  width?: number
}

export function SidebarShell({ visible, children, title, width = 260 }: SidebarShellProps) {
  if (!visible) return null

  return (
    <div
      className="no-print flex flex-col"
      style={{
        width: `${width}px`,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {title && (
        <div
          style={{
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
