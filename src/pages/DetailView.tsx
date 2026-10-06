import clsx from 'clsx'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import MovieFacts from '../components/MovieFacts'
import MovieHero from '../components/MovieHero'
import { useMovieDetails } from '../hooks/useMovieDetails'
import { useStepper } from '../hooks/useStepper'
import { useTopRatedAndGenres } from '../hooks/useTopRatedAndGenres'
import { isDetailNavState } from '../utils/detailNav'
import styles from './DetailView.module.css'

// "278" -> 278, anything else is null and shows as not found
function parseId(value: string | undefined): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function DetailView() {
  const params = useParams()
  const id = parseId(params.id)
  const location = useLocation()
  const { movie, loading, notFound, error } = useMovieDetails(id)

  // Walk the list the user came from, or top-rated order when opened by URL
  const navState = isDetailNavState(location.state) ? location.state : null
  const { movies: topRated } = useTopRatedAndGenres()
  const ids = navState?.ids ?? topRated.map((m) => m.id)
  const { index, inList, prevId, nextId, goTo } = useStepper(id, ids, navState)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const backTo = navState?.backTo ?? '/'
  const backLabel = navState?.backLabel ?? 'List'
  const backLink = (
    <Link to={backTo} className={styles.back}>
      ← Back to {backLabel}
    </Link>
  )

  return (
    <main className={styles.main}>
      {/* The back link moves into the hero once the movie loads */}
      {movie ? (
        <MovieHero movie={movie} backLink={backLink} />
      ) : (
        <div className={clsx(styles.page, styles.bareBack)}>{backLink}</div>
      )}

      <div className={clsx(styles.page, styles.aboveGlow)}>
        {inList && (
          <nav className={styles.stepper} aria-label="Previous and next movie">
            <button
              type="button"
              className={styles.step}
              onClick={() => prevId !== null && goTo(prevId)}
              disabled={prevId === null}
              aria-label="Previous movie"
            >
              ←<span className={styles.stepText}> Previous</span>
            </button>
            <span className={styles.position}>
              {index + 1} of {ids.length}
            </span>
            <button
              type="button"
              className={styles.step}
              onClick={() => nextId !== null && goTo(nextId)}
              disabled={nextId === null}
              aria-label="Next movie"
            >
              <span className={styles.stepText}>Next </span>→
            </button>
          </nav>
        )}

        {loading && <p className={styles.status}>Loading movie…</p>}
        {notFound && <p className={styles.status}>Movie not found.</p>}
        {error && (
          <p className={styles.status}>Couldn’t load this movie: {error}</p>
        )}
        {movie && <MovieFacts movie={movie} />}
      </div>
    </main>
  )
}

export default DetailView
