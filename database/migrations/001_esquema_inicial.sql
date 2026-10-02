-- ============================================================
-- AUBASA · Plataforma de Gestión de Flota
-- Esquema completo de la base de datos (v1.0)
-- Generado a partir de "AUBASA_Esquema_Base_Datos_Jorge.pdf"
-- Orden de creación respetado (sección 1.1 del documento): ninguna
-- tabla referencia a otra que todavía no existe.
--
-- Tablas marcadas "PROVISORIA" (persona, persona_estado, sync_glm):
-- se crean con los campos ya acordados. Cuando Matías confirme el
-- formato real de GLM, se ajustan con una migración ADICIONAL —
-- no reescribir este archivo una vez corrido en el servidor.
-- ============================================================


-- ============================================================
-- (a) IDENTIDAD — sin dependencias
-- ============================================================

-- 1. usuario — cada persona que entra a la plataforma con su cuenta de dominio
CREATE TABLE usuario (
  id          BIGSERIAL PRIMARY KEY,
  ad_id       VARCHAR(100) NOT NULL UNIQUE,  -- identificador en Active Directory
  usuario     VARCHAR(60)  NOT NULL UNIQUE,  -- nombre de usuario de dominio
  nombre      VARCHAR(150) NOT NULL,
  correo      VARCHAR(150),
  activo      BOOLEAN      NOT NULL DEFAULT true,
  creado      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2. persona — PROVISORIA, ver sección 10/11 del documento (confirmar con GLM)
CREATE TABLE persona (
  id              BIGSERIAL PRIMARY KEY,
  legajo          VARCHAR(20)  NOT NULL UNIQUE,
  apellido_nombre VARCHAR(150) NOT NULL,
  dni             VARCHAR(15)  NOT NULL,
  creado          TIMESTAMPTZ  NOT NULL DEFAULT now()
  -- campos pendientes de G-05 (columnas reales de GLM): posible cuil, email, etc.
  -- No agregar columnas de GLM todavía: cuando Matías confirme el formato real,
  -- se agrega con una migración nueva, sin reescribir esta.
);

-- 3. persona_estado — PROVISORIA, ver sección 10/11. Historial de alta/baja con vigencia.
CREATE TABLE persona_estado (
  id            BIGSERIAL PRIMARY KEY,
  persona_id    BIGINT NOT NULL REFERENCES persona(id),
  estado        VARCHAR(10) NOT NULL CHECK (estado IN ('alta','baja')),
  origen        VARCHAR(30) NOT NULL DEFAULT 'sistemas', -- 'glm' o 'sistemas'
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_persona_estado_vigente
  ON persona_estado (persona_id) WHERE vigente_hasta IS NULL;


-- ============================================================
-- (b) LICENCIAS Y AUTORIZACIÓN
-- ============================================================

-- 4. categoria_licencia — catálogo de categorías de licencia de conducir (A, B, C...)
CREATE TABLE categoria_licencia (
  id     BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE
);

-- 5. licencia — un registro de licencia por persona, con su vigencia
CREATE TABLE licencia (
  id            BIGSERIAL PRIMARY KEY,
  persona_id    BIGINT NOT NULL REFERENCES persona(id),
  nro_registro  VARCHAR(30) NOT NULL,
  vencimiento   DATE NOT NULL,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_licencia_vigente
  ON licencia (persona_id) WHERE vigente_hasta IS NULL;

-- 6. licencia_categoria — muchos a muchos: una licencia puede tener varias categorías
CREATE TABLE licencia_categoria (
  licencia_id  BIGINT NOT NULL REFERENCES licencia(id),
  categoria_id BIGINT NOT NULL REFERENCES categoria_licencia(id),
  PRIMARY KEY (licencia_id, categoria_id)
);

-- 7. autorizacion_conducir — la autorización que sube Legales y revisa Mantenimiento
CREATE TABLE autorizacion_conducir (
  id            BIGSERIAL PRIMARY KEY,
  persona_id    BIGINT NOT NULL REFERENCES persona(id),
  revision      VARCHAR(12) NOT NULL DEFAULT 'pendiente'
                CHECK (revision IN ('pendiente','si','no')),
  observacion   VARCHAR(500),
  revisado_por  BIGINT REFERENCES usuario(id),
  revisado_fecha DATE,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_autorizacion_vigente
  ON autorizacion_conducir (persona_id) WHERE vigente_hasta IS NULL;


-- ============================================================
-- (c) VEHÍCULOS
-- ============================================================

-- 8. vehiculo — el vehículo interno. El dominio se normaliza (mayúsculas, sin espacios)
CREATE TABLE vehiculo (
  id                     BIGSERIAL PRIMARY KEY,
  dominio                VARCHAR(10) NOT NULL UNIQUE,
  marca                  VARCHAR(60) NOT NULL,
  modelo                 VARCHAR(60) NOT NULL,
  categoria_requerida_id BIGINT REFERENCES categoria_licencia(id),
  creado                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. vehiculo_estado — historial de estado del vehículo: activo, en taller o baja
CREATE TABLE vehiculo_estado (
  id            BIGSERIAL PRIMARY KEY,
  vehiculo_id   BIGINT NOT NULL REFERENCES vehiculo(id),
  estado        VARCHAR(10) NOT NULL CHECK (estado IN ('activo','taller','baja')),
  motivo        VARCHAR(300),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);
CREATE INDEX ix_vehiculo_estado_vigente
  ON vehiculo_estado (vehiculo_id) WHERE vigente_hasta IS NULL;

-- 10. asignacion — conductor asignado a un vehículo
-- Las tres validaciones (categoría, vigencia de licencia, autorización) las
-- aplica la lógica de la aplicación al insertar, no la base.
CREATE TABLE asignacion (
  id            BIGSERIAL PRIMARY KEY,
  persona_id    BIGINT NOT NULL REFERENCES persona(id),
  vehiculo_id   BIGINT NOT NULL REFERENCES vehiculo(id),
  motivo        VARCHAR(300),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);
CREATE INDEX ix_asignacion_vehiculo_vigente
  ON asignacion (vehiculo_id) WHERE vigente_hasta IS NULL;
CREATE INDEX ix_asignacion_persona_vigente
  ON asignacion (persona_id) WHERE vigente_hasta IS NULL;
-- Nota: no se puede repetir el mismo par persona_id/vehiculo_id en dos
-- períodos superpuestos: se valida en la aplicación, no con un constraint
-- de rango (para no atar la base a una extensión de PostgreSQL todavía no
-- confirmada).

-- 11. poliza — la póliza en sí, independiente de a qué vehículos cubre
CREATE TABLE poliza (
  id            BIGSERIAL PRIMARY KEY,
  nro_poliza    VARCHAR(40) NOT NULL,
  aseguradora   VARCHAR(100) NOT NULL,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);

-- 12. poliza_vehiculo — qué vehículos cubre cada póliza, con su propio período
CREATE TABLE poliza_vehiculo (
  id            BIGSERIAL PRIMARY KEY,
  poliza_id     BIGINT NOT NULL REFERENCES poliza(id),
  vehiculo_id   BIGINT NOT NULL REFERENCES vehiculo(id),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);
CREATE INDEX ix_poliza_vehiculo_vigente
  ON poliza_vehiculo (vehiculo_id) WHERE vigente_hasta IS NULL;

-- 13. vtv — vigente_hasta es, en los hechos, la fecha de vencimiento
CREATE TABLE vtv (
  id            BIGSERIAL PRIMARY KEY,
  vehiculo_id   BIGINT NOT NULL REFERENCES vehiculo(id),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE NOT NULL
);
CREATE INDEX ix_vtv_vehiculo ON vtv (vehiculo_id);


-- ============================================================
-- (d) MULTAS
-- ============================================================

-- 14. multa — un hecho fechado, no una historia por vigencia
CREATE TABLE multa (
  id                 BIGSERIAL PRIMARY KEY,
  nro_acta           VARCHAR(30) NOT NULL UNIQUE,
  vehiculo_id        BIGINT NOT NULL REFERENCES vehiculo(id),
  fecha_infraccion   DATE NOT NULL,
  vence_pago_voluntario DATE NOT NULL,
  responsable_id     BIGINT REFERENCES persona(id), -- nulo hasta que RRHH confirma
  estado_pago        VARCHAR(10) NOT NULL DEFAULT 'pendiente'
                      CHECK (estado_pago IN ('pendiente','pagada')),
  fecha_pago         DATE,
  creado             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_multa_vehiculo ON multa (vehiculo_id);
CREATE INDEX ix_multa_responsable ON multa (responsable_id);


-- ============================================================
-- (e) FINANZAS — VEHÍCULO
-- ============================================================

-- 15. centro_costo — catálogo compartido entre Mantenimiento/Finanzas y Finanzas
CREATE TABLE centro_costo (
  id       BIGSERIAL PRIMARY KEY,
  codigo   VARCHAR(20) NOT NULL UNIQUE,
  nombre   VARCHAR(150) NOT NULL,
  gerencia VARCHAR(100) NOT NULL,
  activo   BOOLEAN NOT NULL DEFAULT true -- baja sin borrado
);

-- 16. vehiculo_finanzas — centro de costo y tipo de flota del vehículo, con historial
CREATE TABLE vehiculo_finanzas (
  id            BIGSERIAL PRIMARY KEY,
  vehiculo_id   BIGINT NOT NULL REFERENCES vehiculo(id),
  centro_costo_id BIGINT NOT NULL REFERENCES centro_costo(id),
  tipo_flota    VARCHAR(10) NOT NULL CHECK (tipo_flota IN ('propia','aubasa')),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);
CREATE INDEX ix_vehiculo_finanzas_vigente
  ON vehiculo_finanzas (vehiculo_id) WHERE vigente_hasta IS NULL;


-- ============================================================
-- (f) FINANZAS — TARJETAS YPF EN RUTA
-- ============================================================

-- 17. perfil — límite de gasto que crea y administra Finanzas
CREATE TABLE perfil (
  id            BIGSERIAL PRIMARY KEY,
  nombre        VARCHAR(60) NOT NULL UNIQUE,
  descripcion   VARCHAR(300),
  tope_importe  NUMERIC(12,2),
  tope_litros   NUMERIC(10,2),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);

-- 18. producto — el producto real que define Finanzas para cada categoría YPF
CREATE TABLE producto (
  id        BIGSERIAL PRIMARY KEY,
  categoria VARCHAR(40) NOT NULL,  -- la que informa YPF: nafta, gasoil, lubricantes, GNC...
  nombre    VARCHAR(100) NOT NULL  -- el producto real, p. ej. "Infinia Diesel"
);
CREATE INDEX ix_producto_categoria ON producto (categoria);

-- 19. pin — PIN del conductor para operar la tarjeta en el surtidor. Lo genera Finanzas
CREATE TABLE pin (
  id            BIGSERIAL PRIMARY KEY,
  persona_id    BIGINT NOT NULL REFERENCES persona(id),
  pin           VARCHAR(10) NOT NULL,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);
CREATE INDEX ix_pin_vigente
  ON pin (persona_id) WHERE vigente_hasta IS NULL;

-- 20. tarjeta — operativa o beneficio. Los campos de una no se usan para la otra.
CREATE TABLE tarjeta (
  id                  BIGSERIAL PRIMARY KEY,
  tipo                VARCHAR(10) NOT NULL CHECK (tipo IN ('operativa','beneficio')),
  vehiculo_id         BIGINT REFERENCES vehiculo(id), -- solo operativa
  persona_id          BIGINT REFERENCES persona(id),  -- solo beneficio
  dominio_personal    VARCHAR(10),                     -- solo beneficio, texto libre
  marca               VARCHAR(60),                     -- solo beneficio
  modelo              VARCHAR(60),                     -- solo beneficio
  numero_tarjeta      VARCHAR(30),                     -- nulo hasta que YPF la entrega
  litros_tanque       NUMERIC(8,2),
  tope_tanque         NUMERIC(8,2),
  responsable_patrimonial VARCHAR(150),                -- solo operativa
  observaciones       VARCHAR(500),
  creado              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (tipo = 'operativa' AND vehiculo_id IS NOT NULL AND persona_id IS NULL) OR
    (tipo = 'beneficio' AND persona_id IS NOT NULL AND vehiculo_id IS NULL)
  )
);
CREATE UNIQUE INDEX ix_tarjeta_vehiculo_vigente ON tarjeta (vehiculo_id)
  WHERE tipo = 'operativa'; -- se refina en tarjeta_periodo (una vigente a la vez, ver 7.5)
-- Nota: el CHECK de tipo asegura que no se mezclen los dos circuitos. La regla
-- de "una sola vigente por dominio o por empleado" (RN-01/RN-02) se controla
-- con tarjeta_periodo.estado al insertar, desde la aplicación: una tabla no
-- alcanza para expresar esa regla sin bloquear altas y bajas legítimas.

-- 21. tarjeta_periodo — lo que cambia de una tarjeta con el tiempo
CREATE TABLE tarjeta_periodo (
  id            BIGSERIAL PRIMARY KEY,
  tarjeta_id    BIGINT NOT NULL REFERENCES tarjeta(id),
  centro_costo_id BIGINT REFERENCES centro_costo(id), -- solo beneficio
  perfil_id     BIGINT NOT NULL REFERENCES perfil(id),
  estado        VARCHAR(12) NOT NULL DEFAULT 'vigente'
                CHECK (estado IN ('vigente','baja','bloqueada')),
  motivo        VARCHAR(300),
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE
);
CREATE INDEX ix_tarjeta_periodo_vigente
  ON tarjeta_periodo (tarjeta_id) WHERE vigente_hasta IS NULL;

-- 22. consumo — cada línea del archivo mensual de YPF
-- centro_costo_ypf se guarda tal cual llega, solo de referencia: el centro de
-- costo real se busca en vehiculo_finanzas o tarjeta_periodo, por fecha.
CREATE TABLE consumo (
  id              BIGSERIAL PRIMARY KEY,
  tarjeta_id      BIGINT NOT NULL REFERENCES tarjeta(id),
  conductor       VARCHAR(150),
  fecha           DATE NOT NULL,
  categoria_ypf   VARCHAR(40) NOT NULL,   -- la que trae el archivo
  producto_id     BIGINT REFERENCES producto(id), -- nulo hasta identificarlo (FI-12)
  litros          NUMERIC(10,2),
  monto           NUMERIC(12,2) NOT NULL,
  tasa_vial       NUMERIC(12,2),
  factura         VARCHAR(30) NOT NULL,
  centro_costo_ypf VARCHAR(20)            -- referencia, no se usa para calcular
);
CREATE INDEX ix_consumo_tarjeta_fecha ON consumo (tarjeta_id, fecha);
CREATE INDEX ix_consumo_factura ON consumo (factura);
CREATE INDEX ix_consumo_sin_producto ON consumo (id) WHERE producto_id IS NULL;


-- ============================================================
-- (g) COMERCIAL
-- ============================================================

-- 23. autopista — catálogo precargado de autopistas
CREATE TABLE autopista (
  id     BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 24. tag — el tag de cada vehículo, con historial
CREATE TABLE tag (
  id               BIGSERIAL PRIMARY KEY,
  vehiculo_id      BIGINT NOT NULL REFERENCES vehiculo(id),
  fecha_alta       DATE NOT NULL DEFAULT CURRENT_DATE,
  nro_dispositivo  VARCHAR(40) NOT NULL,
  nro_cliente      VARCHAR(30) NOT NULL,
  cuenta           VARCHAR(30) NOT NULL,
  subcuenta        VARCHAR(30),
  estado_tag       VARCHAR(20) NOT NULL, -- validado contra el catálogo estado_tag
  habilitado_otras BOOLEAN NOT NULL DEFAULT false,
  nro_ticket       VARCHAR(30),           -- qué representa: a confirmar (pendiente 7)
  vigente_desde    DATE NOT NULL,
  vigente_hasta    DATE
);
CREATE INDEX ix_tag_vigente
  ON tag (vehiculo_id) WHERE vigente_hasta IS NULL;

-- 25. tag_autopista — autopistas habilitadas para cada tag
CREATE TABLE tag_autopista (
  tag_id      BIGINT NOT NULL REFERENCES tag(id),
  autopista_id BIGINT NOT NULL REFERENCES autopista(id),
  PRIMARY KEY (tag_id, autopista_id)
);


-- ============================================================
-- (h) DOCUMENTOS
-- ============================================================

-- 26. tipo_documento_catalogo — catálogo de tipos de documento
CREATE TABLE tipo_documento_catalogo (
  id          BIGSERIAL PRIMARY KEY,
  codigo      VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT true
);

-- 27. documento — un documento lógico (puede tener varias versiones)
CREATE TABLE documento (
  id                 BIGSERIAL PRIMARY KEY,
  tipo_documento_id  BIGINT NOT NULL REFERENCES tipo_documento_catalogo(id),
  estado             VARCHAR(10) NOT NULL DEFAULT 'vigente'
                      CHECK (estado IN ('vigente','anulado'))
);

-- 28. documento_version — cada versión de un documento, identificada por su hash.
-- Nunca se edita, solo se agregan versiones nuevas. El archivo en sí no va en
-- esta tabla: se guarda en disco, nombrado por su sha256. Acá solo metadatos.
CREATE TABLE documento_version (
  id              BIGSERIAL PRIMARY KEY,
  documento_id    BIGINT NOT NULL REFERENCES documento(id),
  nro_version     INTEGER NOT NULL,
  sha256          CHAR(64) NOT NULL,
  tamanio         BIGINT NOT NULL,
  tipo_detectado  VARCHAR(50),
  nombre_original VARCHAR(255),
  subido_por      BIGINT NOT NULL REFERENCES usuario(id),
  vigente_desde   DATE NOT NULL,
  vigente_hasta   DATE,
  creado          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (documento_id, nro_version)
);
CREATE INDEX ix_documento_version_vigente
  ON documento_version (documento_id) WHERE vigente_hasta IS NULL;
CREATE INDEX ix_documento_version_hash ON documento_version (sha256);

-- 29. documento_vinculo — a qué entidad está vinculado un documento
-- entidad_id no lleva REFERENCES porque apunta a una tabla distinta según
-- entidad_tipo (una FK polimórfica). La integridad se valida en la
-- aplicación, en el único punto de escritura (sección 3.3 de la Guía).
CREATE TABLE documento_vinculo (
  id            BIGSERIAL PRIMARY KEY,
  documento_id  BIGINT NOT NULL REFERENCES documento(id),
  entidad_tipo  VARCHAR(20) NOT NULL
    CHECK (entidad_tipo IN
      ('persona','vehiculo','licencia','poliza','vtv','autorizacion','multa')),
  entidad_id    BIGINT NOT NULL
);
CREATE INDEX ix_documento_vinculo_entidad ON documento_vinculo (entidad_tipo, entidad_id);


-- ============================================================
-- (i) ALARMAS, AUDITORÍA Y GLM
-- ============================================================

-- 30. notificacion — la bandeja interna de cada usuario
CREATE TABLE notificacion (
  id              BIGSERIAL PRIMARY KEY,
  destinatario_id BIGINT NOT NULL REFERENCES usuario(id),
  tipo            VARCHAR(40) NOT NULL,
  entidad         VARCHAR(40),
  mensaje         VARCHAR(500) NOT NULL,
  creada          TIMESTAMPTZ NOT NULL DEFAULT now(),
  leida           BOOLEAN NOT NULL DEFAULT false,
  enviada_correo  BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX ix_notificacion_destinatario ON notificacion (destinatario_id, leida);

-- 31. aviso_enviado — registro de cada aviso que mandó el proceso diario, para no duplicar
CREATE TABLE aviso_enviado (
  id              BIGSERIAL PRIMARY KEY,
  evento          VARCHAR(60) NOT NULL,
  umbral          VARCHAR(30),
  destinatario_id BIGINT NOT NULL REFERENCES usuario(id),
  canal           VARCHAR(20) NOT NULL, -- 'bandeja' o 'correo'
  fecha_envio     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_aviso_enviado_evento ON aviso_enviado (evento, umbral, destinatario_id);

-- 32. auditoria_evento — append-only: el rol de la aplicación solo inserta y lee
-- acá, nunca actualiza ni borra.
CREATE TABLE auditoria_evento (
  id             BIGSERIAL PRIMARY KEY,
  fecha          TIMESTAMPTZ NOT NULL DEFAULT now(),
  usuario_id     BIGINT REFERENCES usuario(id), -- nulo si fuente = 'trigger'
  ip             VARCHAR(45),
  request_id     VARCHAR(60),
  accion         VARCHAR(20) NOT NULL, -- alta, modificacion, anulacion
  entidad        VARCHAR(40) NOT NULL,
  entidad_id     BIGINT NOT NULL,
  valor_anterior JSONB,
  valor_nuevo    JSONB,
  motivo         VARCHAR(300),
  fuente         VARCHAR(20) NOT NULL DEFAULT 'aplicacion'
                 CHECK (fuente IN ('aplicacion','trigger'))
);
CREATE INDEX ix_auditoria_entidad ON auditoria_evento (entidad, entidad_id);
CREATE INDEX ix_auditoria_fecha ON auditoria_evento (fecha);

-- 33. sync_glm — PROVISORIA, ver sección 10/11. Cada movimiento recibido desde GLM.
-- Guardar el contenido completo en JSONB es a propósito: así, cuando Matías
-- confirme las columnas reales, no hay que volver a pedirle nada a GLM — ya
-- está guardado — solo hay que reprocesar lo que ya llegó.
CREATE TABLE sync_glm (
  id        BIGSERIAL PRIMARY KEY,
  recibido  TIMESTAMPTZ NOT NULL DEFAULT now(),
  legajo    VARCHAR(20) NOT NULL,
  tipo      VARCHAR(10) NOT NULL CHECK (tipo IN ('alta','baja')),
  contenido JSONB NOT NULL, -- el mensaje crudo, tal como lo manda GLM
  resultado VARCHAR(20),
  procesado BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX ix_sync_glm_pendiente ON sync_glm (id) WHERE procesado = false;


-- ============================================================
-- (j) CATÁLOGO DE COMERCIAL
-- ============================================================

-- 34. estado_tag — catálogo de estados posibles del tag (activo, perdido,
-- bloqueado, etc. — valores a confirmar con Comercial)
CREATE TABLE estado_tag (
  id          BIGSERIAL PRIMARY KEY,
  codigo      VARCHAR(20) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- Fin del esquema (34 tablas)
-- ============================================================
