import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Search } from 'lucide-react'
import { useSesion, MODO_DESARROLLO } from '../../core/sesion/SesionContext'
import { vigenteEn, hoy, estadoLicencia, contextoMulta, diasHasta, ESTADOS_GESTION, esAviso, gestionesDePersona } from './dominio'
import { datosIniciales, guardarLicencia, guardarMulta } from './servicioDemo'
import { CategoriasLicencia, GuiaCategorias, SelectorCategorias } from '../../core/componentes/CategoriaLicencia'
import Desplegable from '../../core/componentes/Desplegable'
const capital = t => t.charAt(0).toUpperCase() + t.slice(1)
import './rrhh.css'

const fecha = v => v ? new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC' }).format(new Date(`${v}T12:00:00Z`)) : '—'
const nombre = (d, id) => d.personas.find(p => p.id === id)?.apellido_nombre ?? 'Sin confirmar'
const patente = (d, id) => d.vehiculos.find(v => v.id === id)?.dominio ?? '—'
function Etiqueta({ children }) {
  return <span className={`rrhh-etiqueta ${['Vencida', 'baja', 'Vencido'].includes(children) ? 'error' : ['Por vencer', 'pendiente', 'Sin licencia'].includes(children) ? 'alerta' : ''}`}>{children}</span>
}
function Documento({ documento: d }) {
  if (!d) return <span>Sin documento</span>
  if (d.ejemplo) return <span className="rrhh-muted">{d.nombre} (sin archivo)</span>
  return <button type="button" className="rrhh-enlace" onClick={() => {
    const url = URL.createObjectURL(d.archivo)
    const a = document.createElement('a'); a.href = url; a.download = d.nombre; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }}>{d.nombre}</button>
}
async function adjunto(f) {
  if (!f?.size) throw new Error('Seleccioná un archivo de prueba.')
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) throw new Error('Usá PDF, JPG o PNG.')
  if (f.size > 10 * 1024 * 1024) throw new Error('El archivo debe pesar hasta 10 MB.')
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()))].map(b => b.toString(16).padStart(2, '0')).join('')
  return { nombre: f.name, hash, archivo: f }
}
export default function Modulo() {
  if (!MODO_DESARROLLO) return <section className="pagina"><h1>Recursos Humanos</h1><p>La conexión con la API de RRHH todavía está pendiente.</p></section>
  return <Demo />
}
function Demo() {
  const { usuario } = useSesion()
  const [datos, setDatos] = useState(datosIniciales)
  const [vista, setVista] = useState('personas')
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [seleccion, setSeleccion] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const pendientes = datos.multas.filter(m => m.estado_pago === 'pendiente')
  const alertas = datos.licencias.filter(l => vigenteEn(l, hoy()) && estadoLicencia(l) !== 'Vigente')
  function cambiar(v, id = null) { setVista(v); setSeleccion(id); setBusqueda(''); setFiltro('todos'); setMensaje('') }
  function actualizar(d) { setDatos(d); setMensaje('Cambio guardado en esta sesión de prueba.') }
  const personas = datos.personas.filter(p => `${p.apellido_nombre} ${p.legajo} ${p.dni}`.toLowerCase().includes(busqueda.toLowerCase()) && (filtro === 'todos' || datos.estados.some(e => e.persona_id === p.id && e.estado === filtro && vigenteEn(e, hoy()))))
  const multas = datos.multas.filter(m => `${m.nro_acta} ${patente(datos, m.vehiculo_id)}`.toLowerCase().includes(busqueda.toLowerCase()) && (filtro === 'todos' || m.estado_pago === filtro))
  const vencimientos = [...alertas.map(l => ({ id: `l${l.id}`, tipo: 'Licencia', referencia: nombre(datos, l.persona_id), fecha: l.vencimiento, abrir: () => cambiar('personas', l.persona_id) })), ...pendientes.filter(m => diasHasta(m.vence_pago_voluntario) <= 15).map(m => ({ id: `m${m.id}`, tipo: 'Multa', referencia: m.nro_acta, fecha: m.vence_pago_voluntario, abrir: () => cambiar('multas', m.id) }))].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return <section className="pagina rrhh">
    <Link to="/" className="volver"><ArrowLeft size={16} /> Volver al inicio</Link>
    <header className="rrhh-cabecera"><div className="rrhh-icono"><Users size={28} /></div><div><span className="rrhh-kicker">GESTIÓN DE FLOTA / PERSONAS</span><h1>Recursos Humanos</h1><p>Conductores, licencias y seguimiento de multas.</p></div></header>
    <p className="rrhh-demo"><b>Vista de prueba</b> · Datos ficticios. Los cambios y archivos duran mientras el módulo siga abierto; al recargar o salir se reinician. Usá únicamente archivos ficticios.</p>
    <div className="rrhh-resumen"><div className="vidrio"><span>Personas de alta</span><strong>{datos.estados.filter(e => e.estado === 'alta' && vigenteEn(e, hoy())).length}</strong><small>Fuente: GLM simulado</small></div><button className="vidrio" onClick={() => cambiar('vencimientos')}><span>Licencias a revisar</span><strong>{alertas.length}</strong><small>Vencidas o próximas a vencer</small></button><button className="vidrio" onClick={() => cambiar('multas')}><span>Multas pendientes</span><strong>{pendientes.length}</strong><small>{pendientes.filter(m => !m.responsable_id).length} sin responsable confirmado</small></button></div>
    <nav className="rrhh-tabs" aria-label="Secciones de RRHH">{[['personas', 'Personas y licencias'], ['multas', 'Bandeja de multas'], ['vencimientos', 'Vencimientos']].map(([id, titulo]) => <button key={id} aria-current={vista === id ? 'page' : undefined} onClick={() => cambiar(id)}>{titulo}</button>)}</nav>
    {mensaje && <p role="status" className="rrhh-feedback">{mensaje}</p>}
    {seleccion && vista === 'personas' ? <Ficha key={seleccion} datos={datos} id={seleccion} usuario={usuario} actualizar={actualizar} volver={() => setSeleccion(null)} /> : seleccion && vista === 'multas' ? <Multa key={seleccion} datos={datos} id={seleccion} usuario={usuario} actualizar={actualizar} volver={() => setSeleccion(null)} /> : <div className="vidrio rrhh-panel">
      <h2>{vista === 'personas' ? 'Personas' : vista === 'multas' ? 'Bandeja de multas' : 'Vencimientos de RRHH'}</h2>
      <p className="rrhh-muted">{vista === 'personas' ? 'Identidad y estado de personal. RRHH consulta los datos de GLM.' : vista === 'multas' ? 'Actas abiertas por Legales. Confirmá responsables y registrá pagos.' : 'Licencias a 60 días y multas pendientes a 15 días. Incluye vencidas.'}</p>
      {vista !== 'vencimientos' && <div className="rrhh-filtros"><label className="rrhh-busqueda"><Search size={18} /><input aria-label="Buscar" placeholder={vista === 'personas' ? 'Nombre, legajo o DNI' : 'Acta o dominio'} value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label><Desplegable etiqueta="Estado" ancho={180} valor={filtro} alCambiar={setFiltro} opciones={[{ valor: 'todos', etiqueta: 'Todos' }, ...(vista === 'personas' ? ['alta', 'baja'] : ['pendiente', 'pagada']).map(f => ({ valor: f, etiqueta: capital(f) }))]} /></div>}
      <div className="rrhh-scroll">{vista === 'personas' ? <table><thead><tr><th>Persona / legajo</th><th>Estado</th><th>Licencia</th><th>Vencimiento</th><th>Acción</th></tr></thead><tbody>{personas.map(p => {
        const l = datos.licencias.find(l => l.persona_id === p.id && vigenteEn(l, hoy()))
        return <tr key={p.id}><td><b>{p.apellido_nombre}</b><small>{p.legajo}</small></td><td><Etiqueta>{datos.estados.find(e => e.persona_id === p.id && vigenteEn(e, hoy()))?.estado ?? 'Sin estado'}</Etiqueta></td><td><Etiqueta>{estadoLicencia(l)}</Etiqueta></td><td>{fecha(l?.vencimiento)}</td><td><button className="rrhh-enlace" aria-label={`Ver ficha de ${p.apellido_nombre}`} onClick={() => setSeleccion(p.id)}>Ver ficha →</button></td></tr>
      })}</tbody></table> : vista === 'multas' ? <table><thead><tr><th>Acta / vehículo</th><th>Infracción</th><th>Responsable</th><th>Pago</th><th>Gestión</th><th>Vencimiento</th><th>Acción</th></tr></thead><tbody>{multas.map(m => <tr key={m.id}><td><b>{m.nro_acta}</b><small>{patente(datos, m.vehiculo_id)}</small></td><td>{fecha(m.fecha_infraccion)}</td><td>{nombre(datos, m.responsable_id)}</td><td><Etiqueta>{m.estado_pago}</Etiqueta></td><td>{m.documentos.filter(d => d.estado_gestion).at(-1)?.estado_gestion ?? <span className="rrhh-muted">Sin gestión</span>}</td><td>{fecha(m.vence_pago_voluntario)}</td><td><button className="rrhh-enlace" onClick={() => setSeleccion(m.id)}>Gestionar</button></td></tr>)}</tbody></table> : <table><thead><tr><th>Tipo</th><th>Referencia</th><th>Vencimiento</th><th>Plazo</th><th>Acción</th></tr></thead><tbody>{vencimientos.map(v => <tr key={v.id}><td>{v.tipo}</td><td>{v.referencia}</td><td>{fecha(v.fecha)}</td><td><Etiqueta>{diasHasta(v.fecha) < 0 ? 'Vencido' : `${diasHasta(v.fecha)} días`}</Etiqueta></td><td><button className="rrhh-enlace" onClick={v.abrir}>Ver detalle</button></td></tr>)}</tbody></table>}</div>
      {!(vista === 'personas' ? personas : vista === 'multas' ? multas : vencimientos).length && <p className="rrhh-vacio">No hay registros que coincidan.</p>}
    </div>}
  </section>
}
function Ficha({ datos, id, usuario, actualizar, volver }) {
  const p = datos.personas.find(p => p.id === id)
  const [consulta, setConsulta] = useState(hoy())
  const [form, setForm] = useState(false)
  const licencia = datos.licencias.find(l => l.persona_id === id && vigenteEn(l, consulta))
  return <><button className="rrhh-enlace" onClick={volver}>← Volver a personas</button><div className="vidrio rrhh-panel"><div className="rrhh-panel-titulo"><div><span className="rrhh-kicker">FICHA DE PERSONA</span><h2>{p.apellido_nombre}</h2><p className="rrhh-muted">Legajo {p.legajo} · DNI {p.dni}</p></div><label>Consultar al<input type="date" max={hoy()} value={consulta} onChange={e => { if (e.target.value && e.target.value <= hoy()) setConsulta(e.target.value) }} /></label></div><dl className="rrhh-datos"><div><dt>Estado del personal</dt><dd>{datos.estados.find(e => e.persona_id === id && vigenteEn(e, consulta))?.estado ?? 'Sin estado en esa fecha'}</dd></div><div><dt>Autorización para conducir</dt><dd>{datos.autorizaciones.find(a => a.persona_id === id && vigenteEn(a, consulta))?.revision ?? 'Sin autorización registrada'}</dd></div><div><dt>Licencia al {fecha(consulta)}</dt><dd><Etiqueta>{estadoLicencia(licencia, consulta)}</Etiqueta></dd></div><div><dt>Número de registro</dt><dd>{licencia?.nro_registro ?? '—'}</dd></div><div><dt>Categorías <GuiaCategorias texto="?" /></dt><dd><CategoriasLicencia codigos={licencia?.categorias} /></dd></div><div><dt>Vencimiento</dt><dd>{fecha(licencia?.vencimiento)}</dd></div></dl><Documento documento={licencia?.documentos_versiones ? licencia.documentos_versiones.find(d => vigenteEn(d, consulta)) : licencia?.documento} /><div className="rrhh-acciones"><button className="rrhh-boton" onClick={() => setForm(!form)}>{form ? 'Cerrar formulario' : 'Cargar nueva licencia'}</button></div></div>
    {form && <Licencia datos={datos} personaId={id} usuario={usuario} guardar={d => { actualizar(d); setForm(false); setConsulta(hoy()) }} />}
    <div className="vidrio rrhh-panel"><h3>Historial de licencias</h3><div className="rrhh-scroll"><table><thead><tr><th>Desde</th><th>Hasta (exclusivo)</th><th>Registro</th><th>Categorías</th><th>Vencimiento</th><th>Documento</th></tr></thead><tbody>{datos.licencias.filter(l => l.persona_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map(l => <tr key={l.id}><td>{fecha(l.vigente_desde)}</td><td>{l.vigente_hasta ? fecha(l.vigente_hasta) : 'Abierta'}</td><td>{l.nro_registro}</td><td><CategoriasLicencia codigos={l.categorias} /></td><td>{fecha(l.vencimiento)}</td><td><Documento documento={l.documento} /></td></tr>)}</tbody></table></div></div><Avisos datos={datos} personaId={id} /><div className="vidrio rrhh-panel"><h3>Historial de estado del personal</h3>{datos.estados.filter(e => e.persona_id === id).map(e => <p className="rrhh-historial" key={e.id}>{fecha(e.vigente_desde)} → {e.vigente_hasta ? fecha(e.vigente_hasta) : 'Actual'} · {e.estado} · {e.origen}</p>)}</div></>
}
function Licencia({ datos, personaId, usuario, guardar }) {
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  async function enviar(e) {
    e.preventDefault(); setError(''); setOcupado(true)
    const campos = new FormData(e.currentTarget)
    try { guardar(guardarLicencia(datos, { persona_id: personaId, nro_registro: campos.get('registro'), categorias, vencimiento: campos.get('vencimiento'), vigente_desde: campos.get('desde'), documento: await adjunto(campos.get('documento')) }, usuario)) } catch (err) { setError(err.message) } finally { setOcupado(false) }
  }
  return <form className="vidrio rrhh-panel rrhh-form" onSubmit={enviar}><h3>Nueva versión de licencia</h3><p className="rrhh-muted">Se cerrará la anterior en la fecha indicada y se conservará su documento.</p><div className="rrhh-form-grid"><label>Número de registro<input required name="registro" maxLength={80} /></label><label>Vigente desde<input required type="date" name="desde" defaultValue={hoy()} max={hoy()} /></label><label>Vencimiento<input required type="date" name="vencimiento" /></label><label>Documento ficticio · PDF/JPG/PNG · hasta 10 MB<input required type="file" name="documento" accept=".pdf,.jpg,.jpeg,.png" /></label></div><fieldset><legend>Categorías (catálogo de prueba) <GuiaCategorias /></legend><SelectorCategorias codigos={datos.categorias.map(c => c.codigo)} elegidas={categorias} alCambiar={setCategorias} /></fieldset>{error && <p className="rrhh-error" role="alert">{error}</p>}<button className="rrhh-boton" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar licencia de prueba'}</button></form>
}
function Multa({ datos, id, usuario, actualizar, volver }) {
  const m = datos.multas.find(m => m.id === id)
  const contexto = contextoMulta(datos, m)
  const [responsable, setResponsable] = useState(m.responsable_id ?? '')
  const [pago, setPago] = useState(m.estado_pago)
  const [fechaPago, setFechaPago] = useState(m.fecha_pago ?? '')
  const [estadoGestion, setEstadoGestion] = useState('')
  const [conArchivo, setConArchivo] = useState(false)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  async function enviar(e) {
    e.preventDefault(); setError(''); setOcupado(true)
    const formulario = e.currentTarget
    const archivo = new FormData(formulario).get('informe')
    try {
      const documento = archivo?.size ? { ...await adjunto(archivo), estado_gestion: estadoGestion, fecha: hoy(), responsable_id: Number(responsable), usuario: usuario.nombre } : null
      actualizar(guardarMulta(datos, id, { responsable_id: Number(responsable), estado_pago: pago, fecha_pago: fechaPago, documentos: documento ? [...m.documentos, documento] : m.documentos }, usuario))
      formulario.elements.informe.value = ''; setConArchivo(false); setEstadoGestion('')
    } catch (err) { setError(err.message) } finally { setOcupado(false) }
  }
  const relacionadas = datos.multas.filter(x => x.id !== id && (x.vehiculo_id === m.vehiculo_id || (m.responsable_id && x.responsable_id === m.responsable_id)))
  return <><button className="rrhh-enlace" onClick={volver}>← Volver a multas</button><div className="vidrio rrhh-panel"><span className="rrhh-kicker">SEGUIMIENTO DE ACTA</span><h2>{m.nro_acta}</h2><dl className="rrhh-datos"><div><dt>Vehículo</dt><dd>{patente(datos, m.vehiculo_id)}</dd></div><div><dt>Infracción</dt><dd>{fecha(m.fecha_infraccion)}</dd></div><div><dt>Centro de costo en esa fecha</dt><dd>{contexto.centro}</dd></div><div><dt>Vence pago voluntario</dt><dd>{fecha(m.vence_pago_voluntario)}</dd></div></dl><p className="rrhh-muted">Los candidatos corresponden a las asignaciones en la fecha de infracción. El responsable se guarda al confirmar.</p></div><form className="vidrio rrhh-panel rrhh-form" onSubmit={enviar}><h3>Gestión de RRHH</h3><div className="rrhh-form-grid"><Desplegable etiqueta="Responsable confirmado" required placeholder="Seleccionar conductor" valor={responsable} alCambiar={setResponsable} opciones={contexto.conductores.map(p => ({ valor: p.id, etiqueta: p.apellido_nombre, detalle: `· ${p.legajo}` }))} /><Desplegable etiqueta="Estado de pago" valor={pago} alCambiar={setPago} opciones={[{ valor: 'pendiente', etiqueta: 'Pendiente' }, { valor: 'pagada', etiqueta: 'Pagada' }]} />{pago === 'pagada' && <label>Fecha de pago<input required type="date" min={m.fecha_infraccion} max={hoy()} value={fechaPago} onChange={e => setFechaPago(e.target.value)} /></label>}<label>Aviso o informe ficticio<input type="file" name="informe" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setConArchivo(Boolean(e.target.files?.length))} /></label><Desplegable etiqueta="Estado de gestión" required={conArchivo} deshabilitado={!conArchivo} placeholder={conArchivo ? 'Elegí qué responde el informe' : 'Se elige al subir un informe'} valor={estadoGestion} alCambiar={setEstadoGestion} opciones={ESTADOS_GESTION.map(x => ({ valor: x, etiqueta: x }))} /></div>{!contexto.conductores.length && <p>Sin conductores asignados en esa fecha. Se necesita revisión de Mantenimiento.</p>}{error && <p className="rrhh-error" role="alert">{error}</p>}<button className="rrhh-boton" disabled={ocupado || !contexto.conductores.length}>{ocupado ? 'Guardando…' : 'Guardar seguimiento de prueba'}</button></form><div className="vidrio rrhh-panel"><h3>Avisos e informes</h3>{m.documentos.length ? [...m.documentos].reverse().map((d, i) => <p className="rrhh-historial" key={i}>{d.estado_gestion ? <><Etiqueta>{d.estado_gestion}</Etiqueta> · {fecha(d.fecha)} · {nombre(datos, d.responsable_id ?? m.responsable_id)}{d.usuario && ` · cargó ${d.usuario}`} · </> : null}<Documento documento={d} /></p>) : <p className="rrhh-muted">Sin adjuntos en esta sesión.</p>}</div><div className="vidrio rrhh-panel"><h3>Otras multas del vehículo o del responsable</h3>{relacionadas.length ? relacionadas.map(x => <p className="rrhh-historial" key={x.id}>{x.nro_acta} · {patente(datos, x.vehiculo_id)} · {nombre(datos, x.responsable_id)} · {x.estado_pago}</p>) : <p className="rrhh-muted">Sin otras multas registradas.</p>}</div></>
}
// Avisos e informes de multas que tuvo la persona como responsable.
function Avisos({ datos, personaId }) {
  const gestiones = gestionesDePersona(datos, personaId)
  const avisos = gestiones.filter(g => esAviso(g.estado_gestion)).length
  return <div className="vidrio rrhh-panel"><h3>Avisos por multas</h3><p className="rrhh-muted">{avisos === 1 ? 'Recibió 1 aviso' : `Recibió ${avisos} avisos`} · {gestiones.length} {gestiones.length === 1 ? 'informe cargado' : 'informes cargados'} en total.</p>{gestiones.map((g, i) => <p className="rrhh-historial" key={i}>{fecha(g.fecha)} · <Etiqueta>{g.estado_gestion}</Etiqueta> · {g.nro_acta} · {patente(datos, g.vehiculo_id)} · <Documento documento={g} /></p>)}</div>
}
