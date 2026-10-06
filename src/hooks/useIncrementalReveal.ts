import { useEffect, useRef, useState } from 'react'

// Reveal the next batch as the sentinel nears the viewport
export function useIncrementalReveal(
  total: number,
  resetKey: string,
  batchSize: number,
) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  // Reset to one batch during render so the old count never paints
  const [countKey, setCountKey] = useState(resetKey)
  if (countKey !== resetKey) {
    setCountKey(resetKey)
    setVisibleCount(batchSize)
  }

  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = visibleCount < total

  // New observer per batch, since a sentinel still in view never fires again
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => count + batchSize)
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, hasMore, batchSize])

  return { visibleCount, sentinelRef, hasMore }
}
