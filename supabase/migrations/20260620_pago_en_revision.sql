-- Flujo de pago con verificación manual.
--
-- Antes: el demandante tocaba "Confirmar pago" y el contacto se desbloqueaba al
-- instante, sin verificar nada. Ahora el pago entra en un estado intermedio
-- (propuestas.estado = 'pago_en_revision' / publicaciones.status = 'en_revision')
-- y el contacto solo se desbloquea cuando un admin aprueba el pago.
--
-- Estados (columnas text, sin enum):
--   propuestas.estado:    'pago_en_revision' (demandante declaró el pago, falta verificar)
--   publicaciones.status: 'en_revision'      (idem; bloquea aceptar otra propuesta)

-- Timestamp de cuándo el demandante declaró el pago.
ALTER TABLE propuestas ADD COLUMN IF NOT EXISTS pago_revision_at timestamptz;

-- ─── Funciones de admin (SECURITY DEFINER: corren con permisos del dueño de la
--     función y saltan RLS, pero validan que quien llama sea admin) ───────────

-- Lista los pagos pendientes de verificación. Solo admin.
CREATE OR REPLACE FUNCTION listar_pagos_en_revision()
RETURNS TABLE (
  id uuid,
  precio numeric,
  titulo text,
  demandante text,
  nombre_profesional text,
  zona text,
  categoria text,
  pago_revision_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'solvithomes@gmail.com' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
    SELECT p.id, p.precio::numeric, p.titulo, p.demandante,
           p.nombre_profesional, p.zona, p.categoria, p.pago_revision_at
    FROM propuestas p
    WHERE p.estado = 'pago_en_revision'
    ORDER BY p.pago_revision_at ASC NULLS LAST;
END;
$$;

-- Aprueba un pago: marca la propuesta como aceptada, genera el código de 4
-- dígitos y pone la publicación en curso (esto desbloquea el contacto vía RLS).
CREATE OR REPLACE FUNCTION aprobar_pago(p_propuesta_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_pub uuid;
  v_codigo text;
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'solvithomes@gmail.com' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT publicacion_id INTO v_pub
  FROM propuestas
  WHERE id = p_propuesta_id AND estado = 'pago_en_revision';

  IF v_pub IS NULL THEN
    RAISE EXCEPTION 'Propuesta no encontrada o no está en revisión';
  END IF;

  v_codigo := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

  UPDATE propuestas
    SET estado = 'aceptada', codigo_pago = v_codigo, aceptada_at = now()
    WHERE id = p_propuesta_id;

  UPDATE publicaciones
    SET status = 'en_curso'
    WHERE id = v_pub;
END;
$$;

-- Rechaza un pago: vuelve la propuesta a pendiente y reabre la publicación.
CREATE OR REPLACE FUNCTION rechazar_pago(p_propuesta_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_pub uuid;
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'solvithomes@gmail.com' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT publicacion_id INTO v_pub
  FROM propuestas
  WHERE id = p_propuesta_id AND estado = 'pago_en_revision';

  IF v_pub IS NULL THEN
    RAISE EXCEPTION 'Propuesta no encontrada o no está en revisión';
  END IF;

  UPDATE propuestas
    SET estado = 'pendiente', pago_revision_at = NULL
    WHERE id = p_propuesta_id;

  UPDATE publicaciones
    SET status = 'abierto'
    WHERE id = v_pub;
END;
$$;

GRANT EXECUTE ON FUNCTION listar_pagos_en_revision()  TO authenticated;
GRANT EXECUTE ON FUNCTION aprobar_pago(uuid)          TO authenticated;
GRANT EXECUTE ON FUNCTION rechazar_pago(uuid)         TO authenticated;
