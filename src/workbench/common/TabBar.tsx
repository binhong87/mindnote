interface TabBarItem {
  id: string
  label: string
  icon?: string
  pinned?: boolean
}

interface TabBarProps {
  tabs: TabBarItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose?: (id: string) => void
  onDoubleClick?: (id: string) => void
  className?: string
}

export function TabBar({ tabs, activeId, onSelect, onClose, onDoubleClick, className = '' }: TabBarProps) {
  if (tabs.length === 0) return null

  return (
    <div
      className={`flex items-center overflow-x-auto no-print ${className}`}
      style={{
        height: '36px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeId
        return (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            onDoubleClick={() => onDoubleClick?.(tab.id)}
            className="flex items-center gap-1 px-3 cursor-pointer select-none group"
            style={{
              height: '100%',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-primary)' : 'transparent',
              borderRight: '1px solid var(--border)',
              fontStyle: tab.pinned ? 'normal' : 'italic',
              minWidth: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span style={{ fontSize: '11px' }}>{tab.icon}</span>}
            <span className="truncate max-w-[120px]">{tab.label}</span>
            {onClose && (
              <button
                onClick={e => { e.stopPropagation(); onClose(tab.id) }}
                className="opacity-0 group-hover:opacity-100 ml-1"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
