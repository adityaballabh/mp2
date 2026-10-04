import type { Movie } from '../types/movie'

export type SortKey = 'rating' | 'votes' | 'title' | 'release'
export type SortOrder = 'asc' | 'desc'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Rating' },
  { key: 'votes', label: 'Vote count' },
  { key: 'title', label: 'Title' },
  { key: 'release', label: 'Release date' },
]

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value)
}

// Strips accents, then everything that isn't a letter or digit (spaces and
// punctuation included), and lowercases. Applied to both title and query,
// so "amelie" matches "Amélie", "spiderman" matches "Spider-Man", and
// "wall e" matches "WALL·E".
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase()
}

export function filterByTitle(movies: Movie[], query: string): Movie[] {
  const needle = normalize(query)
  if (!needle) return movies
  return movies.filter((movie) => normalize(movie.title).includes(needle))
}

// ignorePunctuation: "¿Quieres…" sorts under Q, not ahead of every letter
const titleCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
  ignorePunctuation: true,
})

function compareBy(key: SortKey, a: Movie, b: Movie): number {
  switch (key) {
    case 'rating':
      return a.vote_average - b.vote_average
    case 'votes':
      return a.vote_count - b.vote_count
    case 'title':
      return titleCollator.compare(a.title, b.title)
    case 'release':
      // "YYYY-MM-DD" strings sort chronologically as plain strings
      return a.release_date.localeCompare(b.release_date)
  }
}

// Returns a new array. `order` flips only the chosen property: ties keep
// their top-rated order, and movies with no release date always go last.
export function sortMovies(movies: Movie[], key: SortKey, order: SortOrder): Movie[] {
  const direction = order === 'asc' ? 1 : -1
  return movies
    .map((movie, index) => ({ movie, index }))
    .sort((a, b) => {
      if (key === 'release') {
        const missingA = a.movie.release_date === ''
        const missingB = b.movie.release_date === ''
        if (missingA !== missingB) return missingA ? 1 : -1
      }
      return direction * compareBy(key, a.movie, b.movie) || a.index - b.index
    })
    .map(({ movie }) => movie)
}

export type GenreMatch = 'all' | 'any'

// 'all': movies tagged with every selected genre. 'any': movies tagged with at
// least one. No selection keeps every movie.
export function filterByGenres(
  movies: Movie[],
  genreIds: number[],
  match: GenreMatch,
): Movie[] {
  if (genreIds.length === 0) return movies
  return movies.filter((movie) =>
    match === 'all'
      ? genreIds.every((id) => movie.genre_ids.includes(id))
      : genreIds.some((id) => movie.genre_ids.includes(id)),
  )
}
