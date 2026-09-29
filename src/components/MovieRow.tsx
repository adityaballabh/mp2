import { Link } from 'react-router-dom'
import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import { detailPath } from '../utils/detailNav'
import type { DetailNavState } from '../utils/detailNav'
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
      <Link to={detailPath(movie.id)} state={navState} className={styles.row}>
        {movie.poster_path ? (
          <img
            className={styles.poster}
            src={posterUrl(movie.poster_path, 'w92')}
            alt=""
            loading="lazy"
            width={46}
            height={69}
          />
        ) : (
          <div className={styles.poster} />
        )}
        <div className={styles.info}>
          <h2 className={styles.title}>{movie.title}</h2>
          <p className={styles.meta}>
            {year} · {genreNames.join(', ')}
          </p>
        </div>
        <div className={styles.score}>
          <span className={styles.rating}>
            ★ {movie.vote_average.toFixed(1)}
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
