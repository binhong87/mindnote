import { useState, useRef, useCallback, type ReactNode } from 'react'

interface SplitViewProps {
  children: [ReactNode, ReactNode]
  direction?: 'horizontal' | 'vertical'
  initialSize?: number // px for the first pane
  minSize?: number
  maxSize?: number
  className?: string
}

export function SplitView({
  children,
  direction = 'horizontal',
  initialSize = 260,
  minSize = 150,
  maxSize = 600,
  className = '',
}: SplitViewProps) {
  const [size, setSize] = useState(initialSize)
  const dragging = useRef(false)
  const startPos = useRef(0)
  const startSize = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
    startSize.current = size

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = (direction === 'horizontal' ? ev.clientX : ev.clientY) - startPos.current
      const newSize = Math.min(maxSize, Math.max(minSize, startSize.current + delta))
      setSize(newSize)
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [direction, size, minSize, maxSize])

  const isHorizontal = direction === 'horizontal'

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`} style={{ height: '100%', width: '100%' }}>
      <div style={{ [isHorizontal ? 'width' : 'height']: `${size}px`, flexShrink: 0, overflow: 'hidden' }}>
        {children[0]}
      </div>
      <div
        onMouseDown={onMouseDown}
        style={{
          [isHorizontal ? 'width' : 'height']: '4px',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          background: 'var(--border)',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children[1]}
      </div>
    </div>
  )
}
