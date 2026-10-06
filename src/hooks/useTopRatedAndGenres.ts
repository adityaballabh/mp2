import { useEffect, useState } from 'react'
import { getGenres, getTopRatedMovies } from '../api/tmdb'
import type { Movie } from '../types/movie'

interface TopRatedAndGenresState {
  movies: Movie[]
  genres: Map<number, string>
  loading: boolean
  error: string | null
}

export function useTopRatedAndGenres(): TopRatedAndGenresState {
  const [state, setState] = useState<TopRatedAndGenresState>({
    movies: [],
    genres: new Map(),
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([getTopRatedMovies(), getGenres()])
      .then(([movies, genres]) => {
        if (!cancelled)
          setState({ movies, genres, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const error =
          err instanceof Error ? err.message : 'Failed to load movies'
        setState((prev) => ({ ...prev, loading: false, error }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
