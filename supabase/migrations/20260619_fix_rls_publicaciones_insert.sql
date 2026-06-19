-- Endurece las políticas RLS de publicaciones.
--
-- Problema: la política "Inserción pública" aplicaba al rol `public` (incluye
-- `anon`, sin login) con WITH CHECK true, permitiendo crear publicaciones sin
-- estar autenticado (vector de spam vía la anon key). Además había dos políticas
-- SELECT idénticas.
--
-- Fix: dejamos solo el INSERT para `authenticated` y una sola SELECT pública.

-- 1) Cierra el agujero: solo usuarios logueados pueden publicar.
DROP POLICY IF EXISTS "Inserción pública" ON publicaciones;

-- 2) Saca la política SELECT duplicada (queda "Lectura pública").
DROP POLICY IF EXISTS "lectura publica" ON publicaciones;
