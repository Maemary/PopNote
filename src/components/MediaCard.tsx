import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import { Link } from 'react-router'
import { posterUrl, type MediaItem } from '../tmdb'
import CardPopover, { type PopoverPoint } from './CardPopover'

type MediaCardProps = {
  to: string
  title: string
  posterPath: string | null
  date: string
  rating?: number
  note?: string
  item?: MediaItem
}

const HOVER_DELAY = 350

function canHover() {
  return window.matchMedia('(hover: hover)').matches
}

function MediaCard({ to, title, posterPath, date, rating, note, item }: MediaCardProps) {
  const poster = posterUrl(posterPath)
  const year = date ? date.slice(0, 4) : '—'
  const ratingText = rating ? ` · ★ ${rating.toFixed(1)}` : ''

  const [point, setPoint] = useState<PopoverPoint | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const lastPointer = useRef<PopoverPoint>({ x: 0, y: 0 })

  // Mouse: wait a moment, then show the box under the cursor and let it follow
  function handleMouseEnter(event: MouseEvent<HTMLElement>) {
    if (!item || !canHover()) return
    lastPointer.current = { x: event.clientX, y: event.clientY }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPoint(lastPointer.current), HOVER_DELAY)
  }

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    lastPointer.current = { x: event.clientX, y: event.clientY }
    if (point) setPoint(lastPointer.current)
  }

  // Keyboard: show the box under the middle of the card
  function handleFocus(event: FocusEvent<HTMLElement>) {
    if (!item || !canHover() || !event.currentTarget.matches(':focus-visible')) return
    const rect = event.currentTarget.getBoundingClientRect()
    setPoint({ x: rect.left + rect.width / 2, y: rect.bottom - 10 })
  }

  function hide() {
    window.clearTimeout(timer.current)
    setPoint(null)
  }

  // Close the box when the page or a row scrolls
  useEffect(() => {
    if (!point) return
    const close = () => setPoint(null)
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
  }, [point])

  useEffect(() => {
    const pending = timer
    return () => window.clearTimeout(pending.current)
  }, [])

  return (
    <Link
      to={to}
      className="movie-card"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={hide}
      onFocus={handleFocus}
      onBlur={hide}
      onClick={hide}
    >
      {poster ? (
        <img src={poster} alt={`${title} poster`} loading="lazy" />
      ) : (
        <div className="poster-placeholder">No poster</div>
      )}

      <div className="movie-info">
        <h3>{title}</h3>
        <p>
          {year}
          {ratingText}
        </p>
        {note && <p className="card-note">{note}</p>}
      </div>

      {point && item && <CardPopover item={item} point={point} />}
    </Link>
  )
}

export default MediaCard
