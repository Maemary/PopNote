import type { MediaItem } from '../tmdb'
import MediaCard from './MediaCard'

type MediaGridProps = {
  items: MediaItem[]
  layout?: 'grid' | 'row'
}

function MediaGrid({ items, layout = 'grid' }: MediaGridProps) {
  return (
    <div className={layout === 'row' ? 'media-row' : 'movie-grid'}>
      {items.map((item) => (
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

export default MediaGrid
