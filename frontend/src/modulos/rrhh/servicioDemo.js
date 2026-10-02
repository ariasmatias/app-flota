import { hoy, renovarLicencia, gestionarMulta } from './dominio.js'

const fechaRelativa = dias => {
  const fecha = new Date(`${hoy()}T12:00:00`)
  fecha.setDate(fecha.getDate() + dias)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

// Ficticios y exclusivamente en memoria. La API real reemplazará este adaptador.
export function datosIniciales() {
  return {
    personas: [
      { id: 1, legajo: 'DEMO-001', apellido_nombre: 'Acosta, Lucía', dni: 'DEMO-1001' },
      { id: 2, legajo: 'DEMO-002', apellido_nombre: 'Benítez, Martín', dni: 'DEMO-1002' },
      { id: 3, legajo: 'DEMO-003', apellido_nombre: 'Costa, Valeria', dni: 'DEMO-1003' },
      { id: 4, legajo: 'DEMO-004', apellido_nombre: 'Duarte, Nicolás', dni: 'DEMO-1004' },
      { id: 5, legajo: 'DEMO-005', apellido_nombre: 'Estévez, Paula', dni: 'DEMO-1005' },
    ],
    estados: [1, 2, 3, 4, 5].map(id => ({ id, persona_id: id, estado: 'alta', origen: 'GLM simulado', vigente_desde: fechaRelativa(-800), vigente_hasta: id === 4 ? fechaRelativa(-20) : null })).concat([{ id: 6, persona_id: 4, estado: 'baja', origen: 'GLM simulado', vigente_desde: fechaRelativa(-20), vigente_hasta: null }]),
    licencias: [
      { id: 1, persona_id: 1, nro_registro: 'REG-DEMO-01', categorias: ['B.1'], vencimiento: fechaRelativa(-100), vigente_desde: fechaRelativa(-700), vigente_hasta: fechaRelativa(-90), documento: { nombre: 'Licencia anterior · ejemplo', ejemplo: true } },
      { id: 2, persona_id: 1, nro_registro: 'REG-DEMO-02', categorias: ['B.1', 'C.1'], vencimiento: fechaRelativa(360), vigente_desde: fechaRelativa(-90), vigente_hasta: null, documento: { nombre: 'Licencia actual · ejemplo', ejemplo: true } },
      { id: 3, persona_id: 2, nro_registro: 'REG-DEMO-03', categorias: ['B.1'], vencimiento: fechaRelativa(18), vigente_desde: fechaRelativa(-600), vigente_hasta: null, documento: { nombre: 'Licencia · ejemplo', ejemplo: true } },
      { id: 4, persona_id: 3, nro_registro: 'REG-DEMO-04', categorias: ['B.1', 'D.1'], vencimiento: fechaRelativa(-12), vigente_desde: fechaRelativa(-600), vigente_hasta: null, documento: { nombre: 'Licencia · ejemplo', ejemplo: true } },
    ],
    autorizaciones: [1, 2, 3].map(id => ({ persona_id: id, revision: id === 3 ? 'pendiente' : 'sí', vigente_desde: fechaRelativa(-300), vigente_hasta: null })),
    vehiculos: [{ id: 1, dominio: 'DEMO-01', marca: 'Vehículo', modelo: 'de prueba A' }, { id: 2, dominio: 'DEMO-02', marca: 'Vehículo', modelo: 'de prueba B' }],
    asignaciones: [{ persona_id: 1, vehiculo_id: 1, vigente_desde: fechaRelativa(-300), vigente_hasta: null }, { persona_id: 2, vehiculo_id: 1, vigente_desde: fechaRelativa(-300), vigente_hasta: null }, { persona_id: 3, vehiculo_id: 2, vigente_desde: fechaRelativa(-300), vigente_hasta: null }],
    centros: [{ vehiculo_id: 1, nombre: 'Operaciones · ejemplo', vigente_desde: fechaRelativa(-500), vigente_hasta: fechaRelativa(-10) }, { vehiculo_id: 1, nombre: 'Administración · ejemplo', vigente_desde: fechaRelativa(-10), vigente_hasta: null }, { vehiculo_id: 2, nombre: 'Mantenimiento · ejemplo', vigente_desde: fechaRelativa(-500), vigente_hasta: null }],
    multas: [
      { id: 1, nro_acta: 'ACTA-DEMO-001', vehiculo_id: 1, fecha_infraccion: fechaRelativa(-30), vence_pago_voluntario: fechaRelativa(7), responsable_id: null, estado_pago: 'pendiente', fecha_pago: null, documentos: [] },
      { id: 2, nro_acta: 'ACTA-DEMO-002', vehiculo_id: 2, fecha_infraccion: fechaRelativa(-40), vence_pago_voluntario: fechaRelativa(-5), responsable_id: 3, estado_pago: 'pendiente', fecha_pago: null, documentos: [] },
      { id: 3, nro_acta: 'ACTA-DEMO-003', vehiculo_id: 1, fecha_infraccion: fechaRelativa(-70), vence_pago_voluntario: fechaRelativa(-35), responsable_id: 1, estado_pago: 'pagada', fecha_pago: fechaRelativa(-50), documentos: [] },
    ],
    auditoria: [],
  }
}

export function guardarLicencia(datos, nueva, usuario) {
  const licencias = renovarLicencia(datos.licencias, nueva)
  return { ...datos, licencias, auditoria: [...datos.auditoria, { fecha: new Date().toISOString(), usuario: usuario.usuario, accion: 'Renovación de licencia', entidad: nueva.persona_id }] }
}

export function guardarMulta(datos, id, cambios, usuario) {
  const multas = gestionarMulta(datos, id, cambios)
  return { ...datos, multas, auditoria: [...datos.auditoria, { fecha: new Date().toISOString(), usuario: usuario.usuario, accion: 'Gestión de multa', entidad: id }] }
}
