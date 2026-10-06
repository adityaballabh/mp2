import { useMemo } from 'react'
import GenreFilter from '../components/GenreFilter'
import PageStatus from '../components/PageStatus'
import PosterCard from '../components/PosterCard'
import { useDetailNavState } from '../hooks/useDetailNavState'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'
import { useTopRatedAndGenres } from '../hooks/useTopRatedAndGenres'
import { useUrlParams } from '../hooks/useUrlParams'
import type { Genre } from '../types/movie'
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
  const { movies, genres, loading, error } = useTopRatedAndGenres()

  // Keep filters in the URL like the list view
  const { searchParams, setParam } = useUrlParams()
  const genresParam = searchParams.get('genres') ?? ''
  const selected = useMemo(() => parseGenreIds(genresParam), [genresParam])
  const match: GenreMatch = searchParams.get('match') === 'any' ? 'any' : 'all'

  function setSelected(ids: number[]) {
    setParam('genres', ids.join(','), '')
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

  const results = useMemo(
    () => filterByGenres(movies, selected, match),
    [movies, selected, match],
  )

  const navState = useDetailNavState(results, 'Gallery')

  const { visibleCount, sentinelRef, hasMore } = useIncrementalReveal(
    results.length,
    `${genresParam}|${match}`,
    BATCH_SIZE,
  )

  if (loading) return <PageStatus>Loading movies…</PageStatus>
  if (error) return <PageStatus>Couldn’t load movies: {error}</PageStatus>

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
          onMatchChange={(value) => setParam('match', value, 'all')}
        />
      </section>
      <p className={styles.count} aria-live="polite">
        {results.length === movies.length
          ? `${movies.length} movies`
          : `${results.length} of ${movies.length} movies`}
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
