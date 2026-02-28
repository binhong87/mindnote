import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

export function Toast({ message, duration = 2000, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, duration)
    return () => clearTimeout(t)
  }, [duration, onDone])

  if (!visible) return null

  return (
    <div className="toast no-print">
      {message}
    </div>
  )
}

export function useToast() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
  }

  const toastElement = toastMsg ? (
    <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
  ) : null

  return { showToast, toastElement }
}
