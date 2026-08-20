-- Foto de perfil para técnicos y demandantes.
--
-- Demandantes: la foto se guarda en user_metadata.avatar_url (auth.users),
-- igual que nombre/apellido — no necesitan fila en perfiles_profesionales.
--
-- Técnicos: además de user_metadata (para que se vean a sí mismos en el header
-- y en /perfil sin queries extra), se duplica en perfiles_profesionales.foto_url
-- para que sea visible públicamente (perfil /tecnico/[id], tarjetas de contacto
-- en /mis-consultas) sin exponer auth.users. Mismo patrón que ya existe hoy con
-- la columna `nombre`.

ALTER TABLE perfiles_profesionales
  ADD COLUMN IF NOT EXISTS foto_url text;

-- La vista pública ya seleccionaba columnas puntuales (no `select *`), así que
-- hay que agregar foto_url a mano.
CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;

-- Bucket público para las fotos de perfil (separado de fotos-publicaciones).
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública (se muestran en perfiles públicos y tarjetas).
CREATE POLICY "avatars: lectura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Cada usuario sube/actualiza/borra SOLO su propio archivo. La convención de
-- ruta es "{user_id}/avatar" (sin extensión, siempre se pisa con upsert), así
-- que el primer segmento de la ruta tiene que ser el uid del que sube.
CREATE POLICY "avatars: subir el propio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars: actualizar el propio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars: borrar el propio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
