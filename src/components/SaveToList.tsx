import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/useAuth'
import {
  STATUS_LABELS,
  removeItem,
  saveItem,
  watchItem,
  type MediaType,
  type WatchStatus,
  type WatchlistItem,
} from '../watchlist'
import SaveForm from './SaveForm'
import { BookmarkIcon, PencilIcon, TrashIcon } from './Icons'

type SaveToListProps = {
  mediaType: MediaType
  tmdbId: number
  title: string
  posterPath: string | null
  date: string
}

type Loaded = {
  key: string
  item: WatchlistItem | null
  error: string | null
}

function isWebLink(text: string) {
  return /^https?:\/\//i.test(text)
}

function SaveToList({ mediaType, tmdbId, title, posterPath, date }: SaveToListProps) {
  const { user } = useAuth()
  const key = `${user?.uid}/${mediaType}-${tmdbId}`
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    return watchItem(
      user.uid,
      mediaType,
      tmdbId,
      (item) => setLoaded({ key, item, error: null }),
      (error) => setLoaded({ key, item: null, error: error.message }),
    )
  }, [user, mediaType, tmdbId, key])

  if (!user) {
    return (
      <section className="save-box">
        <p>
          <Link to="/login" className="text-link">Sign in</Link> or{' '}
          <Link to="/signup" className="text-link">create a free account</Link>{' '}
          to save this and note why you want to watch it.
        </p>
      </section>
    )
  }

  if (loaded?.key !== key) return null
  if (loaded.error) {
    return <p className="auth-message">Couldn’t load your list: {loaded.error}</p>
  }

  const item = loaded.item
  const uid = user.uid

  // One click: save with no note, status "Want to watch"
  async function quickSave() {
    setSaving(true)
    try {
      await saveItem(
        uid,
        {
          mediaType,
          tmdbId,
          title,
          posterPath,
          date,
          status: 'want',
          reason: '',
          recommendedBy: '',
          source: '',
          tags: [],
        },
        true,
      )
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(status: WatchStatus) {
    if (!item) return
    await saveItem(
      uid,
      {
        mediaType: item.mediaType,
        tmdbId: item.tmdbId,
        title: item.title,
        posterPath: item.posterPath,
        date: item.date,
        status,
        reason: item.reason,
        recommendedBy: item.recommendedBy,
        source: item.source,
        tags: item.tags,
      },
      false,
    )
  }

  const hasNote =
    item !== null &&
    (item.reason !== '' || item.recommendedBy !== '' || item.source !== '' || item.tags.length > 0)

  if (editing) {
    return (
      <section className="save-box save-box-panel">
        <h2>{hasNote ? 'Edit your note' : 'Add a note'}</h2>
        <p className="meta save-hint">
          Optional. Jot down why you saved it, so future you remembers.
        </p>
        <SaveForm
          uid={user.uid}
          mediaType={mediaType}
          tmdbId={tmdbId}
          title={title}
          posterPath={posterPath}
          date={date}
          existing={item}
          onDone={() => setEditing(false)}
        />
      </section>
    )
  }

  if (!item) {
    return (
      <section className="save-box">
        <button
          type="button"
          className="save-btn"
          aria-label="Save to My List"
          title="Save to My List"
          onClick={quickSave}
          disabled={saving}
        >
          <BookmarkIcon />
          <span className="btn-text">{saving ? 'Saving...' : 'Save to My List'}</span>
        </button>
      </section>
    )
  }

  return (
    <section className="save-box">
      <div className="saved-row">
        <span className="saved-badge" title="Saved to My List">
          <BookmarkIcon filled />
          <span className="btn-text">Saved</span>
        </span>
        <select
          aria-label="Status"
          className="saved-control"
          value={item.status}
          onChange={(event) => changeStatus(event.target.value as WatchStatus)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="saved-control saved-icon-btn"
          aria-label={hasNote ? 'Edit note' : 'Add a note'}
          title={hasNote ? 'Edit note' : 'Add a note'}
          onClick={() => setEditing(true)}
        >
          <PencilIcon />
          <span className="btn-text">{hasNote ? 'Edit note' : 'Add note'}</span>
        </button>
        <button
          type="button"
          className="saved-remove saved-icon-btn"
          aria-label="Remove from My List"
          title="Remove from My List"
          onClick={() => removeItem(user.uid, mediaType, tmdbId)}
        >
          <TrashIcon />
          <span className="btn-text">Remove</span>
        </button>
      </div>

      {item.reason && <p className="saved-reason">“{item.reason}”</p>}

      {item.recommendedBy && (
        <p className="meta">Recommended by {item.recommendedBy}</p>
      )}

      {item.source &&
        (isWebLink(item.source) ? (
          <p className="meta">
            <a href={item.source} target="_blank" rel="noreferrer">
              Where you heard about it ↗
            </a>
          </p>
        ) : (
          <p className="meta">Heard about it on {item.source}</p>
        ))}

      {item.tags.length > 0 && (
        <p className="tag-row">
          {item.tags.map((tag) => (
            <span key={tag} className="tag tag-on">
              {tag}
            </span>
          ))}
        </p>
      )}
    </section>
  )
}

export default SaveToList