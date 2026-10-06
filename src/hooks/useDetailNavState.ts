import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { Movie } from '../types/movie'
import type { DetailNavState } from '../utils/detailNav'

// Handed to the detail page so previous/next follow these exact results
export function useDetailNavState(
  results: Movie[],
  backLabel: string,
): DetailNavState {
  const location = useLocation()
  return useMemo(
    () => ({
      ids: results.map((movie) => movie.id),
      backTo: location.pathname + location.search,
      backLabel,
    }),
    [results, location.pathname, location.search, backLabel],
  )
}
