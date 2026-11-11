import { createPortal } from 'react-dom'
import { genreNames, type MediaItem } from '../tmdb'

export type PopoverPoint = {
  x: number
  y: number
}

type CardPopoverProps = {
  item: MediaItem
  point: PopoverPoint
}

const WIDTH = 300
const CURSOR_GAP = 18
const EDGE = 12

function formatDate(date: string): string {
  if (!date) return 'Date unknown'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CardPopover({ item, point }: CardPopoverProps) {
  const genres = genreNames(item.mediaType, item.genreIds)

  // Centred under the cursor, but kept inside the window
  const left = Math.min(
    Math.max(point.x - WIDTH / 2, EDGE),
    window.innerWidth - WIDTH - EDGE,
  )
  const top = point.y + CURSOR_GAP

  return createPortal(
    <div className="card-popover" role="tooltip" style={{ left, top, width: WIDTH }}>
      <div className="card-popover-head">
        <strong>{item.title}</strong>
        <span className="card-popover-type">
          {item.mediaType === 'movie' ? 'Movie' : 'TV show'}
        </span>
      </div>

      <p className="card-popover-meta">
        {formatDate(item.date)}
        {item.rating > 0 && <> · ★ {item.rating.toFixed(1)}</>}
      </p>

      {genres.length > 0 && (
        <div className="card-popover-genres">
          {genres.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      )}

      <p className="card-popover-overview">
        {item.overview || 'No description yet.'}
      </p>
    </div>,
    document.body,
  )
}

export default CardPopover
