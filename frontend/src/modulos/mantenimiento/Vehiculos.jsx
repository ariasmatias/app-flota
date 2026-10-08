import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { hoy, estadoVehiculoEn, estadoVencimiento, vtvDeVehiculoEn, polizaDeVehiculoEn, fichaVehiculoEn, ESTADOS_VEHICULO, vigenteEn } from './dominio'
import { guardarVehiculo, guardarCorreccion, guardarEstado } from './servicioDemo'
import { Etiqueta, Panel, MensajeError, intentar, fecha, persona } from './ui'
import { infoCategoria } from '../../core/config/categoriasLicencia'
import FormAsignacion from './FormAsignacion'
import Desplegable from '../../core/componentes/Desplegable'
import { ChipCategoria, IconoCategoria, GuiaCategorias } from '../../core/componentes/CategoriaLicencia'

const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const opcionesCategoria = (datos) => [
  { valor: '', etiqueta: 'Sin exigencia' },
  ...datos.categorias.map((c) => ({ valor: c.id, etiqueta: c.codigo, icono: <IconoCategoria codigo={c.codigo} size={18} />, detalle: `· ${infoCategoria(c.codigo).titulo}` })),
]
const codigoCategoria = (datos, id) => datos.categorias.find((c) => c.id === id)?.codigo

// M-01 / M-02 / M-09: listado, alta, corrección, estado y ficha por fecha.
export default function Vehiculos({ datos, usuario, actualizar, seleccion, setSeleccion }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [alta, setAlta] = useState(false)

  if (seleccion) {
    return <Ficha key={seleccion} datos={datos} id={seleccion} usuario={usuario} actualizar={actualizar} volver={() => setSeleccion(null)} />
  }

  const q = busqueda.trim().toLowerCase()
  const lista = datos.vehiculos.filter((v) => {
    const estado = estadoVehiculoEn(datos, v.id)
    return `${v.dominio} ${v.marca} ${v.modelo}`.toLowerCase().includes(q) && (filtro === 'todos' || estado === filtro)
  })

  return (
    <>
      {alta && <FormAlta datos={datos} usuario={usuario} cerrar={() => setAlta(false)} actualizar={actualizar} />}
      <Panel
        titulo="Vehículos"
        subtitulo={<>Flota interna. El dominio es único y se guarda normalizado. <GuiaCategorias /></>}
        acciones={!alta && <button className="mant-boton" onClick={() => setAlta(true)}><Plus size={16} /> Nuevo vehículo</button>}
      >
        <div className="mant-filtros">
          <label className="mant-busqueda">
            <Search size={18} />
            <input aria-label="Buscar vehículo" placeholder="Dominio, marca o modelo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>
          <Desplegable
            etiqueta="Estado"
            ancho={180}
            valor={filtro}
            alCambiar={setFiltro}
            opciones={[{ valor: 'todos', etiqueta: 'Todos' }, ...ESTADOS_VEHICULO.map((e) => ({ valor: e, etiqueta: capital(e) }))]}
          />
        </div>
        <div className="mant-scroll">
          <table>
            <thead><tr><th>Dominio</th><th>Vehículo</th><th>Estado</th><th>Conductores</th><th>Póliza</th><th>VTV</th><th>Acción</th></tr></thead>
            <tbody>
              {lista.map((v) => {
                const vtv = vtvDeVehiculoEn(datos, v.id)
                const poliza = polizaDeVehiculoEn(datos, v.id)
                const conductores = datos.asignaciones.filter((a) => a.vehiculo_id === v.id && vigenteEn(a, hoy())).length
                const estado = estadoVehiculoEn(datos, v.id)
                return (
                  <tr key={v.id}>
                    <td><b className="mant-dominio">{v.dominio}</b></td>
                    <td>{v.marca} {v.modelo}<small>{codigoCategoria(datos, v.categoria_requerida_id) ? <ChipCategoria codigo={codigoCategoria(datos, v.categoria_requerida_id)} /> : 'Sin exigencia de categoría'}</small></td>
                    <td><Etiqueta>{estado}</Etiqueta></td>
                    <td>{conductores || '—'}</td>
                    <td>{estado === 'baja' ? '—' : poliza ? <Etiqueta>{estadoVencimiento(poliza.vigente_hasta)}</Etiqueta> : <Etiqueta>Sin cobertura</Etiqueta>}</td>
                    <td>{estado === 'baja' ? '—' : <Etiqueta>{estadoVencimiento(vtv?.vigente_hasta)}</Etiqueta>}</td>
                    <td><button className="mant-enlace" onClick={() => setSeleccion(v.id)}>Ver ficha →</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!lista.length && <p className="mant-vacio">No hay vehículos que coincidan.</p>}
      </Panel>
    </>
  )
}

function FormAlta({ datos, usuario, cerrar, actualizar }) {
  const [error, setError] = useState('')
  function enviar(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ok = intentar(() => actualizar(guardarVehiculo(datos, {
      dominio: f.get('dominio'),
      marca: f.get('marca'),
      modelo: f.get('modelo'),
      categoria_requerida_id: Number(f.get('categoria')) || null,
      vigente_desde: f.get('desde'),
    }, usuario), 'Vehículo dado de alta.'), setError)
    if (ok) cerrar()
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Nuevo vehículo</h3>
      <div className="mant-form-grid">
        <label>Dominio<input required name="dominio" placeholder="AA123BB o AAA123" maxLength={12} /></label>
        <label>Fecha de alta<input required type="date" name="desde" defaultValue={hoy()} max={hoy()} /></label>
        <label>Marca<input required name="marca" maxLength={60} /></label>
        <label>Modelo<input required name="modelo" maxLength={60} /></label>
        <Desplegable etiqueta="Categoría de licencia requerida" name="categoria" valorInicial="" opciones={opcionesCategoria(datos)} buscable />
      </div>
      <MensajeError texto={error} />
      <div className="mant-acciones">
        <button className="mant-boton">Guardar vehículo de prueba</button>
        <button type="button" className="mant-boton secundario" onClick={cerrar}>Cancelar</button>
      </div>
    </form>
  )
}

function Ficha({ datos, id, usuario, actualizar, volver }) {
  const [consulta, setConsulta] = useState(hoy())
  const [formulario, setFormulario] = useState(null) // 'estado' | 'corregir' | 'asignar'
  const ficha = fichaVehiculoEn(datos, id, consulta)
  const v = ficha.vehiculo
  const esHoy = consulta === hoy()
  const abrir = (f) => setFormulario(formulario === f ? null : f)
  const hecho = (d, msg) => { actualizar(d, msg); setFormulario(null); setConsulta(hoy()) }

  return (
    <>
      <button className="mant-enlace" onClick={volver}>← Volver a vehículos</button>
      <Panel
        titulo={<><span className="mant-dominio grande">{v.dominio}</span> {v.marca} {v.modelo}</>}
        subtitulo={<>Categoría requerida: {codigoCategoria(datos, v.categoria_requerida_id) ? <ChipCategoria codigo={codigoCategoria(datos, v.categoria_requerida_id)} conTitulo /> : 'sin exigencia'}</>}
        acciones={
          <label className="mant-consulta">Consultar al
            <input type="date" max={hoy()} value={consulta} onChange={(e) => e.target.value && e.target.value <= hoy() && setConsulta(e.target.value)} />
          </label>
        }
      >
        {!esHoy && <p className="mant-aviso-fecha">Mostrando cómo estaba el vehículo el {fecha(consulta)}.</p>}
        <dl className="mant-datos">
          <div><dt>Estado</dt><dd>{ficha.estado ? <Etiqueta>{ficha.estado}</Etiqueta> : 'Todavía no existía'}</dd></div>
          <div><dt>Conductores</dt><dd>{ficha.conductores.length ? ficha.conductores.map((c) => c.persona.apellido_nombre).join(' · ') : 'Sin conductores'}</dd></div>
          <div><dt>Centro de costo</dt><dd>{ficha.centroCosto ? `${ficha.centroCosto.nombre} (${ficha.centroCosto.tipo_flota})` : 'Sin dato (lo carga Finanzas)'}</dd></div>
          <div><dt>Póliza</dt><dd>{ficha.poliza ? `${ficha.poliza.nro_poliza} · vence ${fecha(ficha.poliza.vigente_hasta)}` : 'Sin cobertura'}</dd></div>
          <div><dt>VTV</dt><dd>{ficha.vtv ? <>vence {fecha(ficha.vtv.vigente_hasta)} <Etiqueta>{estadoVencimiento(ficha.vtv.vigente_hasta, consulta)}</Etiqueta></> : 'Sin VTV cargada'}</dd></div>
          <div><dt>Tag de telepeaje</dt><dd className="mant-muted">Pendiente del módulo Comercial</dd></div>
        </dl>
        {esHoy && (
          <div className="mant-acciones">
            <button className="mant-boton" onClick={() => abrir('estado')}>Cambiar estado</button>
            <button className="mant-boton secundario" onClick={() => abrir('asignar')}>Asignar conductor</button>
            <button className="mant-boton secundario" onClick={() => abrir('corregir')}>Corregir datos</button>
            <Link className="mant-enlace" to={`/vehiculo/${v.dominio}`}>Ficha completa con todo el historial →</Link>
          </div>
        )}
      </Panel>

      {formulario === 'estado' && <FormEstado datos={datos} id={id} usuario={usuario} hecho={hecho} />}
      {formulario === 'corregir' && <FormCorreccion datos={datos} vehiculo={v} usuario={usuario} hecho={hecho} />}
      {formulario === 'asignar' && <FormAsignacion datos={datos} usuario={usuario} vehiculoFijo={id} hecho={hecho} />}

      <Panel titulo="Historial de estado">
        {datos.estadosVehiculo.filter((e) => e.vehiculo_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map((e) => (
          <p className="mant-historial" key={e.id}>
            {fecha(e.vigente_desde)} → {e.vigente_hasta ? fecha(e.vigente_hasta) : 'Actual'} · <Etiqueta>{e.estado}</Etiqueta> {e.motivo && `· ${e.motivo}`}
          </p>
        ))}
      </Panel>
      <Panel titulo="Historial de conductores">
        {datos.asignaciones.filter((a) => a.vehiculo_id === id).sort((a, b) => b.vigente_desde.localeCompare(a.vigente_desde)).map((a) => (
          <p className="mant-historial" key={a.id}>
            {fecha(a.vigente_desde)} → {a.vigente_hasta ? fecha(a.vigente_hasta) : 'Vigente'} · {persona(datos, a.persona_id)} {a.motivo && `· ${a.motivo}`}
          </p>
        ))}
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
      <p className="mant-muted">Estado actual: {actual}. Se cierra el período actual y se abre uno nuevo; la baja no borra el vehículo.</p>
      <div className="mant-form-grid">
        <Desplegable
          etiqueta="Nuevo estado"
          name="estado"
          required
          valorInicial={ESTADOS_VEHICULO.find((e) => e !== actual)}
          opciones={ESTADOS_VEHICULO.filter((e) => e !== actual).map((e) => ({ valor: e, etiqueta: capital(e) }))}
        />
        <label>Desde<input required type="date" name="desde" defaultValue={hoy()} max={hoy()} /></label>
        <label className="ancho">Motivo<input name="motivo" maxLength={300} placeholder="Obligatorio para taller y baja" /></label>
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
      categoria_requerida_id: Number(f.get('categoria')) || null,
    }, usuario), 'Datos corregidos. El cambio quedó auditado con el valor anterior.'), setError)
  }
  return (
    <form className="vidrio mant-panel mant-form" onSubmit={enviar}>
      <h3>Corregir datos</h3>
      <p className="mant-muted">Para errores de carga. Corregir el dominio no rompe asignaciones, pólizas ni multas: todas apuntan al id interno.</p>
      <div className="mant-form-grid">
        <label>Dominio<input required name="dominio" defaultValue={vehiculo.dominio} maxLength={12} /></label>
        <Desplegable etiqueta="Categoría requerida" name="categoria" valorInicial={vehiculo.categoria_requerida_id ?? ''} opciones={opcionesCategoria(datos)} buscable />
        <label>Marca<input required name="marca" defaultValue={vehiculo.marca} maxLength={60} /></label>
        <label>Modelo<input required name="modelo" defaultValue={vehiculo.modelo} maxLength={60} /></label>
      </div>
      <MensajeError texto={error} />
      <button className="mant-boton">Guardar corrección de prueba</button>
    </form>
  )
}
