import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import ListControls from '../components/ListControls'
import MovieRow from '../components/MovieRow'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'
import { useTopRatedMovies } from '../hooks/useTopRatedMovies'
import type { DetailNavState } from '../utils/detailNav'
import { filterByTitle, isSortKey, sortMovies } from '../utils/movieQuery'
import type { SortKey, SortOrder } from '../utils/movieQuery'
import styles from './ListView.module.css'

// Rows are rendered in batches as the user scrolls, so the first paint only
// builds (and fetches posters for) a screenful instead of all ~500 rows.
const BATCH_SIZE = 20

function ListView() {
  const { movies, genres, loading, error } = useTopRatedMovies()

  // Search and sort live in the URL (?q=&sort=&order=), so they survive a
  // refresh and are restored when coming back from another page.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const sortParam = searchParams.get('sort')
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'rating'
  const order: SortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

  function updateParam(name: string, value: string, fallback: string) {
    setSearchParams(
      (params) => {
        if (value === fallback) params.delete(name)
        else params.set(name, value)
        return params
      },
      // Replace, so typing doesn't add a history entry per keystroke
      { replace: true },
    )
  }

  const results = useMemo(
    () => sortMovies(filterByTitle(movies, query), sortKey, order),
    [movies, query, sortKey, order],
  )

  // Handed to the detail page so previous/next follow these exact results
  const location = useLocation()
  const navState: DetailNavState = useMemo(
    () => ({
      ids: results.map((movie) => movie.id),
      backTo: location.pathname + location.search,
      backLabel: 'List',
    }),
    [results, location.pathname, location.search],
  )

  const { visibleCount, sentinelRef, hasMore } = useIncrementalReveal(
    results.length,
    `${query}|${sortKey}|${order}`,
    BATCH_SIZE,
  )

  if (loading) return <p className={styles.status}>Loading…</p>
  if (error) return <p className={styles.status}>Error: {error}</p>

  return (
    <main>
      <h1 className={styles.heading}>Top rated movies</h1>
      <ListControls
        query={query}
        sortKey={sortKey}
        order={order}
        onQueryChange={(value) => updateParam('q', value, '')}
        onSortKeyChange={(value) => updateParam('sort', value, 'rating')}
        onOrderChange={(value) => updateParam('order', value, 'desc')}
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
