import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Archive, TriangleAlert } from 'lucide-react'
import {
  hoy, estadoVehiculoEn, estadoVencimiento, vtvDeVehiculoEn, polizaDeVehiculoEn, fichaVehiculoEn, ESTADOS_VEHICULO, vigenteEn,
  normalizarDominio, deBajaEn, CLASES_FLOTA, MOTIVOS_BAJA, queCierraLaBaja, gerenciaDeCentro, avisoGerencia,
} from './dominio'
import {
  guardarVehiculo, guardarCorreccion, guardarEstado, guardarBaja, guardarCentroCosto, guardarJefatura, guardarQuitarJefatura,
} from './servicioDemo'
import { Etiqueta, Panel, MensajeError, intentar, fecha, persona } from './ui'
import { infoCategoria } from '../../core/config/categoriasLicencia'
import FormAsignacion from './FormAsignacion'
import Desplegable from '../../core/componentes/Desplegable'
import { ChipCategoria, IconoCategoria, GuiaCategorias } from '../../core/componentes/CategoriaLicencia'

// M-01 / M-02 / M-09 según "Flota: campos para el diseño de pantallas" (Mariano, v1.0, 08/10/2026).
// Año, chasis, motor, clase, alta/baja, gerencia y jefaturas: datos provisorios
// hasta la migración 002 (core/datos/vehiculoProvisorio.js).

const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const clase = (valor) => CLASES_FLOTA.find((c) => c.valor === valor)?.etiqueta ?? '—'
const opcionesCategoria = (datos) => [
  { valor: '', etiqueta: 'Sin exigencia' },
  ...datos.categorias.map((c) => ({ valor: c.id, etiqueta: c.codigo, icono: <IconoCategoria codigo={c.codigo} size={18} />, detalle: `· ${infoCategoria(c.codigo).titulo}` })),
]
const codigoCategoria = (datos, id) => datos.categorias.find((c) => c.id === id)?.codigo
const nombreGerencia = (datos, id) => datos.gerencias.find((g) => g.id === id)?.nombre ?? '—'
const nombreJefatura = (datos, id) => datos.jefaturas.find((j) => j.id === id)?.nombre ?? '—'
const marcas = (datos) => [...new Set(datos.vehiculos.map((v) => v.marca))].sort()

// Situación hoy de un vehículo (para el listado y los filtros).
function situacion(datos, v) {
  const centro = datos.centrosCosto.find((c) => c.vehiculo_id === v.id && vigenteEn(c, hoy()))
  return {
    estado: estadoVehiculoEn(datos, v.id),
    deBaja: deBajaEn(v),
    centro,
    gerenciaId: centro?.gerencia_id ?? null,
    jefaturas: datos.vehiculoJefaturas.filter((j) => j.vehiculo_id === v.id && vigenteEn(j, hoy())).map((j) => j.jefatura_id),
    conductores: datos.asignaciones.filter((a) => a.vehiculo_id === v.id && vigenteEn(a, hoy())),
  }
}

const TODOS = ''

export default function Vehiculos({ datos, usuario, actualizar, seleccion, setSeleccion }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState({ vigencia: 'vigentes', gerencia: TODOS, jefatura: TODOS, centro: TODOS, clase: TODOS, estado: TODOS })
  const [alta, setAlta] = useState(false)
  const filtrar = (campo) => (valor) => setFiltros((f) => ({ ...f, [campo]: valor, ...(campo === 'gerencia' ? { jefatura: TODOS } : {}) }))

  if (seleccion) {
    return <Ficha key={seleccion} datos={datos} id={seleccion} usuario={usuario} actualizar={actualizar} volver={() => setSeleccion(null)} />
  }

  // Busca por dominio (sin importar mayúsculas, espacios ni guiones), chasis, motor, marca o modelo.
  const libre = busqueda.trim().toLowerCase()
  const q = normalizarDominio(busqueda)
  const coincide = (v) => !libre ||
    (q && [v.dominio, v.nro_chasis, v.nro_motor].some((x) => normalizarDominio(x ?? '').includes(q))) ||
    `${v.marca} ${v.modelo}`.toLowerCase().includes(libre)

  const filas = datos.vehiculos.map((v) => ({ v, s: situacion(datos, v) })).filter(({ v, s }) =>
    coincide(v) &&
    (filtros.vigencia === 'todos' || (filtros.vigencia === 'baja') === s.deBaja) &&
    (!filtros.gerencia || s.gerenciaId === Number(filtros.gerencia)) &&
    (!filtros.jefatura || s.jefaturas.includes(Number(filtros.jefatura))) &&
    (!filtros.centro || s.centro?.centro_costo_id === Number(filtros.centro)) &&
    (!filtros.clase || v.clase_flota === filtros.clase) &&
    (!filtros.estado || s.estado === filtros.estado))

  const jefaturasFiltro = datos.jefaturas.filter((j) => !filtros.gerencia || j.gerencia_id === Number(filtros.gerencia))
  const hayFiltros = Object.entries(filtros).some(([k, x]) => (k === 'vigencia' ? x !== 'vigentes' : x)) || busqueda

  return (
    <>
      {alta && <FormAlta datos={datos} usuario={usuario} cerrar={() => setAlta(false)} actualizar={actualizar} />}
      <Panel
        titulo="Vehículos"
        subtitulo={<>Flota interna. El dominio y el chasis no se repiten. Los vehículos de baja se siguen pudiendo consultar. <GuiaCategorias /></>}
        acciones={!alta && <button className="mant-boton" onClick={() => setAlta(true)}><Plus size={16} /> Nuevo vehículo</button>}
      >
        <div className="mant-filtros">
          <label className="mant-busqueda">
            <Search size={18} />
            <input aria-label="Buscar vehículo" placeholder="Dominio, chasis, motor, marca o modelo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>
          <Desplegable etiqueta="Mostrar" ancho={150} valor={filtros.vigencia} alCambiar={filtrar('vigencia')}
            opciones={[{ valor: 'vigentes', etiqueta: 'Vigentes' }, { valor: 'baja', etiqueta: 'De baja' }, { valor: 'todos', etiqueta: 'Todos' }]} />
          <Desplegable etiqueta="Estado" ancho={140} valor={filtros.estado} alCambiar={filtrar('estado')}
            opciones={[{ valor: TODOS, etiqueta: 'Todos' }, ...ESTADOS_VEHICULO.map((e) => ({ valor: e, etiqueta: capital(e) }))]} />
          <Desplegable etiqueta="Clase de flota" ancho={150} valor={filtros.clase} alCambiar={filtrar('clase')}
            opciones={[{ valor: TODOS, etiqueta: 'Todas' }, ...CLASES_FLOTA]} />
        </div>
        <div className="mant-filtros mant-filtros-2">
          <Desplegable etiqueta="Gerencia" ancho={230} buscable valor={filtros.gerencia} alCambiar={filtrar('gerencia')}
            opciones={[{ valor: TODOS, etiqueta: 'Todas' }, ...datos.gerencias.map((g) => ({ valor: g.id, etiqueta: g.nombre }))]} />
          <Desplegable etiqueta="Jefatura" ancho={250} buscable valor={filtros.jefatura} alCambiar={filtrar('jefatura')}
            opciones={[{ valor: TODOS, etiqueta: 'Todas' }, ...jefaturasFiltro.map((j) => ({ valor: j.id, etiqueta: j.nombre }))]} />
          <Desplegable etiqueta="Centro de costo" ancho={250} buscable valor={filtros.centro} alCambiar={filtrar('centro')}
            opciones={[{ valor: TODOS, etiqueta: 'Todos' }, ...datos.catalogoCentros.map((c) => ({ valor: c.id, etiqueta: c.codigo, detalle: `· ${c.nombre}` }))]} />
          {hayFiltros && (
            <button className="mant-enlace" onClick={() => { setBusqueda(''); setFiltros({ vigencia: 'vigentes', gerencia: TODOS, jefatura: TODOS, centro: TODOS, clase: TODOS, estado: TODOS }) }}>
              Limpiar filtros
            </button>
          )}
        </div>
        <p className="mant-muted mant-cuenta">{filas.length} {filas.length === 1 ? 'vehículo' : 'vehículos'}</p>
        <div className="mant-scroll">
          <table>
            <thead>
              <tr>
                <th>Dominio</th><th>Vehículo</th><th>Año</th><th>Clase</th><th>Gerencia</th><th>Jefatura</th>
                <th>Conductor</th><th>Estado</th><th>Alta</th><th>Baja</th><th>Vencimientos</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ v, s }) => {
                const vtv = vtvDeVehiculoEn(datos, v.id)
                const poliza = polizaDeVehiculoEn(datos, v.id)
                return (
                  <tr key={v.id} className={s.deBaja ? 'mant-fila-baja' : ''}>
                    <td><b className="mant-dominio">{v.dominio}</b></td>
                    <td>{v.marca} {v.modelo}<small>{codigoCategoria(datos, v.categoria_requerida_id) ? <ChipCategoria codigo={codigoCategoria(datos, v.categoria_requerida_id)} /> : 'Sin exigencia de categoría'}</small></td>
                    <td>{v.anio ?? '—'}</td>
                    <td>{clase(v.clase_flota)}</td>
                    <td>{s.gerenciaId ? nombreGerencia(datos, s.gerenciaId) : <span className="mant-muted">—</span>}</td>
                    <td>{s.jefaturas.length ? s.jefaturas.map((j) => <small key={j} className="mant-linea">{nombreJefatura(datos, j)}</small>) : <span className="mant-muted">—</span>}</td>
                    <td>{s.conductores.length ? s.conductores.map((a) => <small key={a.id} className="mant-linea">{persona(datos, a.persona_id)}</small>) : <span className="mant-muted">—</span>}</td>
                    <td><Etiqueta>{s.estado ?? 'sin estado'}</Etiqueta></td>
                    <td>{fecha(v.fecha_alta)}</td>
                    <td>{v.fecha_baja ? fecha(v.fecha_baja) : '—'}</td>
                    <td>
                      {s.deBaja ? '—' : (
                        <>
                          <small className="mant-linea">Póliza {poliza ? <Etiqueta>{estadoVencimiento(poliza.vigente_hasta)}</Etiqueta> : <Etiqueta tono="error">Sin póliza</Etiqueta>}</small>
                          <small className="mant-linea">VTV <Etiqueta>{estadoVencimiento(vtv?.vigente_hasta)}</Etiqueta></small>
                        </>
                      )}
                    </td>
                    <td><button className="mant-enlace" onClick={() => setSeleccion(v.id)}>Ver ficha →</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!filas.length && <p className="mant-vacio">No hay vehículos que coincidan.</p>}
      </Panel>
    </>
  )
}

// ───── Centro de costo + gerencia: elegir el centro propone su gerencia; se puede cambiar ─────

function CentroYGerencia({ datos, centro, setCentro, gerencia, setGerencia, obligatorio = false }) {
  const centrosActivos = datos.catalogoCentros.filter((c) => c.activo)
  // Con gerencia elegida y sin centro, se sugieren primero los centros de esa gerencia.
  const ordenados = gerencia && !centro
    ? [...centrosActivos].sort((a, b) => (b.gerencia_id === Number(gerencia)) - (a.gerencia_id === Number(gerencia)))
    : centrosActivos
  const aviso = avisoGerencia(datos, centro, gerencia)
  return (
    <>
      <Desplegable
        etiqueta="Centro de costo" buscable limpiable required={obligatorio} placeholder="Elegir centro de costo"
        valor={centro}
        alCambiar={(c) => { setCentro(c); if (c) setGerencia(String(gerenciaDeCentro(datos, c) ?? '')) }}
        opciones={ordenados.map((c) => ({ valor: c.id, etiqueta: c.codigo, detalle: `· ${c.nombre} · ${c.gerencia}` }))}
      />
      <Desplegable
        etiqueta="Gerencia" buscable required={obligatorio || Boolean(centro)} placeholder="Se completa con el centro de costo"
        valor={gerencia} alCambiar={setGerencia}
        opciones={datos.gerencias.map((g) => ({ valor: g.id, etiqueta: g.nombre }))}
      />
      {aviso && <p className="mant-aviso ancho"><TriangleAlert size={16} /> {aviso}</p>}
    </>
  )
}

function FormAlta({ datos, usuario, cerrar, actualizar }) {
  const [error, setError] = useState('')
  const [centro, setCentro] = useState('')
  const [gerencia, setGerencia] = useState('')
  const [jefaturas, setJefaturas] = useState([])
  const opcionesJefatura = datos.jefaturas
    .filter((j) => !gerencia || j.gerencia_id === Number(gerencia))
    .map((j) => ({ valor: j.id, etiqueta: j.nombre, detalle: `· ${nombreGerencia(datos, j.gerencia_id)}` }))

  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ok = intentar(() => actualizar(guardarVehiculo(datos, {
      dominio: f.get('dominio'),
      marca: f.get('marca'),
      modelo: f.get('modelo'),
      anio: f.get('anio'),
      clase_flota: f.get('clase'),
      nro_chasis: f.get('chasis'),
      nro_motor: f.get('motor'),
      categoria_requerida_id: Number(f.get('categoria')) || null,
      vigente_desde: f.get('desde'),
      centro_costo_id: Number(centro) || null,
      gerencia_id: Number(gerencia) || null,
      jefatura_ids: jefaturas.map(Number),
    }, usuario), 'Vehículo dado de alta.'), setError)
    if (ok) cerrar()
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Nuevo vehículo</h3>
      <div className="mant-form-grid">
        <label>Dominio<input required name="dominio" placeholder="AA123BB, AAA123 o 123AAA (moto)" maxLength={9} /></label>
        <label>Fecha de alta<input required type="date" name="desde" defaultValue={hoy()} max={hoy()} /></label>
        <label>Marca<input required name="marca" maxLength={60} list="mant-marcas" /></label>
        <label>Modelo<input required name="modelo" maxLength={60} /></label>
        <label>Año<input required name="anio" type="number" min={1900} max={2100} step={1} placeholder="Ej. 2024" /></label>
        <Desplegable etiqueta="Clase de flota" name="clase" required valorInicial="" placeholder="Operativa o ejecutiva" opciones={CLASES_FLOTA} />
        <label>Número de chasis<input name="chasis" maxLength={30} placeholder="Opcional" /></label>
        <label>Número de motor<input name="motor" maxLength={30} placeholder="Opcional" /></label>
        <Desplegable etiqueta="Categoría de licencia requerida" name="categoria" valorInicial="" opciones={opcionesCategoria(datos)} buscable />
        <span />
        <CentroYGerencia datos={datos} centro={centro} setCentro={setCentro} gerencia={gerencia} setGerencia={setGerencia} />
        <div className="ancho">
          <Desplegable etiqueta="Jefaturas (una o varias)" multiple buscable limpiable placeholder="Opcional" valor={jefaturas} alCambiar={setJefaturas} opciones={opcionesJefatura} />
        </div>
      </div>
      <datalist id="mant-marcas">{marcas(datos).map((m) => <option key={m} value={m} />)}</datalist>
      <MensajeError texto={error} />
      <div className="mant-acciones">
        <button className="mant-boton">Guardar vehículo de prueba</button>
        <button type="button" className="mant-boton secundario" onClick={cerrar}>Cancelar</button>
      </div>
    </form>
  )
}

// ───── Ficha ─────

function Ficha({ datos, id, usuario, actualizar, volver }) {
  const [consulta, setConsulta] = useState(hoy())
  const [formulario, setFormulario] = useState(null) // 'estado' | 'corregir' | 'asignar' | 'centro' | 'jefaturas' | 'baja'
  const ficha = fichaVehiculoEn(datos, id, consulta)
  const v = ficha.vehiculo
  const esHoy = consulta === hoy()
  const deBaja = deBajaEn(v)
  const abrir = (f) => setFormulario(formulario === f ? null : f)
  const hecho = (d, msg) => { actualizar(d, msg); setFormulario(null); setConsulta(hoy()) }
  const aviso = ficha.centroCosto && avisoGerencia(datos, ficha.centroCosto.centro_costo_id, ficha.centroCosto.gerencia_id)

  return (
    <>
      <button className="mant-enlace" onClick={volver}>← Volver a vehículos</button>
      {deBaja && (
        <p className="mant-cartel-baja" role="status">
          <Archive size={18} /> <b>De baja desde el {fecha(v.fecha_baja)}</b> · {v.motivo_baja}{v.nota_baja ? `: ${v.nota_baja}` : ''}. Solo se puede consultar.
        </p>
      )}
      <Panel
        titulo={<><span className="mant-dominio grande">{v.dominio}</span> {v.marca} {v.modelo} {v.anio && <span className="mant-anio">{v.anio}</span>}</>}
        subtitulo={<>Alta {fecha(v.fecha_alta)}{v.fecha_baja ? ` · Baja ${fecha(v.fecha_baja)}` : ''} · Categoría requerida: {codigoCategoria(datos, v.categoria_requerida_id) ? <ChipCategoria codigo={codigoCategoria(datos, v.categoria_requerida_id)} conTitulo /> : 'sin exigencia'}</>}
        acciones={
          <label className="mant-consulta">Consultar al
            <input type="date" max={hoy()} value={consulta} onChange={(e) => e.target.value && e.target.value <= hoy() && setConsulta(e.target.value)} />
          </label>
        }
      >
        {!esHoy && <p className="mant-aviso-fecha">Mostrando cómo estaba el vehículo el {fecha(consulta)}.</p>}
        <dl className="mant-datos">
          <div><dt>Estado</dt><dd>{ficha.estado ? <Etiqueta>{ficha.estado}</Etiqueta> : 'Todavía no existía'}</dd></div>
          <div><dt>Clase de flota</dt><dd>{clase(v.clase_flota)}</dd></div>
          <div><dt>Chasis / motor</dt><dd className="mant-mono">{v.nro_chasis ?? '—'}<small>{v.nro_motor ?? 'Sin motor cargado'}</small></dd></div>
          <div><dt>Centro de costo</dt><dd>{ficha.centroCosto ? <>{ficha.centroCosto.codigo} <small>{ficha.centroCosto.nombre}</small></> : 'Sin dato'}</dd></div>
          <div><dt>Gerencia</dt><dd>{ficha.gerencia?.nombre ?? 'Sin dato'}{aviso && <small className="mant-aviso-chico"><TriangleAlert size={13} /> No es la gerencia del centro de costo</small>}</dd></div>
          <div><dt>Jefaturas</dt><dd>{ficha.jefaturas.length ? ficha.jefaturas.map((j) => <small key={j.id} className="mant-linea fuerte">{j.nombre}</small>) : 'Sin jefatura'}</dd></div>
          <div><dt>Conductores</dt><dd>{ficha.conductores.length ? ficha.conductores.map((c) => <small key={c.asignacion.id} className="mant-linea fuerte">{c.persona.apellido_nombre}</small>) : 'Sin conductores'}</dd></div>
          <div><dt>Póliza</dt><dd>{ficha.poliza ? `${ficha.poliza.nro_poliza} · vence ${fecha(ficha.poliza.vigente_hasta)}` : 'Sin cobertura'}</dd></div>
          <div><dt>VTV</dt><dd>{ficha.vtv ? <>vence {fecha(ficha.vtv.vigente_hasta)} <Etiqueta>{estadoVencimiento(ficha.vtv.vigente_hasta, consulta)}</Etiqueta></> : 'Sin VTV cargada'}</dd></div>
        </dl>
        {esHoy && !deBaja && (
          <div className="mant-acciones">
            <button className="mant-boton" onClick={() => abrir('estado')}>Cambiar estado</button>
            <button className="mant-boton secundario" onClick={() => abrir('asignar')}>Asignar conductor</button>
            <button className="mant-boton secundario" onClick={() => abrir('jefaturas')}>Jefaturas</button>
            <button className="mant-boton secundario" onClick={() => abrir('centro')}>Centro de costo</button>
            <button className="mant-boton secundario" onClick={() => abrir('corregir')}>Corregir datos</button>
            <button className="mant-boton peligro" onClick={() => abrir('baja')}><Archive size={16} /> Dar de baja</button>
          </div>
        )}
        <Link className="mant-enlace" to={`/vehiculo/${v.dominio}`}>Ficha completa con todo el historial →</Link>
      </Panel>

      {formulario === 'estado' && <FormEstado datos={datos} id={id} usuario={usuario} hecho={hecho} />}
      {formulario === 'corregir' && <FormCorreccion datos={datos} vehiculo={v} usuario={usuario} hecho={hecho} />}
      {formulario === 'asignar' && <FormAsignacion datos={datos} usuario={usuario} vehiculoFijo={id} hecho={hecho} />}
      {formulario === 'centro' && <FormCentro datos={datos} id={id} usuario={usuario} hecho={hecho} />}
      {formulario === 'jefaturas' && <FormJefaturas datos={datos} id={id} usuario={usuario} actualizar={actualizar} />}
      {formulario === 'baja' && <FormBaja datos={datos} vehiculo={v} usuario={usuario} hecho={hecho} cancelar={() => setFormulario(null)} />}

      <Panel titulo="Historial de estado">
        {v.fecha_baja && <p className="mant-historial">Desde {fecha(v.fecha_baja)} · <Etiqueta>baja</Etiqueta> · {v.motivo_baja}{v.nota_baja ? `: ${v.nota_baja}` : ''}</p>}
        {datos.estadosVehiculo.filter((e) => e.vehiculo_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map((e) => (
          <p className="mant-historial" key={e.id}>
            {fecha(e.vigente_desde)} → {e.vigente_hasta ? fecha(e.vigente_hasta) : 'Actual'} · <Etiqueta>{e.estado}</Etiqueta> {e.motivo && `· ${e.motivo}`}
          </p>
        ))}
      </Panel>
      <Panel titulo="Historial de centro de costo y gerencia">
        {datos.centrosCosto.filter((c) => c.vehiculo_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map((c) => (
          <p className="mant-historial" key={c.id}>
            {fecha(c.vigente_desde)} → {c.vigente_hasta ? fecha(c.vigente_hasta) : 'Actual'} · {c.codigo ?? '—'} {c.nombre} · {nombreGerencia(datos, c.gerencia_id)}
          </p>
        ))}
        {!datos.centrosCosto.some((c) => c.vehiculo_id === id) && <p className="mant-muted">Sin centro de costo cargado.</p>}
      </Panel>
      <Panel titulo="Historial de jefaturas">
        {datos.vehiculoJefaturas.filter((j) => j.vehiculo_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map((j) => (
          <p className="mant-historial" key={j.id}>
            {fecha(j.vigente_desde)} → {j.vigente_hasta ? fecha(j.vigente_hasta) : 'Vigente'} · {nombreJefatura(datos, j.jefatura_id)}
          </p>
        ))}
        {!datos.vehiculoJefaturas.some((j) => j.vehiculo_id === id) && <p className="mant-muted">Sin jefaturas cargadas.</p>}
      </Panel>
      <Panel titulo="Historial de conductores">
        {datos.asignaciones.filter((a) => a.vehiculo_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map((a) => (
          <p className="mant-historial" key={a.id}>
            {fecha(a.vigente_desde)} → {a.vigente_hasta ? fecha(a.vigente_hasta) : 'Vigente'} · {persona(datos, a.persona_id)} {a.motivo && `· ${a.motivo}`}
          </p>
        ))}
        {!datos.asignaciones.some((a) => a.vehiculo_id === id) && <p className="mant-muted">Nunca tuvo conductores asignados.</p>}
      </Panel>
    </>
  )
}

function FormEstado({ datos, id, usuario, hecho }) {
  const [error, setError] = useState('')
  const actual = estadoVehiculoEn(datos, id)
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    intentar(() => hecho(guardarEstado(datos, id, { estado: f.get('estado'), motivo: f.get('motivo'), vigente_desde: f.get('desde') }, usuario), 'Estado actualizado. El período anterior quedó en el historial.'), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Cambiar estado</h3>
      <p className="mant-muted">Estado actual: {actual}. Se cierra el período actual y se abre uno nuevo. Para sacar el vehículo de la flota se usa "Dar de baja".</p>
      <div className="mant-form-grid">
        <Desplegable
          etiqueta="Nuevo estado"
          name="estado"
          required
          valorInicial={ESTADOS_VEHICULO.find((e) => e !== actual)}
          opciones={ESTADOS_VEHICULO.filter((e) => e !== actual).map((e) => ({ valor: e, etiqueta: capital(e) }))}
        />
        <label>Desde<input required type="date" name="desde" defaultValue={hoy()} max={hoy()} /></label>
        <label className="ancho">Motivo<input name="motivo" maxLength={300} placeholder="Obligatorio para taller" /></label>
      </div>
      <MensajeError texto={error} />
      <button className="mant-boton">Guardar cambio de prueba</button>
    </form>
  )
}

function FormCorreccion({ datos, vehiculo, usuario, hecho }) {
  const [error, setError] = useState('')
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    intentar(() => hecho(guardarCorreccion(datos, vehiculo.id, {
      dominio: f.get('dominio'), marca: f.get('marca'), modelo: f.get('modelo'),
      anio: f.get('anio'), clase_flota: f.get('clase'), nro_chasis: f.get('chasis'), nro_motor: f.get('motor'),
      categoria_requerida_id: Number(f.get('categoria')) || null,
    }, usuario), 'Datos corregidos. El cambio quedó auditado con el valor anterior.'), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Corregir datos</h3>
      <p className="mant-muted">Para errores de carga. Corregir el dominio no rompe asignaciones, pólizas ni multas: todas apuntan al id interno.</p>
      <div className="mant-form-grid">
        <label>Dominio<input required name="dominio" defaultValue={vehiculo.dominio} maxLength={9} /></label>
        <Desplegable etiqueta="Categoría requerida" name="categoria" valorInicial={vehiculo.categoria_requerida_id ?? ''} opciones={opcionesCategoria(datos)} buscable />
        <label>Marca<input required name="marca" defaultValue={vehiculo.marca} maxLength={60} list="mant-marcas-c" /></label>
        <label>Modelo<input required name="modelo" defaultValue={vehiculo.modelo} maxLength={60} /></label>
        <label>Año<input required name="anio" type="number" min={1900} max={2100} defaultValue={vehiculo.anio ?? ''} /></label>
        <Desplegable etiqueta="Clase de flota" name="clase" required valorInicial={vehiculo.clase_flota ?? ''} opciones={CLASES_FLOTA} />
        <label>Número de chasis<input name="chasis" maxLength={30} defaultValue={vehiculo.nro_chasis ?? ''} /></label>
        <label>Número de motor<input name="motor" maxLength={30} defaultValue={vehiculo.nro_motor ?? ''} /></label>
      </div>
      <datalist id="mant-marcas-c">{marcas(datos).map((m) => <option key={m} value={m} />)}</datalist>
      <MensajeError texto={error} />
      <button className="mant-boton">Guardar corrección de prueba</button>
    </form>
  )
}

function FormCentro({ datos, id, usuario, hecho }) {
  const actual = datos.centrosCosto.find((c) => c.vehiculo_id === id && !c.vigente_hasta)
  const [centro, setCentro] = useState(actual ? String(actual.centro_costo_id) : '')
  const [gerencia, setGerencia] = useState(actual?.gerencia_id ? String(actual.gerencia_id) : '')
  const [desde, setDesde] = useState(hoy())
  const [error, setError] = useState('')
  function enviar(e) {
    e.preventDefault()
    intentar(() => hecho(guardarCentroCosto(datos, id, { centro_costo_id: Number(centro), gerencia_id: Number(gerencia) || null, vigente_desde: desde }, usuario), 'Centro de costo actualizado. El anterior quedó en el historial.'), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Centro de costo y gerencia</h3>
      <p className="mant-muted">Al elegir el centro de costo se propone su gerencia; se puede cambiar si el vehículo depende de otra. Se cierra el actual y se abre uno nuevo. (Cuando exista el módulo de Finanzas, esta carga puede pasar allá.)</p>
      <div className="mant-form-grid">
        <CentroYGerencia datos={datos} centro={centro} setCentro={setCentro} gerencia={gerencia} setGerencia={setGerencia} obligatorio />
        <label>Desde<input required type="date" max={hoy()} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
      </div>
      <MensajeError texto={error} />
      <button className="mant-boton">Guardar cambio de prueba</button>
    </form>
  )
}

function FormJefaturas({ datos, id, usuario, actualizar }) {
  const gerencia = datos.centrosCosto.find((c) => c.vehiculo_id === id && !c.vigente_hasta)?.gerencia_id
  const vigentes = datos.vehiculoJefaturas.filter((j) => j.vehiculo_id === id && !j.vigente_hasta)
  const [nueva, setNueva] = useState('')
  const [desde, setDesde] = useState(hoy())
  const [hasta, setHasta] = useState(hoy())
  const [error, setError] = useState('')
  const opciones = [...datos.jefaturas]
    .filter((j) => !vigentes.some((x) => x.jefatura_id === j.id))
    .sort((a, b) => (b.gerencia_id === gerencia) - (a.gerencia_id === gerencia))
    .map((j) => ({ valor: j.id, etiqueta: j.nombre, detalle: `· ${nombreGerencia(datos, j.gerencia_id)}` }))
  function agregar(e) {
    e.preventDefault()
    if (intentar(() => actualizar(guardarJefatura(datos, id, { jefatura_id: Number(nueva), vigente_desde: desde }, usuario), 'Jefatura agregada.'), setError)) setNueva('')
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={agregar}>
      <h3>Jefaturas</h3>
      <p className="mant-muted">Un vehículo puede depender de varias jefaturas. Quitar una cierra su período: queda en el historial.</p>
      {vigentes.length ? (
        <ul className="mant-lista-jefaturas">
          {vigentes.map((j) => (
            <li key={j.id}>
              <span><b>{nombreJefatura(datos, j.jefatura_id)}</b> <small>desde {fecha(j.vigente_desde)}</small></span>
              <button type="button" className="mant-enlace" onClick={() => intentar(() => actualizar(guardarQuitarJefatura(datos, j.id, hasta, usuario), 'Jefatura quitada. Quedó en el historial.'), setError)}>
                Quitar al {fecha(hasta)}
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="mant-muted">Sin jefaturas vigentes.</p>}
      <div className="mant-form-grid">
        <Desplegable etiqueta="Agregar jefatura" buscable required placeholder="Elegir jefatura" valor={nueva} alCambiar={setNueva} opciones={opciones} />
        <label>Desde<input required type="date" max={hoy()} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
        {vigentes.length > 0 && <label>Fecha para quitar<input type="date" max={hoy()} value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>}
      </div>
      <MensajeError texto={error} />
      <button className="mant-boton">Agregar jefatura de prueba</button>
    </form>
  )
}

// Dar de baja: pide fecha y motivo y muestra todo lo que se va a cerrar antes de confirmar.
function FormBaja({ datos, vehiculo, usuario, hecho, cancelar }) {
  const [fechaBaja, setFechaBaja] = useState(hoy())
  const [motivo, setMotivo] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')
  const c = queCierraLaBaja(datos, vehiculo.id)
  const nombrePoliza = (pv) => datos.polizas.find((p) => p.id === pv.poliza_id)?.nro_poliza ?? '—'
  const numeroTarjeta = (p) => datos.tarjetas.find((t) => t.id === p.tarjeta_id)?.numero_tarjeta ?? 'Sin número'
  const items = [
    ...c.asignaciones.map((a) => `Conductor: ${persona(datos, a.persona_id)}`),
    ...c.centros.map((x) => `Centro de costo: ${x.codigo ?? ''} ${x.nombre} · ${nombreGerencia(datos, x.gerencia_id)}`),
    ...c.jefaturas.map((j) => `Jefatura: ${nombreJefatura(datos, j.jefatura_id)}`),
    ...c.polizas.map((p) => `Póliza: ${nombrePoliza(p)}`),
    ...c.tarjetas.map((p) => `Tarjeta de combustible: ${numeroTarjeta(p)}`),
    ...c.tags.map((t) => `Tag: ${t.nro_dispositivo}`),
    ...(c.estado ? [`Estado actual: ${c.estado.estado}`] : []),
  ]
  function enviar(e) {
    e.preventDefault()
    intentar(() => hecho(
      guardarBaja(datos, vehiculo.id, { fecha_baja: fechaBaja, motivo_baja: motivo, nota_baja: nota }, usuario),
      `${vehiculo.dominio} quedó de baja desde el ${fecha(fechaBaja)}. Se cerraron ${items.length} ${items.length === 1 ? 'registro' : 'registros'}.`,
    ), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form mant-form-baja" onSubmit={enviar}>
      <h3><Archive size={18} /> Dar de baja {vehiculo.dominio}</h3>
      <p className="mant-muted">El vehículo sale de la flota pero no se borra: sigue apareciendo en el historial de multas, consumos y documentos, y queda en solo lectura. Las multas y las VTV no se cierran.</p>
      <div className="mant-form-grid">
        <label>Fecha de baja<input required type="date" min={vehiculo.fecha_alta ?? undefined} max={hoy()} value={fechaBaja} onChange={(e) => setFechaBaja(e.target.value)} /></label>
        <Desplegable etiqueta="Motivo" required placeholder="Elegir motivo" valor={motivo} alCambiar={setMotivo} opciones={MOTIVOS_BAJA.map((m) => ({ valor: m, etiqueta: m }))} />
        <label className="ancho">Nota{motivo === 'Otro' ? ' (obligatoria)' : ''}<input maxLength={300} value={nota} onChange={(e) => setNota(e.target.value)} placeholder={motivo === 'Otro' ? 'Explicá el motivo' : 'Opcional'} /></label>
      </div>
      <div className="mant-cierre">
        <h4>Al confirmar se cierra todo junto el {fecha(fechaBaja)}:</h4>
        {items.length ? <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="mant-muted">No tiene nada abierto para cerrar.</p>}
        <p className="mant-muted">Si algo no se puede cerrar, no se cierra nada y el vehículo sigue vigente.</p>
      </div>
      <MensajeError texto={error} />
      <div className="mant-acciones">
        <button className="mant-boton peligro">Confirmar baja de prueba</button>
        <button type="button" className="mant-boton secundario" onClick={cancelar}>Cancelar</button>
      </div>
    </form>
  )
}
