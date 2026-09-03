-- Reportes de perfil (2026-09-03): la sección "Seguridad" de la home dice
-- "Podés reportar — si algo no cuadra con un perfil, nos avisás y lo
-- revisamos", pero hasta ahora no había ninguna forma de hacerlo. El modal
-- viejo (ReportarProblemaModal) no servía: pide propuestaId/publicacionId y
-- escribe en `disputas`, que tiene FKs a tablas del flujo pre-pivot.
--
-- Decisión: puede reportar cualquiera, con o sin cuenta (quien detecta un
-- teléfono falso capaz ni tiene usuario). reportado_por queda NULL en ese
-- caso, igual que ya se hace en contactos_tecnico y vistas_perfil_tecnico.

CREATE TABLE IF NOT EXISTS reportes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tecnico_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reportado_por  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  motivo         text NOT NULL,
  detalle        text,
  estado         text NOT NULL DEFAULT 'pendiente',  -- 'pendiente' | 'revisado'
  creado_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reportes_estado_idx ON reportes (estado, creado_at DESC);

ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede reportar (incluso sin cuenta), pero NADIE puede leerlos:
-- esta migración no crea policy de SELECT a propósito. La excepción para los
-- mails de admin (que es como los lee /admin) se agrega aparte, en
-- 20260903e. Así un técnico no puede ver quién lo reportó ni qué dice.
DROP POLICY IF EXISTS reportes_insert_todos ON reportes;
CREATE POLICY reportes_insert_todos ON reportes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE reportes IS
  'Reportes sobre perfiles de técnicos. Solo los mails de admin tienen SELECT (ver 20260903e); nadie más puede leerlos.';
COMMENT ON COLUMN reportes.reportado_por IS
  'NULL si lo reportó alguien sin cuenta. Mismo criterio que contactos_tecnico.';
