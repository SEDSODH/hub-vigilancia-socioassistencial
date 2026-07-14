import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink, AlertTriangle, Monitor, Eye } from 'lucide-react'

interface SitePreviewModalProps {
  url: string
  titulo: string
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url.replace('https://', '').replace('http://', '').split('/')[0]
  }
}

export default function SitePreviewModal({ url, titulo }: SitePreviewModalProps) {
  const [open, setOpen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeBlocked, setIframeBlocked] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleClose = useCallback(() => {
    setOpen(false)
    setIframeLoaded(false)
    setIframeBlocked(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      timeoutRef.current = setTimeout(() => {
        if (!iframeLoaded) setIframeBlocked(true)
      }, 8000)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [open, iframeLoaded])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleClose])

  const domain = domainFromUrl(url)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative w-44 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 hover:border-institucional-blue/40 dark:hover:border-blue-500/40 transition-all duration-300 cursor-pointer text-left"
        aria-label={`Pré-visualizar ${titulo}`}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
          <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
          <span className="ml-1 text-[9px] text-slate-400 dark:text-slate-500 truncate">{domain}</span>
        </div>
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
          <div className="text-center px-2">
            <Monitor className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-2">{titulo}</span>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/40 dark:bg-slate-900/60 text-[10px] text-white/70 font-medium">
            <Eye className="w-3 h-3" />
            Preview
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-semibold bg-white/20 backdrop-blur px-2.5 py-1 rounded-lg">
              Visualizar
            </span>
          </div>
        </div>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-6xl h-[90vh] mx-auto mt-[5vh] rounded-xl overflow-hidden shadow-2xl flex flex-col bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold text-white truncate">{titulo}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">— pré-visualização</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-institucional-blue hover:bg-institucional-blue/90 text-white text-sm font-medium transition-colors no-underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visitar site
                </a>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-white">
              {iframeBlocked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10 gap-4">
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                  <div className="text-center px-6">
                    <p className="text-slate-600 font-medium mb-1">Pré-visualização indisponível</p>
                    <p className="text-sm text-slate-400">Este site não permite visualização incorporada.</p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-institucional-blue hover:bg-institucional-blue/90 text-white text-sm font-medium transition-colors no-underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir site em nova aba
                  </a>
                </div>
              ) : (
                <>
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                      <svg className="animate-spin h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                  <iframe
                    src={url}
                    title={titulo}
                    className="w-full h-full border-0"
                    loading="lazy"
                    onLoad={() => setIframeLoaded(true)}
                  />
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
