-- Limpieza puntual (no repetible): borra TODAS las publicaciones/propuestas/
-- disputas de prueba acumuladas durante el desarrollo, para arrancar limpio
-- antes de las pruebas reales del flujo de contacto directo gratis.
--
-- NO toca cuentas de usuario, perfiles_profesionales ni verificaciones — solo
-- "consultas" (publicaciones y todo lo que cuelga de ellas).
--
-- Orden: disputas y propuestas primero (por las dudas no haya FK con cascade),
-- publicaciones al final. resenas se borra sola por ON DELETE CASCADE.

DELETE FROM disputas;
DELETE FROM propuestas;
DELETE FROM publicaciones;
