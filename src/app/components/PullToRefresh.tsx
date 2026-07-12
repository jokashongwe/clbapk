import React from 'react'
import { useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

const THRESHOLD = 64

type Props = {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className = '' }: Props) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const tracking = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0 && !refreshing) {
      startY.current = e.touches[0].clientY
      tracking.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!tracking.current || refreshing) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.45, THRESHOLD + 16))
    }
  }

  const handleTouchEnd = async () => {
    if (!tracking.current) return
    tracking.current = false

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  return (
    <div className={`relative flex flex-col flex-1 min-h-0 ${className}`}>
      {(pullDistance > 0 || refreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
          style={{ height: Math.max(pullDistance, refreshing ? THRESHOLD : 0) }}
        >
          <Loader2
            size={20}
            className={`text-clb-blue mt-3 ${refreshing ? 'animate-spin' : ''}`}
          />
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          transform: pullDistance ? `translateY(${pullDistance}px)` : undefined,
          transition: refreshing || pullDistance === 0 ? 'transform 0.2s ease' : undefined,
          scrollbarWidth: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
