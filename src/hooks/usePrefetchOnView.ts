import { useEffect, useRef } from 'react'
import { onDwell, prefetchMovie } from '../utils/prefetch'

// Put the returned ref on a row or card: once it's been on screen for a
// moment, that movie's details are fetched into the cache, so opening it
// renders without waiting on the network.
export function usePrefetchOnView<T extends Element>(id: number) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    return onDwell(element, () => prefetchMovie(id))
  }, [id])

  return ref
}
