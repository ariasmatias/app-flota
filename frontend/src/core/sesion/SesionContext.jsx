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
  const [modoBackend, setModoBackend] = useState(null)

  useEffect(() => {
    if (MODO_DESARROLLO) return
    fetch('/api/sesion/modo', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('No se pudo verificar el modo de autenticación'); return r.json() })
      .then(data => setModoBackend(data.modo))
      .catch(() => setModoBackend('desconocido'))
    fetch('/api/sesion', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setUsuario)
      .catch(e => { if (!String(e.message).includes('401')) setError(e) })
      .finally(() => setCargando(false))
  }, [])

  async function iniciarSesion(usuarioIngresado, password) {
    if (modoBackend === null || modoBackend === 'desconocido') throw new Error('No se pudo verificar la autenticación del servidor')
    if (modoBackend === 'simulado' && (usuarioIngresado || password)) throw new Error('El acceso de demostración no utiliza credenciales')
    if (modoBackend === 'corporativo' && !window.isSecureContext) throw new Error('Para ingresar credenciales corporativas se requiere HTTPS')
    const response = await fetch('/api/sesion/login', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Flota-Session': '1' },
      body: JSON.stringify({ usuario: usuarioIngresado, password }),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'No se pudo iniciar sesión')
    }
    setUsuario(await response.json())
    setError(null)
  }

  async function cerrarSesion() {
    const response = await fetch('/api/sesion/logout', {
      method: 'POST', credentials: 'include', headers: { 'X-Flota-Session': '1' },
    })
    if (!response.ok) throw new Error('No se pudo cerrar la sesión')
    setUsuario(null)
    setError(null)
  }

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
    <SesionContext.Provider value={{ usuario, cargando, error, verComo, iniciarSesion, cerrarSesion, modoBackend }}>
      {children}
    </SesionContext.Provider>
  )
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return ctx
}
