import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import {
  STATUS_LABELS,
  watchList,
  type WatchStatus,
  type WatchlistItem,
} from '../watchlist'
import MediaCard from '../components/MediaCard'
import { downloadListAsCsv } from '../exportList'

type Filter = WatchStatus | 'all'

type Loaded = {
  uid: string
  items: WatchlistItem[]
  error: string | null
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'want', label: STATUS_LABELS.want },
  { value: 'watching', label: STATUS_LABELS.watching },
  { value: 'watched', label: STATUS_LABELS.watched },
]

function MyListPage() {
  const { user, loading } = useAuth()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!user) return
    const uid = user.uid

    return watchList(
      uid,
      (items) => setLoaded({ uid, items, error: null }),
      (error) => setLoaded({ uid, items: [], error: error.message }),
    )
  }, [user])

  if (loading) return <p className="page">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  if (loaded?.uid !== user.uid) return <p className="page">Loading your list...</p>
  if (loaded.error) return <p className="page">Error: {loaded.error}</p>

  const items =
    filter === 'all'
      ? loaded.items
      : loaded.items.filter((item) => item.status === filter)

  return (
    <main className="page">
      <div className="mylist-head">
        <h1>My List</h1>
        {loaded.items.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => downloadListAsCsv(loaded.items)}
          >
            ⬇ Download my list
          </button>
        )}
      </div>

      <div className="filter-tabs" role="tablist">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={filter === value ? 'tag tag-on' : 'tag'}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loaded.items.length === 0 ? (
        <p className="meta">
          Nothing saved yet. Find something on the <Link to="/">home page</Link>{' '}
          and press “Save to My List”.
        </p>
      ) : items.length === 0 ? (
        <p className="meta">Nothing here yet.</p>
      ) : (
        <div className="movie-grid">
          {items.map((item) => (
            <MediaCard
              key={`${item.mediaType}-${item.tmdbId}`}
              to={`/${item.mediaType}/${item.tmdbId}`}
              title={item.title}
              posterPath={item.posterPath}
              date={item.date}
              note={item.reason}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default MyListPage