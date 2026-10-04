import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import GenreFilter from '../components/GenreFilter'
import PosterCard from '../components/PosterCard'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'
import { useTopRatedMovies } from '../hooks/useTopRatedMovies'
import type { Genre } from '../types/movie'
import type { DetailNavState } from '../utils/detailNav'
import { filterByGenres } from '../utils/movieQuery'
import type { GenreMatch } from '../utils/movieQuery'
import styles from './GalleryView.module.css'

// Posters are larger than list rows, so fewer fill a screen
const BATCH_SIZE = 24

// ?genres=18,80 -> [18, 80], ignoring anything that isn't a genre id
function parseGenreIds(value: string | null): number[] {
  if (!value) return []
  return value
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0)
}

function GalleryView() {
  const { movies, genres, loading, error } = useTopRatedMovies()

  // Filters live in the URL (?genres=&match=), like the list
  // view's search and sort
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = parseGenreIds(searchParams.get('genres'))
  const match: GenreMatch = searchParams.get('match') === 'any' ? 'any' : 'all'

  function updateParam(name: string, value: string, fallback: string) {
    setSearchParams(
      (params) => {
        if (value === fallback) params.delete(name)
        else params.set(name, value)
        return params
      },
      // Replace, so filter tweaks don't pile up in the back history
      { replace: true },
    )
  }

  function setSelected(ids: number[]) {
    updateParam('genres', ids.join(','), '')
  }

  function toggleGenre(id: number) {
    setSelected(
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    )
  }

  // Only offer genres that at least one movie in the subset has
  const availableGenres = useMemo(() => {
    const present = new Set(movies.flatMap((movie) => movie.genre_ids))
    const options: Genre[] = []
    for (const [id, name] of genres) {
      if (present.has(id)) options.push({ id, name })
    }
    return options.sort((a, b) => a.name.localeCompare(b.name))
  }, [movies, genres])

  const selectedKey = selected.join(',')
  const results = useMemo(
    () => filterByGenres(movies, parseGenreIds(selectedKey), match),
    [movies, selectedKey, match],
  )

  // Handed to the detail page so previous/next follow these exact results
  const location = useLocation()
  const navState: DetailNavState = useMemo(
    () => ({
      ids: results.map((movie) => movie.id),
      backTo: location.pathname + location.search,
      backLabel: 'Gallery',
    }),
    [results, location.pathname, location.search],
  )

  const { visibleCount, sentinelRef, hasMore } = useIncrementalReveal(
    results.length,
    `${selectedKey}|${match}`,
    BATCH_SIZE,
  )

  if (loading)
    return (
      <main className={styles.page}>
        <p className={styles.status}>Loading movies…</p>
      </main>
    )
  if (error)
    return (
      <main className={styles.page}>
        <p className={styles.status}>Couldn’t load movies: {error}</p>
      </main>
    )

    return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Gallery</h1>
      <section className={styles.filters} aria-label="Filters">
        <GenreFilter
          genres={availableGenres}
          selected={selected}
          match={match}
          onToggle={toggleGenre}
          onClear={() => setSelected([])}
          onMatchChange={(value) => updateParam('match', value, 'all')}
        />
      </section>
      <p className={styles.count} aria-live="polite">
        {selected.length > 0
          ? `${results.length} of ${movies.length} movies`
          : `${movies.length} movies`}
      </p>
      {results.length === 0 ? (
        <p className={styles.status}>No movies match these filters.</p>
      ) : (
        <ul className={styles.grid}>
          {results.slice(0, visibleCount).map((movie) => (
            <PosterCard key={movie.id} movie={movie} navState={navState} />
          ))}
        </ul>
      )}
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </main>
  )
}

export default GalleryView
