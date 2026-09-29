import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { backdropUrl, getMovie, posterUrl } from '../api/tmdb'
import { useMovieDetails } from '../hooks/useMovieDetails'
import { useTopRatedMovies } from '../hooks/useTopRatedMovies'
import type { MovieDetails } from '../types/movie'
import { detailPath, isDetailNavState } from '../utils/detailNav'
import styles from './DetailView.module.css'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC', // release_date is a plain date; don't shift it by timezone
})
const moneyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`
}

// "/movie/278" -> 278. Anything else is null and renders as not found.
function parseId(value: string | undefined): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function DetailView() {
  const params = useParams()
  const id = parseId(params.id)
  const location = useLocation()
  const navigate = useNavigate()
  const { movie, loading, notFound, error } = useMovieDetails(id)

  // Previous/next walk the list the user came from. Opened directly by URL
  // there is no such list, so fall back to the full top-rated order.
  const navState = isDetailNavState(location.state) ? location.state : null
  const { movies: topRated } = useTopRatedMovies()
  const ids = navState?.ids ?? topRated.map((m) => m.id)
  const index = id === null ? -1 : ids.indexOf(id)
  const hasNeighbors = index !== -1 && ids.length > 1
  // Wraps around at both ends
  const prevId = hasNeighbors
    ? ids[(index - 1 + ids.length) % ids.length]
    : null
  const nextId = hasNeighbors ? ids[(index + 1) % ids.length] : null

  // Replace rather than push, so the browser's Back button still returns to
  // the list instead of stepping back through every movie viewed
  function goTo(targetId: number) {
    navigate(detailPath(targetId), { state: navState, replace: true })
  }

  // Warm the cache for both neighbours so previous/next render instantly
  useEffect(() => {
    for (const neighborId of [prevId, nextId]) {
      if (neighborId !== null) getMovie(neighborId).catch(() => {})
    }
  }, [prevId, nextId])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Left/right arrow keys step through the list too
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      const targetId =
        event.key === 'ArrowLeft'
          ? prevId
          : event.key === 'ArrowRight'
            ? nextId
            : null
      if (targetId !== null) {
        event.preventDefault()
        navigate(detailPath(targetId), { state: navState, replace: true })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prevId, nextId, navState, navigate])

  const backTo = navState?.backTo ?? '/'
  const backLabel = navState?.backLabel ?? 'List'

  return (
    <main>
      <nav className={styles.toolbar} aria-label="Movie navigation">
        <Link to={backTo} className={styles.back}>
          ← Back to {backLabel}
        </Link>
        {hasNeighbors && prevId !== null && nextId !== null && (
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.step}
              onClick={() => goTo(prevId)}
              aria-label="Previous movie"
            >
              ←<span className={styles.stepText}> Previous</span>
            </button>
            <span className={styles.position}>
              {index + 1} / {ids.length}
            </span>
            <button
              type="button"
              className={styles.step}
              onClick={() => goTo(nextId)}
              aria-label="Next movie"
            >
              <span className={styles.stepText}>Next </span>→
            </button>
          </div>
        )}
      </nav>

      {loading && <p className={styles.status}>Loading…</p>}
      {notFound && <p className={styles.status}>Movie not found.</p>}
      {error && <p className={styles.status}>Error: {error}</p>}
      {movie && <MovieDetailsBody movie={movie} />}
    </main>
  )
}

function MovieDetailsBody({ movie }: { movie: MovieDetails }) {
  const year = movie.release_date.slice(0, 4)
  const studios = movie.production_companies.map((c) => c.name).join(', ')

  const facts: [string, string][] = []
  if (movie.release_date) {
    facts.push(['Released', dateFormat.format(new Date(movie.release_date))])
  }
  if (movie.runtime) facts.push(['Runtime', formatRuntime(movie.runtime)])
  if (movie.original_title !== movie.title) {
    facts.push(['Original title', movie.original_title])
  }
  if (movie.budget > 0) facts.push(['Budget', moneyFormat.format(movie.budget)])
  if (movie.revenue > 0)
    facts.push(['Box office', moneyFormat.format(movie.revenue)])
  if (studios) facts.push(['Studios', studios])

  return (
    <article className={styles.detail}>
      {movie.backdrop_path && (
        <img
          className={styles.backdrop}
          src={backdropUrl(movie.backdrop_path, 'w1280')}
          alt=""
        />
      )}
      <div className={styles.body}>
        {movie.poster_path ? (
          <img
            className={styles.poster}
            src={posterUrl(movie.poster_path, 'w500')}
            alt={`${movie.title} poster`}
            width={500}
            height={750}
          />
        ) : (
          <div className={`${styles.poster} ${styles.missingPoster}`}>
            No poster
          </div>
        )}
        <div className={styles.info}>
          <h1 className={styles.title}>
            {movie.title}
            {year && <span className={styles.year}> ({year})</span>}
          </h1>
          {movie.tagline && <p className={styles.tagline}>{movie.tagline}</p>}

          <p className={styles.score}>
            <span className={styles.rating}>
              ★ {movie.vote_average.toFixed(1)}
            </span>{' '}
            <span className={styles.votes}>
              from {movie.vote_count.toLocaleString('en-US')} votes
            </span>
          </p>

          {movie.genres.length > 0 && (
            <ul className={styles.genres} aria-label="Genres">
              {movie.genres.map((genre) => (
                <li key={genre.id} className={styles.genre}>
                  {genre.name}
                </li>
              ))}
            </ul>
          )}

          {movie.overview && (
            <>
              <h2 className={styles.sectionHeading}>Overview</h2>
              <p className={styles.overview}>{movie.overview}</p>
            </>
          )}

          {facts.length > 0 && (
            <dl className={styles.facts}>
              {facts.map(([label, value]) => (
                <div key={label} className={styles.fact}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className={styles.links}>
            <a
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noreferrer"
            >
              View on TMDB ↗
            </a>
            {movie.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                target="_blank"
                rel="noreferrer"
              >
                View on IMDb ↗
              </a>
            )}
          </p>
        </div>
      </div>
    </article>
  )
}

export default DetailView
