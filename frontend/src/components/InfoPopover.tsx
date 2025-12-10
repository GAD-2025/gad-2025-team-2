import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  content: ReactNode
  ariaLabel?: string
}

const InfoPopover = ({ content, ariaLabel = 'more info' }: Props) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // next frame to allow CSS transition
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      // wait for animation to finish
      const t = setTimeout(() => setMounted(false), 180)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onDocDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (btnRef.current && btnRef.current.contains(target)) return
      if (popRef.current && popRef.current.contains(target)) return
      setOpen(false)
    }

    const onScroll = () => setOpen(false)
    const onPop = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }

    document.addEventListener('mousedown', onDocDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('mousedown', onDocDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Compute position relative to button
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  useEffect(() => {
    if (!open) return
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const left = rect.left + rect.width / 2 + window.scrollX
    const belowTop = rect.bottom + 8 + window.scrollY
    const aboveTop = rect.top - 8 + window.scrollY

    // determine if there's enough space below; if not, flip to top
    const viewportHeight = window.innerHeight + window.scrollY
    const spaceBelow = viewportHeight - rect.bottom
    const preferTop = spaceBelow < 160 // if less than ~160px below, show above
    if (preferTop) {
      setPlacement('top')
      // position popover bottom at rect.top - 8
      setPos({ left, top: aboveTop })
    } else {
      setPlacement('bottom')
      setPos({ left, top: belowTop })
    }
  }, [open])

  const idRef = useRef<string | null>(null)
  if (!idRef.current) idRef.current = `info-popover-${Math.random().toString(36).slice(2,9)}`

  if (!mounted) {
    return (
      <span className="inline-flex items-center">
        <button
          ref={btnRef}
          type="button"
          aria-label={ariaLabel}
          className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-text-500 hover:bg-gray-50"
          onClick={() => setOpen(v => !v)}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth={1.2} fill="none"/>
            <path d="M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1.25-1 1.75-1.5 2.25-.5.5-.5 1.5-.5 1.75" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
        </button>
      </span>
    )
  }

  const popover = (
    <>
      {/* transparent overlay to capture outside clicks - visually transparent */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'transparent' }}
        onClick={() => setOpen(false)}
      />

      <div
        ref={popRef}
        id={idRef.current!}
        role="dialog"
        aria-modal={false}
        className="z-50"
        style={{
          position: 'absolute',
          left: pos ? pos.left : 0,
          top: pos ? pos.top : 0,
          transform: `translateX(-50%) ${placement === 'top' ? 'translateY(-100%)' : 'translateY(0)'}`,
          maxWidth: 320,
        }}
      >
        <div className="relative">
          {/* triangle tail */}
          <div
            style={{ left: '50%', transform: 'translateX(-50%)' }}
            className="absolute -top-2 w-3 h-3 bg-white rotate-45 shadow-sm"
          />
          <div className={`bg-white rounded-[12px] shadow-card p-3 text-text-900 text-[13px] leading-relaxed max-w-[320px] transform transition-all duration-150 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {content}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <span className="inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={idRef.current!}
        className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-text-500 hover:bg-gray-50"
        onClick={() => setOpen(v => !v)}
      >
        {/* question mark icon */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth={1.2} fill="none"/>
          <path d="M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1.25-1 1.75-1.5 2.25-.5.5-.5 1.5-.5 1.75" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      </button>

      {pos && createPortal(popover, document.body)}
    </span>
  )
}

export default InfoPopover
