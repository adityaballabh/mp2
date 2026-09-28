import { useEffect, useRef, useState } from 'react'
import MovieRow from '../components/MovieRow'
import { useTopRatedMovies } from '../hooks/useTopRatedMovies'
import styles from './ListView.module.css'

// Rows are rendered in batches as the user scrolls, so the first paint only
// builds (and fetches posters for) a screenful instead of all ~500 rows.
const BATCH_SIZE = 20

function ListView() {
  const { movies, genres, loading, error } = useTopRatedMovies()
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const hasMore = visibleCount < movies.length

  // A fresh observer per batch: it reports the sentinel's current state right
  // away, so if a batch doesn't fill the screen the next one still loads.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => count + BATCH_SIZE)
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, hasMore])

  if (loading) return <p className={styles.status}>Loading…</p>
  if (error) return <p className={styles.status}>Error: {error}</p>

  return (
    <main>
      <h1 className={styles.heading}>Top rated movies</h1>
      <ol className={styles.list}>
        {movies.slice(0, visibleCount).map((movie, index) => (
          <MovieRow
            key={movie.id}
            movie={movie}
            rank={index + 1}
            genres={genres}
          />
        ))}
      </ol>
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </main>
  )
}

export default ListView
