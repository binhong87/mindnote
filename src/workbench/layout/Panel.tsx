import type { ReactNode } from 'react'

interface PanelProps {
  visible: boolean
  children: ReactNode
  height?: number
}

export function Panel({ visible, children, height = 200 }: PanelProps) {
  if (!visible) return null

  return (
    <div
      style={{
        height: `${height}px`,
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}
