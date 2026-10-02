import { createContext, useContext, useEffect, useState } from 'react'
import { USUARIOS_DE_PRUEBA } from './usuariosDePrueba'

// ─────────────────────────────────────────────────────────────────────────────
// Sesión del usuario.
//
// Modo desarrollo (VITE_AUTH_MODE=development, el default en `npm run dev`):
//   usuario simulado, con un selector "Ver como" para probar cada área.
//
// Modo real: le pregunta al backend quién es el usuario (GET /api/sesion).
//   La sesión vive en el servidor con cookie HttpOnly (historia I-01): el
//   frontend no guarda tokens ni contraseñas.
// ─────────────────────────────────────────────────────────────────────────────

const MODO = import.meta.env.VITE_AUTH_MODE ?? (import.meta.env.DEV ? 'development' : 'real')
export const MODO_DESARROLLO = MODO === 'development'

const CLAVE_LOCAL = 'flota.usuarioDePrueba'

const SesionContext = createContext(null)

function leerUsuarioDePrueba() {
  try {
    const id = Number(localStorage.getItem(CLAVE_LOCAL))
    return USUARIOS_DE_PRUEBA.find((u) => u.id === id) ?? USUARIOS_DE_PRUEBA[0]
  } catch {
    return USUARIOS_DE_PRUEBA[0]
  }
}

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(MODO_DESARROLLO ? leerUsuarioDePrueba() : null)
  const [cargando, setCargando] = useState(!MODO_DESARROLLO)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (MODO_DESARROLLO) return
    fetch('/api/sesion', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setUsuario)
      .catch(setError)
      .finally(() => setCargando(false))
  }, [])

  // Solo en desarrollo: cambiar el usuario simulado.
  function verComo(id) {
    const u = USUARIOS_DE_PRUEBA.find((x) => x.id === Number(id))
    if (!u) return
    setUsuario(u)
    try {
      localStorage.setItem(CLAVE_LOCAL, String(u.id))
    } catch {
      /* sin almacenamiento: queda solo en memoria */
    }
  }

  return (
    <SesionContext.Provider value={{ usuario, cargando, error, verComo }}>
      {children}
    </SesionContext.Provider>
  )
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return ctx
}
