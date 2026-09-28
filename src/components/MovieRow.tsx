import { posterUrl } from '../api/tmdb'
import type { Movie } from '../types/movie'
import styles from './MovieRow.module.css'

interface MovieRowProps {
  movie: Movie
  rank: number
  genres: Map<number, string>
}

function MovieRow({ movie, rank, genres }: MovieRowProps) {
  const year = movie.release_date.slice(0, 4) || 'TBA'
  const genreNames = movie.genre_ids
    .map((id) => genres.get(id))
    .filter((name) => name !== undefined)

  return (
    <li className={styles.row}>
      <span className={styles.rank}>{rank}</span>
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
      <span className={styles.rating}>★ {movie.vote_average.toFixed(1)}</span>
    </li>
  )
}

export default MovieRow
