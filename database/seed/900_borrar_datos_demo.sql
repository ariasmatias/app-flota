-- ============================================================
-- AUBASA · Flota · BORRAR LOS DATOS DE PRUEBA
--
-- Vacía TODAS las tablas y reinicia los contadores de id.
-- Las tablas quedan creadas (no toca la estructura).
-- Uso: al pasar a producción, antes de conectar GLM y cargar datos reales,
-- o para volver a cargar el seed desde cero.
-- ¡Borra todo lo que haya en las tablas! Revisar en qué base se corre.
-- ============================================================

TRUNCATE TABLE
  usuario,
  persona,
  persona_estado,
  categoria_licencia,
  licencia,
  licencia_categoria,
  autorizacion_conducir,
  vehiculo,
  vehiculo_estado,
  asignacion,
  poliza,
  poliza_vehiculo,
  vtv,
  multa,
  centro_costo,
  vehiculo_finanzas,
  perfil,
  producto,
  pin,
  tarjeta,
  tarjeta_periodo,
  consumo,
  autopista,
  tag,
  tag_autopista,
  tipo_documento_catalogo,
  documento,
  documento_version,
  documento_vinculo,
  notificacion,
  aviso_enviado,
  auditoria_evento,
  sync_glm,
  estado_tag
RESTART IDENTITY CASCADE;
