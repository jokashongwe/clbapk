import { useEffect, useState } from 'react'

let unreadCount = 0
const listeners = new Set<(count: number) => void>()

export function setUnreadAnnonces(count: number) {
  unreadCount = count
  listeners.forEach(listener => listener(count))
}

export function useUnreadAnnonces(): number {
  const [count, setCount] = useState(unreadCount)

  useEffect(() => {
    listeners.add(setCount)
    setCount(unreadCount)
    return () => {
      listeners.delete(setCount)
    }
  }, [])

  return count
}
