/**
 * src/main.jsx
 *
 * Purpose: React app entry point — mounts App into DOM
 * Context: Called by Vite on build/dev; imports global CSS
 * Dependencies: React 18, ReactDOM, App.jsx, index.css
 */

import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)