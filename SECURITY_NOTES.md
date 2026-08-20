# SECURITY_NOTES — Sufix

## Auditoría RLS (Tarea 3, 2026-06-09)

### Problema original
`ContactarModal.tsx` insertaba `profesional_email`, `profesional_telefono` y `profesional_dni`
directamente en la tabla `propuestas`. Cualquier demandante que leyera su propia fila de propuesta
tenía el contacto completo del técnico **sin haber pagado**, destruyendo el modelo de monetización.

### Solución implementada

#### Tablas nuevas
- `perfiles_profesionales (user_id PK, nombre, telefono, email, rubro, zona, verificado, creado_at)`
- `verificaciones (user_id PK, dni, creado_at)` — DNI separado, solo legible por el dueño

#### Políticas RLS — `perfiles_profesionales`
1. **`perfil_owner`**: el dueño puede leer y editar su propio perfil.
2. **`perfil_contacto_si_aceptado`**: un demandante puede leer telefono/email solo si
   `EXISTS (propuesta con estado IN ('aceptada','completada') que vincule a ese profesional con una
   publicación del demandante)`.

Esto garantiza que el contacto se desbloquea **solo después del pago** (porque `aceptarPropuesta`
setea `estado = 'aceptada'`).

#### Flujo de datos post-migración
- `ContactarModal` ya no inserta email/telefono/dni en `propuestas`.
- Al registrarse un profesional, un trigger de base de datos crea automáticamente su fila en
  `perfiles_profesionales` y `verificaciones` (sin acción extra en el cliente).
- `mis-consultas/page.tsx` (server component) hace `SELECT` sobre `perfiles_profesionales`
  con el usuario autenticado; el RLS filtra automáticamente.
- `DemandanteView` muestra datos de `perfilMap` (nuevo) con fallback a campos legacy en
  `propuestas` para registros anteriores a esta migración.
- `AceptarModal/StepDesbloqueado` hace un `SELECT` client-side al montar; el RLS ya permite
  la lectura porque `aceptarPropuesta` marcó la propuesta como `'aceptada'` instantes antes.

#### Columnas legacy en `propuestas` (no eliminadas aún)
`profesional_email`, `profesional_telefono`, `profesional_zona`, `profesional_dni` todavía existen
en la tabla para retrocompatibilidad con propuestas anteriores. Se pueden eliminar cuando todas las
propuestas activas hayan migrado o se cierren.

### Pendiente
- Agregar RLS a `publicaciones` para que solo el dueño pueda leer sus publicaciones cerradas
  (actualmente cualquier usuario autenticado puede leer publicaciones ajenas por `publicacion_id`).
- Restringir el `SELECT *` en `propuestas` del oferente: no debería ver campos sensibles del demandante.
