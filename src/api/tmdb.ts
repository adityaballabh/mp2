import axios from 'axios'
import type { Genre, Movie, MovieDetails, PagedResponse } from '../types/movie'

const apiKey = import.meta.env.VITE_TMDB_KEY

export const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: { api_key: apiKey, language: 'en-US' },
})

const IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Sizes TMDB serves for posters (widths in px, or the original upload).
export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export function posterUrl(path: string, size: PosterSize): string {
  return `${IMAGE_BASE}/${size}${path}`
}

// Backdrops are wide stills (16:9), served in their own set of sizes
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original'

export function backdropUrl(path: string, size: BackdropSize): string {
  return `${IMAGE_BASE}/${size}${path}`
}

// TMDB returns 20 movies per page, so 25 pages is the ~500 movie subset
// that the list view searches and sorts client-side.
const TOP_RATED_PAGES = 25

// Two cache layers, both keyed by request:
// - memory: holds the promise, so concurrent callers share one request
// - sessionStorage: holds the resolved JSON, so a page refresh in the same tab
//   skips the network. It is cleared when the tab closes.
// A failed request is dropped from memory and never stored, so the next call
// retries. Cached values must be JSON-serializable.
const memory = new Map<string, Promise<unknown>>()
const STORAGE_PREFIX = 'tmdb:'

function readStored<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    return undefined // storage blocked or entry corrupted: refetch
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the memory cache still covers this page load
  }
}

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let entry = memory.get(key) as Promise<T> | undefined
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
        memory.delete(key)
        throw err
      },
    )
  }
  memory.set(key, entry)
  return entry
}

async function loadTopRatedMovies(): Promise<Movie[]> {
  const pages = Array.from({ length: TOP_RATED_PAGES }, (_, i) => i + 1)
  const responses = await Promise.all(
    pages.map((page) =>
      tmdb.get<PagedResponse<Movie>>('/movie/top_rated', { params: { page } }),
    ),
  )

  // Rankings can shift between page requests, so the same movie can show up
  // on two pages. Keep the first occurrence.
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

// Genre id -> name, for turning a list movie's `genre_ids` into labels.
// The cache stores the plain array (a Map can't go through JSON), and the
// lookup is built from it on each call.
export async function getGenres(): Promise<Map<number, string>> {
  const genres = await cached('genres', async () => {
    const { data } = await tmdb.get<{ genres: Genre[] }>('/genre/movie/list')
    return data.genres
  })
  return new Map(genres.map((genre) => [genre.id, genre.name]))
}

export function getMovie(id: number): Promise<MovieDetails> {
  return cached(`movie/${id}`, async () => {
    const { data } = await tmdb.get<MovieDetails>(`/movie/${id}`)
    return data
  })
}
