-- Limpieza del flujo de confirmación por email al publicar.
--
-- Contexto: el flujo de publicar dejó de pedir confirmación por email; ahora la
-- publicación queda visible al instante (status 'abierto') y el email es solo un
-- aviso. Esto deja huérfanos la función confirm_publication y la columna
-- publicaciones.confirmation_token, que removemos acá.

-- 1) Drop de la función confirm_publication (cualquier firma, por las dudas).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT oid::regprocedure AS sig
    FROM pg_proc
    WHERE proname = 'confirm_publication'
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig;
  END LOOP;
END $$;

-- 2) Drop de la columna huérfana.
ALTER TABLE publicaciones DROP COLUMN IF EXISTS confirmation_token;
