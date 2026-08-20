# Contexto del proyecto — Sufix

> Este archivo resume el contexto operativo del proyecto para que cualquier sesión de
> Claude Code (y yo mismo) arranque entendiendo la situación. No reemplaza al README
> (que describe el producto y el esquema de datos), sino que lo complementa con el
> contexto de **propiedad, repos, deploy y credenciales**.

> ⚠️ **Rebranding 2026-08-20: "SolvIT" → "Sufix".** El producto se renombró (competidor
> `solvitapp.com.ar` ocupando el nombre viejo + investigación de marca sin conflictos
> para "Sufix"). Se compraron `sufix.com.ar`, `sufix.store`, `sufix.online` y
> `sufixapp.com`. Todo el texto de marca visible al usuario ya dice "Sufix" en el código.
> **Lo que sigue con el nombre viejo a propósito** (son identificadores de infraestructura,
> no marca): el repo `github.com/pedrodibelli/solvit`, el proyecto Vercel `sope/solvit`,
> la URL en vivo `solvitweb.vercel.app`, el email admin `solvithomes@gmail.com`, y las
> menciones históricas a `solvit.homes` (dominio viejo de Mateo, ya no se usa). Conectar
> `sufix.com.ar` como dominio real está **pendiente** de recuperar el acceso a la cuenta
> de Vercel (ver §6 y la nota de la sesión sobre el 2FA).

> ⚠️ **Pivot de producto 2026-08-20/21: "publicar problema" → "directorio de técnicos".**
> La home dejó de tener como flujo principal "el demandante publica su problema y espera
> propuestas". Ahora, tanto para logueados como para visitantes sin cuenta, la home muestra
> primero un **directorio de perfiles de técnicos** (foto, rubros, zona, reseñas) con un
> botón **"Contactar por WhatsApp"** directo en cada tarjeta — cero clics de más, sin login,
> sin publicar nada antes. Es una **prueba de concepto**, no una decisión definitiva: la idea
> es generar movimiento rápido; si funciona, más adelante se vuelve (parcial o totalmente) al
> modelo anterior.
>
> **Qué cambió técnicamente:**
> - `app/page.tsx`: nueva sección "Encontrá tu técnico" (usa `TecnicosGrid`/`TecnicoCard`)
>   arriba de "Consultas activas". Solo se muestra si `!esProfesional` (a un técnico logueado
>   le siguen mostrando el feed de trabajos, no colegas).
> - `app/tecnico/[id]/page.tsx`: botón de WhatsApp agregado junto al nombre.
> - `perfiles_publicos` (vista) ahora expone `telefono` — antes protegido a propósito (Tarea 3,
>   2026-06-09: solo se revelaba tras pago/propuesta). Se decidió conscientemente hacerlo
>   público: el técnico quiere que lo llamen, es el equivalente a una guía de oficios. Ver
>   `supabase/migrations/20260821_telefono_publico_directorio.sql` para el detalle y cómo
>   revertirlo si hiciera falta.
>
> **Qué NO se tocó** (nada se borró, todo sigue en el repo): el flujo viejo completo —
> `/publicar`, la sección "Consultas activas" (sigue debajo en la home), `propuestas`,
> `ContactarModal`/`AceptarModal`, el cupo `CUPO_CONTACTOS_GRATIS` — todo intacto. El pivot es
> aditivo: se agregó una sección nueva arriba, no se quitó la vieja.
>
> **Cómo volver atrás si en algún momento se quiere volver al modelo viejo:**
> - **Revert liviano (recomendado primero)**: en `app/page.tsx`, sacar/comentar el bloque
>   `{!esProfesional && (<section>...<TecnicosGrid .../></section>)}`. La home vuelve a mostrar
>   solo "Consultas activas" como antes, sin tocar nada más — todo el código nuevo queda ahí,
>   pausado, listo para reactivar (mismo patrón que ya usamos con el login de Google o el
>   flujo de pago viejo).
> - **Revert completo (código exacto de antes del pivot)**: existe el tag de git
>   `idea-publicar-problema-2026-08-20`, apuntando al commit justo antes de este cambio.
>   `git checkout idea-publicar-problema-2026-08-20` para ver/recuperar ese estado exacto.
> - Si se revierte, evaluar si conviene volver a sacar `telefono` de `perfiles_publicos`
>   (dejarlo público no rompe nada por sí solo, pero ya no tendría el mismo sentido sin el
>   botón de WhatsApp en la home).

---

## 1. Qué es esto

**Sufix** — marketplace de servicios para el hogar en Buenos Aires. Conecta
**demandantes** (gente con un problema en casa) con **oferentes/profesionales**.
Detalle completo del producto, journeys y esquema de base de datos: ver `README.md`.

### Stack
- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 3** + **TypeScript 5**
- **Supabase** (PostgreSQL + Auth + RLS) como base de datos y autenticación
- **Resend** para emails transaccionales (opcional)
- **Deploy en Vercel** con auto-deploy desde GitHub

> Nota técnica: el middleware vive en `proxy.ts` (nomenclatura nueva de Next 16),
> no en `middleware.ts`. Protege las rutas `/publicar/*`.

---

## 2. Contexto de equipo y de cómo llegué a este repo

- Originalmente el repo lo tenía una **compañera del grupo** en su GitHub.
- Ella le dio acceso a otro compañero, que trabajaba **localmente** y luego pusheaba
  a GitHub **y** a Vercel por separado.
- Mi flujo preferido es distinto: **pushear solo a GitHub** y que Vercel se vincule y
  **auto-deployee** solo.
- **Ahora yo (pedrodibelli) quedo a cargo de todo el proyecto.**

### Estado actual de la migración
- Cloné el repo original (`VarSiv/taller`) y creé **mi propio repo privado**:
  **`github.com/pedrodibelli/solvit`** (rama `main`, con toda la historia).
- Esta carpeta local (`A:\solvit`) tiene el `origin` apuntando a **mi** repo
  (`pedrodibelli/solvit`), NO al original. Pushear desde acá sube a mi repo.
- Mi repo es una **copia independiente**: pushear acá no afecta al repo ni al deploy
  originales, y viceversa. Lo único que podría quedar compartido es la base de datos
  de Supabase, si reutilizo las mismas credenciales (ver sección 5).

---

## 3. Flujo de trabajo

```
Edito en A:\solvit  →  git push a GitHub (main)  →  Vercel auto-deploya producción
```

- Push a `main` → deploy de **producción**.
- Push a otra rama → **preview deployment** (URL temporal).
- Antes de correr local: `npm install` y luego `npm run dev`.

---

## 4. Variables de entorno

Las env vars **NO están en el repo** (`.env*` está en `.gitignore`). Para correr local
hay que crear `A:\solvit\.env.local`; para producción hay que cargarlas en el panel de
Vercel. El código usa:

| Variable | ¿Obligatoria? | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Sí** | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Sí** | Usar la **anon / publishable** key (ver abajo). Se necesita también en build. |
| `RESEND_API_KEY` | No | Si falta, el envío de email se saltea y la app sigue andando |
| `NEXT_PUBLIC_APP_URL` | Recomendada | Si falta, los links de confirmación apuntan a `https://sufix.com.ar` (dominio nuevo, todavía sin conectar al deploy — ver nota de rebranding arriba). Setear a la URL real del deploy. |
| `CRON_SECRET` | Recomendada | Sin esto, el cron diario de keepalive devuelve 401 (inofensivo) |
| `SUPABASE_SERVICE_ROLE_KEY` | Para el mail | **Secreta, solo servidor.** La usa `/api/propuesta-creada` para leer el email del demandante. NUNCA `NEXT_PUBLIC`. |
| `GMAIL_USER` | Para el mail | `solvithomes@gmail.com` — remitente del aviso de propuesta |
| `GMAIL_APP_PASSWORD` | Para el mail | Contraseña de aplicación de Google (16 letras). Ver §15. |
| `WEBHOOK_SECRET` | Para el mail | Protege `/api/propuesta-creada`. Va en el header `Authorization: Bearer <secret>` del webhook de Supabase. |

### ⚠️ Cuál clave de Supabase usar
- Hay que usar la **anon key** (pública / "publishable" → `sb_publishable_...`).
- **NO** usar la **secret / service_role** key (`sb_secret_...`).
- Motivo: la variable tiene prefijo `NEXT_PUBLIC_`, así que Next.js la **incrusta en el
  navegador** y queda visible para cualquiera. La anon key está hecha para eso (la base
  se protege con RLS). La secret key **saltea RLS**; exponerla sería un agujero grave.
- Este proyecto **no usa la secret key en ningún lado** del código.

---

## 5. Supabase — base de datos y administración

### ✅ Decisión tomada: reusar la base original
- **Soy owner del proyecto Supabase original** (el que ya tiene el esquema y los datos).
  Mi deploy apunta a esa **misma base** reusando sus credenciales.
- No hace falta recrear nada: migraciones, tablas (`publicaciones`, `propuestas`),
  políticas RLS, buckets de Storage (fotos) y plantillas de email de Auth ya existen.
- Caveat: si el deploy original sigue vivo, comparte la misma base — lo que toco le pega.

### Administrar Supabase (cambiar tablas, datos, RLS, Auth)
- Se hace desde el **Dashboard de Supabase** (supabase.com) con login → SQL Editor,
  Table Editor, config de Auth/Storage.
- Ya soy **owner del proyecto**, así que tengo acceso completo (no necesito que me inviten).
- La secret key **no** da acceso al dashboard; solo sirve para que código del servidor
  saltee RLS (y acá no se usa).

### Auth redirect URLs
- En **Supabase → Authentication → URL Configuration**, agregar la URL del nuevo deploy
  a las **Redirect URLs** permitidas, o el login/confirmación por email puede fallar.

---

## 6. Checklist para dejar el deploy andando

### ✅ Estado: DEPLOYADO y EN PRODUCCIÓN
- **Proyecto Vercel:** `sope/solvit` (CLI autenticado como `pedrodibelli`).
- **URL de producción:** **https://solvitweb.vercel.app** (la vieja `solvit-navy.vercel.app`
  redirige acá).
- **Repo GitHub conectado** → auto-deploy: push a `main` = producción.
- **Env vars (Production):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_APP_URL` (= `https://solvitweb.vercel.app`), `CRON_SECRET` (seteado).
  `RESEND_API_KEY` **sin setear a propósito** (emails apagados — ver §7).
- **Pendiente:** agregar `https://solvitweb.vercel.app/**` a **Supabase → Auth → Redirect URLs**.

### Pasos (referencia)
1. Crear proyecto en mi Vercel apuntando a `pedrodibelli/solvit` (uso el dominio
   `*.vercel.app` que genera Vercel — ver sección 7).
2. Cargar en Vercel: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mínimo).
3. ✅ Base de Supabase: **reuso la original** (soy owner — ver sección 5).
4. Agregar la URL nueva de Vercel a las Redirect URLs de Supabase Auth.
5. Setear `NEXT_PUBLIC_APP_URL` a la URL de Vercel. Dejar `RESEND_API_KEY` **sin setear**
   (no uso `solvit.homes` — ver sección 7). `CRON_SECRET` opcional.

---

## 7. Dominio y emails (Resend)

- **Decisión histórica: no usé el dominio viejo (`solvit.homes`, de Mateo).** Al deployar
  conecté el repo en Vercel y usé el **dominio que genera Vercel** (`*.vercel.app`) — sigue
  siendo la URL en producción hoy (ver nota de rebranding al principio del archivo).
- El código de `/publicar/actions.ts` (email dormido de Resend) ahora referencia
  `sufix.com.ar` y envía desde `noreply@sufix.com.ar` — dominio propio, comprado en
  2026-08, pero **todavía sin verificar en ninguna cuenta de Resend**.
- Por eso: dejar `RESEND_API_KEY` **sin setear** → los emails transaccionales se saltean y
  la app sigue andando (no rompe).
- Setear `NEXT_PUBLIC_APP_URL` a la URL real del deploy para que los links de confirmación
  apunten bien (overridea el default `sufix.com.ar`, que hoy no resuelve a nada).
- **URL de producción actual: `https://solvitweb.vercel.app`** (dominio `sufix.com.ar` aún
  no conectado — pendiente de recuperar acceso a Vercel, ver §6).

---

# 📍 ESTADO ACTUAL DEL PRODUCTO (leer esto primero)

> Sección agregada para que una sesión nueva sepa **en qué punto estamos y cómo funciona
> todo**, sin tener que explorar el código. Última actualización: **2026-06-21**.

## 8. Cómo funciona la app hoy (features que YA están)

**Roles** (según `user_metadata.es_profesional`):
- **Demandante / cliente** (tema claro) — publica problemas, recibe propuestas, paga la conexión, califica.
- **Oferente / técnico** (tema oscuro) — ve trabajos, manda propuestas, cobra su consulta directo, recibe reseñas.

**Flujos principales:**
1. **Publicar** (`/publicar`, demandante): wizard de pasos → la publicación queda **visible al instante** (`status='abierto'`). Ya **NO** hay confirmación por email.
2. **Marketplace** (home `/`): el técnico ve trabajos disponibles; arriba un **cartel de urgentes de su rubro**. El demandante ve sus consultas.
3. **Proponer** (técnico): `ContactarModal` → fija el precio de su consulta + toggle "descontar del presupuesto final".
4. **Aceptar + pagar** (demandante, `AceptarModal`): ver §9. Paga **solo la tarifa de conexión**. Estado → `pago_en_revision`.
5. **Verificación manual** (admin en `/admin`): aprueba el pago → se desbloquea el contacto del técnico, se genera un **código de 4 dígitos**, estado → `en_curso`.
6. **Cierre**: el técnico hace el trabajo y cobra su consulta directo; el cliente le da el **código**; el técnico lo ingresa → estado → `cerrado`. Habilita la **reseña**.
7. **Reseñas**: el demandante califica al técnico (★ + comentario). Se ve en cada propuesta (★ + cantidad) y en el **perfil del técnico** (`/tecnico/[id]`).
8. **Perfiles** (`/perfil`): el técnico edita teléfono/zona/**rubros (puede elegir varios**, ej. plomero + gasista — `perfiles_profesionales.rubro` es `text[]`, no un solo valor) y ve su reputación; el demandante edita nombre/apellido y ve las opiniones que dejó. Datos con candado/lápiz para editar.
9. **Disputas**: cualquiera "reporta un problema" → `status='en_disputa'` → el admin lo resuelve en `/admin`.
10. **Avisos in-app**: punto rojo 🔴 en "Mis consultas" (demandante: propuestas nuevas; técnico: propuestas aceptadas). **Tiempo real** vía Supabase Realtime (se actualiza solo).
11. **PWA + Mobile**: ícono iOS (`apple-icon`, fondo verde oscuro), manifest, standalone. Barra de navegación inferior (Inicio / Mis consultas) solo en mobile. Menú del perfil (avatar arriba a la derecha).
12. **Avisos por email** ✅ (sin dominio, vía Gmail SMTP `solvithomes@gmail.com`, nodemailer). Hay **dos Database Webhooks de Supabase** (INSERT) que pegan a endpoints propios (header `Authorization: Bearer WEBHOOK_SECRET`, email del destinatario via service role):
    - **Propuesta** → webhook `aviso-propuestas` (tabla `propuestas`) → `/api/propuesta-creada` → mail al **demandante** ("te llegó una propuesta").
    - **Publicación** → webhook `aviso-publicacion` (tabla `publicaciones`) → `/api/publicacion-creada` → **dos** mails: al **demandante** ("publicación creada") y a los **técnicos** cuyo `rubro` + `zona` coinciden con la publicación ("nuevo trabajo en tu zona y rubro").
    - **Pendiente de dominio + Resend:** confirmación de cuenta (Supabase Auth SMTP).

**Estados:**
- `publicaciones.status`: `abierto` → `en_revision` (pago declarado) → `en_curso` (admin aprobó) → `cerrado` (código) / `en_disputa`.
- `propuestas.estado`: `pendiente` → `pago_en_revision` → `aceptada` → `completada` / `rechazada`.

## 9. Modelo de negocio y pagos ⚠️ (importante)

**Modelo actual: el cliente paga TODO a la plataforma (escrow manual).**
- El cliente paga **consulta del técnico + tarifa de conexión** (`COMISION_CONSULTA = 4500`, en
  `lib/config.ts`). Ej: $15.000 + $4.500 = **$19.500**. Todo entra a la plataforma.
- La plataforma **retiene el pago** y **Mateo le paga la consulta ($15.000) al técnico cuando el
  trabajo se concreta** (se cierra con el código). Es un **payout MANUAL** — la app NO lo automatiza.
- **Pago del cliente (manual)**: transferencia → comprobante por WhatsApp → admin aprueba en `/admin`
  → desbloquea el contacto.
- ⚠️ **Los datos de transferencia y el WhatsApp son los de MATEO** (hardcodeados en
  `components/AceptarModal.tsx`, ver `// TODO`).
- **Fase 2 (futuro, a charlar):** Mercado Pago con pagos divididos → automatizar el cobro y el
  payout de la consulta al técnico.

> 📌 Hubo un intento de "modelo conexión" (cobrar solo los $4.500 y que el técnico cobre directo al
> cliente). Se **descartó**: la plataforma cobra todo y Mateo le paga al técnico al concretarse.

### 9.1 Flujo de "contacto directo gratis" (2026-08, temporal — PAUSA el modelo de arriba)

**Objetivo:** generar movimiento en el marketplace mientras es chico. Nadie paga nada —
ni cliente ni técnico — hasta tener una base de usuarios activos definida.

- El oferente ya **no cotiza un precio de consulta**. Toca *"Quiero hacer este trabajo"*
  (`components/ContactoDirectoModal.tsx`) → se crea una `propuesta` con `contacto_directo = true`,
  `precio = 0`, `estado = 'interesado'` (`crearContactoDirecto` en `app/mis-consultas/actions.ts`).
- **Pueden reclamar el mismo trabajo varios técnicos a la vez** (no es exclusivo). El demandante
  recibe **mail + aviso en la web** con el teléfono/WhatsApp y perfil (reseñas) de cada uno, y es
  **el demandante quien escribe primero** al técnico (no al revés).
- El cartel de precio se muestra tachado al demandante: `~~$4.500~~ $0` (`InteresadoRow` en
  `DemandanteView.tsx`), con un botón directo a WhatsApp (mensaje precargado con el título/zona/
  categoría de la consulta, para que el técnico —que puede tener muchas— sepa de qué se trata).
- El código de 4 dígitos / seguimiento / reseña **NO se genera solo con reclamar el trabajo**.
  El demandante tiene que volver a la app y tocar **"Elegir a este técnico"** (con un paso de
  confirmación intermedio) en la fila correspondiente (`elegirTecnico` en
  `app/mis-consultas/actions.ts`) — ahí, y solo ahí, se genera el código y `publicaciones.status`
  pasa a `en_curso` (mismo mecanismo que `aprobar_pago`, sin el pago). Una vez elegido, la
  publicación deja de aceptar nuevos técnicos.
- El técnico puede arrepentirse antes de ser elegido con **"Ya no me interesa este trabajo"**
  (`cancelarInteres`) → `estado = 'cancelada'`. No borra la fila (mismo patrón RLS que
  `rechazarPropuesta`). El cupo y el chequeo de duplicados (`crearContactoDirecto`) ignoran las
  filas `cancelada` — el técnico puede volver a anotarse después.
- **Notificaciones en vivo:** `DemandanteView.tsx`/`OferenteView.tsx` se suscriben por Realtime a
  la tabla `propuestas` (ya habilitada desde antes) y hacen `router.refresh()` cuando cambia algo
  de lo propio, sin recargar la página.
- **Cupo gratis: "los primeros 1000 usuarios/trabajos", no 1000 técnicos.** Se cuentan
  **publicaciones distintas** con al menos un interesado contra `CUPO_CONTACTOS_GRATIS` en
  `lib/config.ts` (hoy: 1000). Si a un trabajo que ya tiene cupo usado se le suman más técnicos,
  **no gasta cupo nuevo** — solo cuenta la primera vez que una publicación consigue un interesado.
  Se calcula con el service role porque un técnico no puede ver, por RLS, las propuestas de otros.
- **RLS nueva:** migración `20260805_contacto_directo_gratis.sql` agrega la policy
  `perfil_contacto_directo` sobre `perfiles_profesionales` — deja ver el teléfono del técnico
  cuando `contacto_directo = true` y `estado = 'interesado'` (la policy vieja solo lo permitía en
  `aceptada`/`completada`). Es **aditiva**, no reemplaza ni afloja la policy vieja.
- **El flujo viejo (precio de consulta + pago de $4.500 por transferencia) NO se borró.**
  `ContactarModal.tsx` y `AceptarModal.tsx` siguen intactos en el repo, simplemente
  `MarketplaceGrid.tsx` dejó de invocarlos (usa `ContactoDirectoModal` en su lugar). Para volver a
  cobrar: en `MarketplaceGrid.tsx` volver a usar `ContactarModal`, y prender
  `PROPUESTAS_CON_PRECIO_ACTIVO` en `lib/config.ts` (hoy es solo documentación/flag, no hay
  gating automático más allá de ese swap de componente).
- **Pendiente/pausado a propósito:** no hay forma de calificar/cerrar un trabajo si el demandante
  nunca toca "Elegir a este técnico" — está bien así por ahora (mucha gente puede escribir por
  WhatsApp sin que eso implique un trabajo formal en curso).

## 10. Base de datos (Supabase) y migraciones

**Tablas:** `publicaciones`, `propuestas`, `perfiles_profesionales`, `verificaciones`, `disputas`, `resenas`.
**Vistas:** `propuestas_count_por_publicacion`, `resenas_resumen`, `perfiles_publicos` (solo datos no sensibles del técnico).
**Funciones (RPC, SECURITY DEFINER):** `aprobar_pago`, `rechazar_pago`, `listar_pagos_en_revision`,
`listar_disputas`, `resolver_disputa`, `eliminar_publicacion`, `crear_resena`.

> ⚠️ **GOTCHA: `propuestas.publicacion_id` es de tipo `text`** (no uuid). Al cruzarlo con
> `publicaciones.id` (uuid) hay que castear: `publicacion_id = p_id::text`.

> ⚠️ **Las migraciones NO se aplican solas.** Están en `supabase/migrations/*.sql` como
> documentación, pero hay que **correr el SQL a mano en el SQL Editor de Supabase**. Si una
> sesión crea una migración nueva, **darle el SQL al usuario para que lo pegue y ejecute**.

**Auth:** "Confirm email" está **APAGADO** en Supabase (no hay SMTP, los mails no llegarían).
El registro deja al usuario logueado directo.

## 11. Panel de administración (`/admin`)
- Accesible **solo** para `solvithomes@gmail.com` (ver `lib/admin.ts` — mantener sincronizado
  con el chequeo de email dentro de las funciones SQL de admin).
- Dos secciones: **Pagos en revisión** (aprobar/rechazar) y **Disputas abiertas** (resolver).

## 12. Decisiones tomadas (y por qué)
- **Reusar la base de Supabase de Mateo** (soy owner). El deploy viejo de Mateo (`solvit.homes`)
  **sigue vivo y comparte la misma base** — todavía NO lo corté (pendiente: sacarlo del team + rotar keys).
- **Modelo: el cliente paga todo** (consulta + tarifa); Mateo le paga la consulta al técnico al
  concretarse (payout manual) — ver §9. Mercado Pago = fase 2.
- **Emails apagados** (sin `RESEND_API_KEY`): Resend necesita un **dominio propio verificado**, que
  no tengo. Todo lo de emails (aviso de publicación, confirmación de cuenta, alerta de urgentes)
  está **bloqueado hasta tener dominio**.
- **Admin = `solvithomes@gmail.com`**.
- Realtime requiere conexión **autenticada** (`supabase.realtime.setAuth(token)` antes de suscribir).

## 13. Roadmap / pendientes
**Bloqueado por "dominio propio":**
- Comprar dominio → habilita Resend (emails de la app) + SMTP en Supabase (confirmación de cuenta) + Mercado Pago.

**Negocio:**
- Cambiar datos de pago (transferencia + WhatsApp) de Mateo por los propios → Mercado Pago.
- Cortar a Mateo: sacarlo del team de Supabase + **rotar las API keys** (su deploy deja de leer la base; desloguea a todos una vez).

**Mejoras (se pueden hacer ya):**
- Editar publicación (ya existe eliminar).
- Match por **zona** además del rubro en el aviso de urgentes.
- `/profesional/[slug]` es una página **mock vieja** (datos inventados) — retirar o reemplazar por el perfil real (`/tecnico/[id]`).
- Notificaciones push (web push) — build grande.
- Indicador de disputa también del lado del técnico.

**Login con Google — PAUSADO a propósito (2026-08):**
- El código está armado y probado (redirige bien a Supabase con los parámetros
  correctos), pero abría muchas variables de configuración externa (Google
  Cloud, pantalla de consentimiento, credenciales) y se decidió no avanzar
  por ahora. **No se borró nada**, solo se comentó el botón:
  - `components/GoogleButton.tsx` — el botón, sin usar en ningún lado por ahora.
  - `app/auth/callback/route.ts` — recibe la vuelta del login con Google (PKCE),
    marca `es_profesional=false` en la primera vez (el botón es solo para
    demandantes; los técnicos siguen con el formulario porque necesitamos DNI y
    teléfono, que Google no da).
  - En `app/registrar/page.tsx` y `app/ingresar/page.tsx` el `<GoogleButton />`
    y su import quedaron comentados (buscar "pausado" en esos archivos).
- **Para reactivarlo:** descomentar esas dos líneas en cada página, y
  configurar el proveedor Google en Supabase (Google Cloud Console → crear
  credenciales OAuth con redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`
  → pegar Client ID/Secret en Supabase → Authentication → Providers → Google
  → agregar `https://solvitweb.vercel.app/**` a Authentication → URL
  Configuration → Redirect URLs).

## 14. Cómo trabajar en este repo (workflow para Claude)
1. **Cambio de código** → `npm run build` (verificar que compila) → `git add -A` → commit → `git push origin main`. ⚠️ **El push NO siempre re-apunta el dominio `solvitweb.vercel.app` al último deploy** (puede quedar sirviendo código viejo). Correr **`vercel --prod`** después para forzar el alias. (Co-author trailer: `Claude Opus 4.8 <noreply@anthropic.com>`.)
2. **Cambio de base de datos** → crear el `.sql` en `supabase/migrations/` Y **darle el SQL al usuario para correr en el SQL Editor** (no se aplica solo).
3. **Verificar deploy**: `vercel ls solvit` (esperar `● Ready`). Smoke test con `curl`.
4. **Env vars**: `vercel env add/rm <VAR> production` (CLI autenticado). Para Preview, el CLI pide branch (usar `--value ... --yes` o el dashboard).
5. Plataforma: **Windows / PowerShell + Git Bash**. Editor del usuario: VSCode.

---

## 15. Avisos por email — referencia de setup

- **Gmail App Password**: cuenta `solvithomes@gmail.com` con verificación en 2 pasos activada →
  https://myaccount.google.com/apppasswords (está **oculto** del menú, entrar por link directo) →
  crear → código de 16 letras → va en `GMAIL_APP_PASSWORD` (**sin espacios**).
- **Service role key**: Supabase → Settings → API → `service_role` → va en `SUPABASE_SERVICE_ROLE_KEY`
  (Vercel, **solo Production/servidor**).
- **Webhooks** (Supabase → Database → Database Webhooks), ambos evento **INSERT**, método POST,
  header `Authorization: Bearer <WEBHOOK_SECRET>` (el **mismo** secreto en los dos):
  | Webhook | Tabla | URL endpoint | Manda mail a |
  |---|---|---|---|
  | `aviso-propuestas` | `public.propuestas` | `…/api/propuesta-creada` | demandante (te llegó propuesta) |
  | `aviso-publicacion` | `public.publicaciones` | `…/api/publicacion-creada` | demandante (publicación creada) + técnicos del rubro+zona |
- **Endpoints**: `app/api/propuesta-creada/route.ts` y `app/api/publicacion-creada/route.ts`
  (nodemailer + Gmail SMTP, `runtime = "nodejs"`). El de publicación cruza `perfiles_profesionales`
  por `rubro` + `zona` para avisar a los técnicos. Límite Gmail ~500/día.
- ⚠️ Tras tocar estos endpoints: `git push` **y** `vercel --prod` (el alias `solvitweb` no se
  reapunta solo — ver §14.1). Si un aviso "no llega", revisar `select … from net._http_response`
  en el SQL Editor (status 200 = llegó al endpoint; 401 = header mal; vacío = el webhook no disparó).
- A futuro (con dominio): migrar a **Resend** para mejor entregabilidad y remitente `@dominio`.
