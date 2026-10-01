import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tipografía incluida en el build: la app no depende de internet ni de CDNs.
import '@fontsource/encode-sans/400.css'
import '@fontsource/encode-sans/600.css'
import '@fontsource/encode-sans/700.css'
import '@fontsource/encode-sans/800.css'
import './estilos.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
