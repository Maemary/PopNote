import { Link, useSearchParams } from 'react-router'

type PaginationProps = {
  page: number
  totalPages: number
}

// 1 … 4 5 [6] 7 8 … 40
function pageNumbers(page: number, total: number): (number | '…')[] {
  const pages = new Set([1, total, page - 2, page - 1, page, page + 1, page + 2])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result: (number | '…')[] = []
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
}

function Pagination({ page, totalPages }: PaginationProps) {
  const [searchParams] = useSearchParams()
  if (totalPages <= 1) return null

  // Keep the sort and letter in the URL when changing page
  function linkTo(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    return `?${params.toString()}`
  }

  return (
    <nav className="pagination" aria-label="Pages">
      {page > 1 ? (
        <Link to={linkTo(page - 1)} className="page-step">
          ← Previous
        </Link>
      ) : (
        <span className="page-step disabled">← Previous</span>
      )}

      <div className="page-numbers">
        {pageNumbers(page, totalPages).map((p, index) =>
          p === '…' ? (
            <span key={`gap-${index}`} className="page-gap">
              …
            </span>
          ) : (
            <Link
              key={p}
              to={linkTo(p)}
              className={p === page ? 'page-number active' : 'page-number'}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {page < totalPages ? (
        <Link to={linkTo(page + 1)} className="page-step">
          Next →
        </Link>
      ) : (
        <span className="page-step disabled">Next →</span>
      )}
    </nav>
  )
}

export default Pagination
