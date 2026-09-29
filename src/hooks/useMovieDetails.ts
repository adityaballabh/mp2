import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { getMovie } from '../api/tmdb'
import type { MovieDetails } from '../types/movie'

type Result =
  | { status: 'loaded'; movie: MovieDetails }
  | { status: 'not-found' }
  | { status: 'error'; message: string }

interface MovieDetailsState {
  movie: MovieDetails | null
  loading: boolean
  notFound: boolean
  error: string | null
}

// Loads /movie/{id} through the api cache. `id` is null for a malformed URL.
export function useMovieDetails(id: number | null): MovieDetailsState {
  // Tagged with the id it belongs to, so a new id reads as loading straight
  // away instead of briefly showing the previous movie
  const [result, setResult] = useState<{ id: number; result: Result } | null>(
    null,
  )

  useEffect(() => {
    if (id === null) return
    let cancelled = false
    getMovie(id)
      .then((movie) => {
        if (!cancelled) setResult({ id, result: { status: 'loaded', movie } })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          setResult({ id, result: { status: 'not-found' } })
        } else {
          const message =
            err instanceof Error ? err.message : 'Failed to load movie'
          setResult({ id, result: { status: 'error', message } })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (id === null) {
    return { movie: null, loading: false, notFound: true, error: null }
  }
  const current = result?.id === id ? result.result : null
  return {
    movie: current?.status === 'loaded' ? current.movie : null,
    loading: current === null,
    notFound: current?.status === 'not-found',
    error: current?.status === 'error' ? current.message : null,
  }
}
