import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
// In a real published scenario this would be imported from '@otelverse/web'
// Mock initOtelVerse for the standalone demo
const initOtelVerse = (config: any) => {
  console.log('OTelVerse initialized with:', config)
}

initOtelVerse({
  serviceName: 'react-app-frontend',
  endpoint: 'http://localhost:4318/v1/traces', // Public OTLP HTTP endpoint
})

const App = () => {
  const [data, setData] = useState<any>(null)
  
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/users')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    }
  }

  const createOrder = async (fail: boolean) => {
    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Math.floor(Math.random() * 1000), fail })
      })
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>OTelVerse React Demo</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={fetchUsers}>Fetch Users</button>
        <button onClick={() => createOrder(false)}>Create Order (Success)</button>
        <button onClick={() => createOrder(true)}>Create Order (Fail)</button>
      </div>
      <pre style={{ background: '#f4f4f4', padding: 10, borderRadius: 4 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
