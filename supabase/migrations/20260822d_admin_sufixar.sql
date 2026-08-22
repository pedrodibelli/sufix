-- Agrega sufixar@gmail.com como admin, sin sacar a solvithomes@gmail.com (se
-- deja el viejo por las dudas — sacarlo es un cambio aparte, a propósito).
-- El chequeo de admin estaba repetido a mano en 4 funciones (no hay una sola
-- función central), así que hay que tocar las 4. Mismo patrón que ya usaban,
-- solo cambia la condición de un solo email a "está en esta lista".

CREATE OR REPLACE FUNCTION listar_disputas()
RETURNS TABLE (
  id uuid,
  motivo text,
  rol text,
  creado_at timestamptz,
  titulo text,
  demandante text,
  nombre_profesional text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') NOT IN ('solvithomes@gmail.com', 'sufixar@gmail.com') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
    SELECT d.id, d.motivo, d.rol, d.creado_at,
           p.titulo, p.demandante, p.nombre_profesional
    FROM disputas d
    LEFT JOIN propuestas p ON p.id = d.propuesta_id
    WHERE d.estado = 'abierta'
    ORDER BY d.creado_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION resolver_disputa(p_disputa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_pub uuid;
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') NOT IN ('solvithomes@gmail.com', 'sufixar@gmail.com') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT publicacion_id INTO v_pub
  FROM disputas
  WHERE id = p_disputa_id AND estado = 'abierta';

  IF v_pub IS NULL THEN
    RAISE EXCEPTION 'Disputa no encontrada o ya resuelta';
  END IF;

  UPDATE disputas SET estado = 'resuelta' WHERE id = p_disputa_id;
  UPDATE publicaciones SET status = 'en_curso' WHERE id = v_pub AND status = 'en_disputa';
END;
$$;

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
  IF coalesce(auth.jwt() ->> 'email', '') NOT IN ('solvithomes@gmail.com', 'sufixar@gmail.com') THEN
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
  IF coalesce(auth.jwt() ->> 'email', '') NOT IN ('solvithomes@gmail.com', 'sufixar@gmail.com') THEN
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

CREATE OR REPLACE FUNCTION rechazar_pago(p_propuesta_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_pub uuid;
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') NOT IN ('solvithomes@gmail.com', 'sufixar@gmail.com') THEN
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
