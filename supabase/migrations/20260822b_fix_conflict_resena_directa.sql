-- Fix: el ON CONFLICT de crear_resena_directa no coincidía exactamente con el
-- predicado del índice parcial resenas_directo_unico (le faltaba
-- "AND autor_id IS NOT NULL"), y Postgres exige que coincidan letra por letra
-- para poder usarlo como árbitro del upsert. Sin el fix, cualquier intento de
-- reseña directa fallaba con "there is no unique or exclusion constraint
-- matching the ON CONFLICT specification".

CREATE OR REPLACE FUNCTION crear_resena_directa(
  p_tecnico_id uuid,
  p_estrellas int,
  p_comentario text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_nombre   text;
  v_apellido text;
  v_autor    text;
BEGIN
  IF p_estrellas < 1 OR p_estrellas > 5 THEN
    RAISE EXCEPTION 'Calificación inválida';
  END IF;

  IF p_tecnico_id = auth.uid() THEN
    RAISE EXCEPTION 'No podés calificarte a vos mismo';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM perfiles_profesionales WHERE user_id = p_tecnico_id) THEN
    RAISE EXCEPTION 'Técnico no encontrado';
  END IF;

  SELECT raw_user_meta_data->>'nombre', raw_user_meta_data->>'apellido'
    INTO v_nombre, v_apellido
  FROM auth.users WHERE id = auth.uid();

  v_autor := NULLIF(TRIM(
    COALESCE(v_nombre, '') ||
    CASE WHEN COALESCE(v_apellido, '') <> '' THEN ' ' || LEFT(v_apellido, 1) || '.' ELSE '' END
  ), '');

  INSERT INTO resenas (tecnico_id, autor_id, autor_nombre, estrellas, comentario)
  VALUES (p_tecnico_id, auth.uid(), v_autor, p_estrellas, NULLIF(TRIM(p_comentario), ''))
  ON CONFLICT (tecnico_id, autor_id) WHERE publicacion_id IS NULL AND autor_id IS NOT NULL
  DO UPDATE SET estrellas = excluded.estrellas,
                comentario = excluded.comentario,
                autor_nombre = excluded.autor_nombre,
                creado_at = now();
END;
$$;
