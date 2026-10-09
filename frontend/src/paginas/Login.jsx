import { useState } from 'react'
import { useSesion } from '../core/sesion/SesionContext'

export default function Login() {
  const { iniciarSesion } = useSesion()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setCargando(true)
    setError('')
    try {
      await iniciarSesion(usuario, clave)
      setClave('')
    } catch (e) {
      setError(e.message || 'No se pudo iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flota-login">
      <form className="flota-login-form vidrio" onSubmit={enviar}>
        <h1>App FLOTA</h1>
        <p>Ingresá con tu cuenta corporativa de AUBASA.</p>
        <label htmlFor="usuario-ad">Usuario</label>
        <input id="usuario-ad" autoComplete="username" value={usuario} required
          onChange={e => setUsuario(e.target.value)} />
        <label htmlFor="clave-ad">Contraseña</label>
        <input id="clave-ad" type="password" autoComplete="current-password" value={clave} required
          onChange={e => setClave(e.target.value)} />
        {error && <p role="alert" className="estado-error">{error}</p>}
        <button type="submit" disabled={cargando}>{cargando ? 'Verificando…' : 'Iniciar sesión'}</button>
      </form>
    </main>
  )
}
