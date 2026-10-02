-- ============================================================
-- AUBASA · Flota · DATOS FICTICIOS DE PRUEBA (seed)
-- 
-- Para el esquema v1.0 (database/migrations/001_esquema_inicial.sql).
-- NUNCA correr en producción con datos reales: para vaciar, usar
-- database/seed/900_borrar_datos_demo.sql.
-- 
-- · Todo es inventado: legajos DEMO-…, DNI "DEMO-…", dominios serie ZZ,
--   correos @demo.invalid, actas ACTA-DEMO-…, pólizas POL-DEMO-….
-- · Las fechas son relativas al día en que se carga (CURRENT_DATE ± días),
--   así siempre hay ejemplos vigentes, por vencer y vencidos.
-- · Mismas personas y vehículos que las demos de RRHH y Mantenimiento.
-- · Generado con un script; si cambia el esquema, se regenera.
-- 
-- Casos de prueba a propósito:
--   Costa (DEMO-003): licencia vencida + autorización pendiente, conduce AA002ZZ.
--   Duarte (DEMO-004) y Suárez (DEMO-018): de baja, con asignaciones cerradas.
--   Juárez (DEMO-010): autorización rechazada. Paz (DEMO-015): sin categoría B.1.
--   Torres (DEMO-019): sin licencia. Estévez (DEMO-005): autorización por revisar.
--   AB004ZZ y AA015ZZ en taller; AA005ZZ y AA019ZZ de baja.
--   VTV vencida: AA003ZZ, AA013ZZ. Por vencer: AA002ZZ, AA009ZZ.
--   AA020ZZ: 0 km, sin póliza ni VTV. POL-DEMO-0002 vence en 25 días.
-- ============================================================

BEGIN;

-- usuario: los 6 primeros son los de "Ver como" del frontend. Correos .invalid (no existen). sgimenez inactivo.
INSERT INTO usuario (id, ad_id, usuario, nombre, correo, activo, creado) VALUES
  (1, 'DEMO-AD-001', 'agomez', 'Ana Gómez', 'agomez@demo.invalid', true, (CURRENT_DATE - 399 + TIME '10:00')::timestamptz),
  (2, 'DEMO-AD-002', 'bdiaz', 'Bruno Díaz', 'bdiaz@demo.invalid', true, (CURRENT_DATE - 398 + TIME '10:00')::timestamptz),
  (3, 'DEMO-AD-003', 'cruiz', 'Carla Ruiz', 'cruiz@demo.invalid', true, (CURRENT_DATE - 397 + TIME '10:00')::timestamptz),
  (4, 'DEMO-AD-004', 'dpaz', 'Diego Paz', 'dpaz@demo.invalid', true, (CURRENT_DATE - 396 + TIME '10:00')::timestamptz),
  (5, 'DEMO-AD-005', 'esosa', 'Elena Sosa', 'esosa@demo.invalid', true, (CURRENT_DATE - 395 + TIME '10:00')::timestamptz),
  (6, 'DEMO-AD-006', 'admin', 'Admin Sistemas', 'admin@demo.invalid', true, (CURRENT_DATE - 394 + TIME '10:00')::timestamptz),
  (7, 'DEMO-AD-007', 'flopez', 'Federico López', 'flopez@demo.invalid', true, (CURRENT_DATE - 393 + TIME '10:00')::timestamptz),
  (8, 'DEMO-AD-008', 'gmendez', 'Gisela Méndez', 'gmendez@demo.invalid', true, (CURRENT_DATE - 392 + TIME '10:00')::timestamptz),
  (9, 'DEMO-AD-009', 'hrojas', 'Hugo Rojas', 'hrojas@demo.invalid', true, (CURRENT_DATE - 391 + TIME '10:00')::timestamptz),
  (10, 'DEMO-AD-010', 'iflores', 'Inés Flores', 'iflores@demo.invalid', true, (CURRENT_DATE - 390 + TIME '10:00')::timestamptz),
  (11, 'DEMO-AD-011', 'jcastro', 'Julián Castro', 'jcastro@demo.invalid', true, (CURRENT_DATE - 389 + TIME '10:00')::timestamptz),
  (12, 'DEMO-AD-012', 'kperalta', 'Karina Peralta', 'kperalta@demo.invalid', true, (CURRENT_DATE - 388 + TIME '10:00')::timestamptz),
  (13, 'DEMO-AD-013', 'lsilva', 'Leandro Silva', 'lsilva@demo.invalid', true, (CURRENT_DATE - 387 + TIME '10:00')::timestamptz),
  (14, 'DEMO-AD-014', 'mvera', 'Marina Vera', 'mvera@demo.invalid', true, (CURRENT_DATE - 386 + TIME '10:00')::timestamptz),
  (15, 'DEMO-AD-015', 'nramos', 'Norberto Ramos', 'nramos@demo.invalid', true, (CURRENT_DATE - 385 + TIME '10:00')::timestamptz),
  (16, 'DEMO-AD-016', 'oaguirre', 'Olga Aguirre', 'oaguirre@demo.invalid', true, (CURRENT_DATE - 384 + TIME '10:00')::timestamptz),
  (17, 'DEMO-AD-017', 'pcabrera', 'Pedro Cabrera', 'pcabrera@demo.invalid', true, (CURRENT_DATE - 383 + TIME '10:00')::timestamptz),
  (18, 'DEMO-AD-018', 'rmolina', 'Rosa Molina', 'rmolina@demo.invalid', true, (CURRENT_DATE - 382 + TIME '10:00')::timestamptz),
  (19, 'DEMO-AD-019', 'sgimenez', 'Sergio Giménez', 'sgimenez@demo.invalid', false, (CURRENT_DATE - 381 + TIME '10:00')::timestamptz),
  (20, 'DEMO-AD-020', 'tbravo', 'Teresa Bravo', 'tbravo@demo.invalid', true, (CURRENT_DATE - 380 + TIME '10:00')::timestamptz);

-- persona (PROVISORIA hasta GLM). Legajos DEMO-001..020 y DNI "DEMO-…": imposibles de confundir con reales.
INSERT INTO persona (id, legajo, apellido_nombre, dni, creado) VALUES
  (1, 'DEMO-001', 'Acosta, Lucía', 'DEMO-1001', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (2, 'DEMO-002', 'Benítez, Martín', 'DEMO-1002', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (3, 'DEMO-003', 'Costa, Valeria', 'DEMO-1003', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (4, 'DEMO-004', 'Duarte, Nicolás', 'DEMO-1004', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (5, 'DEMO-005', 'Estévez, Paula', 'DEMO-1005', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (6, 'DEMO-006', 'Fernández, Diego', 'DEMO-1006', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (7, 'DEMO-007', 'Gómez, Rocío', 'DEMO-1007', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (8, 'DEMO-008', 'Herrera, Pablo', 'DEMO-1008', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (9, 'DEMO-009', 'Ibarra, Sofía', 'DEMO-1009', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (10, 'DEMO-010', 'Juárez, Tomás', 'DEMO-1010', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (11, 'DEMO-011', 'Ledesma, Carla', 'DEMO-1011', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (12, 'DEMO-012', 'Molina, Andrés', 'DEMO-1012', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (13, 'DEMO-013', 'Núñez, Florencia', 'DEMO-1013', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (14, 'DEMO-014', 'Ortiz, Gabriel', 'DEMO-1014', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (15, 'DEMO-015', 'Paz, Julieta', 'DEMO-1015', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (16, 'DEMO-016', 'Quiroga, Ramiro', 'DEMO-1016', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (17, 'DEMO-017', 'Ríos, Micaela', 'DEMO-1017', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (18, 'DEMO-018', 'Suárez, Hernán', 'DEMO-1018', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (19, 'DEMO-019', 'Torres, Camila', 'DEMO-1019', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (20, 'DEMO-020', 'Vega, Emiliano', 'DEMO-1020', (CURRENT_DATE - 900 + TIME '10:00')::timestamptz);

-- persona_estado: Duarte (4) y Suárez (18) de baja; Vega (20) dado de alta por Sistemas.
INSERT INTO persona_estado (id, persona_id, estado, origen, vigente_desde, vigente_hasta) VALUES
  (1, 1, 'alta', 'glm', CURRENT_DATE - 1480, NULL),
  (2, 2, 'alta', 'glm', CURRENT_DATE - 1460, NULL),
  (3, 3, 'alta', 'glm', CURRENT_DATE - 1440, NULL),
  (4, 4, 'alta', 'glm', CURRENT_DATE - 1420, CURRENT_DATE - 20),
  (5, 4, 'baja', 'glm', CURRENT_DATE - 20, NULL),
  (6, 5, 'alta', 'glm', CURRENT_DATE - 1400, NULL),
  (7, 6, 'alta', 'glm', CURRENT_DATE - 1380, NULL),
  (8, 7, 'alta', 'glm', CURRENT_DATE - 1360, NULL),
  (9, 8, 'alta', 'glm', CURRENT_DATE - 1340, NULL),
  (10, 9, 'alta', 'glm', CURRENT_DATE - 1320, NULL),
  (11, 10, 'alta', 'glm', CURRENT_DATE - 1300, NULL),
  (12, 11, 'alta', 'glm', CURRENT_DATE - 1280, NULL),
  (13, 12, 'alta', 'glm', CURRENT_DATE - 1260, NULL),
  (14, 13, 'alta', 'glm', CURRENT_DATE - 1240, NULL),
  (15, 14, 'alta', 'glm', CURRENT_DATE - 1220, NULL),
  (16, 15, 'alta', 'glm', CURRENT_DATE - 1200, NULL),
  (17, 16, 'alta', 'glm', CURRENT_DATE - 1180, NULL),
  (18, 17, 'alta', 'glm', CURRENT_DATE - 1160, NULL),
  (19, 18, 'alta', 'glm', CURRENT_DATE - 1140, CURRENT_DATE - 200),
  (20, 18, 'baja', 'glm', CURRENT_DATE - 200, NULL),
  (21, 19, 'alta', 'glm', CURRENT_DATE - 1120, NULL),
  (22, 20, 'alta', 'sistemas', CURRENT_DATE - 1100, NULL);

-- categoria_licencia: categorías de la licencia nacional de conducir.
INSERT INTO categoria_licencia (id, codigo) VALUES
  (1, 'A.1'),
  (2, 'A.2'),
  (3, 'A.3'),
  (4, 'B.1'),
  (5, 'B.2'),
  (6, 'C.1'),
  (7, 'C.2'),
  (8, 'C.3'),
  (9, 'D.1'),
  (10, 'D.2'),
  (11, 'D.3'),
  (12, 'D.4'),
  (13, 'E.1'),
  (14, 'E.2'),
  (15, 'F'),
  (16, 'G.1'),
  (17, 'G.2'),
  (18, 'G.3');

-- licencia: una vigente por persona (Acosta y Herrera tienen además una histórica). Torres (19) no tiene.
INSERT INTO licencia (id, persona_id, nro_registro, vencimiento, vigente_desde, vigente_hasta) VALUES
  (1, 1, 'REG-DEMO-01', CURRENT_DATE - 100, CURRENT_DATE - 700, CURRENT_DATE - 90),
  (2, 1, 'REG-DEMO-02', CURRENT_DATE + 360, CURRENT_DATE - 90, NULL),
  (3, 2, 'REG-DEMO-03', CURRENT_DATE + 18, CURRENT_DATE - 600, NULL),
  (4, 3, 'REG-DEMO-04', CURRENT_DATE - 12, CURRENT_DATE - 600, NULL),
  (5, 4, 'REG-DEMO-05', CURRENT_DATE + 400, CURRENT_DATE - 200, NULL),
  (6, 5, 'REG-DEMO-06', CURRENT_DATE + 500, CURRENT_DATE - 200, NULL),
  (7, 6, 'REG-DEMO-07', CURRENT_DATE + 700, CURRENT_DATE - 200, NULL),
  (8, 7, 'REG-DEMO-08', CURRENT_DATE + 250, CURRENT_DATE - 600, NULL),
  (9, 8, 'REG-DEMO-09', CURRENT_DATE - 900, CURRENT_DATE - 1800, CURRENT_DATE - 900),
  (10, 8, 'REG-DEMO-10', CURRENT_DATE + 900, CURRENT_DATE - 90, NULL),
  (11, 9, 'REG-DEMO-11', CURRENT_DATE + 420, CURRENT_DATE - 200, NULL),
  (12, 10, 'REG-DEMO-12', CURRENT_DATE + 300, CURRENT_DATE - 600, NULL),
  (13, 11, 'REG-DEMO-13', CURRENT_DATE + 25, CURRENT_DATE - 600, NULL),
  (14, 12, 'REG-DEMO-14', CURRENT_DATE + 610, CURRENT_DATE - 200, NULL),
  (15, 13, 'REG-DEMO-15', CURRENT_DATE + 330, CURRENT_DATE - 600, NULL),
  (16, 14, 'REG-DEMO-16', CURRENT_DATE + 880, CURRENT_DATE - 200, NULL),
  (17, 15, 'REG-DEMO-17', CURRENT_DATE + 540, CURRENT_DATE - 200, NULL),
  (18, 16, 'REG-DEMO-18', CURRENT_DATE + 150, CURRENT_DATE - 600, NULL),
  (19, 17, 'REG-DEMO-19', CURRENT_DATE + 95, CURRENT_DATE - 600, NULL),
  (20, 18, 'REG-DEMO-20', CURRENT_DATE - 150, CURRENT_DATE - 600, NULL),
  (21, 20, 'REG-DEMO-21', CURRENT_DATE + 1200, CURRENT_DATE - 200, NULL);

INSERT INTO licencia_categoria (licencia_id, categoria_id) VALUES
  (1, 4),
  (2, 4),
  (2, 6),
  (3, 4),
  (4, 4),
  (4, 9),
  (5, 4),
  (6, 4),
  (7, 4),
  (7, 6),
  (8, 4),
  (9, 4),
  (9, 6),
  (10, 4),
  (10, 6),
  (10, 13),
  (11, 4),
  (12, 4),
  (13, 4),
  (14, 4),
  (14, 6),
  (15, 4),
  (16, 4),
  (17, 2),
  (18, 4),
  (19, 4),
  (20, 4),
  (21, 4),
  (21, 6),
  (21, 9);

-- autorizacion_conducir: la carga Legales, la revisa Mantenimiento (usuario 1, Ana Gómez).
INSERT INTO autorizacion_conducir (id, persona_id, revision, observacion, revisado_por, revisado_fecha, vigente_desde, vigente_hasta) VALUES
  (1, 1, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (2, 2, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (3, 3, 'pendiente', NULL, NULL, NULL, CURRENT_DATE - 300, NULL),
  (4, 4, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (5, 5, 'pendiente', NULL, NULL, NULL, CURRENT_DATE - 6, NULL),
  (6, 6, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (7, 7, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (8, 8, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (9, 9, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (10, 10, 'no', 'Documentación incompleta (ejemplo)', 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (11, 11, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (12, 12, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (13, 13, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (14, 14, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (15, 15, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (16, 16, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (17, 17, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (18, 18, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL),
  (19, 19, 'pendiente', NULL, NULL, NULL, CURRENT_DATE - 3, NULL),
  (20, 20, 'si', NULL, 1, CURRENT_DATE - 290, CURRENT_DATE - 300, NULL);

-- vehiculo: dominios ficticios serie ZZ. Los 5 primeros coinciden con la demo de Mantenimiento.
INSERT INTO vehiculo (id, dominio, marca, modelo, categoria_requerida_id, creado) VALUES
  (1, 'AA001ZZ', 'Toyota', 'Hilux', 4, (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (2, 'AA002ZZ', 'Ford', 'Ranger', 4, (CURRENT_DATE - 900 + TIME '10:00')::timestamptz),
  (3, 'AA003ZZ', 'Iveco', 'Daily', 6, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (4, 'AB004ZZ', 'Renault', 'Kangoo', 4, (CURRENT_DATE - 700 + TIME '10:00')::timestamptz),
  (5, 'AA005ZZ', 'Volkswagen', 'Amarok', 4, (CURRENT_DATE - 1200 + TIME '10:00')::timestamptz),
  (6, 'AA006ZZ', 'Toyota', 'Hilux', 4, (CURRENT_DATE - 820 + TIME '10:00')::timestamptz),
  (7, 'AA007ZZ', 'Ford', 'Ranger', 4, (CURRENT_DATE - 760 + TIME '10:00')::timestamptz),
  (8, 'AA008ZZ', 'Fiat', 'Strada', 4, (CURRENT_DATE - 640 + TIME '10:00')::timestamptz),
  (9, 'AA009ZZ', 'Chevrolet', 'S10', 4, (CURRENT_DATE - 600 + TIME '10:00')::timestamptz),
  (10, 'AA010ZZ', 'Renault', 'Kangoo', 4, (CURRENT_DATE - 580 + TIME '10:00')::timestamptz),
  (11, 'AA011ZZ', 'Peugeot', 'Partner', 4, (CURRENT_DATE - 560 + TIME '10:00')::timestamptz),
  (12, 'AA012ZZ', 'Mercedes-Benz', 'Sprinter', 6, (CURRENT_DATE - 520 + TIME '10:00')::timestamptz),
  (13, 'AA013ZZ', 'Iveco', 'Tector (grúa)', 6, (CURRENT_DATE - 480 + TIME '10:00')::timestamptz),
  (14, 'AA014ZZ', 'Toyota', 'Corolla', 4, (CURRENT_DATE - 450 + TIME '10:00')::timestamptz),
  (15, 'AA015ZZ', 'Volkswagen', 'Amarok', 4, (CURRENT_DATE - 430 + TIME '10:00')::timestamptz),
  (16, 'AA016ZZ', 'Ford', 'Transit', 4, (CURRENT_DATE - 90 + TIME '10:00')::timestamptz),
  (17, 'AA017ZZ', 'Scania', 'P310 con semirremolque', 13, (CURRENT_DATE - 380 + TIME '10:00')::timestamptz),
  (18, 'AA018ZZ', 'Renault', 'Duster', 4, (CURRENT_DATE - 350 + TIME '10:00')::timestamptz),
  (19, 'AA019ZZ', 'Fiat', 'Cronos', 4, (CURRENT_DATE - 700 + TIME '10:00')::timestamptz),
  (20, 'AA020ZZ', 'Toyota', 'Hilux', 4, (CURRENT_DATE - 15 + TIME '10:00')::timestamptz);

-- vehiculo_estado: en taller AB004ZZ y AA015ZZ; de baja AA005ZZ y AA019ZZ.
INSERT INTO vehiculo_estado (id, vehiculo_id, estado, motivo, vigente_desde, vigente_hasta) VALUES
  (1, 1, 'activo', 'Alta del vehículo', CURRENT_DATE - 900, NULL),
  (2, 2, 'activo', 'Alta del vehículo', CURRENT_DATE - 900, NULL),
  (3, 3, 'activo', 'Alta del vehículo', CURRENT_DATE - 400, NULL),
  (4, 4, 'activo', 'Alta del vehículo', CURRENT_DATE - 700, CURRENT_DATE - 5),
  (5, 4, 'taller', 'Service de 60.000 km', CURRENT_DATE - 5, NULL),
  (6, 5, 'activo', 'Alta del vehículo', CURRENT_DATE - 1200, CURRENT_DATE - 60),
  (7, 5, 'baja', 'Fin de vida útil (ejemplo)', CURRENT_DATE - 60, NULL),
  (8, 6, 'activo', 'Alta del vehículo', CURRENT_DATE - 820, NULL),
  (9, 7, 'activo', 'Alta del vehículo', CURRENT_DATE - 760, NULL),
  (10, 8, 'activo', 'Alta del vehículo', CURRENT_DATE - 640, NULL),
  (11, 9, 'activo', 'Alta del vehículo', CURRENT_DATE - 600, NULL),
  (12, 10, 'activo', 'Alta del vehículo', CURRENT_DATE - 580, NULL),
  (13, 11, 'activo', 'Alta del vehículo', CURRENT_DATE - 560, NULL),
  (14, 12, 'activo', 'Alta del vehículo', CURRENT_DATE - 520, NULL),
  (15, 13, 'activo', 'Alta del vehículo', CURRENT_DATE - 480, NULL),
  (16, 14, 'activo', 'Alta del vehículo', CURRENT_DATE - 450, NULL),
  (17, 15, 'activo', 'Alta del vehículo', CURRENT_DATE - 430, CURRENT_DATE - 12),
  (18, 15, 'taller', 'Choque leve (ejemplo)', CURRENT_DATE - 12, NULL),
  (19, 16, 'activo', 'Alta del vehículo', CURRENT_DATE - 90, NULL),
  (20, 17, 'activo', 'Alta del vehículo', CURRENT_DATE - 380, NULL),
  (21, 18, 'activo', 'Alta del vehículo', CURRENT_DATE - 350, NULL),
  (22, 19, 'activo', 'Alta del vehículo', CURRENT_DATE - 700, CURRENT_DATE - 150),
  (23, 19, 'taller', 'Falla de motor', CURRENT_DATE - 150, CURRENT_DATE - 90),
  (24, 19, 'baja', 'Reparación antieconómica (ejemplo)', CURRENT_DATE - 90, NULL),
  (25, 20, 'activo', 'Alta del vehículo', CURRENT_DATE - 15, NULL);

-- asignacion: todas las vigentes cumplen las reglas (alta, licencia vigente, categoría, autorización "si"), salvo Costa en AA002ZZ, que es el caso de prueba de alarma.
INSERT INTO asignacion (id, persona_id, vehiculo_id, motivo, vigente_desde, vigente_hasta) VALUES
  (1, 1, 1, 'Asignación inicial', CURRENT_DATE - 300, NULL),
  (2, 2, 1, 'Turno tarde', CURRENT_DATE - 300, NULL),
  (3, 3, 2, 'Asignación inicial', CURRENT_DATE - 300, NULL),
  (4, 4, 2, 'Asignación inicial · Cierre: baja de la persona', CURRENT_DATE - 500, CURRENT_DATE - 20),
  (5, 1, 3, 'Reparto de insumos', CURRENT_DATE - 60, NULL),
  (6, 1, 5, 'Asignación inicial · Cierre: baja del vehículo', CURRENT_DATE - 400, CURRENT_DATE - 60),
  (7, 6, 6, 'Asignación inicial', CURRENT_DATE - 280, NULL),
  (8, 2, 6, 'Reemplazo de fin de semana', CURRENT_DATE - 40, NULL),
  (9, 7, 7, 'Asignación inicial', CURRENT_DATE - 260, NULL),
  (10, 18, 7, 'Asignación inicial · Cierre: baja de la persona', CURRENT_DATE - 700, CURRENT_DATE - 200),
  (11, 9, 8, 'Asignación inicial', CURRENT_DATE - 240, NULL),
  (12, 11, 9, 'Asignación inicial', CURRENT_DATE - 230, NULL),
  (13, 13, 10, 'Asignación inicial', CURRENT_DATE - 220, NULL),
  (14, 14, 11, 'Asignación inicial', CURRENT_DATE - 210, NULL),
  (15, 12, 12, 'Asignación inicial', CURRENT_DATE - 200, NULL),
  (16, 20, 13, 'Operador de grúa', CURRENT_DATE - 190, NULL),
  (17, 16, 14, 'Asignación inicial', CURRENT_DATE - 180, NULL),
  (18, 13, 15, 'Asignación inicial', CURRENT_DATE - 170, NULL),
  (19, 17, 16, 'Asignación inicial', CURRENT_DATE - 60, NULL),
  (20, 8, 17, 'Asignación inicial', CURRENT_DATE - 150, NULL),
  (21, 16, 18, 'Recorridas de control', CURRENT_DATE - 90, NULL),
  (22, 6, 3, 'Turno noche', CURRENT_DATE - 100, NULL);

-- poliza: vigente_hasta = vencimiento. POL-DEMO-0002 vence en 25 días (alarma).
INSERT INTO poliza (id, nro_poliza, aseguradora, vigente_desde, vigente_hasta) VALUES
  (1, 'POL-DEMO-0001', 'Aseguradora Ejemplo', CURRENT_DATE - 730, CURRENT_DATE - 366),
  (2, 'POL-DEMO-0002', 'Aseguradora Ejemplo', CURRENT_DATE - 365, CURRENT_DATE + 25),
  (3, 'POL-DEMO-0003', 'Seguros Demo', CURRENT_DATE - 930, CURRENT_DATE - 201),
  (4, 'POL-DEMO-0004', 'Seguros Demo', CURRENT_DATE - 200, CURRENT_DATE + 165);

-- poliza_vehiculo: AA020ZZ (recién comprado) todavía sin póliza: caso de alarma.
INSERT INTO poliza_vehiculo (id, poliza_id, vehiculo_id, vigente_desde, vigente_hasta) VALUES
  (1, 1, 1, CURRENT_DATE - 730, CURRENT_DATE - 365),
  (2, 1, 2, CURRENT_DATE - 730, CURRENT_DATE - 365),
  (3, 1, 5, CURRENT_DATE - 730, CURRENT_DATE - 365),
  (4, 2, 1, CURRENT_DATE - 365, NULL),
  (5, 2, 2, CURRENT_DATE - 365, NULL),
  (6, 2, 3, CURRENT_DATE - 365, NULL),
  (7, 2, 4, CURRENT_DATE - 100, NULL),
  (8, 2, 5, CURRENT_DATE - 365, CURRENT_DATE - 60),
  (9, 3, 4, CURRENT_DATE - 700, CURRENT_DATE - 201),
  (10, 3, 6, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (11, 4, 6, CURRENT_DATE - 200, NULL),
  (12, 3, 7, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (13, 4, 7, CURRENT_DATE - 200, NULL),
  (14, 3, 8, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (15, 4, 8, CURRENT_DATE - 200, NULL),
  (16, 3, 9, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (17, 4, 9, CURRENT_DATE - 200, NULL),
  (18, 3, 10, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (19, 4, 10, CURRENT_DATE - 200, NULL),
  (20, 3, 11, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (21, 4, 11, CURRENT_DATE - 200, NULL),
  (22, 3, 12, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (23, 4, 12, CURRENT_DATE - 200, NULL),
  (24, 3, 13, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (25, 4, 13, CURRENT_DATE - 200, NULL),
  (26, 3, 14, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (27, 4, 14, CURRENT_DATE - 200, NULL),
  (28, 3, 15, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (29, 4, 15, CURRENT_DATE - 200, NULL),
  (30, 3, 17, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (31, 4, 17, CURRENT_DATE - 200, NULL),
  (32, 3, 18, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (33, 4, 18, CURRENT_DATE - 200, NULL),
  (34, 3, 19, CURRENT_DATE - 900, CURRENT_DATE - 200),
  (35, 4, 19, CURRENT_DATE - 200, CURRENT_DATE - 90),
  (36, 4, 16, CURRENT_DATE - 90, NULL);

-- vtv: vencidas AA003ZZ y AA013ZZ; por vencer AA002ZZ (12 días) y AA009ZZ (20 días). AA020ZZ 0 km, sin VTV.
INSERT INTO vtv (id, vehiculo_id, vigente_desde, vigente_hasta) VALUES
  (1, 1, CURRENT_DATE - 530, CURRENT_DATE - 165),
  (2, 6, CURRENT_DATE - 590, CURRENT_DATE - 225),
  (3, 1, CURRENT_DATE - 165, CURRENT_DATE + 200),
  (4, 2, CURRENT_DATE - 353, CURRENT_DATE + 12),
  (5, 3, CURRENT_DATE - 368, CURRENT_DATE - 3),
  (6, 4, CURRENT_DATE - 65, CURRENT_DATE + 300),
  (7, 5, CURRENT_DATE - 435, CURRENT_DATE - 70),
  (8, 6, CURRENT_DATE - 225, CURRENT_DATE + 140),
  (9, 7, CURRENT_DATE - 275, CURRENT_DATE + 90),
  (10, 8, CURRENT_DATE - 135, CURRENT_DATE + 230),
  (11, 9, CURRENT_DATE - 345, CURRENT_DATE + 20),
  (12, 10, CURRENT_DATE - 55, CURRENT_DATE + 310),
  (13, 11, CURRENT_DATE - 320, CURRENT_DATE + 45),
  (14, 12, CURRENT_DATE - 185, CURRENT_DATE + 180),
  (15, 13, CURRENT_DATE - 405, CURRENT_DATE - 40),
  (16, 14, CURRENT_DATE - 105, CURRENT_DATE + 260),
  (17, 15, CURRENT_DATE - 245, CURRENT_DATE + 120),
  (18, 16, CURRENT_DATE - 35, CURRENT_DATE + 330),
  (19, 17, CURRENT_DATE - 290, CURRENT_DATE + 75),
  (20, 18, CURRENT_DATE - 205, CURRENT_DATE + 160),
  (21, 19, CURRENT_DATE - 485, CURRENT_DATE - 120);

-- multa: las 3 primeras son las de la demo de RRHH. Responsable = quien tenía asignado el vehículo ese día; nulo si RRHH todavía no lo confirmó.
INSERT INTO multa (id, nro_acta, vehiculo_id, fecha_infraccion, vence_pago_voluntario, responsable_id, estado_pago, fecha_pago, creado) VALUES
  (1, 'ACTA-DEMO-001', 1, CURRENT_DATE - 30, CURRENT_DATE + 7, NULL, 'pendiente', NULL, (CURRENT_DATE - 27 + TIME '10:00')::timestamptz),
  (2, 'ACTA-DEMO-002', 2, CURRENT_DATE - 40, CURRENT_DATE - 5, 3, 'pendiente', NULL, (CURRENT_DATE - 37 + TIME '10:00')::timestamptz),
  (3, 'ACTA-DEMO-003', 1, CURRENT_DATE - 70, CURRENT_DATE - 35, 1, 'pagada', CURRENT_DATE - 50, (CURRENT_DATE - 67 + TIME '10:00')::timestamptz),
  (4, 'ACTA-DEMO-004', 6, CURRENT_DATE - 15, CURRENT_DATE + 20, NULL, 'pendiente', NULL, (CURRENT_DATE - 12 + TIME '10:00')::timestamptz),
  (5, 'ACTA-DEMO-005', 7, CURRENT_DATE - 90, CURRENT_DATE - 55, 7, 'pagada', CURRENT_DATE - 60, (CURRENT_DATE - 87 + TIME '10:00')::timestamptz),
  (6, 'ACTA-DEMO-006', 8, CURRENT_DATE - 12, CURRENT_DATE + 23, 9, 'pendiente', NULL, (CURRENT_DATE - 9 + TIME '10:00')::timestamptz),
  (7, 'ACTA-DEMO-007', 9, CURRENT_DATE - 200, CURRENT_DATE - 165, 11, 'pagada', CURRENT_DATE - 170, (CURRENT_DATE - 197 + TIME '10:00')::timestamptz),
  (8, 'ACTA-DEMO-008', 10, CURRENT_DATE - 50, CURRENT_DATE - 15, 13, 'pendiente', NULL, (CURRENT_DATE - 47 + TIME '10:00')::timestamptz),
  (9, 'ACTA-DEMO-009', 11, CURRENT_DATE - 8, CURRENT_DATE + 27, NULL, 'pendiente', NULL, (CURRENT_DATE - 5 + TIME '10:00')::timestamptz),
  (10, 'ACTA-DEMO-010', 12, CURRENT_DATE - 120, CURRENT_DATE - 85, 12, 'pagada', CURRENT_DATE - 90, (CURRENT_DATE - 117 + TIME '10:00')::timestamptz),
  (11, 'ACTA-DEMO-011', 13, CURRENT_DATE - 25, CURRENT_DATE + 10, 20, 'pendiente', NULL, (CURRENT_DATE - 22 + TIME '10:00')::timestamptz),
  (12, 'ACTA-DEMO-012', 14, CURRENT_DATE - 60, CURRENT_DATE - 25, 16, 'pagada', CURRENT_DATE - 30, (CURRENT_DATE - 57 + TIME '10:00')::timestamptz),
  (13, 'ACTA-DEMO-013', 17, CURRENT_DATE - 33, CURRENT_DATE + 2, 8, 'pendiente', NULL, (CURRENT_DATE - 30 + TIME '10:00')::timestamptz),
  (14, 'ACTA-DEMO-014', 18, CURRENT_DATE - 45, CURRENT_DATE - 10, 16, 'pagada', CURRENT_DATE - 12, (CURRENT_DATE - 42 + TIME '10:00')::timestamptz),
  (15, 'ACTA-DEMO-015', 2, CURRENT_DATE - 480, CURRENT_DATE - 445, 4, 'pagada', CURRENT_DATE - 450, (CURRENT_DATE - 477 + TIME '10:00')::timestamptz),
  (16, 'ACTA-DEMO-016', 7, CURRENT_DATE - 350, CURRENT_DATE - 315, 18, 'pagada', CURRENT_DATE - 320, (CURRENT_DATE - 347 + TIME '10:00')::timestamptz),
  (17, 'ACTA-DEMO-017', 3, CURRENT_DATE - 20, CURRENT_DATE + 15, NULL, 'pendiente', NULL, (CURRENT_DATE - 17 + TIME '10:00')::timestamptz),
  (18, 'ACTA-DEMO-018', 6, CURRENT_DATE - 5, CURRENT_DATE + 30, NULL, 'pendiente', NULL, (CURRENT_DATE - 2 + TIME '10:00')::timestamptz),
  (19, 'ACTA-DEMO-019', 16, CURRENT_DATE - 10, CURRENT_DATE + 25, 17, 'pendiente', NULL, (CURRENT_DATE - 7 + TIME '10:00')::timestamptz),
  (20, 'ACTA-DEMO-020', 1, CURRENT_DATE - 150, CURRENT_DATE - 115, 2, 'pagada', CURRENT_DATE - 118, (CURRENT_DATE - 147 + TIME '10:00')::timestamptz);

-- centro_costo: ficticios; CC-DEMO-900 dado de baja (sin borrar).
INSERT INTO centro_costo (id, codigo, nombre, gerencia, activo) VALUES
  (1, 'CC-DEMO-100', 'Operaciones (ejemplo)', 'Operaciones', true),
  (2, 'CC-DEMO-200', 'Mantenimiento (ejemplo)', 'Mantenimiento', true),
  (3, 'CC-DEMO-300', 'Administración (ejemplo)', 'Administración y Finanzas', true),
  (4, 'CC-DEMO-400', 'Seguridad vial (ejemplo)', 'Operaciones', true),
  (5, 'CC-DEMO-500', 'Atención al usuario (ejemplo)', 'Comercial', true),
  (6, 'CC-DEMO-600', 'Recursos Humanos (ejemplo)', 'Recursos Humanos', true),
  (7, 'CC-DEMO-700', 'Legales (ejemplo)', 'Legales', true),
  (8, 'CC-DEMO-900', 'Obras (ejemplo, dado de baja)', 'Operaciones', false);

-- vehiculo_finanzas: AA001ZZ cambió de Operaciones a Administración hace 10 días (prueba de la ficha por fecha).
INSERT INTO vehiculo_finanzas (id, vehiculo_id, centro_costo_id, tipo_flota, vigente_desde, vigente_hasta) VALUES
  (1, 1, 1, 'aubasa', CURRENT_DATE - 900, CURRENT_DATE - 10),
  (2, 13, 8, 'aubasa', CURRENT_DATE - 480, CURRENT_DATE - 300),
  (3, 1, 3, 'aubasa', CURRENT_DATE - 10, NULL),
  (4, 2, 2, 'aubasa', CURRENT_DATE - 900, NULL),
  (5, 3, 2, 'propia', CURRENT_DATE - 400, NULL),
  (6, 4, 2, 'aubasa', CURRENT_DATE - 700, NULL),
  (7, 5, 1, 'aubasa', CURRENT_DATE - 1200, NULL),
  (8, 6, 1, 'aubasa', CURRENT_DATE - 820, NULL),
  (9, 7, 1, 'aubasa', CURRENT_DATE - 760, NULL),
  (10, 8, 4, 'aubasa', CURRENT_DATE - 640, NULL),
  (11, 9, 4, 'aubasa', CURRENT_DATE - 600, NULL),
  (12, 10, 2, 'aubasa', CURRENT_DATE - 580, NULL),
  (13, 11, 5, 'aubasa', CURRENT_DATE - 560, NULL),
  (14, 12, 1, 'aubasa', CURRENT_DATE - 520, NULL),
  (15, 13, 4, 'aubasa', CURRENT_DATE - 300, NULL),
  (16, 14, 3, 'aubasa', CURRENT_DATE - 450, NULL),
  (17, 15, 1, 'aubasa', CURRENT_DATE - 430, NULL),
  (18, 16, 5, 'aubasa', CURRENT_DATE - 90, NULL),
  (19, 17, 1, 'propia', CURRENT_DATE - 380, NULL),
  (20, 18, 4, 'aubasa', CURRENT_DATE - 350, NULL),
  (21, 19, 3, 'aubasa', CURRENT_DATE - 700, NULL),
  (22, 20, 1, 'aubasa', CURRENT_DATE - 15, NULL);

-- perfil: topes ficticios.
INSERT INTO perfil (id, nombre, descripcion, tope_importe, tope_litros, vigente_desde, vigente_hasta) VALUES
  (1, 'Utilitario liviano', 'Pickups y utilitarios (ejemplo)', 450000, 600, CURRENT_DATE - 900, NULL),
  (2, 'Pesado', 'Camiones y grúas (ejemplo)', 1200000, 1500, CURRENT_DATE - 900, NULL),
  (3, 'Auto de servicio', 'Autos (ejemplo)', 250000, 350, CURRENT_DATE - 900, NULL),
  (4, 'Beneficio estándar', 'Beneficio al personal (ejemplo)', 120000, 150, CURRENT_DATE - 900, NULL),
  (5, 'Beneficio ampliado', 'Beneficio al personal (ejemplo)', 200000, 250, CURRENT_DATE - 900, NULL);

-- producto: genéricos, sin marcas.
INSERT INTO producto (id, categoria, nombre) VALUES
  (1, 'nafta', 'Nafta súper (ejemplo)'),
  (2, 'nafta', 'Nafta premium (ejemplo)'),
  (3, 'gasoil', 'Diésel común (ejemplo)'),
  (4, 'gasoil', 'Diésel premium (ejemplo)'),
  (5, 'gnc', 'GNC (ejemplo)'),
  (6, 'lubricantes', 'Aceite de motor (ejemplo)'),
  (7, 'lubricantes', 'Líquido refrigerante (ejemplo)'),
  (8, 'otros', 'Lavado (ejemplo)');

-- pin: valores al azar SOLO de prueba. Pendiente con Mariano: cómo guardarlo protegido.
INSERT INTO pin (id, persona_id, pin, vigente_desde, vigente_hasta) VALUES
  (1, 1, '0000', CURRENT_DATE - 600, CURRENT_DATE - 300),
  (2, 1, '6305', CURRENT_DATE - 300, NULL),
  (3, 2, '3471', CURRENT_DATE - 300, NULL),
  (4, 3, '7468', CURRENT_DATE - 300, NULL),
  (5, 6, '1791', CURRENT_DATE - 300, NULL),
  (6, 7, '2186', CURRENT_DATE - 300, NULL),
  (7, 8, '9779', CURRENT_DATE - 300, NULL),
  (8, 9, '2542', CURRENT_DATE - 300, NULL),
  (9, 11, '6991', CURRENT_DATE - 300, NULL),
  (10, 12, '1950', CURRENT_DATE - 300, NULL),
  (11, 13, '9313', CURRENT_DATE - 300, NULL),
  (12, 14, '4517', CURRENT_DATE - 300, NULL),
  (13, 16, '1614', CURRENT_DATE - 300, NULL),
  (14, 17, '2408', CURRENT_DATE - 300, NULL),
  (15, 20, '8104', CURRENT_DATE - 300, NULL);

-- tarjeta: 15 operativas (una por vehículo) y 5 de beneficio. La de AA016ZZ espera el número de YPF (nulo).
INSERT INTO tarjeta (id, tipo, vehiculo_id, persona_id, dominio_personal, marca, modelo, numero_tarjeta, litros_tanque, tope_tanque, responsable_patrimonial, observaciones, creado) VALUES
  (1, 'operativa', 1, NULL, NULL, NULL, NULL, 'DEMO-7000-0001', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 895 + TIME '10:00')::timestamptz),
  (2, 'operativa', 2, NULL, NULL, NULL, NULL, 'DEMO-7000-0002', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 895 + TIME '10:00')::timestamptz),
  (3, 'operativa', 3, NULL, NULL, NULL, NULL, 'DEMO-7000-0003', 100, 100, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 395 + TIME '10:00')::timestamptz),
  (4, 'operativa', 4, NULL, NULL, NULL, NULL, 'DEMO-7000-0004', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 695 + TIME '10:00')::timestamptz),
  (5, 'operativa', 5, NULL, NULL, NULL, NULL, 'DEMO-7000-0005', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 1195 + TIME '10:00')::timestamptz),
  (6, 'operativa', 6, NULL, NULL, NULL, NULL, 'DEMO-7000-0006', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 815 + TIME '10:00')::timestamptz),
  (7, 'operativa', 7, NULL, NULL, NULL, NULL, 'DEMO-7000-0007', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 755 + TIME '10:00')::timestamptz),
  (8, 'operativa', 8, NULL, NULL, NULL, NULL, 'DEMO-7000-0008', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 635 + TIME '10:00')::timestamptz),
  (9, 'operativa', 9, NULL, NULL, NULL, NULL, 'DEMO-7000-0009', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 595 + TIME '10:00')::timestamptz),
  (10, 'operativa', 10, NULL, NULL, NULL, NULL, 'DEMO-7000-0010', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 575 + TIME '10:00')::timestamptz),
  (11, 'operativa', 11, NULL, NULL, NULL, NULL, 'DEMO-7000-0011', 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 555 + TIME '10:00')::timestamptz),
  (12, 'operativa', 12, NULL, NULL, NULL, NULL, 'DEMO-7000-0012', 75, 75, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 515 + TIME '10:00')::timestamptz),
  (13, 'operativa', 13, NULL, NULL, NULL, NULL, 'DEMO-7000-0013', 200, 200, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 475 + TIME '10:00')::timestamptz),
  (14, 'operativa', 14, NULL, NULL, NULL, NULL, 'DEMO-7000-0014', 50, 50, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 445 + TIME '10:00')::timestamptz),
  (15, 'operativa', 16, NULL, NULL, NULL, NULL, NULL, 80, 80, 'Gómez, Ana (ejemplo)', NULL, (CURRENT_DATE - 85 + TIME '10:00')::timestamptz),
  (16, 'beneficio', NULL, 1, 'AD101ZZ', 'Fiat', 'Palio', 'DEMO-7000-0016', 50, 45, NULL, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (17, 'beneficio', NULL, 6, 'AD102ZZ', 'Chevrolet', 'Onix', 'DEMO-7000-0017', 50, 45, NULL, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (18, 'beneficio', NULL, 8, 'AD103ZZ', 'Ford', 'Ka', 'DEMO-7000-0018', 50, 45, NULL, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (19, 'beneficio', NULL, 12, 'AD104ZZ', 'Renault', 'Sandero', 'DEMO-7000-0019', 50, 45, NULL, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (20, 'beneficio', NULL, 20, 'AD105ZZ', 'Volkswagen', 'Gol', 'DEMO-7000-0020', 50, 45, NULL, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz);

-- tarjeta_periodo: la de AA005ZZ dada de baja; la de AB004ZZ bloqueada mientras está en taller.
INSERT INTO tarjeta_periodo (id, tarjeta_id, centro_costo_id, perfil_id, estado, motivo, vigente_desde, vigente_hasta) VALUES
  (1, 1, NULL, 1, 'vigente', NULL, CURRENT_DATE - 895, NULL),
  (2, 2, NULL, 1, 'vigente', NULL, CURRENT_DATE - 895, NULL),
  (3, 3, NULL, 2, 'vigente', NULL, CURRENT_DATE - 395, NULL),
  (4, 4, NULL, 1, 'vigente', NULL, CURRENT_DATE - 695, CURRENT_DATE - 5),
  (5, 4, NULL, 1, 'bloqueada', 'Vehículo en taller', CURRENT_DATE - 5, NULL),
  (6, 5, NULL, 1, 'vigente', NULL, CURRENT_DATE - 1195, CURRENT_DATE - 60),
  (7, 5, NULL, 1, 'baja', 'Baja del vehículo', CURRENT_DATE - 60, NULL),
  (8, 6, NULL, 1, 'vigente', NULL, CURRENT_DATE - 815, NULL),
  (9, 7, NULL, 1, 'vigente', NULL, CURRENT_DATE - 755, NULL),
  (10, 8, NULL, 1, 'vigente', NULL, CURRENT_DATE - 635, NULL),
  (11, 9, NULL, 1, 'vigente', NULL, CURRENT_DATE - 595, NULL),
  (12, 10, NULL, 1, 'vigente', NULL, CURRENT_DATE - 575, NULL),
  (13, 11, NULL, 1, 'vigente', NULL, CURRENT_DATE - 555, NULL),
  (14, 12, NULL, 2, 'vigente', NULL, CURRENT_DATE - 515, NULL),
  (15, 13, NULL, 2, 'vigente', NULL, CURRENT_DATE - 475, NULL),
  (16, 14, NULL, 3, 'vigente', NULL, CURRENT_DATE - 445, NULL),
  (17, 15, NULL, 1, 'vigente', NULL, CURRENT_DATE - 85, NULL),
  (18, 16, 6, 4, 'vigente', NULL, CURRENT_DATE - 395, NULL),
  (19, 17, 6, 4, 'vigente', NULL, CURRENT_DATE - 395, NULL),
  (20, 18, 6, 5, 'vigente', NULL, CURRENT_DATE - 395, NULL),
  (21, 19, 6, 4, 'vigente', NULL, CURRENT_DATE - 395, NULL),
  (22, 20, 1, 4, 'vigente', NULL, CURRENT_DATE - 395, NULL);

-- consumo: 40 líneas de los últimos 60 días, en 4 facturas. 4 sin producto identificado (para probar FI-12). Montos ficticios.
INSERT INTO consumo (id, tarjeta_id, conductor, fecha, categoria_ypf, producto_id, litros, monto, tasa_vial, factura, centro_costo_ypf) VALUES
  (1, 1, 'Acosta, Lucía', CURRENT_DATE - 2, 'gasoil', 3, 46.73, 71029.6, 3551.48, 'FAC-DEMO-0001', 'CC-DEMO-300'),
  (2, 2, 'Costa, Valeria', CURRENT_DATE - 3, 'gasoil', 4, 39.63, 60237.6, 3011.88, 'FAC-DEMO-0001', 'CC-DEMO-200'),
  (3, 3, 'Acosta, Lucía', CURRENT_DATE - 5, 'gasoil', 3, 52.04, 79100.8, 3955.04, 'FAC-DEMO-0001', 'CC-DEMO-200'),
  (4, 4, NULL, CURRENT_DATE - 6, 'nafta', 2, 32.36, 46922.0, 2346.1, 'FAC-DEMO-0001', 'CC-DEMO-200'),
  (5, 6, 'Fernández, Diego', CURRENT_DATE - 8, 'gasoil', 3, 52.62, 79982.4, 3999.12, 'FAC-DEMO-0001', 'CC-DEMO-100'),
  (6, 7, 'Gómez, Rocío', CURRENT_DATE - 9, 'gasoil', 4, 67.9, 103208.0, 5160.4, 'FAC-DEMO-0001', 'CC-DEMO-100'),
  (7, 8, 'Ibarra, Sofía', CURRENT_DATE - 11, 'nafta', 1, 55.23, 80083.5, 4004.18, 'FAC-DEMO-0001', 'CC-DEMO-400'),
  (8, 9, 'Ledesma, Carla', CURRENT_DATE - 12, 'gasoil', NULL, 53.32, 81046.4, 4052.32, 'FAC-DEMO-0001', 'CC-DEMO-400'),
  (9, 10, 'Núñez, Florencia', CURRENT_DATE - 14, 'nafta', 1, 32.47, 47081.5, 2354.08, 'FAC-DEMO-0001', 'CC-DEMO-200'),
  (10, 11, 'Ortiz, Gabriel', CURRENT_DATE - 15, 'nafta', 2, 53.42, 77459.0, 3872.95, 'FAC-DEMO-0001', 'CC-DEMO-500'),
  (11, 12, 'Molina, Andrés', CURRENT_DATE - 17, 'gasoil', 3, 31.98, 48609.6, 2430.48, 'FAC-DEMO-0002', 'CC-DEMO-100'),
  (12, 13, 'Vega, Emiliano', CURRENT_DATE - 18, 'gasoil', 4, 63.16, 96003.2, 4800.16, 'FAC-DEMO-0002', 'CC-DEMO-400'),
  (13, 14, 'Quiroga, Ramiro', CURRENT_DATE - 20, 'nafta', 1, 52.27, 75791.5, 3789.58, 'FAC-DEMO-0002', 'CC-DEMO-300'),
  (14, 1, 'Acosta, Lucía', CURRENT_DATE - 21, 'gasoil', 4, 35.33, 53701.6, 2685.08, 'FAC-DEMO-0002', 'CC-DEMO-300'),
  (15, 2, 'Costa, Valeria', CURRENT_DATE - 23, 'gasoil', 3, 46.77, 71090.4, 3554.52, 'FAC-DEMO-0002', 'CC-DEMO-200'),
  (16, 3, 'Acosta, Lucía', CURRENT_DATE - 24, 'gasoil', 4, 51.63, 78477.6, 3923.88, 'FAC-DEMO-0002', 'CC-DEMO-200'),
  (17, 4, NULL, CURRENT_DATE - 26, 'nafta', 1, 52.84, 76618.0, 3830.9, 'FAC-DEMO-0002', 'CC-DEMO-200'),
  (18, 6, 'Fernández, Diego', CURRENT_DATE - 27, 'gasoil', 4, 52.41, 79663.2, 3983.16, 'FAC-DEMO-0002', 'CC-DEMO-100'),
  (19, 7, 'Gómez, Rocío', CURRENT_DATE - 29, 'gasoil', 3, 57.28, 87065.6, 4353.28, 'FAC-DEMO-0002', 'CC-DEMO-100'),
  (20, 8, 'Ibarra, Sofía', CURRENT_DATE - 30, 'nafta', NULL, 34.12, 49474.0, 2473.7, 'FAC-DEMO-0002', 'CC-DEMO-400'),
  (21, 9, 'Ledesma, Carla', CURRENT_DATE - 32, 'gasoil', 3, 52.85, 80332.0, 4016.6, 'FAC-DEMO-0003', 'CC-DEMO-400'),
  (22, 10, 'Núñez, Florencia', CURRENT_DATE - 33, 'nafta', 2, 37.51, 54389.5, 2719.48, 'FAC-DEMO-0003', 'CC-DEMO-200'),
  (23, 11, 'Ortiz, Gabriel', CURRENT_DATE - 35, 'nafta', 1, 33.9, 49155.0, 2457.75, 'FAC-DEMO-0003', 'CC-DEMO-500'),
  (24, 12, 'Molina, Andrés', CURRENT_DATE - 36, 'gasoil', 4, 58.48, 88889.6, 4444.48, 'FAC-DEMO-0003', 'CC-DEMO-100'),
  (25, 13, 'Vega, Emiliano', CURRENT_DATE - 38, 'gasoil', 3, 114.66, 174283.2, 8714.16, 'FAC-DEMO-0003', 'CC-DEMO-400'),
  (26, 14, 'Quiroga, Ramiro', CURRENT_DATE - 39, 'lubricantes', NULL, NULL, 27000, 1350.0, 'FAC-DEMO-0003', 'CC-DEMO-300'),
  (27, 1, 'Acosta, Lucía', CURRENT_DATE - 41, 'gasoil', 3, 49.86, 75787.2, 3789.36, 'FAC-DEMO-0003', 'CC-DEMO-300'),
  (28, 2, 'Costa, Valeria', CURRENT_DATE - 42, 'gasoil', 4, 51.27, 77930.4, 3896.52, 'FAC-DEMO-0003', 'CC-DEMO-200'),
  (29, 3, 'Acosta, Lucía', CURRENT_DATE - 44, 'gasoil', 3, 61.09, 92856.8, 4642.84, 'FAC-DEMO-0003', 'CC-DEMO-200'),
  (30, 4, NULL, CURRENT_DATE - 45, 'nafta', 2, 48.62, 70499.0, 3524.95, 'FAC-DEMO-0003', 'CC-DEMO-200'),
  (31, 6, 'Fernández, Diego', CURRENT_DATE - 47, 'gasoil', 3, 66.94, 101748.8, 5087.44, 'FAC-DEMO-0004', 'CC-DEMO-100'),
  (32, 7, 'Gómez, Rocío', CURRENT_DATE - 48, 'gasoil', NULL, 44.46, 67579.2, 3378.96, 'FAC-DEMO-0004', 'CC-DEMO-100'),
  (33, 8, 'Ibarra, Sofía', CURRENT_DATE - 50, 'nafta', 1, 39.94, 57913.0, 2895.65, 'FAC-DEMO-0004', 'CC-DEMO-400'),
  (34, 9, 'Ledesma, Carla', CURRENT_DATE - 51, 'gasoil', 4, 37.19, 56528.8, 2826.44, 'FAC-DEMO-0004', 'CC-DEMO-400'),
  (35, 20, 'Vega, Emiliano', CURRENT_DATE - 53, 'nafta', 1, 40.6, 58870.0, 2943.5, 'FAC-DEMO-0004', 'CC-DEMO-600'),
  (36, 16, 'Acosta, Lucía', CURRENT_DATE - 54, 'nafta', 1, 26.64, 38628.0, 1931.4, 'FAC-DEMO-0004', 'CC-DEMO-600'),
  (37, 17, 'Fernández, Diego', CURRENT_DATE - 56, 'nafta', 1, 31.0, 44950.0, 2247.5, 'FAC-DEMO-0004', 'CC-DEMO-600'),
  (38, 18, 'Herrera, Pablo', CURRENT_DATE - 57, 'nafta', 1, 34.9, 50605.0, 2530.25, 'FAC-DEMO-0004', 'CC-DEMO-600'),
  (39, 19, 'Molina, Andrés', CURRENT_DATE - 59, 'nafta', 1, 31.87, 46211.5, 2310.58, 'FAC-DEMO-0004', 'CC-DEMO-600'),
  (40, 20, 'Vega, Emiliano', CURRENT_DATE - 60, 'nafta', 1, 33.98, 49271.0, 2463.55, 'FAC-DEMO-0004', 'CC-DEMO-600');

-- autopista: nombres de ejemplo. El catálogo real lo confirma Comercial.
INSERT INTO autopista (id, nombre) VALUES
  (1, 'Autopista Ejemplo Norte'),
  (2, 'Autopista Ejemplo Sur'),
  (3, 'Autopista Ejemplo Este'),
  (4, 'Autopista Ejemplo Oeste'),
  (5, 'Autopista Ejemplo Centro'),
  (6, 'Autopista Ejemplo Costera');

-- tag: estado_tag como texto (así está el esquema v1.0; pendiente con Mariano). AA002ZZ tuvo uno perdido.
INSERT INTO tag (id, vehiculo_id, fecha_alta, nro_dispositivo, nro_cliente, cuenta, subcuenta, estado_tag, habilitado_otras, nro_ticket, vigente_desde, vigente_hasta) VALUES
  (1, 2, CURRENT_DATE - 850, 'TAG-DEMO-0000', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-02', 'PERDIDO', false, 'TCK-DEMO-001', CURRENT_DATE - 850, CURRENT_DATE - 400),
  (2, 1, CURRENT_DATE - 890, 'TAG-DEMO-0002', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-01', 'ACTIVO', false, NULL, CURRENT_DATE - 890, NULL),
  (3, 2, CURRENT_DATE - 400, 'TAG-DEMO-0003', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-02', 'ACTIVO', false, NULL, CURRENT_DATE - 400, NULL),
  (4, 3, CURRENT_DATE - 390, 'TAG-DEMO-0004', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-03', 'ACTIVO', false, NULL, CURRENT_DATE - 390, NULL),
  (5, 4, CURRENT_DATE - 690, 'TAG-DEMO-0005', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-04', 'BLOQUEADO', false, NULL, CURRENT_DATE - 690, NULL),
  (6, 5, CURRENT_DATE - 1190, 'TAG-DEMO-0006', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-05', 'BAJA', false, NULL, CURRENT_DATE - 1190, NULL),
  (7, 6, CURRENT_DATE - 810, 'TAG-DEMO-0007', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-06', 'ACTIVO', false, NULL, CURRENT_DATE - 810, NULL),
  (8, 7, CURRENT_DATE - 750, 'TAG-DEMO-0008', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-07', 'ACTIVO', false, NULL, CURRENT_DATE - 750, NULL),
  (9, 8, CURRENT_DATE - 630, 'TAG-DEMO-0009', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-08', 'ACTIVO', false, NULL, CURRENT_DATE - 630, NULL),
  (10, 9, CURRENT_DATE - 590, 'TAG-DEMO-0010', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-09', 'ACTIVO', false, NULL, CURRENT_DATE - 590, NULL),
  (11, 10, CURRENT_DATE - 570, 'TAG-DEMO-0011', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-10', 'ACTIVO', false, NULL, CURRENT_DATE - 570, NULL),
  (12, 11, CURRENT_DATE - 550, 'TAG-DEMO-0012', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-11', 'ACTIVO', false, NULL, CURRENT_DATE - 550, NULL),
  (13, 12, CURRENT_DATE - 510, 'TAG-DEMO-0013', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-12', 'ACTIVO', true, NULL, CURRENT_DATE - 510, NULL),
  (14, 13, CURRENT_DATE - 470, 'TAG-DEMO-0014', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-13', 'ACTIVO', true, NULL, CURRENT_DATE - 470, NULL),
  (15, 14, CURRENT_DATE - 440, 'TAG-DEMO-0015', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-14', 'ACTIVO', false, NULL, CURRENT_DATE - 440, NULL),
  (16, 15, CURRENT_DATE - 420, 'TAG-DEMO-0016', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-15', 'ACTIVO', false, NULL, CURRENT_DATE - 420, NULL),
  (17, 16, CURRENT_DATE - 60, 'TAG-DEMO-0017', 'CLI-DEMO-01', 'CTA-DEMO-01', 'SUB-16', 'PENDIENTE', false, NULL, CURRENT_DATE - 60, NULL);

INSERT INTO tag_autopista (tag_id, autopista_id) VALUES
  (2, 1),
  (2, 3),
  (3, 1),
  (3, 2),
  (3, 4),
  (4, 1),
  (4, 3),
  (4, 5),
  (5, 1),
  (5, 4),
  (5, 6),
  (6, 1),
  (6, 5),
  (7, 1),
  (7, 2),
  (7, 6),
  (8, 1),
  (8, 3),
  (9, 1),
  (9, 2),
  (9, 4),
  (10, 1),
  (10, 3),
  (10, 5),
  (11, 1),
  (11, 4),
  (11, 6),
  (12, 1),
  (12, 5),
  (13, 1),
  (13, 2),
  (13, 6),
  (14, 1),
  (14, 3),
  (15, 1),
  (15, 2),
  (15, 4),
  (16, 1),
  (16, 3),
  (16, 5),
  (17, 1),
  (17, 4),
  (17, 6);

INSERT INTO tipo_documento_catalogo (id, codigo, descripcion, activo) VALUES
  (1, 'LICENCIA', 'Licencia de conducir', true),
  (2, 'AUTORIZACION', 'Autorización para conducir', true),
  (3, 'POLIZA', 'Póliza de seguro', true),
  (4, 'VTV', 'Certificado de VTV', true),
  (5, 'ACTA_MULTA', 'Acta de infracción', true),
  (6, 'CEDULA', 'Cédula del vehículo', true),
  (7, 'COMPROBANTE_PAGO', 'Comprobante de pago', true),
  (8, 'OTRO', 'Otro (ejemplo, inactivo)', false);

-- documento: el 20 está anulado (anular, no borrar).
INSERT INTO documento (id, tipo_documento_id, estado) VALUES
  (1, 1, 'vigente'),
  (2, 1, 'vigente'),
  (3, 1, 'vigente'),
  (4, 2, 'vigente'),
  (5, 2, 'vigente'),
  (6, 2, 'vigente'),
  (7, 2, 'vigente'),
  (8, 2, 'vigente'),
  (9, 3, 'vigente'),
  (10, 3, 'vigente'),
  (11, 3, 'vigente'),
  (12, 4, 'vigente'),
  (13, 4, 'vigente'),
  (14, 4, 'vigente'),
  (15, 5, 'vigente'),
  (16, 5, 'vigente'),
  (17, 7, 'vigente'),
  (18, 6, 'vigente'),
  (19, 6, 'vigente'),
  (20, 8, 'anulado');

-- documento_version: hash calculado de un texto de ejemplo (no hay archivos reales). La póliza POL-DEMO-0002 y la VTV de AA001ZZ tienen versión 2.
INSERT INTO documento_version (id, documento_id, nro_version, sha256, tamanio, tipo_detectado, nombre_original, subido_por, vigente_desde, vigente_hasta, creado) VALUES
  (1, 1, 1, encode(sha256(convert_to('demo-doc-1-v1', 'UTF8')), 'hex'), 153248, 'application/pdf', 'licencia-acosta.pdf', 2, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (2, 2, 1, encode(sha256(convert_to('demo-doc-2-v1', 'UTF8')), 'hex'), 156419, 'application/pdf', 'licencia-benitez.pdf', 2, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (3, 3, 1, encode(sha256(convert_to('demo-doc-3-v1', 'UTF8')), 'hex'), 159590, 'application/pdf', 'licencia-costa.pdf', 2, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (4, 4, 1, encode(sha256(convert_to('demo-doc-4-v1', 'UTF8')), 'hex'), 162761, 'application/pdf', 'autorizacion-acosta.pdf', 3, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (5, 5, 1, encode(sha256(convert_to('demo-doc-5-v1', 'UTF8')), 'hex'), 165932, 'application/pdf', 'autorizacion-benitez.pdf', 3, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (6, 6, 1, encode(sha256(convert_to('demo-doc-6-v1', 'UTF8')), 'hex'), 169103, 'application/pdf', 'autorizacion-costa.pdf', 3, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (7, 7, 1, encode(sha256(convert_to('demo-doc-7-v1', 'UTF8')), 'hex'), 172274, 'application/pdf', 'autorizacion-estevez.pdf', 3, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (8, 8, 1, encode(sha256(convert_to('demo-doc-8-v1', 'UTF8')), 'hex'), 175445, 'application/pdf', 'autorizacion-juarez.pdf', 3, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (9, 9, 1, encode(sha256(convert_to('demo-doc-9-v1', 'UTF8')), 'hex'), 178616, 'application/pdf', 'poliza-0001.pdf', 1, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (10, 10, 1, encode(sha256(convert_to('demo-doc-10-v1', 'UTF8')), 'hex'), 181787, 'application/pdf', 'poliza-0002.pdf', 1, CURRENT_DATE - 400, CURRENT_DATE - 200, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (11, 10, 2, encode(sha256(convert_to('demo-doc-10-v2', 'UTF8')), 'hex'), 181864, 'application/pdf', 'poliza-0002-v2.pdf', 1, CURRENT_DATE - 200, NULL, (CURRENT_DATE - 200 + TIME '10:00')::timestamptz),
  (12, 11, 1, encode(sha256(convert_to('demo-doc-11-v1', 'UTF8')), 'hex'), 184958, 'application/pdf', 'poliza-0004.pdf', 1, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (13, 12, 1, encode(sha256(convert_to('demo-doc-12-v1', 'UTF8')), 'hex'), 188129, 'application/pdf', 'vtv-aa001zz.pdf', 1, CURRENT_DATE - 400, CURRENT_DATE - 200, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (14, 12, 2, encode(sha256(convert_to('demo-doc-12-v2', 'UTF8')), 'hex'), 188206, 'application/pdf', 'vtv-aa001zz-v2.pdf', 1, CURRENT_DATE - 200, NULL, (CURRENT_DATE - 200 + TIME '10:00')::timestamptz),
  (15, 13, 1, encode(sha256(convert_to('demo-doc-13-v1', 'UTF8')), 'hex'), 191300, 'application/pdf', 'vtv-aa003zz.pdf', 1, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (16, 14, 1, encode(sha256(convert_to('demo-doc-14-v1', 'UTF8')), 'hex'), 194471, 'application/pdf', 'vtv-aa006zz.pdf', 1, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (17, 15, 1, encode(sha256(convert_to('demo-doc-15-v1', 'UTF8')), 'hex'), 197642, 'application/pdf', 'acta-demo-001.pdf', 2, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (18, 16, 1, encode(sha256(convert_to('demo-doc-16-v1', 'UTF8')), 'hex'), 200813, 'application/pdf', 'acta-demo-002.pdf', 2, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (19, 17, 1, encode(sha256(convert_to('demo-doc-17-v1', 'UTF8')), 'hex'), 203984, 'application/pdf', 'pago-acta-demo-003.pdf', 2, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (20, 18, 1, encode(sha256(convert_to('demo-doc-18-v1', 'UTF8')), 'hex'), 207155, 'application/pdf', 'cedula-aa001zz.pdf', 1, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (21, 19, 1, encode(sha256(convert_to('demo-doc-19-v1', 'UTF8')), 'hex'), 210326, 'application/pdf', 'cedula-aa003zz.pdf', 1, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz),
  (22, 20, 1, encode(sha256(convert_to('demo-doc-20-v1', 'UTF8')), 'hex'), 213497, 'application/pdf', 'nota-acosta.pdf', 6, CURRENT_DATE - 400, NULL, (CURRENT_DATE - 400 + TIME '10:00')::timestamptz);

INSERT INTO documento_vinculo (id, documento_id, entidad_tipo, entidad_id) VALUES
  (1, 1, 'licencia', 2),
  (2, 2, 'licencia', 3),
  (3, 3, 'licencia', 4),
  (4, 4, 'autorizacion', 1),
  (5, 5, 'autorizacion', 2),
  (6, 6, 'autorizacion', 3),
  (7, 7, 'autorizacion', 5),
  (8, 8, 'autorizacion', 10),
  (9, 9, 'poliza', 1),
  (10, 10, 'poliza', 2),
  (11, 11, 'poliza', 4),
  (12, 12, 'vtv', 3),
  (13, 13, 'vtv', 5),
  (14, 14, 'vtv', 8),
  (15, 15, 'multa', 1),
  (16, 16, 'multa', 2),
  (17, 17, 'multa', 3),
  (18, 18, 'vehiculo', 1),
  (19, 19, 'vehiculo', 3),
  (20, 20, 'persona', 1);

-- notificacion: bandeja de cada usuario, coherente con los casos de prueba.
INSERT INTO notificacion (id, destinatario_id, tipo, entidad, mensaje, creada, leida, enviada_correo) VALUES
  (1, 1, 'vtv_vencida', 'vtv:5', 'La VTV de AA003ZZ venció hace 3 días.', (CURRENT_DATE - 3 + TIME '07:00')::timestamptz, false, true),
  (2, 1, 'vtv_por_vencer', 'vtv:4', 'La VTV de AA002ZZ vence en 12 días.', (CURRENT_DATE - 2 + TIME '07:00')::timestamptz, false, false),
  (3, 1, 'vtv_vencida', 'vtv:15', 'La VTV de AA013ZZ venció hace 40 días.', (CURRENT_DATE - 40 + TIME '07:00')::timestamptz, true, true),
  (4, 1, 'poliza_por_vencer', 'poliza:2', 'La póliza POL-DEMO-0002 vence en 25 días.', (CURRENT_DATE - 5 + TIME '07:00')::timestamptz, false, false),
  (5, 1, 'asignacion_con_problemas', 'asignacion:3', 'Costa, Valeria tiene la licencia vencida y conduce AA002ZZ.', (CURRENT_DATE - 11 + TIME '07:00')::timestamptz, false, false),
  (6, 1, 'autorizacion_pendiente', 'autorizacion_conducir:5', 'Hay una autorización nueva de Estévez, Paula para revisar.', (CURRENT_DATE - 6 + TIME '07:00')::timestamptz, false, false),
  (7, 1, 'autorizacion_pendiente', 'autorizacion_conducir:19', 'Hay una autorización nueva de Torres, Camila para revisar.', (CURRENT_DATE - 3 + TIME '07:00')::timestamptz, false, false),
  (8, 7, 'vehiculo_sin_poliza', 'vehiculo:20', 'AA020ZZ no tiene póliza vigente.', (CURRENT_DATE - 14 + TIME '07:00')::timestamptz, false, false),
  (9, 7, 'vtv_por_vencer', 'vtv:11', 'La VTV de AA009ZZ vence en 20 días.', (CURRENT_DATE - 1 + TIME '07:00')::timestamptz, false, false),
  (10, 2, 'licencia_por_vencer', 'licencia:3', 'La licencia de Benítez, Martín vence en 18 días.', (CURRENT_DATE - 12 + TIME '07:00')::timestamptz, false, false),
  (11, 2, 'licencia_por_vencer', 'licencia:13', 'La licencia de Ledesma, Carla vence en 25 días.', (CURRENT_DATE - 5 + TIME '07:00')::timestamptz, true, false),
  (12, 2, 'licencia_vencida', 'licencia:4', 'La licencia de Costa, Valeria venció hace 12 días.', (CURRENT_DATE - 12 + TIME '07:00')::timestamptz, true, true),
  (13, 2, 'multa_sin_responsable', 'multa:1', 'El acta ACTA-DEMO-001 no tiene responsable confirmado.', (CURRENT_DATE - 28 + TIME '07:00')::timestamptz, false, false),
  (14, 2, 'multa_sin_responsable', 'multa:4', 'El acta ACTA-DEMO-004 no tiene responsable confirmado.', (CURRENT_DATE - 13 + TIME '07:00')::timestamptz, false, false),
  (15, 9, 'baja_glm', 'persona:4', 'GLM informó la baja de Duarte, Nicolás. Se cerraron sus asignaciones.', (CURRENT_DATE - 20 + TIME '07:00')::timestamptz, true, true),
  (16, 3, 'autorizacion_rechazada', 'autorizacion_conducir:10', 'Mantenimiento rechazó la autorización de Juárez, Tomás.', (CURRENT_DATE - 290 + TIME '07:00')::timestamptz, true, false),
  (17, 4, 'consumo_sin_producto', 'consumo:8', 'Hay consumos de YPF sin producto identificado.', (CURRENT_DATE - 2 + TIME '07:00')::timestamptz, false, false),
  (18, 4, 'tarjeta_sin_numero', 'tarjeta:15', 'La tarjeta de AA016ZZ todavía no tiene número de YPF.', (CURRENT_DATE - 55 + TIME '07:00')::timestamptz, false, false),
  (19, 5, 'tag_pendiente', 'tag:17', 'El tag de AA016ZZ está pendiente de entrega.', (CURRENT_DATE - 58 + TIME '07:00')::timestamptz, true, false),
  (20, 6, 'sync_glm_pendiente', 'sync_glm:22', 'Llegó un alta de GLM (DEMO-021) sin procesar.', (CURRENT_DATE + 0 + TIME '07:00')::timestamptz, false, false);

-- aviso_enviado: evento = "tabla:id" porque el esquema v1.0 no tiene columna de entidad (pendiente con Mariano).
INSERT INTO aviso_enviado (id, evento, umbral, destinatario_id, canal, fecha_envio) VALUES
  (1, 'vtv:5', '30d', 1, 'bandeja', (CURRENT_DATE - 33 + TIME '07:00')::timestamptz),
  (2, 'vtv:5', '7d', 1, 'bandeja', (CURRENT_DATE - 10 + TIME '07:00')::timestamptz),
  (3, 'vtv:5', 'vencido', 1, 'correo', (CURRENT_DATE - 3 + TIME '07:00')::timestamptz),
  (4, 'vtv:4', '30d', 1, 'bandeja', (CURRENT_DATE - 18 + TIME '07:00')::timestamptz),
  (5, 'vtv:11', '30d', 7, 'bandeja', (CURRENT_DATE - 10 + TIME '07:00')::timestamptz),
  (6, 'vtv:15', 'vencido', 1, 'correo', (CURRENT_DATE - 40 + TIME '07:00')::timestamptz),
  (7, 'poliza:2', '30d', 1, 'bandeja', (CURRENT_DATE - 5 + TIME '07:00')::timestamptz),
  (8, 'licencia:3', '30d', 2, 'bandeja', (CURRENT_DATE - 12 + TIME '07:00')::timestamptz),
  (9, 'licencia:13', '30d', 2, 'bandeja', (CURRENT_DATE - 5 + TIME '07:00')::timestamptz),
  (10, 'licencia:4', '30d', 2, 'bandeja', (CURRENT_DATE - 42 + TIME '07:00')::timestamptz),
  (11, 'licencia:4', '7d', 2, 'bandeja', (CURRENT_DATE - 19 + TIME '07:00')::timestamptz),
  (12, 'licencia:4', 'vencido', 2, 'correo', (CURRENT_DATE - 12 + TIME '07:00')::timestamptz),
  (13, 'multa:1', 'sin_responsable', 2, 'bandeja', (CURRENT_DATE - 28 + TIME '07:00')::timestamptz),
  (14, 'multa:4', 'sin_responsable', 2, 'bandeja', (CURRENT_DATE - 13 + TIME '07:00')::timestamptz),
  (15, 'asignacion:3', 'problema', 1, 'bandeja', (CURRENT_DATE - 11 + TIME '07:00')::timestamptz);

-- auditoria_evento: muestra de eventos (en la realidad cada cambio deja uno). IPs y request_id de ejemplo.
INSERT INTO auditoria_evento (id, fecha, usuario_id, ip, request_id, accion, entidad, entidad_id, valor_anterior, valor_nuevo, motivo, fuente) VALUES
  (1, (CURRENT_DATE - 900 + TIME '11:00')::timestamptz, 6, '10.0.0.16', 'REQ-DEMO-0001', 'alta', 'vehiculo', 1, NULL, '{"dominio": "AA001ZZ", "marca": "Toyota", "modelo": "Hilux"}'::jsonb, NULL, 'aplicacion'),
  (2, (CURRENT_DATE - 400 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0002', 'alta', 'vehiculo', 3, NULL, '{"dominio": "AA003ZZ", "marca": "Iveco", "modelo": "Daily"}'::jsonb, NULL, 'aplicacion'),
  (3, (CURRENT_DATE - 300 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0003', 'alta', 'asignacion', 1, NULL, '{"persona": "DEMO-001", "vehiculo": "AA001ZZ"}'::jsonb, 'Asignación inicial', 'aplicacion'),
  (4, (CURRENT_DATE - 300 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0004', 'alta', 'asignacion', 3, NULL, '{"persona": "DEMO-003", "vehiculo": "AA002ZZ"}'::jsonb, 'Asignación inicial', 'aplicacion'),
  (5, (CURRENT_DATE - 290 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0005', 'modificacion', 'autorizacion_conducir', 1, '{"revision": "pendiente"}'::jsonb, '{"revision": "si"}'::jsonb, NULL, 'aplicacion'),
  (6, (CURRENT_DATE - 290 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0006', 'modificacion', 'autorizacion_conducir', 10, '{"revision": "pendiente"}'::jsonb, '{"revision": "no"}'::jsonb, 'Documentación incompleta (ejemplo)', 'aplicacion'),
  (7, (CURRENT_DATE - 200 + TIME '11:00')::timestamptz, 6, '10.0.0.16', 'REQ-DEMO-0007', 'alta', 'poliza', 4, NULL, '{"nro_poliza": "POL-DEMO-0004"}'::jsonb, 'Renovación de POL-DEMO-0003', 'aplicacion'),
  (8, (CURRENT_DATE - 200 + TIME '11:00')::timestamptz, 2, '10.0.0.12', 'REQ-DEMO-0008', 'alta', 'documento', 10, NULL, '{"nro_version": 2}'::jsonb, 'Nueva versión de la póliza', 'aplicacion'),
  (9, (CURRENT_DATE - 150 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0009', 'modificacion', 'vehiculo', 19, '{"estado": "activo"}'::jsonb, '{"estado": "taller"}'::jsonb, 'Falla de motor', 'aplicacion'),
  (10, (CURRENT_DATE - 120 + TIME '11:00')::timestamptz, 2, '10.0.0.12', 'REQ-DEMO-0010', 'modificacion', 'multa', 20, '{"responsable_id": null}'::jsonb, '{"responsable_id": 2}'::jsonb, NULL, 'aplicacion'),
  (11, (CURRENT_DATE - 100 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0011', 'alta', 'poliza_vehiculo', 7, NULL, '{"poliza": "POL-DEMO-0002", "vehiculo": "AB004ZZ"}'::jsonb, NULL, 'aplicacion'),
  (12, (CURRENT_DATE - 90 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0012', 'modificacion', 'vehiculo', 19, '{"estado": "taller"}'::jsonb, '{"estado": "baja"}'::jsonb, 'Reparación antieconómica (ejemplo)', 'aplicacion'),
  (13, (CURRENT_DATE - 60 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0013', 'modificacion', 'vehiculo', 5, '{"estado": "activo"}'::jsonb, '{"estado": "baja"}'::jsonb, 'Fin de vida útil (ejemplo)', 'aplicacion'),
  (14, (CURRENT_DATE - 60 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0014', 'anulacion', 'asignacion', 6, NULL, '{"vigente_hasta": "baja del vehículo"}'::jsonb, 'Baja del vehículo', 'aplicacion'),
  (15, (CURRENT_DATE - 20 + TIME '11:00')::timestamptz, NULL, NULL, 'REQ-DEMO-0015', 'modificacion', 'persona', 4, '{"estado": "alta"}'::jsonb, '{"estado": "baja"}'::jsonb, 'Baja informada por GLM', 'trigger'),
  (16, (CURRENT_DATE - 20 + TIME '11:00')::timestamptz, NULL, NULL, 'REQ-DEMO-0016', 'anulacion', 'asignacion', 4, NULL, '{"vigente_hasta": "baja de la persona"}'::jsonb, 'Baja de la persona', 'trigger'),
  (17, (CURRENT_DATE - 15 + TIME '11:00')::timestamptz, 6, '10.0.0.16', 'REQ-DEMO-0017', 'alta', 'vehiculo', 20, NULL, '{"dominio": "AA020ZZ", "marca": "Toyota", "modelo": "Hilux"}'::jsonb, NULL, 'aplicacion'),
  (18, (CURRENT_DATE - 10 + TIME '11:00')::timestamptz, 4, '10.0.0.14', 'REQ-DEMO-0018', 'modificacion', 'vehiculo', 1, '{"centro_costo": "CC-DEMO-100"}'::jsonb, '{"centro_costo": "CC-DEMO-300"}'::jsonb, 'Reasignación de área', 'aplicacion'),
  (19, (CURRENT_DATE - 5 + TIME '11:00')::timestamptz, 1, '10.0.0.11', 'REQ-DEMO-0019', 'modificacion', 'vehiculo', 4, '{"estado": "activo"}'::jsonb, '{"estado": "taller"}'::jsonb, 'Service de 60.000 km', 'aplicacion'),
  (20, (CURRENT_DATE - 5 + TIME '11:00')::timestamptz, 4, '10.0.0.14', 'REQ-DEMO-0020', 'modificacion', 'tarjeta', 4, '{"estado": "vigente"}'::jsonb, '{"estado": "bloqueada"}'::jsonb, 'Vehículo en taller', 'aplicacion');

-- sync_glm (PROVISORIA): formato de ejemplo hasta conocer el real de GLM. El último (DEMO-021) queda sin procesar.
INSERT INTO sync_glm (id, recibido, legajo, tipo, contenido, resultado, procesado) VALUES
  (1, (CURRENT_DATE - 1480 + TIME '06:00')::timestamptz, 'DEMO-001', 'alta', '{"legajo": "DEMO-001", "apellido_nombre": "Acosta, Lucía", "dni": "DEMO-1001", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (2, (CURRENT_DATE - 1460 + TIME '06:00')::timestamptz, 'DEMO-002', 'alta', '{"legajo": "DEMO-002", "apellido_nombre": "Benítez, Martín", "dni": "DEMO-1002", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (3, (CURRENT_DATE - 1440 + TIME '06:00')::timestamptz, 'DEMO-003', 'alta', '{"legajo": "DEMO-003", "apellido_nombre": "Costa, Valeria", "dni": "DEMO-1003", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (4, (CURRENT_DATE - 1420 + TIME '06:00')::timestamptz, 'DEMO-004', 'alta', '{"legajo": "DEMO-004", "apellido_nombre": "Duarte, Nicolás", "dni": "DEMO-1004", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (5, (CURRENT_DATE - 1400 + TIME '06:00')::timestamptz, 'DEMO-005', 'alta', '{"legajo": "DEMO-005", "apellido_nombre": "Estévez, Paula", "dni": "DEMO-1005", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (6, (CURRENT_DATE - 1380 + TIME '06:00')::timestamptz, 'DEMO-006', 'alta', '{"legajo": "DEMO-006", "apellido_nombre": "Fernández, Diego", "dni": "DEMO-1006", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (7, (CURRENT_DATE - 1360 + TIME '06:00')::timestamptz, 'DEMO-007', 'alta', '{"legajo": "DEMO-007", "apellido_nombre": "Gómez, Rocío", "dni": "DEMO-1007", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (8, (CURRENT_DATE - 1340 + TIME '06:00')::timestamptz, 'DEMO-008', 'alta', '{"legajo": "DEMO-008", "apellido_nombre": "Herrera, Pablo", "dni": "DEMO-1008", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (9, (CURRENT_DATE - 1320 + TIME '06:00')::timestamptz, 'DEMO-009', 'alta', '{"legajo": "DEMO-009", "apellido_nombre": "Ibarra, Sofía", "dni": "DEMO-1009", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (10, (CURRENT_DATE - 1300 + TIME '06:00')::timestamptz, 'DEMO-010', 'alta', '{"legajo": "DEMO-010", "apellido_nombre": "Juárez, Tomás", "dni": "DEMO-1010", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (11, (CURRENT_DATE - 1280 + TIME '06:00')::timestamptz, 'DEMO-011', 'alta', '{"legajo": "DEMO-011", "apellido_nombre": "Ledesma, Carla", "dni": "DEMO-1011", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (12, (CURRENT_DATE - 1260 + TIME '06:00')::timestamptz, 'DEMO-012', 'alta', '{"legajo": "DEMO-012", "apellido_nombre": "Molina, Andrés", "dni": "DEMO-1012", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (13, (CURRENT_DATE - 1240 + TIME '06:00')::timestamptz, 'DEMO-013', 'alta', '{"legajo": "DEMO-013", "apellido_nombre": "Núñez, Florencia", "dni": "DEMO-1013", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (14, (CURRENT_DATE - 1220 + TIME '06:00')::timestamptz, 'DEMO-014', 'alta', '{"legajo": "DEMO-014", "apellido_nombre": "Ortiz, Gabriel", "dni": "DEMO-1014", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (15, (CURRENT_DATE - 1200 + TIME '06:00')::timestamptz, 'DEMO-015', 'alta', '{"legajo": "DEMO-015", "apellido_nombre": "Paz, Julieta", "dni": "DEMO-1015", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (16, (CURRENT_DATE - 1180 + TIME '06:00')::timestamptz, 'DEMO-016', 'alta', '{"legajo": "DEMO-016", "apellido_nombre": "Quiroga, Ramiro", "dni": "DEMO-1016", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (17, (CURRENT_DATE - 1160 + TIME '06:00')::timestamptz, 'DEMO-017', 'alta', '{"legajo": "DEMO-017", "apellido_nombre": "Ríos, Micaela", "dni": "DEMO-1017", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (18, (CURRENT_DATE - 1140 + TIME '06:00')::timestamptz, 'DEMO-018', 'alta', '{"legajo": "DEMO-018", "apellido_nombre": "Suárez, Hernán", "dni": "DEMO-1018", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (19, (CURRENT_DATE - 1120 + TIME '06:00')::timestamptz, 'DEMO-019', 'alta', '{"legajo": "DEMO-019", "apellido_nombre": "Torres, Camila", "dni": "DEMO-1019", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (20, (CURRENT_DATE - 200 + TIME '06:00')::timestamptz, 'DEMO-018', 'baja', '{"legajo": "DEMO-018", "fecha_baja": "hace 200 días", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (21, (CURRENT_DATE - 20 + TIME '06:00')::timestamptz, 'DEMO-004', 'baja', '{"legajo": "DEMO-004", "fecha_baja": "hace 20 días", "origen": "ejemplo"}'::jsonb, 'ok', true),
  (22, (CURRENT_DATE + 0 + TIME '06:00')::timestamptz, 'DEMO-021', 'alta', '{"legajo": "DEMO-021", "apellido_nombre": "Zárate, Ivana", "dni": "DEMO-1021", "origen": "ejemplo"}'::jsonb, NULL, false);

-- estado_tag: valores a confirmar con Comercial.
INSERT INTO estado_tag (id, codigo, descripcion, activo) VALUES
  (1, 'ACTIVO', 'Activo (ejemplo)', true),
  (2, 'BLOQUEADO', 'Bloqueado (ejemplo)', true),
  (3, 'PERDIDO', 'Perdido (ejemplo)', true),
  (4, 'BAJA', 'Dado de baja (ejemplo)', true),
  (5, 'PENDIENTE', 'Pendiente de entrega (ejemplo)', true);

-- Las secuencias siguen después del último id cargado.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['usuario', 'persona', 'persona_estado', 'categoria_licencia', 'licencia', 'autorizacion_conducir', 'vehiculo', 'vehiculo_estado', 'asignacion', 'poliza', 'poliza_vehiculo', 'vtv', 'multa', 'centro_costo', 'vehiculo_finanzas', 'perfil', 'producto', 'pin', 'tarjeta', 'tarjeta_periodo', 'consumo', 'autopista', 'tag', 'tipo_documento_catalogo', 'documento', 'documento_version', 'documento_vinculo', 'notificacion', 'aviso_enviado', 'auditoria_evento', 'sync_glm', 'estado_tag']
  LOOP
    EXECUTE format('SELECT setval(pg_get_serial_sequence(%L, ''id''), (SELECT max(id) FROM %I))', t, t);
  END LOOP;
END $$;

COMMIT;
