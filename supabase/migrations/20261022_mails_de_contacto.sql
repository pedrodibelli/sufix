-- Mail obligatorio antes de abrir WhatsApp + seguimiento a los 7 días con
-- link para reseñar SIN cuenta (2026-10-22). Ver CLAUDE.md §24.
--
-- Hasta acá el 81% de los clics en "Contactar por WhatsApp" eran anónimos
-- (56 de 69, y 24 de 24 en el último mes): no sabíamos quién usa Sufix y las
-- reseñas nativas eran 3. Ahora, antes de abrir WhatsApp, un pop-up pide el
-- mail (obligatorio) y el WhatsApp (opcional). Con eso:
--   1. la primera vez se le mandan consejos de seguridad;
--   2. a los 7 días, un mail "¿cómo te fue?" con un link que deja reseñar a
--      ESE técnico sin crear cuenta (invitaciones_resena).
--
-- Las tres tablas nuevas son SOLO para el servidor (service role):
-- RLS prendido y ninguna policy. Ni anon ni authenticated pueden leerlas —
-- en particular, un técnico no puede ver los tokens de reseña de sus
-- contactos (se dejaría reseñas a sí mismo) ni los mails de sus clientes.

-- ── 1) Una fila por mail ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contactantes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL UNIQUE,      -- siempre en minúsculas
  telefono              text,                      -- opcional
  acepta_novedades      boolean NOT NULL DEFAULT false, -- casilla del pop-up, desmarcada por defecto
  -- El dominio no tiene servidor de mail (chequeo de MX al dar de alta): no se
  -- le escribe nunca. Cada rebote le baja la reputación a sufixapp.com.
  mail_invalido         boolean NOT NULL DEFAULT false,
  consejos_enviados_at  timestamptz,               -- el mail de seguridad sale una sola vez
  baja_at               timestamptz,               -- se dio de baja: no se le escribe más
  token_baja            uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  creado_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contactantes ENABLE ROW LEVEL SECURITY;

-- ── 2) Cada contacto sabe de qué mail vino y si ya se le hizo el seguimiento ─
ALTER TABLE contactos_tecnico
  ADD COLUMN IF NOT EXISTS contactante_id uuid REFERENCES contactantes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seguimiento_enviado_at timestamptz;

-- Desde el navegador (anon/authenticated) se sigue pudiendo insertar el clic,
-- pero SIN estas dos columnas: las completa sólo el servidor. Si no, alguien
-- podría colgarle contactos inventados al mail de otra persona y hacerle
-- llegar mails de seguimiento sobre técnicos que nunca contactó.
DROP POLICY IF EXISTS "contactos_insert_cualquiera" ON contactos_tecnico;
CREATE POLICY "contactos_insert_cualquiera"
ON contactos_tecnico FOR INSERT
TO anon, authenticated
WITH CHECK (contactante_id IS NULL AND seguimiento_enviado_at IS NULL);

-- El cron diario busca exactamente esto: contactos con mail y sin seguimiento.
CREATE INDEX IF NOT EXISTS contactos_tecnico_seguimiento_pendiente
  ON contactos_tecnico (creado_at)
  WHERE contactante_id IS NOT NULL AND seguimiento_enviado_at IS NULL;

-- ── 3) Link para reseñar sin cuenta ─────────────────────────────────────────
-- Uno por (mail, técnico): si la misma persona vuelve a contactar al mismo
-- técnico, se reusa el token y se le extiende el vencimiento.
CREATE TABLE IF NOT EXISTS invitaciones_resena (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token           uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  contactante_id  uuid NOT NULL REFERENCES contactantes(id) ON DELETE CASCADE,
  tecnico_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vence_at        timestamptz NOT NULL,
  respuesta       text CHECK (respuesta IN ('contratado', 'no_contratado')),
  motivo          text,               -- por qué no lo contrató (opcional)
  respondida_at   timestamptz,
  resena_id       uuid REFERENCES resenas(id) ON DELETE SET NULL,
  creado_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contactante_id, tecnico_id)
);

ALTER TABLE invitaciones_resena ENABLE ROW LEVEL SECURITY;

-- La reseña en sí va a `resenas` como cualquier otra, con autor_id NULL y el
-- nombre que la persona elija en autor_nombre (mismo formato que las
-- cargadas a mano, ver 20260822_resenas_directas_y_contactos.sql). El vínculo
-- con el mail queda del lado de invitaciones_resena.resena_id, NO como
-- columna en `resenas`: esa tabla es de lectura pública.

-- ── 4) Cuánta gente abre el pop-up y cuánta sigue ───────────────────────────
-- Es la medición de si el mail obligatorio está espantando gente. El id lo
-- genera el navegador, así la apertura y el "siguió" pueden llegar en
-- cualquier orden sin perderse.
CREATE TABLE IF NOT EXISTS aperturas_popup_contacto (
  id           uuid PRIMARY KEY,
  tecnico_id   uuid,
  continuo_at  timestamptz,           -- NULL = cerró el pop-up sin seguir
  creado_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE aperturas_popup_contacto ENABLE ROW LEVEL SECURITY;
