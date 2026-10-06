import type { MovieDetails } from '../types/movie'
import { formatRuntime } from '../utils/formatRuntime'
import styles from './MovieFacts.module.css'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  // Keep release dates from shifting a day in local time
  timeZone: 'UTC',
})
const moneyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

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
      <section>
        <h2 className={styles.sectionHeading}>Overview</h2>
        <p className={styles.overview}>
          {movie.overview || 'No overview available.'}
        </p>
      </section>

      {(facts.length > 0 || movie.imdb_id) && (
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt className={styles.factLabel}>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          {movie.imdb_id && (
            <div className={styles.fact}>
              <dt className={styles.factLabel}>IMDb</dt>
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

export default MovieFacts
