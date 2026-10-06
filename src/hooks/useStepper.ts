import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { detailPath } from '../utils/detailNav'
import type { DetailNavState } from '../utils/detailNav'
import { prefetchMovieAndHeroImages } from '../utils/prefetch'

export function useStepper(
  id: number | null,
  ids: number[],
  navState: DetailNavState | null,
) {
  const navigate = useNavigate()
  const index = id === null ? -1 : ids.indexOf(id)
  const inList = index !== -1
  // With one result the buttons show but stay disabled
  const hasNeighbors = inList && ids.length > 1
  // Wraps around at both ends
  const prevId = hasNeighbors
    ? ids[(index - 1 + ids.length) % ids.length]
    : null
  const nextId = hasNeighbors ? ids[(index + 1) % ids.length] : null

  // Replace so browser Back returns to the list instead of each movie viewed
  const goTo = useCallback(
    (targetId: number) => {
      navigate(detailPath(targetId), { state: navState, replace: true })
    },
    [navState, navigate],
  )

  // Warm both neighbors so previous/next render instantly
  useEffect(() => {
    if (prevId !== null) prefetchMovieAndHeroImages(prevId)
    if (nextId !== null) prefetchMovieAndHeroImages(nextId)
  }, [prevId, nextId])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      let targetId: number | null = null
      if (event.key === 'ArrowLeft') targetId = prevId
      else if (event.key === 'ArrowRight') targetId = nextId
      if (targetId !== null) {
        event.preventDefault()
        goTo(targetId)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prevId, nextId, goTo])

  return { index, inList, prevId, nextId, goTo }
}
