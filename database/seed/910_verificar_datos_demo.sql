-- Controles de coherencia de los datos de prueba. Solo lee, no modifica nada.
-- Uso: psql -h localhost -U flota_app -d flota -f database/seed/910_verificar_datos_demo.sql

\echo '--- Asignaciones vigentes con algún problema (esperado: solo Costa en AA002ZZ)'
SELECT a.id, p.apellido_nombre, v.dominio,
  concat_ws(' · ',
    CASE WHEN pe.estado <> 'alta' THEN 'persona de baja' END,
    CASE WHEN ve.estado = 'baja' THEN 'vehículo de baja' END,
    CASE WHEN l.id IS NULL THEN 'sin licencia' WHEN l.vencimiento < CURRENT_DATE THEN 'licencia vencida' END,
    CASE WHEN NOT EXISTS (SELECT 1 FROM licencia_categoria lc WHERE lc.licencia_id = l.id AND lc.categoria_id = v.categoria_requerida_id) THEN 'falta categoría' END,
    CASE WHEN au.revision IS DISTINCT FROM 'si' THEN 'autorización ' || coalesce(au.revision,'ninguna') END) AS problemas
FROM asignacion a
JOIN persona p ON p.id = a.persona_id JOIN vehiculo v ON v.id = a.vehiculo_id
JOIN persona_estado pe ON pe.persona_id = p.id AND pe.vigente_hasta IS NULL
JOIN vehiculo_estado ve ON ve.vehiculo_id = v.id AND ve.vigente_hasta IS NULL
LEFT JOIN licencia l ON l.persona_id = p.id AND l.vigente_hasta IS NULL
LEFT JOIN autorizacion_conducir au ON au.persona_id = p.id AND au.vigente_hasta IS NULL
WHERE a.vigente_hasta IS NULL
  AND (pe.estado <> 'alta' OR ve.estado = 'baja' OR l.id IS NULL OR l.vencimiento < CURRENT_DATE OR au.revision IS DISTINCT FROM 'si'
       OR NOT EXISTS (SELECT 1 FROM licencia_categoria lc WHERE lc.licencia_id = l.id AND lc.categoria_id = v.categoria_requerida_id));
\echo '--- Más de un período vigente por entidad (esperado: vacío)'
SELECT 'persona_estado', persona_id FROM persona_estado WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'vehiculo_estado', vehiculo_id FROM vehiculo_estado WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'licencia', persona_id FROM licencia WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'vehiculo_finanzas', vehiculo_id FROM vehiculo_finanzas WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'poliza_vehiculo', vehiculo_id FROM poliza_vehiculo WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'tarjeta_periodo', tarjeta_id FROM tarjeta_periodo WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'tag', vehiculo_id FROM tag WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1
UNION ALL SELECT 'pin', persona_id FROM pin WHERE vigente_hasta IS NULL GROUP BY 1,2 HAVING count(*)>1;
\echo '--- Períodos al revés o superpuestos del mismo par persona/vehículo (esperado: vacío)'
SELECT 'desde>=hasta', id FROM asignacion WHERE vigente_hasta <= vigente_desde
UNION ALL SELECT 'superpuesta', a.id FROM asignacion a JOIN asignacion b ON a.persona_id=b.persona_id AND a.vehiculo_id=b.vehiculo_id AND a.id<b.id
  AND daterange(a.vigente_desde, a.vigente_hasta) && daterange(b.vigente_desde, b.vigente_hasta);
\echo '--- Vínculos de documentos que apuntan a algo inexistente (esperado: vacío)'
SELECT dv.* FROM documento_vinculo dv WHERE NOT CASE dv.entidad_tipo
  WHEN 'persona' THEN EXISTS (SELECT 1 FROM persona x WHERE x.id = dv.entidad_id)
  WHEN 'vehiculo' THEN EXISTS (SELECT 1 FROM vehiculo x WHERE x.id = dv.entidad_id)
  WHEN 'licencia' THEN EXISTS (SELECT 1 FROM licencia x WHERE x.id = dv.entidad_id)
  WHEN 'poliza' THEN EXISTS (SELECT 1 FROM poliza x WHERE x.id = dv.entidad_id)
  WHEN 'vtv' THEN EXISTS (SELECT 1 FROM vtv x WHERE x.id = dv.entidad_id)
  WHEN 'autorizacion' THEN EXISTS (SELECT 1 FROM autorizacion_conducir x WHERE x.id = dv.entidad_id)
  WHEN 'multa' THEN EXISTS (SELECT 1 FROM multa x WHERE x.id = dv.entidad_id) END;
\echo '--- Multas: responsable con asignación del vehículo ese día (esperado: vacío)'
SELECT m.nro_acta FROM multa m WHERE responsable_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM asignacion a WHERE a.persona_id=m.responsable_id AND a.vehiculo_id=m.vehiculo_id
  AND m.fecha_infraccion >= a.vigente_desde AND (a.vigente_hasta IS NULL OR m.fecha_infraccion < a.vigente_hasta));
\echo '--- Tags con estado fuera del catálogo (esperado: vacío)'
SELECT id, estado_tag FROM tag WHERE estado_tag NOT IN (SELECT codigo FROM estado_tag);
\echo '--- Muestra de documentos (hash de ejemplo)'
SELECT nombre_original, left(sha256,12) FROM documento_version ORDER BY id LIMIT 3;
\echo '--- Vehículos activos sin póliza o con VTV vencida/por vencer'
SELECT v.dominio,
  (SELECT p.nro_poliza FROM poliza_vehiculo pv JOIN poliza p ON p.id=pv.poliza_id WHERE pv.vehiculo_id=v.id AND pv.vigente_hasta IS NULL) poliza,
  (SELECT max(vigente_hasta) - CURRENT_DATE FROM vtv WHERE vehiculo_id=v.id) dias_vtv
FROM vehiculo v JOIN vehiculo_estado e ON e.vehiculo_id=v.id AND e.vigente_hasta IS NULL AND e.estado<>'baja'
WHERE NOT EXISTS (SELECT 1 FROM poliza_vehiculo pv WHERE pv.vehiculo_id=v.id AND pv.vigente_hasta IS NULL)
   OR coalesce((SELECT max(vigente_hasta) FROM vtv WHERE vehiculo_id=v.id), CURRENT_DATE) < CURRENT_DATE + 30;
