import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import ContentCration from './ContentCreation'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null)
  const [lookupId, setLookupId] = useState('')

  const getData = (lookupId) => {
    return axios
    .get(`http://127.0.0.1:8000/data/${lookupId}`)
    .then((response) => {      setData(response.data)
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
      setData(null)
    })
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      getData(lookupId)
    }
  }

  return (
    <>
      <h1 style={{ fontSize: '3em' }}>Knowledge Base</h1>
      <div className="card">
        <input type="text" name='lookup_id' className='mainInput' style={{ fontSize: '1.5em', padding: '12px', width: '100%' }} value={lookupId} onChange={(e) => setLookupId(e.target.value)} onKeyDown={handleKeyDown}/>
      <button onClick={() => getData(lookupId)}>Search</button>
      </div>

      <div>
        <p>Output</p>
        <div className="output">
        <p>{data ? JSON.stringify(data, null, 2) : 'No data'}</p>
        </div>
      </div>
      <ContentCration/>
    </>
  )
}

export default App
