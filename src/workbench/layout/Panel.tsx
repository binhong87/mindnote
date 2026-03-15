import { useState, useRef, useCallback, type ReactNode } from 'react'
import { TabBar } from '../common/TabBar'

interface PanelTab {
  id: string
  label: string
  icon?: string
}

interface PanelProps {
  visible: boolean
  children: ReactNode
  height?: number
  tabs?: PanelTab[]
  activeTabId?: string
  onSelectTab?: (id: string) => void
  onClose?: () => void
}

export function Panel({
  visible,
  children,
  height: initialHeight = 200,
  tabs,
  activeTabId,
  onSelectTab,
  onClose,
}: PanelProps) {
  const [height, setHeight] = useState(initialHeight)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startY.current = e.clientY
    startH.current = height

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = startY.current - ev.clientY
      setHeight(Math.min(600, Math.max(100, startH.current + delta)))
    }
    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [height])

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
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          height: '4px',
          cursor: 'row-resize',
          background: 'var(--border)',
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
      />
      {/* Panel header with tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <TabBar
            tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon, pinned: true }))}
            activeId={activeTabId || null}
            onSelect={id => onSelectTab?.(id)}
          />
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '14px',
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
