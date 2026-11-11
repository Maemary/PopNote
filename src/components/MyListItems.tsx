import { Link } from 'react-router'
import { AIRING_LABELS, posterUrl, type AiringStatus } from '../tmdb'
import { STATUS_LABELS, type WatchlistItem } from '../watchlist'

type ItemProps = {
  item: WatchlistItem
  airing: AiringStatus | null
}

function savedOn(item: WatchlistItem): string {
  return item.createdAt
    ? item.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Just now'
}

function year(item: WatchlistItem): string {
  return item.date ? item.date.slice(0, 4) : '—'
}

function Badges({ item, airing }: ItemProps) {
  return (
    <span className="ml-badges">
      <span className={`ml-badge progress-${item.status}`}>{STATUS_LABELS[item.status]}</span>
      {airing && <span className={`ml-badge airing-${airing}`}>{AIRING_LABELS[airing]}</span>}
    </span>
  )
}

// Grid view: poster card with badges
export function MyListCard({ item, airing }: ItemProps) {
  const poster = posterUrl(item.posterPath)

  return (
    <Link to={`/${item.mediaType}/${item.tmdbId}`} className="ml-card">
      <div className="ml-card-poster">
        {poster ? (
          <img src={poster} alt={`${item.title} poster`} loading="lazy" />
        ) : (
          <div className="poster-placeholder">No poster</div>
        )}
        <span className="ml-type">{item.mediaType === 'movie' ? 'Movie' : 'Series'}</span>
      </div>
      <div className="ml-card-body">
        <h3>{item.title}</h3>
        <p className="ml-meta">{year(item)}</p>
        <Badges item={item} airing={airing} />
        {item.reason && <p className="ml-note">“{item.reason}”</p>}
      </div>
    </Link>
  )
}

// List view: one row per title
export function MyListRow({ item, airing }: ItemProps) {
  const poster = posterUrl(item.posterPath, 'w92')

  return (
    <Link to={`/${item.mediaType}/${item.tmdbId}`} className="ml-row">
      {poster ? (
        <img src={poster} alt="" loading="lazy" className="ml-row-thumb" />
      ) : (
        <span className="ml-row-thumb ml-row-thumb-empty" />
      )}
      <div className="ml-row-main">
        <h3>{item.title}</h3>
        <p className="ml-meta">
          {item.mediaType === 'movie' ? 'Movie' : 'Series'} · {year(item)}
          {item.recommendedBy && ` · Recommended by ${item.recommendedBy}`}
        </p>
        {item.reason && <p className="ml-note">“{item.reason}”</p>}
      </div>
      <div className="ml-row-side">
        <Badges item={item} airing={airing} />
        <span className="ml-saved">Saved {savedOn(item)}</span>
      </div>
      <span className="ml-row-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
