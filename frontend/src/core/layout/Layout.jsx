import { Suspense, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Search, Sun, Moon } from 'lucide-react'
import { useSesion, MODO_DESARROLLO } from '../sesion/SesionContext'
import { useTema } from '../tema/TemaContext'
import { AREAS } from '../config/areas'
import { USUARIOS_DE_PRUEBA } from '../sesion/usuariosDePrueba'
import Logo from '../componentes/Logo'

function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export default function Layout() {
  const { usuario, cargando, error, verComo } = useSesion()
  const { tema, alternar } = useTema()
  const { pathname } = useLocation()
  const [busqueda, setBusqueda] = useState('')
  const enInicio = pathname === '/'

  return (
    <div className="app">
      {/* Manchas de color de fondo: el vidrio de las tarjetas las difumina */}
      <div className="fondo" aria-hidden="true">
        <span className="mancha mancha-1" />
        <span className="mancha mancha-2" />
        <span className="mancha mancha-3" />
      </div>

      <div className="capa">
        {MODO_DESARROLLO && (
          <div className="barra-dev vidrio" role="note">
            <span>
              <strong>Modo desarrollo</strong> · usuario simulado, sin Active Directory
            </span>
            <label>
              Ver como
              <select value={usuario?.id ?? ''} onChange={(e) => verComo(e.target.value)}>
                {USUARIOS_DE_PRUEBA.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} · {AREAS[u.area]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <header className="barra vidrio">
          <Link to="/" className="barra-marca" aria-label="Ir al inicio">
            <Logo />
            <span className="barra-app">Gestión de Flota</span>
          </Link>

          {enInicio && usuario && (
            <label className="buscador">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar módulo o dominio…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar módulo o dominio"
              />
            </label>
          )}

          <div className="barra-der">
            <button
              type="button"
              className="boton-redondo"
              onClick={alternar}
              aria-label={tema === 'oscuro' ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
              title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
            >
              {tema === 'oscuro' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {usuario && (
              <div className="usuario">
                <span className="avatar">{iniciales(usuario.nombre)}</span>
                <div className="usuario-datos">
                  <b>{usuario.nombre}</b>
                  <small>{AREAS[usuario.area] ?? usuario.area}</small>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="contenido">
          {cargando && <p className="estado">Cargando sesión…</p>}
          {error && (
            <p className="estado estado-error">
              No se pudo obtener la sesión. Volvé a ingresar o avisá a Sistemas.
            </p>
          )}
          {usuario && (
            <Suspense fallback={<p className="estado">Cargando…</p>}>
              <Outlet context={{ busqueda }} />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  )
}
