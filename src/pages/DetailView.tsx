import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { backdropUrl, getMovie, posterUrl } from '../api/tmdb'
import { useMovieDetails } from '../hooks/useMovieDetails'
import { useTopRatedMovies } from '../hooks/useTopRatedMovies'
import type { MovieDetails } from '../types/movie'
import { detailPath, isDetailNavState } from '../utils/detailNav'
import {
  HERO_BACKDROP_SIZE,
  HERO_POSTER_SIZE,
  preloadHeroImages,
} from '../utils/prefetch'
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
  // The row shows whenever this movie is in the list; with only one result
  // the buttons stay visible but disabled, rather than the row vanishing
  const inList = index !== -1
  const hasNeighbors = inList && ids.length > 1
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

  // Warm both neighbours, details and hero images, so previous/next render
  // instantly
  useEffect(() => {
    for (const neighborId of [prevId, nextId]) {
      if (neighborId !== null) {
        getMovie(neighborId)
          .then(preloadHeroImages)
          .catch(() => {})
      }
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
  const backLink = (
    <Link to={backTo} className={styles.back}>
      ← Back to {backLabel}
    </Link>
  )

  return (
    <main className={styles.main}>
      {/* The hero carries the back link once the movie is in; until then it
          sits on its own at the top of the page */}
      {movie ? (
        <MovieHero movie={movie} backLink={backLink} />
      ) : (
        <div className={`${styles.page} ${styles.bareBack}`}>{backLink}</div>
      )}

      <div className={`${styles.page} ${styles.aboveGlow}`}>
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

// Backdrop under a scrim, with poster, title, year, tagline and rating on top
function MovieHero({
  movie,
  backLink,
}: {
  movie: MovieDetails
  backLink: ReactNode
}) {
  const year = movie.release_date.slice(0, 4)
  const meta = [
    year,
    movie.runtime ? formatRuntime(movie.runtime) : '',
    movie.genres.map((genre) => genre.name).join(', '),
  ].filter(Boolean)

  const backdrop = movie.backdrop_path
    ? backdropUrl(movie.backdrop_path, HERO_BACKDROP_SIZE)
    : null

  return (
    <>
      {/* A blurred copy behind the hero that runs down the page to the
          footer. Both copies share one URL, so there's one download. */}
      {backdrop && (
        <div className={styles.glow} aria-hidden="true">
          <img className={styles.glowImage} src={backdrop} alt="" />
        </div>
      )}
      <section
        className={backdrop ? styles.hero : `${styles.hero} ${styles.plain}`}
      >
        {backdrop && (
          <img className={styles.backdrop} src={backdrop} alt="" />
        )}
        <div className={`${styles.page} ${styles.heroInner}`}>
          {backLink}
          <div className={styles.heroBody}>
            {movie.poster_path ? (
              <img
                className={styles.poster}
                src={posterUrl(movie.poster_path, HERO_POSTER_SIZE)}
                alt={`${movie.title} poster`}
                width={500}
                height={750}
              />
            ) : (
              <div className={`${styles.poster} ${styles.missingPoster}`}>
                No poster
              </div>
            )}
            <div className={styles.heading}>
              <p className={styles.meta}>{meta.join(' · ')}</p>
              <h1 className={styles.title}>{movie.title}</h1>
              {/* Always rendered, empty when there's no tagline, so stepping
                  previous/next doesn't shift the title and rating */}
              <p
                className={styles.tagline}
                aria-hidden={movie.tagline ? undefined : true}
              >
                {movie.tagline}
              </p>
              <p className={styles.score}>
                <span className={styles.star} aria-hidden="true">
                  ★
                </span>
                <span className={styles.rating}>
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className={styles.votes}>
                  {movie.vote_count.toLocaleString('en-US')} votes
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      {backdrop && <div className={styles.grain} aria-hidden="true" />}
    </>
  )
}

// Overview and the remaining facts, on the plain page below the hero
function MovieFacts({ movie }: { movie: MovieDetails }) {
  const facts: [string, string][] = []
  if (movie.directors.length > 0) {
    facts.push(['Directed by', movie.directors.join(', ')])
  }
  if (movie.release_date) {
    facts.push(['Released', dateFormat.format(new Date(movie.release_date))])
  }
  if (movie.genres.length > 0) {
    facts.push(['Genres', movie.genres.map((genre) => genre.name).join(', ')])
  }
  if (movie.runtime) facts.push(['Runtime', formatRuntime(movie.runtime)])
  if (movie.original_title !== movie.title) {
    facts.push(['Original title', movie.original_title])
  }
  if (movie.budget > 0) facts.push(['Budget', moneyFormat.format(movie.budget)])
  if (movie.revenue > 0)
    facts.push(['Box office', moneyFormat.format(movie.revenue)])

  return (
    <div className={styles.details}>
      <section className={styles.overviewSection}>
        <h2 className={styles.sectionHeading}>Overview</h2>
        <p className={styles.overview}>
          {movie.overview || 'No overview available.'}
        </p>
      </section>

      {(facts.length > 0 || movie.imdb_id) && (
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          {/* Last row: a link out, laid out like the other facts */}
          {movie.imdb_id && (
            <div className={styles.fact}>
              <dt>IMDb</dt>
              <dd>
                <a
                  className={styles.factLink}
                  href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on IMDb ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  )
}

export default DetailView
