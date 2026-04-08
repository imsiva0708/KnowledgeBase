import { useState, useEffect } from 'react'

export default function ImageCard({ img, idx }) {
  const url = img?.secure_url || img?.url || (img?.public_id ? `https://res.cloudinary.com/dkek5ojrc/image/upload/v1772898344/${img.public_id}` : '')
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = async (e) => {
    e?.stopPropagation()
    // Try to fetch as blob then download — more reliable for cross-origin resources
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error('Network response was not ok')
      const blob = await resp.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const name = (img?.image_name || img?.public_id || `image-${idx}`)
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
      return
    } catch (err) {
      console.warn('Blob download failed, falling back to opening URL', err)
      try {
        // fallback: open in new tab so user can manually save
        window.open(url, '_blank', 'noopener')
      } catch (err2) {
        console.error('Fallback download failed', err2)
      }
    }
  }

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative group">
      <img
        src={url}
        alt={img?.alt || img?.image_name || img?.public_id || `image-${idx}`}
        className="w-full aspect-square object-cover rounded-xl cursor-pointer transition-opacity opacity-90 hover:opacity-100"
        onClick={() => setOpen(true)}
      />

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleDownload} title="Download" className="p-2 rounded bg-black/50 text-white hover:bg-black/70">
          <span className="material-symbols-outlined">download</span>
        </button>
        <button onClick={handleCopy} title="Copy link" className="p-2 rounded bg-black/50 text-white hover:bg-black/70">
          <span className="material-symbols-outlined">link</span>
        </button>
      </div>

      {copied && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Link copied</div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setOpen(false)}>
          <div className="relative w-[90%] md:w-3/4 max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-2 right-2 p-2 rounded bg-black/60 text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <img src={url} alt={img?.alt || `image-${idx}`} className="w-full h-auto max-h-[80vh] object-contain rounded" />
            <div className="mt-4 flex gap-2 justify-center">
              <button onClick={handleDownload} className="px-4 py-2 bg-surface-container-low rounded hover:bg-surface-container-high">Download</button>
              <button onClick={handleCopy} className="px-4 py-2 bg-surface-container-low rounded hover:bg-surface-container-high">Copy link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
