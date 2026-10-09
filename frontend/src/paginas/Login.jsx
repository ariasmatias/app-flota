import { useState } from 'react'
import { useSesion } from '../core/sesion/SesionContext'

export default function Login() {
  const { iniciarSesion, modoBackend } = useSesion()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setCargando(true)
    setError('')
    try {
      await iniciarSesion(modoBackend === 'simulado' ? '' : usuario, modoBackend === 'simulado' ? '' : clave)
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
        <h1>Gestión de Flota</h1>
        <p>{modoBackend === 'simulado' ? 'Modo demostración: no se validan credenciales de Active Directory.' : 'Ingresá con tu cuenta corporativa de AUBASA.'}</p>
        {modoBackend === 'corporativo' && <><label htmlFor="usuario-ad">Usuario</label>
        <input id="usuario-ad" autoComplete="username" value={usuario} required
          onChange={e => setUsuario(e.target.value)} />
        <label htmlFor="clave-ad">Contraseña</label>
        <input id="clave-ad" type="password" autoComplete="current-password" value={clave} required
          onChange={e => setClave(e.target.value)} />
        {error && <p role="alert" className="estado-error">{error}</p>}
        </>}
        {modoBackend === 'desconocido' && <p role="alert">No se pudo determinar el modo de autenticación.</p>}
        <button type="submit" disabled={cargando || !['simulado', 'corporativo'].includes(modoBackend)}>{cargando ? 'Verificando…' : modoBackend === 'simulado' ? 'Ingresar a demostración' : 'Iniciar sesión'}</button>
      </form>
    </main>
  )
}
