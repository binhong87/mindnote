interface StatusBarItem {
  id: string
  text: string
  icon?: string
  tooltip?: string
  alignment: 'left' | 'right'
  priority?: number
  onClick?: () => void
}

interface StatusBarProps {
  items: StatusBarItem[]
}

export function StatusBar({ items }: StatusBarProps) {
  const leftItems = items.filter(i => i.alignment === 'left').sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  const rightItems = items.filter(i => i.alignment === 'right').sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))

  return (
    <div
      className="no-print"
      style={{
        height: '24px',
        background: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        fontSize: '11px',
        color: 'var(--bg-primary)',
        flexShrink: 0,
      }}
    >
      <div className="flex items-center gap-3">
        {leftItems.map(item => (
          <StatusBarEntry key={item.id} item={item} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {rightItems.map(item => (
          <StatusBarEntry key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function StatusBarEntry({ item }: { item: StatusBarItem }) {
  return (
    <span
      onClick={item.onClick}
      title={item.tooltip}
      style={{
        cursor: item.onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
      }}
    >
      {item.icon && <span>{item.icon}</span>}
      {item.text}
    </span>
  )
}

export type { StatusBarItem }
