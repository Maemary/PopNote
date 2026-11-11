import { useState, type FormEvent } from 'react'
import {
  MOOD_TAGS,
  STATUS_LABELS,
  saveItem,
  type MediaType,
  type WatchStatus,
  type WatchlistItem,
} from '../watchlist'

type SaveFormProps = {
  uid: string
  mediaType: MediaType
  tmdbId: number
  title: string
  posterPath: string | null
  date: string
  existing: WatchlistItem | null
  onDone: () => void
}

function SaveForm({
  uid,
  mediaType,
  tmdbId,
  title,
  posterPath,
  date,
  existing,
  onDone,
}: SaveFormProps) {
  const [status, setStatus] = useState<WatchStatus>(existing?.status ?? 'want')
  const [reason, setReason] = useState(existing?.reason ?? '')
  const [recommendedBy, setRecommendedBy] = useState(existing?.recommendedBy ?? '')
  const [source, setSource] = useState(existing?.source ?? '')
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)

    try {
      await saveItem(
        uid,
        {
          mediaType,
          tmdbId,
          title,
          posterPath,
          date,
          status,
          reason: reason.trim(),
          recommendedBy: recommendedBy.trim(),
          source: source.trim(),
          tags,
        },
        existing === null,
      )
      onDone()
    } catch {
      setMessage('Could not save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <form className="save-form" onSubmit={handleSubmit}>
      <label>
        Why do you want to watch it?
        <textarea
          rows={3}
          maxLength={500}
          placeholder="e.g. Everyone says the ending is crazy"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>

      <div className="save-form-row">
        <label>
          Who recommended it?
          <input
            type="text"
            maxLength={80}
            placeholder="e.g. Tolu"
            value={recommendedBy}
            onChange={(event) => setRecommendedBy(event.target.value)}
          />
        </label>

        <label>
          Where did you hear about it?
          <input
            type="text"
            maxLength={300}
            placeholder="TikTok link, podcast, tweet..."
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </label>
      </div>

      <fieldset className="tag-picker">
        <legend>Mood</legend>
        {MOOD_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={tags.includes(tag) ? 'tag tag-on' : 'tag'}
            aria-pressed={tags.includes(tag)}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </fieldset>

      <label>
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as WatchStatus)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {message && <p className="auth-message">{message}</p>}

      <div className="save-form-actions">
        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="link-button" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default SaveForm