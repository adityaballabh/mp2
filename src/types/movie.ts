// Shape of a movie in TMDB list responses (/movie/top_rated, /discover/movie, /search/movie)
export interface Movie {
  id: number
  title: string
  overview: string
  release_date: string // "YYYY-MM-DD", can be "" for unreleased titles
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

export interface ProductionCompany {
  id: number
  name: string
}

// Full record from /movie/{id}. It has `genres` objects in place of the
// list responses' `genre_ids`, plus fields the lists leave out. Only the
// fields the detail view uses are declared.
export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  genres: Genre[]
  tagline: string
  runtime: number | null // minutes
  budget: number // USD, 0 when unknown
  revenue: number // USD, 0 when unknown
  imdb_id: string | null
  original_title: string
  production_companies: ProductionCompany[]
}
