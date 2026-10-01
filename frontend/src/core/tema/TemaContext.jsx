import { createContext, useContext, useEffect, useState } from 'react'

// Modo claro / oscuro.
// Solo agrega o saca la clase `dark` de <body>: los colores viven en variables
// CSS (estilos.css), así el cambio es instantáneo, con transición suave, y sin
// volver a renderizar React. Mismo patrón que Atención al Usuario y SVIA.

const CLAVE = 'flota.tema'
const TemaContext = createContext(null)

function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'oscuro' || guardado === 'claro') return guardado
  } catch {
    /* sin almacenamiento */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.body.classList.toggle('dark', tema === 'oscuro')
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      /* sin almacenamiento: queda solo en memoria */
    }
  }, [tema])

  const alternar = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'))

  return <TemaContext.Provider value={{ tema, alternar }}>{children}</TemaContext.Provider>
}

export function useTema() {
  const ctx = useContext(TemaContext)
  if (!ctx) throw new Error('useTema debe usarse dentro de <TemaProvider>')
  return ctx
}
