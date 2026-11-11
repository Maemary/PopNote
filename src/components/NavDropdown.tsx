import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type NavDropdownProps = {
  label: ReactNode
  buttonClass: string
  panelClass: string
  ariaLabel?: string
  children: (close: () => void) => ReactNode
}

const GAP = 8
const EDGE = 12

// A nav button that opens a panel right under it; closes on outside click or Esc
function NavDropdown({ label, buttonClass, panelClass, ariaLabel, children }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Line the panel up with its button, but keep it inside the window
  useLayoutEffect(() => {
    if (!open) return

    function place() {
      const button = buttonRef.current
      const panel = panelRef.current
      if (!button || !panel) return
      const rect = button.getBoundingClientRect()
      const width = panel.offsetWidth
      const left = Math.min(Math.max(rect.left, EDGE), window.innerWidth - width - EDGE)
      panel.style.left = `${Math.max(left, EDGE)}px`
      panel.style.top = `${rect.bottom + GAP}px`
    }

    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClass}
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open && (
        <div ref={panelRef} className={`nav-panel ${panelClass}`}>
          {children(close)}
        </div>
      )}
    </div>
  )
}

export default NavDropdown
