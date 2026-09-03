-- Lectura de reportes solo para admin (2026-09-03). La tabla `reportes` se
-- creó a propósito sin policy de SELECT: cualquiera puede insertar, nadie
-- puede leer. Esto agrega la excepción para los dos mails de admin, así el
-- panel /admin puede listarlos y marcarlos revisados.
--
-- Se hace con RLS en vez de usar la service role key desde la página: aunque
-- /admin ya valida el email con isAdminEmail(), tener el control también en
-- la base significa que un error en esa validación no expone los reportes.
-- Mismo criterio de emails hardcodeados que ya usan las funciones admin
-- viejas (ver CLAUDE.md §11 — mantener sincronizado con lib/admin.ts).
DROP POLICY IF EXISTS reportes_select_admin ON reportes;
CREATE POLICY reportes_select_admin ON reportes
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' IN ('solvithomes@gmail.com', 'sufixar@gmail.com'));

DROP POLICY IF EXISTS reportes_update_admin ON reportes;
CREATE POLICY reportes_update_admin ON reportes
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' IN ('solvithomes@gmail.com', 'sufixar@gmail.com'));
