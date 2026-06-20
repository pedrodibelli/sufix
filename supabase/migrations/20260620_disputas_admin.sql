-- Panel de admin para disputas.
--
-- La tabla `disputas` ya existe (ver 20260609_tarea2_disputas.sql) con RLS que
-- solo deja ver a cada parte sus propias disputas. Para que el admin pueda ver y
-- resolver TODAS, agregamos funciones SECURITY DEFINER (que saltan RLS pero
-- validan que quien llama sea admin).

-- Lista las disputas abiertas con contexto. Solo admin.
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
  IF coalesce(auth.jwt() ->> 'email', '') <> 'solvithomes@gmail.com' THEN
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

-- Marca una disputa como resuelta y devuelve la publicación a 'en_curso'
-- (si seguía en disputa). Solo admin.
CREATE OR REPLACE FUNCTION resolver_disputa(p_disputa_id uuid)
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
  FROM disputas
  WHERE id = p_disputa_id AND estado = 'abierta';

  IF v_pub IS NULL THEN
    RAISE EXCEPTION 'Disputa no encontrada o ya resuelta';
  END IF;

  UPDATE disputas SET estado = 'resuelta' WHERE id = p_disputa_id;
  UPDATE publicaciones SET status = 'en_curso' WHERE id = v_pub AND status = 'en_disputa';
END;
$$;

GRANT EXECUTE ON FUNCTION listar_disputas()        TO authenticated;
GRANT EXECUTE ON FUNCTION resolver_disputa(uuid)   TO authenticated;
