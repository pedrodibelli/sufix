-- Flujo de "contacto directo gratis" (pausa temporal del flujo de propuesta con
-- precio de consulta + pago de $4500).
--
-- Idea: mientras haya cupo, el oferente que quiere hacer un trabajo toca un botón
-- y se crea una propuesta SIN precio, marcada como contacto_directo = true. El
-- demandante ve a todos los interesados (nombre, reseñas, botón de WhatsApp con
-- mensaje precargado) y puede hablar con varios. Cuando decide, toca "Elegir a
-- este técnico" en la app: ahí (y solo ahí) se genera el código de 4 dígitos y la
-- publicación pasa a en_curso — igual que hoy, pero sin pago de por medio.
--
-- El cupo gratis ("los primeros 1000 usuarios") se cuenta por PUBLICACIÓN, no por
-- técnico: ver CUPO_CONTACTOS_GRATIS en lib/config.ts y crearContactoDirecto() en
-- app/mis-consultas/actions.ts.
--
-- Nuevo valor de propuestas.estado para este flujo:
--   'interesado'  → el técnico tocó "Quiero hacer este trabajo". Visible para el
--                    demandante (teléfono/WhatsApp), pero todavía no fue elegido.
--   'aceptada'    → el demandante lo eligió (mismo valor que el flujo viejo; a
--                    partir de acá el seguimiento con código y reseña es idéntico).
--
-- El flujo viejo (ContactarModal con precio de consulta + AceptarModal con pago
-- por transferencia) NO se borra: queda intacto en el código, simplemente deja de
-- usarse desde el marketplace. Las propuestas viejas tienen contacto_directo = false
-- (o NULL) y siguen funcionando exactamente igual que antes.

ALTER TABLE propuestas ADD COLUMN IF NOT EXISTS contacto_directo boolean DEFAULT false;

COMMENT ON COLUMN propuestas.contacto_directo IS
  'true = propuesta del flujo nuevo de contacto directo gratis (sin precio de consulta, sin pago). false/NULL = flujo viejo con precio + pago de $4500.';

-- La tabla 20260609_tarea3_privacidad.sql dejó el teléfono/email del técnico
-- visible para el demandante SOLO cuando la propuesta está 'aceptada'/'completada'
-- (política "perfil_contacto_si_aceptado"). En el flujo nuevo, el teléfono tiene
-- que verse desde que el técnico avisa que está interesado — todavía nadie
-- "aceptó" nada. Esta política es ADITIVA (no reemplaza ni afloja la de arriba):
-- solo abre visibilidad para filas contacto_directo = true en estado 'interesado'.
CREATE POLICY "perfil_contacto_directo" ON perfiles_profesionales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM propuestas p
      JOIN publicaciones pub ON pub.id = p.publicacion_id::uuid
      WHERE p.profesional_id = perfiles_profesionales.user_id
        AND pub.user_id = auth.uid()
        AND p.contacto_directo = true
        AND p.estado IN ('interesado', 'aceptada', 'completada')
    )
  );
