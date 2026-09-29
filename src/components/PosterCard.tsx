import { Link } from 'react-router-dom'
import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import { detailPath } from '../utils/detailNav'
import type { DetailNavState } from '../utils/detailNav'
import styles from './PosterCard.module.css'

// Cards are narrow, so votes are shortened: 41304 -> "41K"
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact' })

interface PosterCardProps {
  movie: Movie
  navState: DetailNavState
}

function PosterCard({ movie, navState }: PosterCardProps) {
  const year = movie.release_date.slice(0, 4) || 'TBA'

  return (
    <li className={styles.card}>
      <Link to={detailPath(movie.id)} state={navState} className={styles.link}>
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
          <div className={`${styles.poster} ${styles.missing}`}>
            {movie.title}
          </div>
        )}
        <p className={styles.title}>{movie.title}</p>
        <p className={styles.meta}>
          {year} · ★ {movie.vote_average.toFixed(1)} ·{' '}
          {compactNumber.format(movie.vote_count)} votes
        </p>
      </Link>
    </li>
  )
}

export default PosterCard
