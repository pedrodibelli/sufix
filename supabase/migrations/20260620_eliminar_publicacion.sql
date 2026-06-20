-- Permite al demandante eliminar una de sus publicaciones ABIERTAS.
--
-- Se hace con SECURITY DEFINER (en vez de una policy DELETE) para poder borrar
-- también las propuestas asociadas saltando su RLS, pero validando que quien
-- llama sea el dueño y que la publicación no tenga un trato en curso.
CREATE OR REPLACE FUNCTION eliminar_publicacion(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_owner  uuid;
  v_status text;
BEGIN
  SELECT user_id, status INTO v_owner, v_status
  FROM publicaciones
  WHERE id = p_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Publicación no encontrada';
  END IF;
  IF v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF v_status <> 'abierto' THEN
    RAISE EXCEPTION 'Solo se pueden eliminar publicaciones abiertas';
  END IF;

  -- propuestas.publicacion_id es TEXT (no uuid), por eso el cast
  DELETE FROM disputas      WHERE publicacion_id = p_id;
  DELETE FROM propuestas    WHERE publicacion_id = p_id::text;
  DELETE FROM publicaciones WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION eliminar_publicacion(uuid) TO authenticated;
