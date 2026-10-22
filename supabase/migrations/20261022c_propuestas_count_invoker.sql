-- Saca el aviso "SECURITY DEFINER view" del Security Advisor de Supabase para
-- esta vista (2026-10-22). Es del modelo viejo (publicar problema → propuestas,
-- pausado desde el pivot): sólo cuenta propuestas por publicación, la tabla
-- está vacía y el código no la usa desde el commit 70d2969. Con
-- security_invoker cada usuario ve sólo el conteo de lo que su RLS le deja
-- ver: si algún día se vuelve al modelo viejo, revisar el "bidsCount".
--
-- OJO: perfiles_publicos tiene el mismo aviso y NO hay que tocarlo — ver
-- CLAUDE.md §25.
ALTER VIEW propuestas_count_por_publicacion SET (security_invoker = true);
