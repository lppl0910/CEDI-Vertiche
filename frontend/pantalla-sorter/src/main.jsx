import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SorterProvider } from './context/SorterProvider'
import { BaysProvider } from './context/BaysProvider'
import { SSEManager } from './context/SSEManager'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SorterProvider>
      <BaysProvider>
        <SSEManager />
        <App />
      </BaysProvider>
    </SorterProvider>
  </StrictMode>,
)
