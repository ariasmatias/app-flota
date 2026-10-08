import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, X } from 'lucide-react'

/**
 * Desplegable "Cristal": reemplazo del <select> nativo, mismo criterio que el
 * Dropdown de SIGEPAS (Atención al Usuario).
 *
 * Por qué no el <select> nativo: la lista que abre el navegador no respeta el
 * tema; en modo oscuro quedaba texto claro sobre fondo blanco (ilegible hasta
 * pasar el mouse) y no se puede estilizar.
 *
 * - La lista se dibuja en un portal sobre <body>: no la recorta ninguna
 *   tarjeta con overflow. Si no entra abajo, abre hacia arriba.
 * - La opción bajo el mouse (o elegida con flechas) se marca con el tono
 *   petróleo de la marca; la ya elegida lleva ✓.
 * - Teclado: Enter / Espacio / flechas abren; flechas mueven; Enter elige;
 *   Escape cierra; Tab sigue al próximo campo.
 * - Funciona dentro de un <form>: con `name` manda el valor en FormData y con
 *   `required` el navegador no deja enviar sin elegir (y se marca en rojo).
 * - Controlado (`valor` + `alCambiar`) o no controlado (`valorInicial`).
 *
 * - `multiple`: se eligen varias opciones (valor = array); la lista queda
 *   abierta para seguir marcando y el campo muestra las elegidas.
 *
 * opciones: [{ valor, etiqueta, detalle?, icono?, deshabilitada? }] o
 *           { separador: true, etiqueta } para títulos de grupo.
 */
export default function Desplegable({
  etiqueta,
  valor,
  valorInicial = '',
  alCambiar,
  opciones = [],
  placeholder = 'Seleccionar',
  name,
  required = false,
  deshabilitado = false,
  buscable = false,
  limpiable = false,
  className = '',
  ancho,
  multiple = false,
}) {
  const controlado = valor !== undefined
  const normalizar = (v) => (multiple ? (Array.isArray(v) ? v.map(String) : []) : String(v ?? ''))
  const [interno, setInterno] = useState(() => normalizar(valorInicial))
  const actual = normalizar(controlado ? valor : interno)
  const marcados = multiple ? actual : actual ? [actual] : []
  const estaElegida = (o) => marcados.includes(String(o.valor))

  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [resaltado, setResaltado] = useState(-1)
  const [pos, setPos] = useState(null)
  const [invalido, setInvalido] = useState(false)
  const disparador = useRef(null)
  const panel = useRef(null)
  const idLista = useId()
  const idEtiqueta = useId()

  const elegida = multiple ? null : opciones.find((o) => !o.separador && String(o.valor) === actual)
  const elegidas = opciones.filter((o) => !o.separador && estaElegida(o))

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!buscable || !q) return opciones
    return opciones.filter((o) => !o.separador && `${o.etiqueta} ${o.detalle ?? ''}`.toLowerCase().includes(q))
  }, [opciones, busqueda, buscable])

  const elegible = (o) => o && !o.separador && !o.deshabilitada

  function ubicar() {
    const r = disparador.current?.getBoundingClientRect()
    if (!r) return
    const margen = 8
    const abajo = window.innerHeight - r.bottom - margen
    const arriba = r.top - margen
    const haciaArriba = abajo < 200 && arriba > abajo
    // La lista puede ser más ancha que el campo (por ejemplo "Ver como"), sin salirse de la pantalla.
    const ancho = Math.min(Math.max(r.width, 240), window.innerWidth - margen * 2)
    const izquierda = Math.max(margen, Math.min(r.left, window.innerWidth - ancho - margen))
    setPos({
      left: izquierda,
      width: ancho,
      top: haciaArriba ? undefined : r.bottom + 6,
      bottom: haciaArriba ? window.innerHeight - r.top + 6 : undefined,
      maxHeight: Math.max(140, Math.min(300, haciaArriba ? arriba : abajo)),
    })
  }

  function abrir() {
    if (deshabilitado) return
    ubicar()
    setAbierto(true)
    const i = visibles.findIndex((o) => !o.separador && estaElegida(o))
    setResaltado(i >= 0 ? i : visibles.findIndex(elegible))
  }

  function cerrar() {
    setAbierto(false)
    setBusqueda('')
    setResaltado(-1)
  }

  function elegir(o) {
    if (!elegible(o)) return
    const v = String(o.valor)
    if (multiple) {
      // Varias: marcar / desmarcar y dejar la lista abierta.
      const nuevo = marcados.includes(v) ? marcados.filter((x) => x !== v) : [...marcados, v]
      if (!controlado) setInterno(nuevo)
      alCambiar?.(nuevo)
      setInvalido(false)
      return
    }
    if (!controlado) setInterno(v)
    alCambiar?.(v)
    setInvalido(false)
    cerrar()
    disparador.current?.focus()
  }

  function limpiar() {
    const vacio = multiple ? [] : ''
    if (!controlado) setInterno(vacio)
    alCambiar?.(vacio)
    cerrar()
    disparador.current?.focus()
  }

  // Cerrar con click afuera (el panel vive en un portal: hay que mirar los dos).
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => {
      if (!disparador.current?.contains(e.target) && !panel.current?.contains(e.target)) cerrar()
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierto])

  // Mantener la lista pegada al campo si se hace scroll o cambia la ventana.
  useEffect(() => {
    if (!abierto) return
    window.addEventListener('scroll', ubicar, true)
    window.addEventListener('resize', ubicar)
    return () => {
      window.removeEventListener('scroll', ubicar, true)
      window.removeEventListener('resize', ubicar)
    }
  }, [abierto])

  // Al buscar, queda resaltado el primer resultado: Enter lo elige directo.
  useEffect(() => {
    if (abierto && buscable && busqueda) setResaltado(visibles.findIndex(elegible))
  }, [busqueda]) // eslint-disable-line react-hooks/exhaustive-deps

  // Que la opción resaltada con flechas quede a la vista.
  useEffect(() => {
    if (abierto && resaltado >= 0) panel.current?.querySelector(`[data-i="${resaltado}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [abierto, resaltado])

  function mover(delta) {
    setResaltado((prev) => {
      const total = visibles.length
      let i = prev
      for (let n = 0; n < total; n++) {
        i = (i + delta + total) % total
        if (elegible(visibles[i])) return i
      }
      return prev
    })
  }

  function teclado(e) {
    if (!abierto) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        abrir()
      }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); mover(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); mover(-1) }
    else if (e.key === 'Enter') { e.preventDefault(); elegir(visibles[resaltado]) }
    else if (e.key === 'Escape') { e.preventDefault(); cerrar() }
    else if (e.key === 'Tab') cerrar()
  }

  const clases = ['desplegable-campo', className].filter(Boolean).join(' ')

  return (
    <div className={clases} style={ancho ? { width: ancho } : undefined} onKeyDown={teclado}>
      {etiqueta && <span id={idEtiqueta} className="desplegable-etiqueta">{etiqueta}{required && <span aria-hidden="true"> *</span>}</span>}
      <div className="desplegable-contenedor">
        <button
          type="button"
          ref={disparador}
          className={`desplegable${abierto ? ' abierto' : ''}${invalido ? ' invalido' : ''}`}
          onClick={() => (abierto ? cerrar() : abrir())}
          disabled={deshabilitado}
          aria-haspopup="listbox"
          aria-expanded={abierto}
          aria-controls={abierto ? idLista : undefined}
          aria-labelledby={etiqueta ? idEtiqueta : undefined}
        >
          {multiple ? (
            <span className={elegidas.length ? 'desplegable-valor' : 'desplegable-placeholder'}>
              {elegidas.length === 0 && placeholder}
              {elegidas.length > 0 && elegidas.length <= 3 && elegidas.map((o) => o.etiqueta).join(', ')}
              {elegidas.length > 3 && `${elegidas.length} elegidos`}
            </span>
          ) : (
            <span className={elegida ? 'desplegable-valor' : 'desplegable-placeholder'}>
              {elegida?.icono}{elegida ? elegida.etiqueta : placeholder}
              {elegida?.detalle && <small> {elegida.detalle}</small>}
            </span>
          )}
          <ChevronDown size={16} aria-hidden="true" className="desplegable-flecha" />
        </button>
        {/* Campo real del formulario: lleva el valor en FormData y activa la validación "required". */}
        {(name || required) && (
          <input
            className="desplegable-oculto"
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            required={required}
            value={marcados.join(',')}
            onChange={() => {}}
            onInvalid={() => setInvalido(true)}
          />
        )}
      </div>

      {abierto && pos && createPortal(
        <div
          ref={panel}
          className="desplegable-panel"
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
        >
          {buscable && (
            <label className="desplegable-buscar">
              <Search size={15} aria-hidden="true" />
              <input autoFocus placeholder="Buscar…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </label>
          )}
          {limpiable && marcados.length > 0 && (
            <button type="button" className="desplegable-limpiar" onClick={limpiar}><X size={14} /> Limpiar selección</button>
          )}
          <ul id={idLista} role="listbox" aria-multiselectable={multiple || undefined} aria-labelledby={etiqueta ? idEtiqueta : undefined}>
            {visibles.map((o, i) => {
              if (o.separador) return <li key={`sep-${i}`} role="presentation" className="desplegable-grupo">{o.etiqueta}</li>
              const sel = estaElegida(o)
              const clasesOpcion = ['desplegable-opcion', sel && 'elegida', i === resaltado && 'resaltada', o.deshabilitada && 'deshabilitada'].filter(Boolean).join(' ')
              return (
                <li
                  key={`${o.valor}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={sel}
                  aria-disabled={o.deshabilitada || undefined}
                  className={clasesOpcion}
                  onMouseEnter={() => !o.deshabilitada && setResaltado(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(o)}
                >
                  {multiple && <span className={`desplegable-casilla${sel ? ' marcada' : ''}`} aria-hidden="true">{sel && <Check size={12} />}</span>}
                  <span className="desplegable-texto">{o.icono}{o.etiqueta}{o.detalle && <small> {o.detalle}</small>}</span>
                  {sel && !multiple && <Check size={15} aria-hidden="true" />}
                </li>
              )
            })}
            {!visibles.length && <li className="desplegable-vacio">Sin resultados</li>}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  )
}
