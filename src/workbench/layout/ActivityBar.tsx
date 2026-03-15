interface ActivityBarProps {
  items: { id: string; icon: string; label: string }[]
  activeId: string | null
  onSelect: (id: string) => void
  bottomItems?: { id: string; icon: string; label: string; onClick: () => void }[]
}

export function ActivityBar({ items, activeId, onSelect, bottomItems }: ActivityBarProps) {
  return (
    <div
      className="no-print flex flex-col items-center justify-between"
      style={{
        width: '48px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        paddingTop: '4px',
        paddingBottom: '4px',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={item.label}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
              color: activeId === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderLeft: activeId === item.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
      {bottomItems && (
        <div className="flex flex-col items-center gap-1">
          {bottomItems.map(item => (
            <button
              key={item.id}
              onClick={item.onClick}
              title={item.label}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
              }}
            >
              {item.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
