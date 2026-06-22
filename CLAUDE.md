# Contexto del proyecto — SolvIT

> Este archivo resume el contexto operativo del proyecto para que cualquier sesión de
> Claude Code (y yo mismo) arranque entendiendo la situación. No reemplaza al README
> (que describe el producto y el esquema de datos), sino que lo complementa con el
> contexto de **propiedad, repos, deploy y credenciales**.

---

## 1. Qué es esto

**SolvIT** — marketplace de servicios para el hogar en Buenos Aires. Conecta
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
| `NEXT_PUBLIC_APP_URL` | Recomendada | Si falta, los links de confirmación apuntan a `https://solvit.homes`. Setear a la URL real del deploy. |
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

- **Decisión: no uso el dominio viejo (`solvit.homes`).** Al deployar conecto el repo en
  Vercel y uso el **dominio nuevo que genera Vercel** (`*.vercel.app`).
- El código referencia `solvit.homes` y envía desde `noreply@solvit.homes`, dominio
  verificado en una cuenta de Resend de otra persona — que **no** tengo.
- Por eso: dejar `RESEND_API_KEY` **sin setear** → los emails transaccionales se saltean y
  la app sigue andando (no rompe).
- Setear `NEXT_PUBLIC_APP_URL` a la URL nueva de Vercel para que los links de confirmación
  apunten bien (overridea el default `solvit.homes`).
- **URL de producción actual: `https://solvitweb.vercel.app`** (no `solvit.homes`).

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
8. **Perfiles** (`/perfil`): el técnico edita teléfono/zona/rubro y ve su reputación; el demandante edita nombre/apellido y ve las opiniones que dejó. Datos con candado/lápiz para editar.
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
