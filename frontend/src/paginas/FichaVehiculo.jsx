import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Truck } from 'lucide-react'
import { MODO_DESARROLLO } from '../core/sesion/SesionContext'
import { fichaCompleta } from '../core/datos/fichaVehiculo'
import { flotaDePrueba } from '../core/datos/flotaDePrueba'
import { ChipCategoria } from '../core/componentes/CategoriaLicencia'

const fecha = (v) => (v ? new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC' }).format(new Date(`${v}T12:00:00Z`)) : '—')
const dias = (v, ref) => Math.round((Date.parse(`${v}T12:00:00Z`) - Date.parse(`${ref}T12:00:00Z`)) / 86400000)

const TONO = { activo: 'ok', vigente: 'ok', pagada: 'ok', ACTIVO: 'ok', taller: 'alerta', pendiente: 'alerta', bloqueada: 'alerta', PENDIENTE: 'alerta', BLOQUEADO: 'alerta', baja: 'error', BAJA: 'error', PERDIDO: 'error', Vencida: 'error', 'Por vencer': 'alerta', Vigente: 'ok' }
function Etiqueta({ children, tono }) {
  return <span className={`ficha-etiqueta ${tono ?? TONO[children] ?? ''}`}>{children}</span>
}

function vencimiento(fechaVence, ref) {
  if (!fechaVence) return null
  const d = dias(fechaVence, ref)
  return d < 0 ? 'Vencida' : d <= 30 ? 'Por vencer' : 'Vigente'
}

// Tabla de historial: la fila vigente se marca.
function Historial({ titulo, columnas, filas, vacio = 'Sin registros.' }) {
  return (
    <section className="vidrio ficha-panel">
      <h2>{titulo} <small>{filas.length}</small></h2>
      {filas.length ? (
        <div className="ficha-scroll">
          <table>
            <thead><tr>{columnas.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{filas.map((f) => <tr key={f.key} className={f.actual ? 'actual' : ''}>{f.celdas.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : <p className="ficha-vacio">{vacio}</p>}
    </section>
  )
}

// Ficha completa del vehículo con todo su historial (solo lectura).
// Se llega desde la búsqueda por dominio de la pantalla principal.
export default function FichaVehiculo() {
  const { dominio } = useParams()
  const ficha = useMemo(() => (MODO_DESARROLLO ? fichaCompleta(flotaDePrueba(), dominio) : null), [dominio])

  if (!MODO_DESARROLLO) {
    return (
      <section className="pagina">
        <Link to="/" className="volver"><ArrowLeft size={16} /> Volver al inicio</Link>
        <h1>Ficha del vehículo {dominio}</h1>
        <p>La consulta de la ficha todavía necesita la API del backend.</p>
      </section>
    )
  }
  if (!ficha) {
    return (
      <section className="pagina">
        <Link to="/" className="volver"><ArrowLeft size={16} /> Volver al inicio</Link>
        <div className="vidrio ficha-panel"><h1>No encontramos el dominio {dominio}</h1><p className="ficha-vacio">Revisá que esté bien escrito (AA123BB o AAA123).</p></div>
      </section>
    )
  }

  const { vehiculo: v } = ficha
  const ref = flotaDePrueba().referencia
  const vtvEstado = vencimiento(ficha.vtvHoy?.vigente_hasta, ref)
  const polizaEstado = vencimiento(ficha.polizaHoy?.vence, ref)

  return (
    <section className="pagina ficha">
      <Link to="/" className="volver"><ArrowLeft size={16} /> Volver al inicio</Link>
      <header className="vidrio ficha-cabecera">
        <div className="ficha-icono"><Truck size={28} /></div>
        <div>
          <span className="ficha-kicker">FICHA DEL VEHÍCULO · CONSULTA</span>
          <h1><span className="ficha-dominio">{v.dominio}</span> {v.marca} {v.modelo} {v.anio && <span className="ficha-anio">{v.anio}</span>}</h1>
          <p>Categoría requerida {ficha.categoria === 'Sin exigencia' ? 'sin exigencia' : <ChipCategoria codigo={ficha.categoria} conTitulo />} · {ficha.estado ? <Etiqueta>{ficha.estado}</Etiqueta> : 'sin estado'}</p>
          <p className="ficha-tecnico">Flota {ficha.clase.toLowerCase()} · Alta {fecha(v.fecha_alta)}{v.fecha_baja ? ` · Baja ${fecha(v.fecha_baja)}` : ''} · Chasis <code>{v.nro_chasis ?? '—'}</code> · Motor <code>{v.nro_motor ?? '—'}</code></p>
        </div>
      </header>
      {v.fecha_baja && <p className="ficha-baja">De baja desde el {fecha(v.fecha_baja)} · {v.motivo_baja}{v.nota_baja ? `: ${v.nota_baja}` : ''}. Se conserva todo el historial.</p>}
      <p className="ficha-demo"><b>Vista de prueba</b> · Datos ficticios del seed compartido. Solo lectura: los cambios se hacen en cada módulo.</p>

      <div className="ficha-resumen">
        <div className="vidrio"><span>Conductores hoy</span><strong>{ficha.conductoresHoy.length}</strong><small>{ficha.conductoresHoy.map((a) => a.persona).join(' · ') || 'Sin conductores'}</small></div>
        <div className="vidrio"><span>Póliza</span><strong>{ficha.polizaHoy?.nro_poliza ?? 'Sin cobertura'}</strong><small>{ficha.polizaHoy ? <>vence {fecha(ficha.polizaHoy.vence)} <Etiqueta>{polizaEstado}</Etiqueta></> : <Etiqueta tono="error">Revisar</Etiqueta>}</small></div>
        <div className="vidrio"><span>VTV</span><strong>{ficha.vtvHoy ? fecha(ficha.vtvHoy.vigente_hasta) : 'Sin VTV'}</strong><small>{vtvEstado ? <Etiqueta>{vtvEstado}</Etiqueta> : 'Sin dato'}</small></div>
        <div className="vidrio"><span>Centro de costo</span><strong>{ficha.centroHoy ? `${ficha.centroHoy.codigo ?? ''} ${ficha.centroHoy.nombre}` : 'Sin dato'}</strong><small>{ficha.centroHoy ? `Gerencia: ${ficha.centroHoy.gerencia}` : 'Lo carga Finanzas'}</small></div>
        <div className="vidrio"><span>Jefaturas</span><strong>{ficha.jefaturasHoy.length || 'Sin jefatura'}</strong><small>{ficha.jefaturasHoy.map((j) => j.nombre).join(' · ') || '—'}</small></div>
        <div className="vidrio"><span>Tarjeta YPF</span><strong>{ficha.tarjetas[0]?.numero_tarjeta ?? (ficha.tarjetas[0] ? 'Sin número' : 'Sin tarjeta')}</strong><small>{ficha.tarjetas[0] ? <><Etiqueta>{ficha.tarjetas[0].estado}</Etiqueta> {ficha.tarjetas[0].perfil}</> : '—'}</small></div>
        <div className="vidrio"><span>Tag de telepeaje</span><strong>{ficha.tagHoy?.nro_dispositivo ?? 'Sin tag'}</strong><small>{ficha.tagHoy ? <Etiqueta>{ficha.tagHoy.estado_tag}</Etiqueta> : '—'}</small></div>
      </div>

      <Historial titulo="Conductores" columnas={['Persona', 'Legajo', 'Desde', 'Hasta', 'Motivo']}
        filas={ficha.asignaciones.map((a) => ({ key: a.id, actual: a.vigente, celdas: [<b key="p">{a.persona}</b>, a.legajo, fecha(a.vigente_desde), a.vigente_hasta ? fecha(a.vigente_hasta) : <Etiqueta tono="ok">vigente</Etiqueta>, a.motivo ?? '—'] }))}
        vacio="Nunca tuvo conductores asignados." />
      <Historial titulo="Estados" columnas={['Estado', 'Desde', 'Hasta', 'Motivo']}
        filas={[
          ...(v.fecha_baja ? [{ key: 'baja', actual: true, celdas: [<Etiqueta key="e">baja</Etiqueta>, fecha(v.fecha_baja), '—', [v.motivo_baja, v.nota_baja].filter(Boolean).join(': ')] }] : []),
          ...ficha.estados.map((e) => ({ key: e.id, actual: !e.vigente_hasta && !v.fecha_baja, celdas: [<Etiqueta key="e">{e.estado}</Etiqueta>, fecha(e.vigente_desde), e.vigente_hasta ? fecha(e.vigente_hasta) : 'Actual', e.motivo ?? '—'] })),
        ]} />
      <Historial titulo="Pólizas" columnas={['Póliza', 'Aseguradora', 'Cubierto desde', 'Hasta', 'Vence la póliza']}
        filas={ficha.polizas.map((p) => ({ key: p.id, actual: p.vigente, celdas: [<b key="n">{p.nro_poliza}</b>, p.aseguradora, fecha(p.vigente_desde), p.vigente_hasta ? fecha(p.vigente_hasta) : 'Cubierto', fecha(p.vence)] }))}
        vacio="Nunca estuvo cubierto por una póliza." />
      <Historial titulo="VTV" columnas={['Realizada', 'Vence', 'Situación']}
        filas={ficha.vtv.map((x, i) => ({ key: x.id, actual: i === 0, celdas: [fecha(x.vigente_desde), fecha(x.vigente_hasta), i === 0 ? <Etiqueta key="s">{vencimiento(x.vigente_hasta, ref)}</Etiqueta> : 'Anterior'] }))}
        vacio="Sin VTV cargada." />
      <Historial titulo="Centro de costo y gerencia" columnas={['Centro', 'Gerencia', 'Desde', 'Hasta']}
        filas={ficha.centros.map((c) => ({ key: c.id, actual: c.vigente, celdas: [`${c.codigo ?? ''} ${c.nombre}`, <>{c.gerencia}{c.gerenciaDistinta && <small key="d" className="ficha-nota"> (distinta a la del centro de costo)</small>}</>, fecha(c.vigente_desde), c.vigente_hasta ? fecha(c.vigente_hasta) : 'Actual'] }))} />
      <Historial titulo="Jefaturas" columnas={['Jefatura', 'Desde', 'Hasta']}
        filas={ficha.jefaturas.map((j) => ({ key: j.id, actual: j.vigente, celdas: [j.nombre, fecha(j.vigente_desde), j.vigente_hasta ? fecha(j.vigente_hasta) : 'Vigente'] }))}
        vacio="Sin jefaturas cargadas." />
      <Historial titulo="Multas" columnas={['Acta', 'Infracción', 'Responsable', 'Pago', 'Vence pago voluntario']}
        filas={ficha.multas.map((m) => ({ key: m.id, actual: m.estado_pago === 'pendiente', celdas: [<b key="a">{m.nro_acta}</b>, fecha(m.fecha_infraccion), m.responsable ?? 'Sin confirmar', <Etiqueta key="p">{m.estado_pago}</Etiqueta>, fecha(m.vence_pago_voluntario)] }))}
        vacio="Sin multas registradas." />
      <Historial titulo="Tarjeta YPF" columnas={['Tarjeta', 'Estado', 'Desde', 'Hasta', 'Motivo']}
        filas={ficha.tarjetas.flatMap((tj) => tj.periodos.map((p) => ({ key: p.id, actual: !p.vigente_hasta, celdas: [tj.numero_tarjeta ?? 'Sin número', <Etiqueta key="e">{p.estado}</Etiqueta>, fecha(p.vigente_desde), p.vigente_hasta ? fecha(p.vigente_hasta) : 'Actual', p.motivo ?? '—'] })))}
        vacio="Sin tarjeta YPF." />
      <Historial titulo="Tag de telepeaje" columnas={['Dispositivo', 'Estado', 'Desde', 'Hasta']}
        filas={ficha.tags.map((x) => ({ key: x.id, actual: !x.vigente_hasta, celdas: [x.nro_dispositivo, <Etiqueta key="e">{x.estado_tag}</Etiqueta>, fecha(x.vigente_desde), x.vigente_hasta ? fecha(x.vigente_hasta) : 'Actual'] }))}
        vacio="Sin tag." />
      <Historial titulo="Documentos" columnas={['Tipo', 'Archivo', 'Versión', 'Desde', 'Estado']}
        filas={ficha.documentos.map((d) => ({ key: d.id, actual: !d.hasta && !d.anulado, celdas: [d.tipo, `${d.nombre} (sin archivo)`, `v${d.version}`, fecha(d.desde), d.anulado ? <Etiqueta key="a" tono="error">anulado</Etiqueta> : d.hasta ? 'Reemplazada' : <Etiqueta key="v" tono="ok">vigente</Etiqueta>] }))}
        vacio="Sin documentos." />
    </section>
  )
}
