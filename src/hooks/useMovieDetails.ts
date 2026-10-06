import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { getMovie } from '../api/tmdb'
import type { MovieDetails } from '../types/movie'

type MovieResult =
  | { status: 'loaded'; movie: MovieDetails }
  | { status: 'not-found' }
  | { status: 'error'; message: string }

interface MovieDetailsState {
  movie: MovieDetails | null
  loading: boolean
  notFound: boolean
  error: string | null
}

// A null id means a malformed URL
export function useMovieDetails(id: number | null): MovieDetailsState {
  // Tag the result with its id so a new id never shows the previous movie
  const [loaded, setLoaded] = useState<{
    id: number
    result: MovieResult
  } | null>(null)

  useEffect(() => {
    if (id === null) return
    let cancelled = false
    getMovie(id)
      .then((movie) => {
        if (!cancelled) setLoaded({ id, result: { status: 'loaded', movie } })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          setLoaded({ id, result: { status: 'not-found' } })
        } else {
          const message =
            err instanceof Error ? err.message : 'Failed to load movie'
          setLoaded({ id, result: { status: 'error', message } })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (id === null) {
    return { movie: null, loading: false, notFound: true, error: null }
  }
  const result = loaded?.id === id ? loaded.result : null
  return {
    movie: result?.status === 'loaded' ? result.movie : null,
    loading: result === null,
    notFound: result?.status === 'not-found',
    error: result?.status === 'error' ? result.message : null,
  }
}
