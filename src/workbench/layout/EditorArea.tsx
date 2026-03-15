import type { ReactNode } from 'react'

interface EditorAreaProps {
  children: ReactNode
}

export function EditorArea({ children }: EditorAreaProps) {
  return (
    <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}
