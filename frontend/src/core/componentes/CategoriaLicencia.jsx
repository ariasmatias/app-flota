import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp, X } from 'lucide-react'
import { CLASES, CATEGORIAS_LICENCIA, infoCategoria } from '../config/categoriasLicencia'

// Dibujitos propios (no copiados de ningún sitio), mismo trazo que los
// íconos de lucide: 24×24, línea de 1.8 y color del texto (sirven en claro y oscuro).
const DIBUJOS = {
  moto: (
    <>
      <circle cx="5" cy="16" r="3" /><circle cx="19" cy="16" r="3" />
      <path d="M5 16l3.5-5.5H13l2.2 3.2" /><path d="M19 16l-3.8-5.5L16.5 7H19" /><path d="M7.5 10.5h4" />
    </>
  ),
  cuatriciclo: (
    <>
      <circle cx="6" cy="17" r="2.6" /><circle cx="18" cy="17" r="2.6" />
      <path d="M3 13.5h18l-1.6-3.5H7.5z" /><path d="M15 10l1.2-3.5H19" /><path d="M8.6 17h6.8" />
    </>
  ),
  cabina: (
    <>
      <circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" />
      <path d="M4 17v-5l2.5-5.5h8l3.5 5.5h2v5" /><path d="M9.5 17h5" /><path d="M7 12h10" />
    </>
  ),
  auto: (
    <>
      <circle cx="6.5" cy="16" r="2" /><circle cx="17.5" cy="16" r="2" />
      <path d="M2 16v-3.5l2.5-5h10l3.8 5H22V16" /><path d="M8.5 16h7" /><path d="M2 16h2.5M19.5 16H22" /><path d="M4.8 12.5h14" />
    </>
  ),
  trailer: (
    <>
      <circle cx="4.5" cy="16.5" r="1.6" /><circle cx="10.8" cy="16.5" r="1.6" /><circle cx="19" cy="16.5" r="1.6" />
      <path d="M1.5 16.5V13l1.8-4h6.4l2.6 4h.8v3.5" /><path d="M6.1 16.5h3.1" /><path d="M13.1 14.5h1.4" /><path d="M14.5 9.5h7.5v6h-7.5z" />
    </>
  ),
  camion: (
    <>
      <circle cx="6.5" cy="17.5" r="2" /><circle cx="17" cy="17.5" r="2" />
      <path d="M2 15.5V5.5h11.5v10" /><path d="M13.5 8.5H17l4 4v3.5h-2" /><path d="M8.5 17.5H15" /><path d="M2 15.5h2.5" />
    </>
  ),
  combi: (
    <>
      <circle cx="6.5" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M2 15V6.5h13.5L21 12v3h-2" /><path d="M8.5 17H15" /><path d="M2 15h2.5" /><path d="M5 9.5h3.5v2.5H5zM11 9.5h3.5v2.5H11z" />
    </>
  ),
  colectivo: (
    <>
      <circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" />
      <rect x="3" y="3.5" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M8 3.5V10M13 3.5V10M18 3.5V10" /><path d="M3 13.5h2.5M18.5 13.5H21" />
    </>
  ),
  emergencia: (
    <>
      <circle cx="6.5" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M2 15V6.5h13.5L21 12v3h-2" /><path d="M8.5 17H15" /><path d="M2 15h2.5" /><path d="M8.5 8.5v5M6 11h5" />
    </>
  ),
  articulado: (
    <>
      <circle cx="4" cy="17.5" r="1.7" /><circle cx="8" cy="17.5" r="1.7" /><circle cx="18.5" cy="17.5" r="1.7" />
      <path d="M1 15.5V6h13v9.5H1z" /><path d="M14 13.5h1.5" /><path d="M15.5 15.5V9h3l3.5 3.5v3" />
    </>
  ),
  maquina: (
    <>
      <path d="M2 18.5h11" /><circle cx="4" cy="18.5" r="1.4" /><circle cx="11" cy="18.5" r="1.4" />
      <path d="M2.5 16v-4h9v4" /><path d="M8 12l5-7 7 3.5" /><path d="M20 8.5v4.5" /><path d="M18.5 13h3" />
    </>
  ),
  adaptado: (
    <>
      <circle cx="11" cy="4" r="1.7" /><path d="M11 7v6h5l2.5 5" /><path d="M11 9.5h5" />
      <path d="M8 10.8a5 5 0 1 0 7.8 5.7" />
    </>
  ),
  tractor: (
    <>
      <circle cx="7" cy="15.5" r="4" /><circle cx="7" cy="15.5" r="1" /><circle cx="18.5" cy="17" r="2.5" />
      <path d="M4 11.5V5h6l2 6.5h7.5V15" /><path d="M16 11.5V7" /><path d="M11 15.5h5" />
    </>
  ),
  desconocido: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2" /><path d="M12 16.5h.01" />
    </>
  ),
}

export function IconoCategoria({ codigo, grupo, size = 20, className = '' }) {
  const g = grupo ?? infoCategoria(codigo).grupo
  return (
    <svg
      className={`icono-categoria ${className}`}
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
    >
      {DIBUJOS[g] ?? DIBUJOS.desconocido}
    </svg>
  )
}

// Código de categoría con su dibujito. Al pasar el mouse dice qué es.
export function ChipCategoria({ codigo, conTitulo = false }) {
  const info = infoCategoria(codigo)
  return (
    <span className="chip-categoria" title={`${info.codigo} · ${info.titulo}. ${info.detalle}`}>
      <IconoCategoria grupo={info.grupo} size={18} />
      <b>{info.codigo}</b>
      {conTitulo && <span>{info.titulo}</span>}
    </span>
  )
}

// Lista de categorías de una licencia (o "—" si no hay).
export function CategoriasLicencia({ codigos }) {
  if (!codigos?.length) return <span>—</span>
  return <span className="chips-categoria">{codigos.map((c) => <ChipCategoria key={c} codigo={c} />)}</span>
}

// Botón "¿Qué es cada categoría?" que abre la guía con todas las clases.
export function GuiaCategorias({ texto = '¿Qué es cada categoría?' }) {
  const [abierta, setAbierta] = useState(false)
  useEffect(() => {
    if (!abierta) return
    const esc = (e) => e.key === 'Escape' && setAbierta(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [abierta])

  return (
    <>
      <button type="button" className="guia-categorias-boton" onClick={() => setAbierta(true)}>
        <CircleHelp size={15} aria-hidden="true" /> {texto}
      </button>
      {abierta && createPortal(
        <div className="guia-fondo" onMouseDown={(e) => e.target === e.currentTarget && setAbierta(false)}>
          <div className="guia-categorias" role="dialog" aria-modal="true" aria-labelledby="guia-categorias-titulo">
            <div className="guia-cabecera">
              <div>
                <h2 id="guia-categorias-titulo">Categorías de la licencia de conducir</h2>
                <p>Licencia Nacional de Conducir · clases y subclases (resumen).</p>
              </div>
              <button type="button" className="guia-cerrar" onClick={() => setAbierta(false)} aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="guia-cuerpo">
              {CLASES.map((k) => (
                <section key={k.clase}>
                  <h3>Clase {k.clase} · {k.nombre}</h3>
                  <ul>
                    {CATEGORIAS_LICENCIA.filter((c) => c.codigo[0] === k.clase).map((c) => (
                      <li key={c.codigo}>
                        <span className="guia-icono"><IconoCategoria grupo={c.grupo} size={26} /></span>
                        <span className="guia-codigo">{c.codigo}</span>
                        <span className="guia-texto"><b>{c.titulo}</b><small>{c.detalle}{c.edad ? ` Edad mínima: ${c.edad}.` : ''}</small></span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <p className="guia-nota">Fuente: argentina.gob.ar · Seguridad Vial. Los dibujos son orientativos.</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
