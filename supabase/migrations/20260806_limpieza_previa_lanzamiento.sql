-- Limpieza final antes de lanzar (no repetible): borra TODOS los datos de
-- prueba acumulados durante el desarrollo — publicaciones, propuestas,
-- disputas, reseñas, perfiles de técnico, verificaciones y las cuentas de
-- auth.users — para arrancar con usuarios y técnicos reales.
--
-- Se dejan afuera del borrado, a propósito:
--   - solvithomes@gmail.com   → cuenta admin, se sigue usando para disputas.
--   - vmconstrucciones.bsas@gmail.com → parece un técnico real (no de prueba),
--     registrado el 2026-08-03. Se decide no borrarlo por las dudas.

DELETE FROM resenas;
DELETE FROM disputas;
DELETE FROM propuestas;
DELETE FROM publicaciones;

DELETE FROM verificaciones
WHERE user_id NOT IN (
  SELECT id FROM auth.users
  WHERE email IN ('solvithomes@gmail.com', 'vmconstrucciones.bsas@gmail.com')
);

DELETE FROM perfiles_profesionales
WHERE user_id NOT IN (
  SELECT id FROM auth.users
  WHERE email IN ('solvithomes@gmail.com', 'vmconstrucciones.bsas@gmail.com')
);

DELETE FROM auth.users
WHERE email NOT IN ('solvithomes@gmail.com', 'vmconstrucciones.bsas@gmail.com');
