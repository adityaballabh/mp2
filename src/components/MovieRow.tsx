import clsx from 'clsx'
import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import type { DetailNavState } from '../utils/detailNav'
import MovieLink from './MovieLink'
import styles from './MovieRow.module.css'

interface MovieRowProps {
  movie: Movie
  genres: Map<number, string>
  navState: DetailNavState
}

function MovieRow({ movie, genres, navState }: MovieRowProps) {
  const year = movie.release_date.slice(0, 4) || 'TBA'
  const genreNames = movie.genre_ids
    .map((id) => genres.get(id))
    .filter((name) => name !== undefined)

  return (
    <li>
      <MovieLink movie={movie} navState={navState} className={styles.row}>
        {movie.poster_path ? (
          <img
            className={styles.poster}
            src={posterUrl(movie.poster_path, 'w92')}
            alt=""
            loading="lazy"
            width={64}
            height={96}
          />
        ) : (
          <div className={clsx(styles.poster, styles.missing)} />
        )}
        <div className={styles.info}>
          <h2 className={styles.title}>{movie.title}</h2>
          <p className={styles.meta}>
            {year} · {genreNames.join(', ')}
          </p>
          {movie.overview && (
            <p className={styles.overview}>{movie.overview}</p>
          )}
        </div>
        <div className={styles.score}>
          <span className={styles.rating}>
            <span className={styles.star} aria-hidden="true">
              ★
            </span>{' '}
            {movie.vote_average.toFixed(1)}
          </span>
          <span className={styles.votes}>
            {movie.vote_count.toLocaleString('en-US')} votes
          </span>
        </div>
      </MovieLink>
    </li>
  )
}

export default MovieRow
