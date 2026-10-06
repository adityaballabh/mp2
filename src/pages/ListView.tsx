import { useMemo } from 'react'
import ListControls from '../components/ListControls'
import MovieRow from '../components/MovieRow'
import PageStatus from '../components/PageStatus'
import { useDetailNavState } from '../hooks/useDetailNavState'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'
import { useTopRatedAndGenres } from '../hooks/useTopRatedAndGenres'
import { useUrlParams } from '../hooks/useUrlParams'
import { filterByTitle, isSortKey, sortMovies } from '../utils/movieQuery'
import type { SortKey, SortOrder } from '../utils/movieQuery'
import styles from './ListView.module.css'

// Render rows in batches so the first paint builds only a screenful
const BATCH_SIZE = 20

function ListView() {
  const { movies, genres, loading, error } = useTopRatedAndGenres()

  // Keep search and sort in the URL so they survive a refresh and coming back
  const { searchParams, setParam } = useUrlParams()
  const query = searchParams.get('q') ?? ''
  const sortParam = searchParams.get('sort')
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'rating'
  const order: SortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

  const results = useMemo(
    () => sortMovies(filterByTitle(movies, query), sortKey, order),
    [movies, query, sortKey, order],
  )

  const navState = useDetailNavState(results, 'List')

  const { visibleCount, sentinelRef, hasMore } = useIncrementalReveal(
    results.length,
    `${query}|${sortKey}|${order}`,
    BATCH_SIZE,
  )

  if (loading) return <PageStatus>Loading movies…</PageStatus>
  if (error) return <PageStatus>Couldn’t load movies: {error}</PageStatus>

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Movies</h1>
      <ListControls
        query={query}
        sortKey={sortKey}
        order={order}
        onQueryChange={(value) => setParam('q', value, '')}
        onSortKeyChange={(value) => setParam('sort', value, 'rating')}
        onOrderChange={(value) => setParam('order', value, 'desc')}
      />
      <p className={styles.count} aria-live="polite">
        {results.length === movies.length
          ? `${movies.length} movies`
          : `${results.length} of ${movies.length} movies`}
      </p>
      {results.length === 0 ? (
        <p className={styles.status}>No titles match “{query.trim()}”.</p>
      ) : (
        <ol className={styles.list}>
          {results.slice(0, visibleCount).map((movie) => (
            <MovieRow
              key={movie.id}
              movie={movie}
              genres={genres}
              navState={navState}
            />
          ))}
        </ol>
      )}
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </main>
  )
}

export default ListView
