import { STATUS_LABELS, type WatchStatus, type WatchlistItem } from './watchlist'
import { AIRING_LABELS, type AiringStatus } from './tmdb'

type AiringLookup = (item: WatchlistItem) => AiringStatus | null

const ORDER: WatchStatus[] = ['want', 'watching', 'watched']

function fileDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function niceDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function year(item: WatchlistItem): string {
  return item.date ? item.date.slice(0, 4) : 'year unknown'
}

function typeLabel(item: WatchlistItem, airing: AiringLookup): string {
  if (item.mediaType === 'movie') return 'Movie'
  const status = airing(item)
  return status ? `Series, ${AIRING_LABELS[status].toLowerCase()}` : 'Series'
}

// The lines under each title (only the ones that were filled in)
function details(item: WatchlistItem): [string, string][] {
  const rows: [string, string][] = []
  if (item.reason) rows.push(['Why', item.reason])
  if (item.recommendedBy) rows.push(['Recommended by', item.recommendedBy])
  if (item.source) rows.push(['Heard about it', item.source])
  if (item.tags.length > 0) rows.push(['Mood', item.tags.join(', ')])
  if (item.createdAt) rows.push(['Saved', niceDate(item.createdAt.toDate())])
  return rows
}

function grouped(items: WatchlistItem[]) {
  return ORDER.map((status) => ({
    status,
    items: items
      .filter((item) => item.status === status)
      .sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((group) => group.items.length > 0)
}

function download(content: string, type: string, filename: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// ---------- Notes (.txt) ----------

export function downloadAsNotes(items: WatchlistItem[], airing: AiringLookup) {
  const lines: string[] = [
    'POPNOTE · MY LIST',
    `Downloaded ${niceDate(new Date())} · ${items.length} titles`,
    '',
  ]

  for (const group of grouped(items)) {
    const heading = `${STATUS_LABELS[group.status].toUpperCase()} (${group.items.length})`
    lines.push(heading, '─'.repeat(heading.length), '')
    for (const item of group.items) {
      lines.push(`• ${item.title} (${year(item)}) · ${typeLabel(item, airing)}`)
      for (const [label, value] of details(item)) lines.push(`    ${label}: ${value}`)
      lines.push('')
    }
  }

  download(lines.join('\r\n'), 'text/plain;charset=utf-8', `popnote-my-list-${fileDate()}.txt`)
}

// ---------- Word document (.doc) ----------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function downloadAsDocument(items: WatchlistItem[], airing: AiringLookup) {
  const sections = grouped(items)
    .map((group) => {
      const entries = group.items
        .map((item) => {
          const rows = details(item)
            .map(([label, value]) => `<p class="row"><b>${label}:</b> ${escapeHtml(value)}</p>`)
            .join('')
          return `<h3>${escapeHtml(item.title)} <span class="meta">(${year(item)}) · ${typeLabel(item, airing)}</span></h3>${rows}`
        })
        .join('')
      return `<h2>${STATUS_LABELS[group.status]} (${group.items.length})</h2>${entries}`
    })
    .join('')

  // Word and Google Docs both open this HTML-based .doc file
  const html = `<html><head><meta charset="utf-8"><title>Popnote · My List</title>
<style>
body { font-family: Calibri, Arial, sans-serif; color: #1f1f24; }
h1 { color: #ea580c; margin-bottom: 0; }
h2 { color: #b45309; border-bottom: 1px solid #f3d6a8; padding-bottom: 4px; margin-top: 24px; }
h3 { margin: 14px 0 4px; font-size: 13pt; }
.meta { color: #6b6b78; font-weight: normal; font-size: 11pt; }
.row { margin: 2px 0 2px 16px; }
.intro { color: #6b6b78; }
</style></head><body>
<h1>Popnote · My List</h1>
<p class="intro">Downloaded ${niceDate(new Date())} · ${items.length} titles</p>
${sections}
</body></html>`

  download('\uFEFF' + html, 'application/msword', `popnote-my-list-${fileDate()}.doc`)
}

// ---------- Spreadsheet (.csv) ----------

// Wrap a value in quotes so commas, quotes and new lines don't break the CSV
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function downloadAsSpreadsheet(items: WatchlistItem[], airing: AiringLookup) {
  const header = [
    'Title',
    'Type',
    'Year',
    'My progress',
    'Why I want to watch it',
    'Recommended by',
    'Where I heard about it',
    'Moods',
    'Saved on',
    'Link',
  ]

  const rows = items.map((item) => [
    item.title,
    typeLabel(item, airing),
    item.date ? item.date.slice(0, 4) : '',
    STATUS_LABELS[item.status],
    item.reason,
    item.recommendedBy,
    item.source,
    item.tags.join(', '),
    item.createdAt ? niceDate(item.createdAt.toDate()) : '',
    `https://www.themoviedb.org/${item.mediaType}/${item.tmdbId}`,
  ])

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  // '\uFEFF' is an invisible marker that tells Excel the file is UTF-8 (so accents show correctly)
  download('\uFEFF' + csv, 'text/csv;charset=utf-8', `popnote-my-list-${fileDate()}.csv`)
}
