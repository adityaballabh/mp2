import { Link } from 'react-router-dom'
import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import { usePrefetchOnView } from '../hooks/usePrefetchOnView'
import { detailPath } from '../utils/detailNav'
import type { DetailNavState } from '../utils/detailNav'
import { preloadHeroImages } from '../utils/prefetch'
import styles from './MovieRow.module.css'

interface MovieRowProps {
  movie: Movie
  genres: Map<number, string>
  navState: DetailNavState
}

function MovieRow({ movie, genres, navState }: MovieRowProps) {
  // Details are fetched once the row has been on screen briefly, and the
  // hero images once it's hovered or focused, so opening it is instant
  const ref = usePrefetchOnView<HTMLAnchorElement>(movie.id)
  const year = movie.release_date.slice(0, 4) || 'TBA'
  const genreNames = movie.genre_ids
    .map((id) => genres.get(id))
    .filter((name) => name !== undefined)

  return (
    <li>
      <Link
        ref={ref}
        to={detailPath(movie.id)}
        state={navState}
        className={styles.row}
        onPointerEnter={() => preloadHeroImages(movie)}
        onFocus={() => preloadHeroImages(movie)}
      >
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
          <div className={`${styles.poster} ${styles.missing}`} />
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
      </Link>
    </li>
  )
}

export default MovieRow
