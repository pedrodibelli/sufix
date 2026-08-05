# SolvIT — Arquitectura y contexto para agentes IA

Este documento describe la estructura técnica del proyecto para que un agente de IA pueda entender el contexto completo sin leer todo el código.

---

## Resumen ejecutivo

SolvIT es un marketplace de servicios para el hogar en Buenos Aires construido con **Next.js 16 App Router** y **Supabase**. Tiene dos actores: demandantes (publican problemas) y oferentes/profesionales.

> ⚠️ **2026-08: flujo de pago pausado temporalmente.** Lo que sigue describe el flujo histórico
> (propuesta con precio + pago por transferencia). Hoy el marketplace usa un flujo de **contacto
> directo gratis** (sin precio, sin pago, elegís por WhatsApp) — ver **CLAUDE.md §9.1** para el
> detalle completo y cómo revertir. El código viejo (`ContactarModal.tsx`, `AceptarModal.tsx`)
> sigue en el repo sin borrar, solo dejó de usarse desde `MarketplaceGrid.tsx`.

---

## Estructura de carpetas

```
taller/
├── app/                          # Next.js App Router — rutas y páginas
│   ├── layout.tsx                # Layout raíz: fuentes, metadata global
│   ├── page.tsx                  # Homepage = Marketplace (server component)
│   │
│   ├── buscar/page.tsx           # Búsqueda de servicios estáticos (sin Supabase)
│   ├── categorias/page.tsx       # Grid de categorías
│   ├── categoria/[slug]/page.tsx # Página de categoría individual
│   ├── servicio/[slug]/page.tsx  # Página de servicio individual (datos estáticos)
│   ├── profesional/[slug]/page.tsx # Perfil de profesional (datos estáticos)
│   ├── oferentes/page.tsx        # Listado de profesionales
│   │
│   ├── ingresar/page.tsx         # Login con Supabase Auth
│   ├── registrar/page.tsx        # Registro: demandante o profesional
│   │                               Profesional requiere DNI, teléfono, rubro, zona
│   │
│   ├── publicar/
│   │   ├── page.tsx              # Página de publicar problema
│   │   ├── PublicarForm.tsx      # Formulario cliente — inserta en `publicaciones`
│   │   └── exito/page.tsx        # Confirmación post-publicación
│   │
│   ├── mis-consultas/
│   │   ├── page.tsx              # Server component: detecta rol y renderiza la vista correcta
│   │   ├── DemandanteView.tsx    # Vista cliente del demandante: tabs Activas/Cerradas
│   │   ├── OferenteView.tsx      # Vista cliente del oferente: tabs Todas/Pendientes/Aceptadas/Rechazadas
│   │   └── actions.ts            # Server Actions: aceptarPropuesta, rechazarPropuesta
│   │
│   ├── mis-publicaciones/page.tsx # Lista de publicaciones del usuario (legacy)
│   ├── como-funciona/page.tsx    # About Us / landing informativa
│   └── not-found.tsx             # Página 404
│
├── components/                   # Componentes reutilizables
│   ├── Header.tsx                # Header con logo SolvIT, nav, user pill con rol
│   ├── Footer.tsx                # Footer simple
│   ├── Logo.tsx                  # Logo SVG aislado
│   │
│   ├── CategoryArt.tsx           # Thumbnail de categoría: gradiente radial oklch + emoji
│   ├── CategoryGrid.tsx          # Grid de categorías con íconos
│   ├── MarketplaceGrid.tsx       # Grid de tarjetas de trabajos (marketplace principal)
│   ├── ServiceCard.tsx           # Tarjeta de servicio estático
│   ├── PostedJobCard.tsx         # Tarjeta de trabajo publicado (legacy)
│   ├── ProCard.tsx               # Tarjeta de profesional
│   │
│   ├── SearchBar.tsx             # Barra de búsqueda con query params
│   ├── FilterDropdown.tsx        # Dropdown de filtros
│   ├── StarRating.tsx            # Componente de estrellas
│   │
│   ├── ContactarModal.tsx        # (PAUSADO, ver CLAUDE.md §9.1) Modal para que el oferente
│   │                               envíe una propuesta con precio. Ya no se usa desde
│   │                               MarketplaceGrid.tsx, pero el código sigue intacto.
│   │
│   ├── AceptarModal.tsx          # (PAUSADO) Modal de pago en 3 pasos (demandante acepta
│   │                               propuesta con precio + comisión $4500 por transferencia)
│   │
│   ├── ContactoDirectoModal.tsx  # (ACTIVO) Reemplaza a ContactarModal: el oferente avisa que
│   │                               quiere el trabajo, sin precio. Ver crearContactoDirecto()
│   │                               en app/mis-consultas/actions.ts
│   │
│   ├── EliminarPublicacion.tsx   # Botón para eliminar una publicación propia
│   ├── LogoutButton.tsx          # Botón de cerrar sesión
│   └── UserJobs.tsx              # Lista de trabajos del usuario (legacy)
│
├── lib/
│   ├── data.ts                   # Datos estáticos: CATEGORIES, ZONES, URGENCIES,
│   │                               SERVICES, PROS, PostedJob (datos de demo)
│   ├── supabase.ts               # Cliente Supabase para browser/client components
│   └── supabase-server.ts        # Cliente Supabase para server components (cookie-based)
│
├── proxy.ts                      # Proxy config (si aplica)
├── tailwind.config.ts            # Config Tailwind: paleta sv-*, ink-*, zap-*
├── README.md                     # Documentación de usuario y flujos
└── ARCHITECTURE.md               # Este archivo
```

---

## Patrones de arquitectura clave

### Server vs Client components

- Las **páginas** (`app/**/page.tsx`) son server components por defecto. Hacen fetch de Supabase con `createSupabaseServer()` (acceso autenticado via cookies).
- Los **views** (`DemandanteView.tsx`, `OferenteView.tsx`) son client components (`"use client"`) porque necesitan estado (tabs, modales, transiciones).
- Los **modales** (`AceptarModal.tsx`, `ContactarModal.tsx`) son client components que invocan server actions o el cliente browser de Supabase.

### Server Actions (`app/mis-consultas/actions.ts`)

```typescript
"use server"
// aceptarPropuesta(propuestaId, publicacionId)
//   - Genera codigo_pago de 4 dígitos
//   - UPDATE propuestas SET estado="aceptada", codigo_pago=X WHERE id=propuestaId
//   - UPDATE publicaciones SET status="cerrado" WHERE id=publicacionId
//   - revalidatePath("/mis-consultas")

// rechazarPropuesta(propuestaId)
//   - UPDATE propuestas SET estado="rechazada" WHERE id=propuestaId
//   - revalidatePath("/mis-consultas")
```

### Autenticación y roles

```typescript
// En cualquier server component:
const supabase = await createSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
const esProfesional = user?.user_metadata?.es_profesional === true;

// Datos extra del profesional (guardados en user_metadata al registrarse):
// user.user_metadata.dni
// user.user_metadata.telefono
// user.user_metadata.categoria  (slug de categoría)
// user.user_metadata.zona
```

### Paleta de colores (Tailwind)

| Token | Uso |
|---|---|
| `sv-primary` | Verde principal de la marca |
| `sv-dark` | Verde oscuro (textos, fondos) |
| `sv-olive` | Verde oliva (badges de profesional) |
| `ink-*` (100-500) | Grises neutros para texto y bordes |
| `zap-*` (100, 700) | Amarillo/lima para badges de demandante |

### CategoryArt

Componente `components/CategoryArt.tsx` — genera un thumbnail visual para cada categoría usando gradientes radiales `oklch()` con un `hue` específico por categoría (definido en `lib/data.ts` en el array `CATEGORIES`). Reemplaza las fotos de Unsplash.

---

## Flujo de datos: aceptar propuesta

```
[DemandanteView] usuario click "Aceptar"
  → handleAceptar(propuesta, publicacion) → setPagoInfo(...)
  → <AceptarModal> se monta

[AceptarModal paso 1] usuario click "Confirmar pago"
  → startTransition(async () => {
      await aceptarPropuesta(propuesta.id, publicacion.id)  // server action
      router.refresh()
      setStep(3)
    })

[actions.ts / aceptarPropuesta]
  → genera codigo_pago = 4 dígitos random
  → UPDATE propuestas SET estado="aceptada", codigo_pago
  → UPDATE publicaciones SET status="cerrado"
  → revalidatePath("/mis-consultas")

[AceptarModal paso 3] usuario click "Ver mis consultas"
  → onPagoExitoso() en DemandanteView
  → setPagoInfo(null) + setTab("cerrado") + router.refresh()

[DemandanteView tab "Cerradas"]
  → muestra ProfesionalContacto con teléfono, WhatsApp, email, zona
  → muestra aviso IMPORTANTE con número de SolvIT para confirmar pago
```

---

## Convenciones de código

- **No hay comentarios explicativos** en el código — los nombres de funciones y variables son autoexplicativos.
- **`select("*")`** se prefiere sobre columnas explícitas en Supabase para resiliencia ante migraciones de schema.
- Los errores de Supabase se loguean con `console.error("[contexto] mensaje")` pero no se lanzan — la UI no muestra errores técnicos al usuario.
- `revalidatePath` se llama en server actions para invalidar el cache del servidor. `router.refresh()` en el cliente fuerza la re-hidratación.
- Las **copias de datos** (título, zona, categoría, nombre del demandante) se guardan en `propuestas` al momento de crear la propuesta para que el oferente siempre tenga contexto aunque la publicación cambie.

---

## Cosas a tener en cuenta al modificar el proyecto

1. **RLS de Supabase**: cualquier nueva tabla necesita políticas explícitas de SELECT/INSERT/UPDATE/DELETE. Sin política, las operaciones fallan silenciosamente (devuelven 0 filas).
2. **Nuevas columnas**: siempre usar `ALTER TABLE x ADD COLUMN IF NOT EXISTS`. El `select("*")` del código las levanta automáticamente sin cambiar TypeScript.
3. **Roles en el header**: el componente `Header.tsx` lee `user_metadata.es_profesional` para mostrar el badge de rol y controlar qué links aparecen.
4. **Marketplace**: `app/page.tsx` filtra publicaciones con `.neq("status", "cerrado")` — cualquier publicación cerrada desaparece automáticamente.
5. **El campo `publicacion_id` en propuestas es TEXT** (no UUID) — al hacer queries JOIN usar `id::text` para castear el UUID de publicaciones.
