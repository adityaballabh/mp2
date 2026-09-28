import { useEffect, useState } from 'react'
import { getGenres, getTopRatedMovies } from '../api/tmdb'
import type { Movie } from '../types/movie'

interface TopRatedState {
  movies: Movie[]
  genres: Map<number, string>
  loading: boolean
  error: string | null
}

// Loads the top-rated subset and the genre lookup together. Both come from
// the api cache, so every view using this hook shares the same requests.
export function useTopRatedMovies(): TopRatedState {
  const [state, setState] = useState<TopRatedState>({
    movies: [],
    genres: new Map(),
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([getTopRatedMovies(), getGenres()])
      .then(([movies, genres]) => {
        if (!cancelled) setState({ movies, genres, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const error = err instanceof Error ? err.message : 'Failed to load movies'
        setState((prev) => ({ ...prev, loading: false, error }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
