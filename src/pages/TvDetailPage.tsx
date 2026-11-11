import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  backdropUrl,
  getTvDetails,
  posterUrl,
  type TvDetails,
} from '../tmdb'
import WhereToWatch from '../components/WhereToWatch'
import SaveToList from '../components/SaveToList'
import CastList from '../components/CastList'



const REGION = 'NG'

function TvDetailPage() {
  const { id } = useParams()
  const [show, setShow] = useState<TvDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let ignore = false

    getTvDetails(id)
      .then((details) => {
        if (!ignore) setShow(details)
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
  if (!show) return <p className="page">Loading...</p>

  const trailer =
    show.videos.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official,
    ) ??
    show.videos.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer',
    )

  const backdrop = backdropUrl(show.backdrop_path)
  const poster = posterUrl(show.poster_path, 'w500')
  const startYear = show.first_air_date ? show.first_air_date.slice(0, 4) : '—'
  const endYear =
    show.status === 'Ended' && show.last_air_date
      ? show.last_air_date.slice(0, 4)
      : 'present'
  const seasons = show.seasons.filter((s) => s.season_number > 0)
  const topCast = show.credits.cast.slice(0, 12)
  const providers = show['watch/providers'].results[REGION]

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
            <img className="detail-poster" src={poster} alt={`${show.name} poster`} />
          )}
          <div>
            <h1>{show.name}</h1>
            {show.tagline && <p className="tagline">{show.tagline}</p>}
            <p className="meta">
              {startYear}–{endYear} · {show.number_of_seasons}{' '}
              {show.number_of_seasons === 1 ? 'season' : 'seasons'} · ★{' '}
              {show.vote_average.toFixed(1)}
            </p>
            <p className="meta">{show.genres.map((g) => g.name).join(', ')}</p>
            <p>{show.overview}</p>
          </div>
        </div>

                <SaveToList
          mediaType="tv"
          tmdbId={show.id}
          title={show.name}
          posterPath={show.poster_path}
          date={show.first_air_date}
        />

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

        {seasons.length > 0 && (
          <section>
            <h2>Seasons</h2>
            <ul className="season-list">
              {seasons.map((season) => {
                const seasonPoster = posterUrl(season.poster_path, 'w185')
                return (
                  <li key={season.id}>
                    {seasonPoster ? (
                      <img src={seasonPoster} alt="" loading="lazy" />
                    ) : (
                      <div className="poster-placeholder">No poster</div>
                    )}
                    <strong>{season.name}</strong>
                    <span>
                      {season.episode_count} episodes
                      {season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <CastList cast={topCast} />
      </div>
    </main>
  )
}

export default TvDetailPage