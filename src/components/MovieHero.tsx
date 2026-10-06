import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { MovieDetails } from '../types/movie'
import { formatRuntime } from '../utils/formatRuntime'
import { heroBackdropUrl, heroPosterUrl } from '../utils/heroImages'
import styles from './MovieHero.module.css'

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
    ? heroBackdropUrl(movie.backdrop_path)
    : null

  return (
    <>
      {/* Glow copy shares the backdrop's URL so it downloads once */}
      {backdrop && (
        <div className={styles.glow} aria-hidden="true">
          <img className={styles.glowImage} src={backdrop} alt="" />
        </div>
      )}
      <section className={clsx(styles.hero, !backdrop && styles.plain)}>
        {backdrop && <img className={styles.backdrop} src={backdrop} alt="" />}
        <div className={clsx(styles.page, styles.heroInner)}>
          {backLink}
          <div className={styles.heroBody}>
            {movie.poster_path ? (
              <img
                className={styles.poster}
                src={heroPosterUrl(movie.poster_path)}
                alt={`${movie.title} poster`}
                width={500}
                height={750}
              />
            ) : (
              <div className={clsx(styles.poster, styles.missingPoster)}>
                No poster
              </div>
            )}
            <div className={styles.heading}>
              <p className={styles.meta}>{meta.join(' · ')}</p>
              <h1 className={styles.title}>{movie.title}</h1>
              {/* Always rendered so stepping doesn't shift the layout */}
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
    </>
  )
}

export default MovieHero
