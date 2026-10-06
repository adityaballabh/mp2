import axios from 'axios'
import type { Genre, Movie, MovieDetails, PagedResponse } from '../types/movie'

const apiKey = import.meta.env.VITE_TMDB_KEY

export const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: { api_key: apiKey, language: 'en-US' },
})

const IMAGE_BASE = 'https://image.tmdb.org/t/p'

export type PosterSize =
  'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export function posterUrl(path: string, size: PosterSize): string {
  return `${IMAGE_BASE}/${size}${path}`
}

export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original'

export function backdropUrl(path: string, size: BackdropSize): string {
  return `${IMAGE_BASE}/${size}${path}`
}

// 20 movies per page, so 25 pages gives the ~500 movie subset
const TOP_RATED_PAGES = 25

// Memory shares in-flight requests, sessionStorage survives a refresh
const memoryCache = new Map<string, Promise<unknown>>()
const STORAGE_PREFIX = 'tmdb:'

function readStored<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    // Storage blocked or entry corrupted, so refetch
    return undefined
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage full or blocked, the memory cache still covers this page load
  }
}

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let entry = memoryCache.get(key) as Promise<T> | undefined
  if (entry) return entry

  const stored = readStored<T>(key)
  if (stored !== undefined) {
    entry = Promise.resolve(stored)
  } else if (!apiKey) {
    return Promise.reject(new Error('VITE_TMDB_KEY is not set'))
  } else {
    entry = load().then(
      (value) => {
        writeStored(key, value)
        return value
      },
      (err: unknown) => {
        memoryCache.delete(key)
        throw err
      },
    )
  }
  memoryCache.set(key, entry)
  return entry
}

async function loadTopRatedMovies(): Promise<Movie[]> {
  const pages = Array.from({ length: TOP_RATED_PAGES }, (_, i) => i + 1)
  const responses = await Promise.all(
    pages.map((page) =>
      tmdb.get<PagedResponse<Movie>>('/movie/top_rated', { params: { page } }),
    ),
  )

  // Rankings can shift between page requests, so skip movies already seen
  const seen = new Set<number>()
  const movies: Movie[] = []
  for (const { data } of responses) {
    for (const movie of data.results) {
      if (!seen.has(movie.id)) {
        seen.add(movie.id)
        movies.push(movie)
      }
    }
  }
  return movies
}

export function getTopRatedMovies(): Promise<Movie[]> {
  return cached('top_rated', loadTopRatedMovies)
}

// Cache the plain array since a Map can't go through JSON
export async function getGenres(): Promise<Map<number, string>> {
  const genres = await cached('genres', async () => {
    const { data } = await tmdb.get<{ genres: Genre[] }>('/genre/movie/list')
    return data.genres
  })
  return new Map(genres.map((genre) => [genre.id, genre.name]))
}

interface MovieDetailsResponse extends Omit<MovieDetails, 'directors'> {
  credits: { crew: { job: string; name: string }[] }
}

// Keep only the director names so the cached entry stays small
export function getMovie(id: number): Promise<MovieDetails> {
  return cached(`movie-details/${id}`, async () => {
    const { data } = await tmdb.get<MovieDetailsResponse>(`/movie/${id}`, {
      params: { append_to_response: 'credits' },
    })
    const { credits, ...movie } = data
    const directors = credits.crew
      .filter((member) => member.job === 'Director')
      .map((member) => member.name)
    return { ...movie, directors }
  })
}
