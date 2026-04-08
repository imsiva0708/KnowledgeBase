import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import ContentCreation from './ContentCreation'
import ContentDisplay from './ContentDisplay'
import LookupInput from './LookupInput'

function App() {
  const [lookupId, setLookupId] = useState('')
  const [data, setData] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showLookupModal, setShowLookupModal] = useState(false)
  const lookupRef = useRef(null)

  const getData = async (id) => {
    const trimmed = (id || '').trim()
    if (!trimmed) return
    setSearched(true)
    try {
      const resp = await axios.get(`http://127.0.0.1:8000/data/${trimmed}`)
      setData(resp.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setData(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') getData(lookupId)
  }

  // Global shortcut: Ctrl+K or Meta+K to open the lookup modal
  useEffect(() => {
    const handler = (e) => {
      const key = e.key?.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault()
        setShowLookupModal(true)
        // focus after render
        setTimeout(() => lookupRef.current?.focus(), 50)
      }
      if (e.key === 'Escape' && showLookupModal) {
        setShowLookupModal(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showLookupModal])

  const resetToHome = () => {
    setData(null)
    setLookupId('')
    setSearched(false)
  }

  // If an item is found we show the ContentDisplay view.
  if (data) {
    return (
      <div>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-8 h-16">
          <div className="text-lg font-bold tracking-tighter text-primary font-headline uppercase cursor-pointer" onClick={resetToHome}>KnowledgeBASE</div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[#252626] text-[#acabaa]" onClick={() => setShowCreate(true)}>
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </header>

        <main className="pt-24 px-8">
          <ContentDisplay data={data} />
        </main>

        {showCreate && (
          <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center">
            <div className="bg-surface-container-high p-6 rounded-lg w-full max-w-3xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl">Create Content Item</h2>
                <button onClick={() => setShowCreate(false)} className="material-symbols-outlined">close</button>
              </div>
              <ContentCreation />
            </div>
          </div>
        )}
        {showLookupModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="w-full max-w-xl px-6">
              <div className="bg-surface-container-high p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <LookupInput
                    ref={lookupRef}
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    onSearch={() => { getData(lookupId); setShowLookupModal(false) }}
                    onClose={() => setShowLookupModal(false)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded border" onClick={() => setShowLookupModal(false)}>Cancel</button>
                  <button className="px-4 py-2 rounded bg-primary text-black" onClick={() => { getData(lookupId); setShowLookupModal(false) }}>Go</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Landing / search view
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-8 h-16">
        <div className="text-lg font-bold tracking-tighter text-primary font-headline uppercase">KnowledgeBASE</div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded bg-primary text-white font-semibold" onClick={() => setShowCreate(true)}>Create Content Item</button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center gap-6 py-24">
            <LookupInput
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              onSearch={() => getData(lookupId)}
            />
            <div className="flex gap-4">
              <button className="px-6 py-3 rounded border border-outline-variant text-on-surface-variant" onClick={() => getData(lookupId)}>Search</button>
              <button className="px-6 py-3 rounded border border-outline-variant text-on-surface-variant" onClick={() => { setLookupId(''); setSearched(false); }}>Clear</button>
            </div>
            {searched && !data && <div className="text-error mt-4">Lookup ID does not exist</div>}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center">
          <div className="bg-surface-container-high p-6 rounded-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-white">Create Content Item</h2>
              <button onClick={() => setShowCreate(false)} className="material-symbols-outlined">close</button>
            </div>
            <ContentCreation />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
