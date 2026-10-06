import clsx from 'clsx'
import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import type { DetailNavState } from '../utils/detailNav'
import MovieLink from './MovieLink'
import styles from './PosterCard.module.css'

interface PosterCardProps {
  movie: Movie
  navState: DetailNavState
}

function PosterCard({ movie, navState }: PosterCardProps) {
  return (
    <li className={styles.card}>
      <MovieLink movie={movie} navState={navState} className={styles.link}>
        {movie.poster_path ? (
          <img
            className={styles.poster}
            src={posterUrl(movie.poster_path, 'w342')}
            alt=""
            loading="lazy"
            width={342}
            height={513}
          />
        ) : (
          <div className={clsx(styles.poster, styles.missing)}>
            {movie.title}
          </div>
        )}
        <p className={styles.title}>{movie.title}</p>
      </MovieLink>
    </li>
  )
}

export default PosterCard
