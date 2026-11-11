import { STATUS_LABELS, type WatchlistItem } from './watchlist'

// Wrap a value in quotes so commas, quotes and new lines don't break the CSV
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function toCsv(items: WatchlistItem[]): string {
  const header = [
    'Title',
    'Type',
    'Year',
    'Status',
    'Why I want to watch it',
    'Recommended by',
    'Where I heard about it',
    'Moods',
    'Saved on',
    'Link',
  ]

  const rows = items.map((item) => [
    item.title,
    item.mediaType === 'movie' ? 'Movie' : 'TV show',
    item.date ? item.date.slice(0, 4) : '',
    STATUS_LABELS[item.status],
    item.reason,
    item.recommendedBy,
    item.source,
    item.tags.join(', '),
    item.createdAt ? item.createdAt.toDate().toLocaleDateString('en-GB') : '',
    `https://www.themoviedb.org/${item.mediaType}/${item.tmdbId}`,
  ])

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

// Builds the file in the browser and starts the download
export function downloadListAsCsv(items: WatchlistItem[]) {
  // '\uFEFF' is an invisible marker that tells Excel the file is UTF-8 (so accents show correctly)
  const blob = new Blob(['\uFEFF' + toCsv(items)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `popnote-my-list-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
