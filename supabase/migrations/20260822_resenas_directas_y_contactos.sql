-- Parte del pivot "directorio de técnicos" (ver CLAUDE.md): dos cosas nuevas.
--
-- 1) Reseñas directas: ya no hace falta publicar un problema y cerrarlo con
--    código para calificar a un técnico. Cualquier usuario logueado puede
--    calificar a cualquier técnico directamente desde su perfil público.
--    Reutiliza la tabla `resenas` que ya existe (no una tabla nueva) — el
--    resumen (`resenas_resumen`) ya suma todo junto sin cambios.
--
-- 2) Registro de contactos: cada vez que alguien toca "Contactar por
--    WhatsApp" (con cuenta o sin ella) queda un registro liviano. Sirve para
--    medir si esta prueba de concepto genera movimiento.

-- ── 1) Reseñas directas ─────────────────────────────────────────────────────

-- Antes autor_id era obligatorio (siempre venía de una cuenta real vía
-- crear_resena). Lo aflojamos para permitir reseñas cargadas a mano
-- (testimonios reales que no tienen cuenta en Sufix) directo desde el Table
-- Editor: tecnico_id, autor_nombre (texto libre), estrellas, comentario —
-- publicacion_id y autor_id quedan NULL.
ALTER TABLE resenas ALTER COLUMN autor_id DROP NOT NULL;

-- Un usuario logueado no puede calificar dos veces al mismo técnico por esta
-- vía nueva (publicacion_id IS NULL). No afecta las reseñas viejas (atadas a
-- una publicación) ni las cargadas a mano (autor_id NULL, cada una es libre).
CREATE UNIQUE INDEX IF NOT EXISTS resenas_directo_unico
  ON resenas (tecnico_id, autor_id)
  WHERE publicacion_id IS NULL AND autor_id IS NOT NULL;

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

GRANT EXECUTE ON FUNCTION crear_resena_directa(uuid, int, text) TO authenticated;

-- ── 2) Registro de contactos ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contactos_tecnico (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contactado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  origen         text,          -- 'home' | 'perfil'
  creado_at      timestamptz DEFAULT now()
);

ALTER TABLE contactos_tecnico ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (con cuenta o sin ella) — es el registro del clic.
CREATE POLICY "contactos_insert_cualquiera"
ON contactos_tecnico FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Cada técnico puede ver sus propios contactos (para más adelante, si
-- queremos mostrarle "X personas te contactaron esta semana" en /perfil).
CREATE POLICY "contactos_select_propio"
ON contactos_tecnico FOR SELECT
TO authenticated
USING (tecnico_id = auth.uid());
