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
> menciones históricas a `solvit.homes` (dominio viejo de Mateo, ya no se usa).
> `sufix.com.ar` **es hoy la URL principal** (2026-09-21, ver §7): todos los demás dominios,
> incluido `sufixapp.com`, redirigen a él.

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
| `NEXT_PUBLIC_APP_URL` | Recomendada | Si falta, los links de confirmación apuntan a `https://sufix.com.ar`. Hoy está seteada a ese mismo valor en Producción. |
| `CRON_SECRET` | Recomendada | Sin esto, el cron diario de keepalive devuelve 401 (inofensivo) |
| `SUPABASE_SERVICE_ROLE_KEY` | Para el mail | **Secreta, solo servidor.** La usa `/api/propuesta-creada` para leer el email del demandante. NUNCA `NEXT_PUBLIC`. |
| `GMAIL_USER` | Para el mail | `solvithomes@gmail.com` — remitente del aviso de propuesta |
| `GMAIL_APP_PASSWORD` | Para el mail | Contraseña de aplicación de Google (16 letras). Ver §15. |
| `WEBHOOK_SECRET` | Para el mail | Protege `/api/propuesta-creada`. Va en el header `Authorization: Bearer <secret>` del webhook de Supabase. |
| `ZAPIER_CONTACTO_WEBHOOK_URL` | No | Si está seteada, cada clic en "Contactar por WhatsApp" (`registrarContacto`, `app/tecnico/[id]/actions.ts`) además de guardarse en `contactos_tecnico` manda una copia a un Zap (Catch Hook → Create Spreadsheet Row) para verlo en un Google Sheet en vivo. Si falta, se saltea sin romper nada — Supabase sigue siendo la fuente de verdad. |

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
- **URL de producción:** **https://sufix.com.ar** (desde 2026-09-21, ver §7; todos los demás
  dominios, incluidos `sufixapp.com` y los `.vercel.app`, redirigen 308 acá).
- **Repo GitHub conectado** → auto-deploy: push a `main` = producción.
- **Env vars (Production):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_APP_URL` (= `https://sufix.com.ar`), `CRON_SECRET` (seteado).
  `RESEND_API_KEY` (2026-09-07, ver §7 y §16), `WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
  ⚠️ Vercel las marca **Sensitive**: no se pueden volver a leer, ni por CLI ni por panel. El
  `WEBHOOK_SECRET` se recupera copiándolo de un webhook ya configurado en Supabase.
- ✅ Redirect URLs de Supabase: ya acepta `https://sufixapp.com/**` (verificado con
  `generateLink`, respeta el `redirect_to` que se le pide).

### Pasos (referencia)
1. Crear proyecto en mi Vercel apuntando a `pedrodibelli/solvit` (uso el dominio
   `*.vercel.app` que genera Vercel — ver sección 7).
2. Cargar en Vercel: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mínimo).
3. ✅ Base de Supabase: **reuso la original** (soy owner — ver sección 5).
4. Agregar la URL nueva de Vercel a las Redirect URLs de Supabase Auth.
5. Setear `NEXT_PUBLIC_APP_URL` a la URL real del deploy. `CRON_SECRET` opcional.

---

## 7. Dominio y emails (Resend)

- **Decisión histórica: no usé el dominio viejo (`solvit.homes`, de Mateo).** Al deployar
  conecté el repo en Vercel y usé el **dominio que genera Vercel** (`*.vercel.app`) — sigue
  siendo la URL en producción hoy (ver nota de rebranding al principio del archivo).
- ✅ **RESUELTO 2026-09-07: hay dominio propio y los mails salen.** `sufixapp.com` está
  verificado en Resend (DKIM + 2 CNAME + DMARC, cargados en DonWeb que es donde vive el DNS)
  y `RESEND_API_KEY` está seteada en Vercel. Lo nuevo se manda con `lib/mail.ts` desde
  `hola@sufixapp.com`. Ver §16 para el detalle.
- `/publicar/actions.ts` (email dormido de Resend, referencia `sufix.com.ar`) sigue sin usarse:
  `/publicar` está redirigido desde el pivot, así que ese código no se ejecuta.
- ✅ **URL de producción: `https://sufix.com.ar`** (desde 2026-09-21, antes era `sufixapp.com`).
  Es el único dominio sin redirect. **Todos los demás redirigen 308 a `sufix.com.ar`**:
  `www.sufix.com.ar`, `sufixapp.com`, `sufixapp.online/.store`, `sufix.online/.store`,
  `solvitweb.vercel.app` y `solvit-navy.vercel.app`. `sufixapp.com` tiene que seguir conectado al
  proyecto en Vercel (es lo que hace andar su redirect).
- `sufix.com.ar` es un `.com.ar` con **DNS en DonWeb** (`ns1/ns2.donweb.com`), no en Vercel — por eso
  `vercel domains inspect` marca los nameservers con ☓, es normal. En DonWeb: registro A
  `sufix.com.ar → 76.76.21.21` y CNAME `www → sufix.com.ar`. Tiene certificado propio en Vercel.
  ⚠️ El certificado no se emitió solo apenas se cargó el dominio: `https` daba error de handshake
  hasta que Vercel lo generó (unos minutos después de que el DNS quedó bien).
- `sufixapp.online/.store` y `sufix.online/.store` están en Vercel pero su DNS no apunta ahí, así que
  **no resuelven**: el redirect existe pero nadie llega a él.
- **Los redirects de dominio se cambian por API**, no hay comando de CLI:
  `vercel api /v9/projects/solvit/domains/<dominio> -X PATCH --input <json>` con
  `{"redirect":"sufix.com.ar","redirectStatusCode":308}` (o `{"redirect":null}` para hacerlo
  principal). Vercel no deja redirigir un dominio mientras otro redirija hacia él: hay que soltar
  primero a los que apuntan a él.
- El remitente de mails sigue siendo `hola@sufixapp.com` a propósito (Resend está verificado para
  ese dominio). Solo cambiaron los **links** dentro de los mails, que ahora apuntan a `sufix.com.ar`.
- **Google Search Console:** todavía no está dado de alta. Cuando se haga, registrar
  `sufix.com.ar` como propiedad principal.

---

# 📍 ESTADO ACTUAL DEL PRODUCTO (leer esto primero)

> Sección agregada para que una sesión nueva sepa **en qué punto estamos y cómo funciona
> todo**, sin tener que explorar el código. Última actualización: **2026-09-11**.

## 8.0 Mapa del sitio — lo que está VIVO hoy

> El §8 de más abajo ("Cómo funciona la app hoy") describe el modelo **pre-pivot**
> (publicar problema → propuestas → pago → código de cierre). Quedó desactualizado por
> el pivot del 20/21-08 y se conserva solo como referencia histórica de un esquema que
> sigue en el código pero **pausado** (ver §11). Lo que un visitante ve hoy en
> producción es esto:

| Ruta | Qué es | Quién la ve |
|---|---|---|
| `/` | Home: hero + buscador, directorio de técnicos **verificados**, secciones de marketing (Seguridad, Oficios, Cómo funciona, WhatsApp) | Todos. El técnico logueado ve además su propia vista previa arriba, con cartel de "en revisión" si todavía no lo aprobaron |
| `/categoria/[slug]` | Técnicos de un oficio, con hero de stats (verificados, zonas cubiertas) | Todos |
| `/categorias` | Grilla de los 10 oficios con conteo real de técnicos (se actualiza solo) | Todos |
| `/tecnico/[id]` | Perfil público: foto, rubros, zonas, reseñas (nativas + reputación externa tipo Google Maps si está cargada), botón WhatsApp, botón de reportar el perfil | Todos. Un perfil sin `verificado=true` avisa "en revisión" en vez de mostrarse como aprobado |
| `/como-funciona` | Explicación del modelo (gratis, sin comisión) + FAQ | Todos |
| `/registrar`, `/ingresar` | Alta y login, con confirmación de mail (ver §10) | Visitantes |
| `/restablecer` | Pantalla para poner la contraseña nueva, llega por el mail de "olvidé mi contraseña" | Quien pidió el reset |
| `/perfil` | Edición de datos propios; el técnico completa foto/experiencia; sección "Borrar mi cuenta" (los dos roles) | Usuarios logueados |
| `/reportar` | Reportar un problema general (con el sitio o con un técnico) — **exige cuenta**, es una conversación | Usuarios logueados |
| `/admin` | Panel: **Reportes** + **Técnicos pendientes de revisión** (ver §11, actualizado) | Solo los dos emails admin |
| `/terminos`, `/privacidad` | Legales, linkeados del footer | Todos |

**Redirigidas (307), del modelo viejo — no tocar salvo que se restaure ese modelo:**
`/publicar`, `/buscar`, `/oferentes`, `/servicio/[slug]`, `/profesional/[slug]` (ver
`next.config.mjs`). `/publicar` en particular seguía insertando en `publicaciones` y
disparando mails reales a técnicos sobre un trabajo que nadie podía ver — por eso se cortó.

**Directorio de técnicos — reglas que no son obvias mirando el código:**
- Un técnico **no aparece en ningún listado público** hasta que un admin lo marca
  `verificado = true` desde `/admin`. El trigger de alta (`crear_perfil_al_registrarse`)
  llena rubro/zona desde el metadata pero **nunca** pone `verificado` en true — nace en false.
- La calificación que se muestra sigue `calificacionEfectiva()` en `lib/reputacion.ts`: si
  `reputacion_fuente` + `reputacion_rating` + `reputacion_total` están los tres cargados,
  se usa esa (ej. Google Maps); si no, se usan las reseñas nativas de `resenas`; si no hay
  ninguna, no se muestra nada (nunca se inventa un promedio). El orden "Recomendados" usa un
  promedio ponderado por confianza (más peso cuanto más reseñas tiene), no el promedio pelado.
- `reputacion_url` sola (sin rating/total) **no muestra nada en la web** — queda guardada
  en la base para cuando se complete el dato. Ver §17 para cómo se consigue ese dato.

## 8. Cómo funciona la app hoy (features que YA están) — HISTÓRICO, pre-pivot

> ⚠️ Este §8 y el §9 describen el modelo **de antes del 20/21-08-2026**. El código sigue
> en el repo, intacto, pero **no es alcanzable desde ningún link de la web hoy** — ver
> §8.0 arriba para lo que sí está vivo. Se conserva como documentación por si algún día
> se revierte el pivot (ver la nota al principio del archivo).

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

**Auth:** "Confirm email" está **PRENDIDO** en Supabase desde 2026-09-11 (antes estaba
apagado a propósito porque no había SMTP). El SMTP de Resend está configurado y probado de
punta a punta: el mail de recuperar contraseña llega, y el de confirmación de cuenta
también — registrar una cuenta ya no deja al usuario logueado directo, hay que tocar el
link del mail. Ese link vuelve por `/auth/callback?next=...` (canjea el `code` de PKCE
por una sesión real) y aterriza en `/perfil?bienvenida=1` si es técnico o `/?bienvenida=1`
si es demandante — el componente `Bienvenida` muestra el cartel de "cuenta confirmada".

⚠️ **Si alguna vez hay que tocar esto de nuevo:** nunca prender "Confirm email" sin haber
probado antes que el SMTP manda de verdad (ej. con "olvidé mi contraseña", que usa el mismo
SMTP y no bloquea a nadie si falla). Prenderlo con el SMTP roto deja a **todo el mundo** sin
poder registrarse — pasó una vez en esta sesión por apurar el orden.

## 11. Panel de administración (`/admin`)
- Accesible para **`solvithomes@gmail.com` y `sufixar@gmail.com`** (ver `lib/admin.ts` —
  mantener sincronizado con el chequeo de email dentro de las funciones SQL de admin y con
  la policy RLS de `reportes`, migración `20260903e`).
- **Secciones vivas hoy:**
  - **Reportes** — problemas con un técnico, con el sitio, o sugerencias (tabla `reportes`,
    sin policy de SELECT salvo para los admins — ni el propio técnico reportado puede leer
    quién lo reportó). Botón "Marcar revisado".
  - **Técnicos pendientes de revisión** — quienes se registraron solos por la web y todavía
    no están `verificado = true`. Botón "Marcar verificado" (dispara el mail de "tu perfil
    ya está publicado" al técnico).
- **Secciones pausadas** (código y RPCs intactos, no se llaman desde `/admin` porque su flujo
  de origen — publicar problema → propuesta → pago — no es alcanzable desde ningún link hoy):
  **Pagos en revisión** (aprobar/rechazar) y **Disputas abiertas** (resolver).

## 12. Decisiones tomadas (y por qué)
- **Reusar la base de Supabase de Mateo** (soy owner). El deploy viejo de Mateo (`solvit.homes`)
  **sigue vivo y comparte la misma base** — todavía NO lo corté (pendiente: sacarlo del team + rotar keys).
- **Modelo: el cliente paga todo** (consulta + tarifa); Mateo le paga la consulta al técnico al
  concretarse (payout manual) — ver §9. Mercado Pago = fase 2.
- **Emails: FUNCIONANDO** desde 2026-09-07 con Resend + `sufixapp.com` (ver §7 y §16).
- **Admin = `solvithomes@gmail.com` y `sufixar@gmail.com`** (ver `lib/admin.ts`).
  ⚠️ **No borrar esas dos cuentas de Supabase.** El control de acceso a `/admin` es "tu email
  está en esta lista", y con "Confirm email" apagado cualquiera podría registrar una dirección
  libre y quedar admin. Hoy la puerta está tapada porque las dos están ocupadas. Si alguna se
  borra, sacarla antes de `lib/admin.ts` y de las funciones SQL de admin.
- Realtime requiere conexión **autenticada** (`supabase.realtime.setAuth(token)` antes de suscribir).

## 13. Roadmap / pendientes
**✅ Hecho, de la puesta en marcha de los mails (2026-09-07 a 09-11):**
- ~~Prender "Confirm email"~~ — hecho el 2026-09-11, probado end-to-end (ver §10).
- Marcar "No es spam" en los avisos de `sufixar@gmail.com`/`solvithomes@gmail.com` que
  cayeron en spam — el dominio es nuevo y todavía está construyendo reputación con Gmail.

**Pendiente (sigue abierto):**
- **Rotar `RESEND_API_KEY`**: la que está en uso hoy se pegó en un chat en algún momento
  de la sesión del 2026-09-07. Cambiarla en Vercel **y** en el password del SMTP de Supabase
  (usan la misma clave) — no está confirmado que ya se haya rotado.

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
1. **Cambio de código** → `npm run build` (verificar que compila) → `git add -A` → commit →
   `git push origin main`. ⚠️ **El push NO siempre re-apunta el dominio `sufix.com.ar` al último
   deploy** (puede quedar sirviendo código viejo). Correr **`vercel --prod --yes`** y después
   **`vercel alias set <deployment> sufix.com.ar`** — ver §18 para el detalle de comandos.
   El texto del trailer de commit (`Co-Authored-By: ...`) lo da el sistema en cada sesión,
   no es fijo — usar el que venga en las instrucciones de esa sesión, no copiar uno viejo.
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

---

## 16. Alta de técnicos y mails propios (2026-09-07)

### Un técnico NO entra al directorio hasta que lo aprueban
La home promete "ningún técnico entra sin que lo miremos primero" y hasta esta fecha no era
cierto: quien se registraba aparecía al instante. Ahora los tres listados públicos filtran por
`verificado = true` — la home (`app/page.tsx`), `/categoria/[slug]` y los contadores de
`/categorias`. El perfil suelto `/tecnico/[id]` sigue accesible por link directo (lo necesita
`/admin` para revisarlo) pero avisa que está en revisión.

- El técnico ve en su home un cartel de "tu perfil está en revisión" y el subtítulo cambia a
  "así se va a ver tu perfil cuando lo publiquemos".
- `/admin` tiene la sección **Técnicos pendientes de revisión**, con el teléfono como link de
  WhatsApp (verificar = hablarle). El botón "Marcar verificado" usa **service role**: la policy
  `perfil_owner` es `FOR ALL USING (auth.uid() = user_id)`, así que ni el admin puede editar el
  perfil de otro por RLS.

### Mails (lib/mail.ts, Resend desde hola@sufixapp.com)
| Mail | Qué lo dispara |
|---|---|
| Técnico nuevo → a los admins | Webhook `aviso-tecnico-nuevo`: INSERT en `perfiles_profesionales` → `/api/tecnico-registrado` |
| Perfil aprobado → al técnico | `verificarTecnico()` en `app/admin/actions.ts` |
| Confirmación de cuenta y recuperar contraseña | Supabase Auth vía SMTP de Resend (no pasa por nuestro código) |

`enviarMail()` nunca tira: si falta la key loguea y devuelve `false`. Un aviso que no sale no
debe tumbar la acción que lo dispara. Los mails salen **de a uno**, no en paralelo: Resend
limita a 2 pedidos por segundo.

> Los dos endpoints viejos (`/api/propuesta-creada`, `/api/publicacion-creada`, por Gmail SMTP
> con nodemailer) siguen ahí pero **están dormidos**: disparan sobre `propuestas` y
> `publicaciones`, tablas que desde el pivot ya nadie escribe.

### Teléfonos: el link de WhatsApp tiene que funcionar siempre
`wa.me` necesita `54 + 9 + área + número` (13 dígitos). Sin ese `9` el link abre un chat vacío.
Había tres cargados mal a mano. `telefonoWhatsApp()` en `lib/whatsapp.ts` normaliza las variantes
conocidas y devuelve `null` si no puede completarlo con certeza — mejor no mostrar el botón que
mandar a un chat equivocado. El campo del registro tiene el prefijo `+54 9 11` **fijo** y se queda
con los **últimos** 8 dígitos, así da lo mismo pegar el número entero o escribirlo con el 15.

### Otras cosas de esta tanda
- **Borrar cuenta** (`/perfil`, los dos roles). `resenas` no tiene FK contra `auth.users`, así que
  no se borran solas: hay que hacerlo a mano, igual que la foto en Storage.
- **Recuperar contraseña**: `/restablecer` (el mail vuelve por `/auth/callback?next=/restablecer`,
  que canjea el `code` de PKCE). Antes el link volvía a `/ingresar`, que no tiene dónde escribir
  la contraseña nueva.
- **`components/PasswordInput.tsx`**: campo de contraseña con ojo, usado en los 6 de la app.
- **Páginas del modelo viejo redirigidas** (307, en `next.config.mjs`): `/buscar`, `/oferentes`,
  `/servicio/:slug`, `/profesional/:slug` y `/publicar`. Esta última importa: seguía insertando en
  `publicaciones` y ese INSERT dispara mails a los técnicos sobre un trabajo que nadie puede ver.


---

## 17. Cómo cargar técnicos nuevos (runbook, 2026-09-11)

El usuario manda técnicos en tandas por CSV/Excel (nombre, apellido, teléfono, rubros,
zonas, a veces un link de reputación). Pasos, en orden:

### 17.1 Leer el archivo sin adivinar
- **CSV exportado de Google Sheets pierde los hipervínculos**: si una columna tiene el texto
  "google maps" en vez de una URL, es porque el link estaba como hipervínculo sobre esa
  palabra y el CSV solo guarda el texto visible. Pedirle al usuario el **.xlsx**, no el CSV,
  para poder leer la URL real.
- **Un .xlsx es un ZIP.** No hay librería de xlsx instalada en el proyecto. Para leerlo:
  `Expand-Archive` (PowerShell) sobre una copia renombrada a `.zip`, después parsear a mano
  `xl/worksheets/sheet1.xml` + `xl/worksheets/_rels/sheet1.xml.rels` (para los hipervínculos)
  + `xl/sharedStrings.xml` (los textos están indexados ahí, no inline).
- ⚠️ **GOTCHA ya pisado una vez:** una celda vacía en xlsx se guarda autocerrada
  (`<c r="B6" s="2"/>`, sin `</c>`). Un regex ingenuo tipo `<c ...>([\s\S]*?)</c>` no distingue
  eso y la celda vacía "roba" el contenido de la celda siguiente (corre todo el resto de la
  fila una columna). Parsear celda por celda, chequeando primero si autocierra (`/^<c[^>]*\/>/`)
  **antes** de buscar un `</c>`.
- Nunca confiar en el **nombre** para saber si un técnico ya existe — viene con typos,
  mayúsculas sueltas, columnas corridas. Matchear siempre por **teléfono**, quedándose con los
  últimos 10 dígitos (`tel.replace(/\D/g,"").slice(-10)`) para que dé igual con o sin `+54 9`.

### 17.2 Crear el técnico
Alta vía `admin.auth.admin.createUser()` (service role) con `user_metadata.es_profesional:
true`, `categorias` (array de slugs) y `zonas` (array de nombres) — el trigger
`crear_perfil_al_registrarse` arma la fila de `perfiles_profesionales` solo. Después, a mano:
- `verificado: true` explícito — los que carga el equipo entran verificados de una, no pasan
  por el flujo de aprobación en `/admin` (ese es para altas que se registran solas por la web).
- Rubros en texto libre → mapear a los slugs reales de `lib/data.ts` (`plomeria`, `gas`,
  `aire`, `cerrajeria`, `pintura`, `carpinteria`, `albanileria`, `electrodomesticos`,
  `electricidad`, `vidrieria`). "CABA" en la columna de zonas se expande a los 9 barrios
  modelados (`ZONAS_CABA` en `lib/data.ts`), no se guarda como el string "CABA".

### 17.3 Fotos
Bucket de Storage `avatars`, ruta `${userId}/avatar`, con `?v=${Date.now()}` en la URL
pública para que no quede cacheada. **Mirar cada foto antes de subir**, no asumir: si es un
logo (muchos técnicos mandan el logo de su emprendimiento, no una foto de la cara) se
redimensiona con `fit:"contain"` y fondo tomado del propio pixel de esquina del logo, para no
recortar el diseño; si es una foto de persona, `fit:"cover"` con `sharp.strategy.attention`
(detección de sujeto, no centro a ciegas).

### 17.4 Reputación externa (Google Maps)
El dato que hace falta es `reputacion_fuente` + `reputacion_rating` + `reputacion_total` +
`reputacion_url`, los cuatro juntos (ver §8.0) — la URL sola no muestra nada.

- **`WebFetch` no sirve para Google Maps.** Es una SPA que renderiza todo con JS; `WebFetch`
  solo ve el HTML crudo y no encuentra ni el nombre del negocio. Hay que usar **Playwright**
  con un browser real.
- **Cada consulta necesita un `browser.newContext()` nuevo**, no reusar la misma `page` en un
  loop: Maps es una SPA y las navegaciones siguientes dentro del mismo contexto no renderizan
  igual que la primera carga (el panel de reseñas no se auto-abre). Con contexto fresco por
  consulta, la tasa de éxito subió de 0/20 a 17/20 en la única vez que se hizo esto.
- El rating+conteo aparece en **al menos 4 formatos de texto distintos** según cómo cargue la
  página, sin selector CSS estable (las clases de Google son ofuscadas y cambian):
  1. Ficha completa con reseñas ya visibles: `"\n4.4\n23 opiniones"` (regex:
     `/\n(\d[.,]\d)\n(\d+)\s*(?:opinion|reseñ)/i`).
  2. Página de lista/búsqueda con uno o más negocios: `"4.8(68)"` pegado, sin espacio — hay
     que **confirmar por teléfono** que el bloque de texto alrededor corresponde al técnico
     correcto antes de tomar el número (puede haber varios negocios en la misma página).
  3. Ficha que carga en la pestaña "Descripción general" en vez de "Opiniones": clickear el
     botón/tab "Opiniones" (o el propio rating) fuerza a que se abra el panel con el conteo.
  4. Algunos links del Excel están directamente **rotos** (typo tipo un `%20` de más metido en
     medio de una coordenada) o apuntan a una búsqueda genérica en vez de la ficha — esos no
     se adivinan, se le devuelven al usuario para que los revise.
- Nunca escribir un rating/total sin haber visto el patrón matchear de verdad. Mejor dejar
  `reputacion_url` cargada sola (inerte, no rompe nada — ver §8.0) que inventar un número.

---

## 18. Herramientas y comandos que uso seguido

### Vercel CLI
```
vercel --prod --yes                                  # deploy a producción
vercel alias set <deployment-url> sufix.com.ar        # re-apuntar el dominio real (los demás solo redirigen)
vercel env add/rm <VAR> production                    # cargar/sacar env vars
vercel logs <deployment-url>                           # logs en runtime, para debug de endpoints
vercel domains inspect <dominio>                       # nameservers actuales vs los que espera Vercel
```
⚠️ Las env vars quedan marcadas **Sensitive** — ni yo ni el usuario las podemos volver a leer
por CLI ni por panel una vez cargadas. Si hace falta un secreto ya cargado (ej. `WEBHOOK_SECRET`),
sacarlo de otro lugar que ya lo tenga (un webhook de Supabase ya configurado, por ejemplo),
nunca inventarlo ni pedírselo de nuevo al usuario si ya existe en algún lado.

⚠️ **El DNS de `sufixapp.com` vive en DonWeb, no en Vercel**, aunque `vercel domains ls` lo
liste como dominio del proyecto. `vercel dns ls sufixapp.com` va a devolver una zona vacía o
inactiva — no es donde hay que cargar registros MX/TXT/CNAME reales. Confirmarlo con
`vercel domains inspect sufixapp.com` (columna "Current Nameservers").

### Operar contra Supabase sin pasar por el dashboard
El patrón que uso para casi todo (altas de técnicos, correcciones puntuales, verificaciones,
limpieza de datos de prueba): un script Node de un solo uso en el scratchpad de la sesión,
con el **service role key** leído de `.env.local`, ej.:
```js
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split(/\r?\n/)
  .filter(l=>l.includes("=")&&!l.startsWith("#"))
  .map(l=>[l.slice(0,l.indexOf("=")).trim(), l.slice(l.indexOf("=")+1).trim()]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
```
Se corre, se lee el resultado, y **se borra el script** — no se deja código de un solo uso en
el repo. Si además hace falta simular el registro real (no solo tocar la base), usar Playwright
contra un `npm run build && npx next start` local — más fiel que llamar a Supabase directo,
porque pasa por la validación del formulario real.

### Verificar cambios antes de darlos por terminados
- **Playwright** (ya instalado) para todo lo que sea flujo de usuario: registrar, loguear,
  aprobar un técnico, dejar una reseña, etc. Correr contra `npm run start` local primero,
  contra producción después de deployar.
- **Datos de prueba: siempre limpiarlos después.** Contar cuántos registros hay antes de la
  prueba, hacer la prueba, contar después, y borrar lo que se haya creado (cuenta +
  `perfiles_profesionales` + archivos en Storage si corresponde). Usar `+algo@gmail.com` o
  `@example.com` para que se identifiquen fácil y no se confundan con datos reales — pero ver
  el aviso de abajo sobre `@example.com`.
- ⚠️ **`@example.com` no sirve para probar el registro real con "Confirm email" prendido**:
  es un dominio reservado que no recibe correo, y Resend lo rechaza con un 500 al intentar
  mandarle la confirmación — eso rompe el registro, no es un bug de la app. Para probar el
  flujo de alta completo (no solo tocar la base), usar una dirección real con `+alias`.
- Antes de publicar cualquier cambio visual, screenshot con Playwright y mirarlo — no asumir
  que un cambio de CSS/Tailwind se ve como se espera con solo leer el código.

---

## 19. Sistema de diseño (para que un cambio nuevo no desentone)

- **Paleta** (`tailwind.config.ts`): verdes `sv-primary` #4E7A3E, `sv-dark` #1D2E20 (fondo del
  footer y de la tira "el problema"), `sv-olive` #3C6030, `sv-mint`/`sv-light` de fondo suave.
  Cremas `zap-50` a `zap-300`. Fondo general de página: `#FBF8EF`.
- **Tipografía**: Poppins para títulos (`font-display`/`display`), Inter para el resto.
- **Contenedores**: `container-home` (1140px, usado en toda la home y páginas nuevas post-pivot)
  vs. `container-pad` (1280px, el más viejo, todavía en varias páginas pre-pivot). No mezclar
  los dos en la misma sección.
- **Componentes de ícono propios**: `components/icons.tsx` — línea 24×24, trazo 1.75, sin
  relleno salvo detalles puntuales. **No usar emojis en ningún lado nuevo** — fue un pedido
  explícito y ya se limpiaron todos los que había (oficios, pasos, seguridad, WhatsApp).
- **Botones/tarjetas**: convención `btn-primary` / `btn-outline` / `btn-ghost`, `.card` en
  `globals.css`. Las clases de utilidad (`@layer utilities`) le ganan a las de componente
  (`@layer components`) en Tailwind — si un override no toma efecto, revisar en qué layer está.

---

## 20. Mobile primero en el directorio (rediseño 2026-09-20)

**Por qué:** el 90-95% del tráfico entra desde el celular, y la web estaba hecha en desktop y
sólo *adaptada* a mobile. Medido en un iPhone 13 (390×664) contra producción, la home eran
**54 pantallas de scroll**: la grilla sola eran 44, porque se renderizaban 100 tarjetas en una
columna, y el único filtro estaba en el hero — a la tarjeta 40 no había forma de cambiar de
oficio sin volver 20 pantallas arriba. Las secciones de marketing quedaban debajo de todo eso,
o sea invisibles en mobile.

**Resultado:** home 54 → **14,1 pantallas**, `/categoria` 46,9 → **7,8**, primera tarjeta de la
pantalla 1,8 → **0,9**, HTML de la home 949 KB → **471 KB**.

### Regla que ordena todo: el corte es `lg`
Debajo de `lg` manda el directorio; en `lg`+ queda **exactamente** la home de desktop de antes.
Nunca se ven las dos cosas ni ninguna:

| Debajo de `lg` (mobile/tablet) | En `lg`+ (desktop) |
|---|---|
| `TecnicosFiltroBar` (sticky, oficio + zona) | `HeroSearchCard` |
| conteo dentro de `TecnicosFiltroBar` | conteo dentro de `TecnicosSortBar` |
| garantías compactas debajo del buscador | garantías largas bajo el titular |
| sin bajada ni eyebrow en la sección de técnicos | título completo, centrado |

**Si tocás uno, tocá el otro** — si no, queda un hueco (nada visible) o dos buscadores.

### Cosas que ya se pisaron (no repetir)
- **`overflow-x-hidden` rompe `position: sticky`.** `<main>` lo tenía y la barra de filtro se
  pegaba al tope de `<main>` (fuera de pantalla) en vez de al viewport. Se cambió por
  **`overflow-x-clip`**, que recorta igual pero no crea contenedor de scroll.
- **El blob decorativo del hero pinta sobre la sección siguiente.** Es `absolute` dentro de una
  sección `relative`; al acortar el hero en mobile empezó a asomar sobre el título de
  `#tecnicos`. Se arregla poniendo `relative` en la sección que va abajo (va después en el DOM,
  así que pinta encima), no tocando el blob.
- **Al filtrar hay que reposicionar el scroll.** Si filtrás desde la tarjeta 40 y quedan 6
  resultados, te quedás mirando el pie de página creyendo que no hubo resultados.
  `TecnicosDirectorio` sube al tope del listado, pero **sólo si ya estabas más abajo**.
- **La grilla se reinicia al filtrar** (`key` por filtro en `TecnicosGrid`): sin eso, quien tocó
  "Ver más" hasta 60 y después filtra un oficio con 8 se queda con el "mostrando 60" viejo.

### Filtrado: ahora vive en el navegador
`app/page.tsx` manda la lista **completa** (sin filtrar) + `filtroInicial` de la URL;
`TecnicosDirectorio` filtra y ordena con `useMemo`. Servidor y cliente usan **la misma**
función (`lib/filtros.ts`) — eso es lo que evita el error de hidratación, porque el primer
render del cliente arranca del mismo estado que renderizó el servidor. La URL se mantiene con
`replaceState` (compartible, sin tocar el historial ni pegarle al servidor).

Tener los 620 en memoria es **a propósito**: es lo que hace que cambiar de oficio sea
instantáneo. El costo es el peso del HTML, y por eso **no se mandan campos que la tarjeta no
usa** — se sacó `reputacion_url` de los `select` de la home y de `/categoria` (sólo la usa
`/tecnico/[id]`), que eran ~130 KB de URLs de Google Maps al pedo. Si agregás un campo al
`select`, fijate primero si `TecnicoCard` lo usa.

### Otros cambios de esta tanda
- **`TANDA` de 100 → 12** en `TecnicosGrid` (sirve para mobile y desktop: 4 filas de 3).
- **`BottomNav` para todos**, no sólo logueados. Antes era `{user && <BottomNav/>}`, así que el
  90-95% del tráfico no la veía nunca — y encima el `<body>` ya reservaba su alto en mobile,
  o sea que al visitante le quedaba una franja vacía abajo. Ítems nuevos: Inicio / Oficios /
  (Contactos si hay sesión, Ingresar si no).
- **`CustomSelect` tiene variante `pill`** (chata, para la barra de filtro) además de `campo`
  (la original del hero), con `menuAlign` para que el menú de la pastilla derecha no se salga
  de la pantalla.
- **`app/sitemap.ts` + `app/robots.ts`** (no existían). Con 12 tarjetas por tanda, los otros 608
  perfiles ya no están linkeados en el HTML, así que sin sitemap Google no llega a
  `/tecnico/[id]`. El sitemap usa los mismos criterios de "quién es público" que la home.
- **`/tecnico/[id]` no se tocó**: ya estaba bien en mobile (3,7 pantallas, botón de WhatsApp
  arriba del pliegue). Es la página que convierte — no meterle mano sin motivo.

### Corrección del 2026-09-21: se sacaron los chips de oficio
El rediseño había puesto, además de las pastillas, una fila de chips de oficio que se deslizaba
en horizontal (`OficiosChips`) arriba del listado. **Se sacó al día siguiente, mirándolo en un
celular de verdad:** no se entendía que se podía deslizar — sólo se notaba porque el último chip
quedaba cortado al medio — y hacía exactamente lo mismo que la pastilla "Oficio" de la barra
sticky.

Quedaron **sólo Oficio + Zona**, que se leen como lo que son. La lección sirve para lo que venga:
**un control que hay que descubrir no le gana a uno que se entiende solo**, y dos controles para
la misma acción es peor que uno. El componente se borró; está en el historial de git (commit del
rediseño, 2026-09-20) por si se quiere volver con otra presentación.

---

## 21. Rendimiento: por qué se sentía lento y qué quedó (2026-09-21)

**Síntoma reportado:** cada clic mostraba la pantalla de carga (`app/loading.tsx`) como un
segundo. **Causa:** el servidor tardaba ~1,2 s por página.

### El culpable: un `.in()` de 620 ids sobre una tabla de 3 filas
La home filtraba `resenas_resumen` con `.in("tecnico_id", [los 620 ids])`. Esa vista sólo tiene
una fila por técnico **con reseñas nativas de Sufix** — hoy son **3 filas, 232 bytes**. O sea
que se armaba una URL de ~23 KB con 620 UUIDs para filtrar tres filas.

Medido contra la base real: **con `.in()` 7.940 ms; trayendo la tabla entera 54 ms.** 150 veces
más rápido. Lo mismo pasaba en `/categoria`.

> ⚠️ **Regla:** nunca `.in()` con cientos de ids contra PostgREST. Si la tabla es chica, traerla
> entera. Si es grande, paginar o filtrar por rango — pero no por lista de ids.

### Lo otro que se sacó del camino
- **`/tecnico/[id]` esperaba un INSERT** en `vistas_perfil_tecnico` antes de mandar una línea de
  HTML. Ahora va en **`after()`** (Next 16), que corre después de enviar la respuesta. El
  comentario viejo decía que no se podía hacer fire-and-forget porque en serverless se cortaba
  — cierto, y `after()` es justamente la forma correcta: garantiza que termine.
- **`getUser()` → `getSession()`** en la home y en el perfil. `getUser()` valida el token contra
  Supabase en cada visita (una ida y vuelta más); `getSession()` lee la cookie local. Sólo se usa
  para decidir **qué se muestra** — los datos los protege RLS. Mismo criterio que ya usaba Header.
- **Las dos consultas de los listados van en `Promise.all`** (son independientes).

### Resultado
| | Antes | Ahora |
|---|---|---|
| Navegar entre páginas (clic) | ~1 s + pantalla de carga | **24-47 ms, sin pantalla de carga** |
| Primera carga de la home | ~2,5 s | **~1,3 s** |
| TTFB, todas las páginas | 1,2 s la home | **~0,31 s, parejo** |

### Lo que queda (y es una decisión de producto, no un bug)
El piso de latencia es **~0,30 s** (se ve en `/como-funciona`, que no toca la base): Argentina →
edge de Vercel en São Paulo → función en **iad1** → vuelta. No se baja sin mover la función.

Arriba de ese piso, a la home le quedan ~450 ms que **escalan con el payload**: manda los 620
técnicos al navegador para que filtrar sea instantáneo. Sin comprimir son 470 KB; **con brotli
53 KB** (el JSON es muy repetitivo), así que el costo no es la descarga sino serializar y
comprimir en el servidor. El campo más pesado es `zona` (78 KB de 348 KB en crudo).

Es el precio del filtrado instantáneo (ver §20). Si alguna vez pesa más la primera carga que la
fluidez del filtro, la alternativa es volver a filtrar del lado del servidor por URL: la home
bajaría a ~0,5 s y filtrar pasaría a costar ~0,4 s. **Hoy está elegido al revés a propósito.**

> Ojo al medir: `curl` sin `--compressed` no pide brotli y muestra el tamaño sin comprimir
> (470 KB en vez de 53 KB). Y Next hace **streaming**, así que `time_starttransfer` es cuándo
> salió el primer pedazo, no cuándo terminó el servidor — hay que mirar `time_total`. La primera
> medición de cada tanda suele incluir **cold start** de la función (se vio 1,8 s en la home y
> 1,3 s hasta en una página estática); no confundirlo con lentitud del código.


---

## 22. El buscador del hero, roto por el rediseño mobile (2026-09-21)

**Síntoma:** en desktop, elegir un oficio y apretar "Buscar técnicos" cambiaba la URL pero el
listado seguía mostrando los 620. Medido contra producción: **620 antes de buscar, 620 después.**
En mobile las pastillas sí filtraban, y entrar directo a `/?tecQ=Plomería` también — por eso pasó
una semana sin que nadie lo viera.

### Causa: navegar no re-inicializa un `useState`
`HeroSearchCard` hacía `router.push("/?tecQ=…#tecnicos")`. Eso funcionaba cuando el servidor
filtraba. Cuando el filtro se movió al navegador (§20) quedó así:

```
app/page.tsx (servidor)  →  <TecnicosDirectorio filtroInicial={…} />  →  useState(filtroInicial)
```

`router.push` a la **misma ruta** con otro querystring re-renderiza el componente de servidor,
pero React reconcilia por tipo y posición y **conserva el estado** del componente cliente que ya
estaba montado. `filtroInicial` cambiaba de valor y `useState` lo ignoraba, porque un valor
inicial sólo se usa al montar. La URL cambiaba, el listado no.

> ⚠️ **Regla:** si un dato viaja del servidor al cliente como "valor inicial" de un `useState`,
> **no se puede refrescar navegando**. O el estado vive en un lugar donde los dos controles lo
> comparten, o hay que remontar el componente con un `key`.

### Lo que quedó
- **`components/DirectorioContext.tsx`** (nuevo): el filtro y el orden viven acá, un escalón
  arriba del directorio. `app/page.tsx` envuelve el hero **y** la sección `#tecnicos` con
  `<DirectorioProvider>`, así el buscador del hero y la barra sticky de mobile escriben el mismo
  estado. El hero ya no navega: filtra al instante, como las pastillas. La URL se sigue
  manteniendo con `replaceState`, así que el link sigue siendo compartible.
- `TecnicosDirectorio` ya no tiene estado propio ni props de filtro; sólo `tecnicos` + `resumenMap`.
- El buscador del hero ganó la opción **"Cualquier oficio" / "Cualquier zona"**: no tenía forma de
  volver atrás una vez elegido un oficio.

### Dos cosas más que aparecieron revisando, y también estaban en producción
- **Los links `"/#tecnicos"` no saltaban a ningún lado** (footer, `/como-funciona`, `/categoria`).
  Next manda el HTML en streaming: cuando el navegador procesa el fragmento, el hero todavía no
  tiene su alto final, así que `#tecnicos` está a 0px del tope y "saltar" ahí no mueve nada.
  Arreglado con **`components/AnclaAlCargar.tsx`**, que rehace el salto después de hidratar.
  (El CTA de la propia home sí andaba: ahí la página ya está armada cuando lo tocás.)
- **`w[0]` no es "la primera letra"**, es la primera unidad UTF-16. Hay 3 técnicos con el nombre
  fuera del BMP (`𝗣𝗟𝗢𝗠𝗘𝗥𝗢` en negrita Unicode, dos que empiezan con emoji) y la inicial del
  avatar les salía media pareja sustituta: se dibujaba como el rombo con el signo de
  pregunta **y rompía la hidratación de React**
  en `/categoria` (error #418), o sea que la grilla entera se volvía a renderizar en el cliente.
  Ahora hay `iniciales()` en `lib/format.ts`, que recorre por code points y saltea símbolos
  (`"🟠WOLFCOLORS Pintores"` → `"WP"`). Se usa en los 6 lugares que repetían el one-liner.

### Cómo verificar que el buscador anda (no alcanza con mirar el código)
Contar resultados, no tarjetas: la grilla muestra **12 por tanda**, así que `620` y `111`
resultados se ven los dos como 12 tarjetas. El número está en el texto
`"N profesionales encontrados"` (desktop) y `"N técnicos"` (barra sticky de mobile).
