import { Link } from 'react-router-dom'
import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import { usePrefetchOnView } from '../hooks/usePrefetchOnView'
import { detailPath } from '../utils/detailNav'
import type { DetailNavState } from '../utils/detailNav'
import { preloadHeroImages } from '../utils/prefetch'
import styles from './PosterCard.module.css'

interface PosterCardProps {
  movie: Movie
  navState: DetailNavState
}

function PosterCard({ movie, navState }: PosterCardProps) {
  // Same warm-up as MovieRow: details on view, hero images on hover or focus
  const ref = usePrefetchOnView<HTMLAnchorElement>(movie.id)

  return (
    <li className={styles.card}>
      <Link
        ref={ref}
        to={detailPath(movie.id)}
        state={navState}
        className={styles.link}
        onPointerEnter={() => preloadHeroImages(movie)}
        onFocus={() => preloadHeroImages(movie)}
      >
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
      </Link>
    </li>
  )
}

export default PosterCard
