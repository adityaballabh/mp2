export interface Movie {
  id: number
  title: string
  overview: string
  // Empty for unreleased titles
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
  vote_average: number
  vote_count: number
  popularity: number
}

export interface PagedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

// Detail record, with genre objects in place of ids
export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  genres: Genre[]
  tagline: string
  // In minutes
  runtime: number | null
  // Budget and revenue are in USD, 0 when unknown
  budget: number
  revenue: number
  imdb_id: string | null
  original_title: string
  // Picked out of the credits before caching
  directors: string[]
}
