import { useState, useEffect, useRef } from 'react'
import type { Attachment } from '../store/useAppStore.ts'

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY

interface GifResult {
  id: string
  title: string
  fixedUrl: string
  previewUrl: string
}

async function fetchGifs(endpoint: string, params: Record<string, string>): Promise<GifResult[]> {
  const query = new URLSearchParams({ api_key: GIPHY_API_KEY || '', limit: '20', ...params })
  const res = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?${query}`)
  if (!res.ok) throw new Error(`Giphy returned ${res.status}`)
  const json = await res.json()
  return (json.data || []).map((g: any) => ({
    id: g.id,
    title: g.title || '',
    fixedUrl: g.images?.fixed_height?.url || g.images?.fixed_width?.url || '',
    previewUrl: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url || '',
  }))
}

interface GifPickerProps {
  onSelect: (attachment: Attachment) => void
  onClose: () => void
}

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const keyMissing = !GIPHY_API_KEY

  // Load trending on mount
  useEffect(() => {
    if (keyMissing) return
    fetchGifs('trending', {}).then((results) => {
      setGifs(results)
      setLoading(false)
    }).catch(() => {
      setError('Could not load GIFs — check your API key or network connection.')
      setLoading(false)
    })
  }, [keyMissing])

  // Debounced search
  useEffect(() => {
    if (keyMissing) return
    if (debounce.current) clearTimeout(debounce.current)
    if (!query.trim()) {
      fetchGifs('trending', {}).then(setGifs).catch(() => {
        setError('Could not load GIFs — check your API key or network connection.')
      })
      return
    }
    setLoading(true)
    setError(null)
    debounce.current = setTimeout(() => {
      fetchGifs('search', { q: query }).then((results) => {
        setGifs(results)
        setLoading(false)
      }).catch(() => {
        setError('Could not load GIFs — check your API key or network connection.')
        setLoading(false)
      })
    }, 300)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query, keyMissing])

  const handleSelect = (gif: GifResult) => {
    onSelect({
      id: `gif-${gif.id}-${Date.now()}`,
      type: 'gif',
      url: gif.fixedUrl,
      name: gif.title,
    })
    onClose()
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden" style={{ maxHeight: 360 }}>
      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Grid */}
      <div className="overflow-y-auto p-2" style={{ maxHeight: 300 }}>
        {keyMissing && <p className="text-xs text-gray-500 text-center py-4">GIF search is not configured. Add VITE_GIPHY_API_KEY to your .env.local file.</p>}
        {!keyMissing && error && <p className="text-xs text-red-500 text-center py-4">{error}</p>}
        {!keyMissing && !error && loading && <p className="text-xs text-gray-400 text-center py-4">Loading...</p>}
        {!keyMissing && !error && !loading && gifs.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No GIFs found</p>}
        {!keyMissing && !error && !loading && gifs.length > 0 && (
          <div className="grid grid-cols-4 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => handleSelect(gif)}
                className="rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-400 transition-all cursor-pointer focus:outline-none"
              >
                <img src={gif.previewUrl} alt={gif.title} className="w-full h-20 object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
