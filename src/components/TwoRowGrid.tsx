import { useEffect, useRef, useState } from 'react'
import type { MediaItem } from '../tmdb'
import MediaCard from './MediaCard'

type TwoRowGridProps = {
  items: MediaItem[]
}

const MIN_CARD_WIDTH = 150
const MIN_CARD_WIDTH_PHONE = 100
const GAP = 16
const GAP_PHONE = 10

// Shows exactly two rows of cards, however wide the screen is
function TwoRowGrid({ items }: TwoRowGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(6)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      // Phones fit 3 smaller posters per row instead of 2 big ones
      const phone = width < 520
      const min = phone ? MIN_CARD_WIDTH_PHONE : MIN_CARD_WIDTH
      const gap = phone ? GAP_PHONE : GAP
      setColumns(Math.max(3, Math.floor((width + gap) / (min + gap))))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="two-row-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.slice(0, columns * 2).map((item) => (
        <MediaCard
          key={`${item.mediaType}-${item.id}`}
          to={`/${item.mediaType}/${item.id}`}
          title={item.title}
          posterPath={item.posterPath}
          date={item.date}
          rating={item.rating}
          item={item}
        />
      ))}
    </div>
  )
}

export default TwoRowGrid
