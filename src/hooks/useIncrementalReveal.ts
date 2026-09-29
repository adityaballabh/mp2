import { useEffect, useRef, useState } from 'react'

// Reveals a long list in batches as the user scrolls: render the first
// `visibleCount` items and put `sentinelRef` on an element after them. When
// the sentinel nears the viewport, the next batch is revealed. Changing
// `resetKey` (e.g. a new search or filter) starts over from the first batch.
export function useIncrementalReveal(total: number, resetKey: string, batchSize: number) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const [countKey, setCountKey] = useState(resetKey)
  if (countKey !== resetKey) {
    setCountKey(resetKey)
    setVisibleCount(batchSize)
  }

  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = visibleCount < total

  // A fresh observer per batch: it reports the sentinel's current state right
  // away, so if a batch doesn't fill the screen the next one still loads.
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
