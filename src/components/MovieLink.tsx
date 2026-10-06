import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '../types/movie'
import { detailPath } from '../utils/detailNav'
import type { DetailNavState } from '../utils/detailNav'
import { onDwell, preloadHeroImages, prefetchMovie } from '../utils/prefetch'

interface MovieLinkProps {
  movie: Movie
  navState: DetailNavState
  className: string
  children: ReactNode
}

function MovieLink({ movie, navState, className, children }: MovieLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  // Fetch details once the link stays on screen, so opening is instant
  useEffect(() => {
    const element = ref.current
    if (!element) return
    return onDwell(element, () => prefetchMovie(movie.id))
  }, [movie.id])

  return (
    <Link
      ref={ref}
      to={detailPath(movie.id)}
      state={navState}
      className={className}
      onPointerEnter={() => preloadHeroImages(movie)}
      onFocus={() => preloadHeroImages(movie)}
    >
      {children}
    </Link>
  )
}

export default MovieLink
