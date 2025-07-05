import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { setupDatabase } from './db/neon'

// Initialize Neon DB
setupDatabase()
  .then(() => {
    console.log('Neon DB initialized successfully')
  })
  .catch((error) => {
    console.error('Failed to initialize Neon DB:', error)
  })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
