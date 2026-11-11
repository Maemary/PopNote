import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  backdropUrl,
  getMovieDetails,
  posterUrl,
  type MovieDetails,
} from '../tmdb'

import WhereToWatch from '../components/WhereToWatch'
import SaveToList from '../components/SaveToList'
import CastList from '../components/CastList'


const REGION = 'NG'

function MovieDetailPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let ignore = false

    getMovieDetails(id)
      .then((details) => {
        if (!ignore) setMovie(details)
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      })

    return () => {
      ignore = true
    }
  }, [id])

  if (error) return <p className="page">Error: {error}</p>
  if (!movie) return <p className="page">Loading...</p>

  const trailer =
    movie.videos.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official,
    ) ??
    movie.videos.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer',
    )

  const backdrop = backdropUrl(movie.backdrop_path)
  const poster = posterUrl(movie.poster_path, 'w500')
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const topCast = movie.credits.cast.slice(0, 12)
    const providers = movie['watch/providers'].results[REGION]

  return (
    <main>
      <div
        className="backdrop"
        style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
      />

      <div className="page detail">
        <Link to="/" className="back-link">
          ← Back
        </Link>

        <div className="detail-header">
          {poster && (
            <img className="detail-poster" src={poster} alt={`${movie.title} poster`} />
          )}
          <div>
            <h1>{movie.title}</h1>
            {movie.tagline && <p className="tagline">{movie.tagline}</p>}
            <p className="meta">
              {year}
              {movie.runtime ? ` · ${movie.runtime} min` : ''} · ★{' '}
              {movie.vote_average.toFixed(1)}
            </p>
            <p className="meta">{movie.genres.map((g) => g.name).join(', ')}</p>
            <p>{movie.overview}</p>
            <SaveToList
              mediaType="movie"
              tmdbId={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              date={movie.release_date}
            />
          </div>
        </div>

        <WhereToWatch providers={providers} />

        {trailer && (
          <section>
            <h2>Trailer</h2>
            <div className="trailer">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        <CastList cast={topCast} />
      </div>
    </main>
  )
}

export default MovieDetailPage