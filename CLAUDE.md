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

### ✅ Estado: DEPLOYADO (2026-06-19)
- **Proyecto Vercel:** `sope/solvit` (vinculado vía `vercel link`).
- **URL de producción (estable):** https://solvit-navy.vercel.app
- **Repo GitHub conectado** → auto-deploy activo (push a `main` = producción).
- **Env vars cargadas:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (Production + Development) y `NEXT_PUBLIC_APP_URL` (Production). Smoke test OK
  (home 200, `/publicar` redirige a `/ingresar` → Supabase Auth responde).
- **Pendientes menores:**
  - Agregar `https://solvit-navy.vercel.app` a **Supabase → Auth → Redirect URLs**
    (si no, el login/confirmación por email puede fallar).
  - Env vars de Supabase en **Preview** (quirk del CLI; cargar desde el dashboard si se
    usan branch previews).
  - `NEXT_PUBLIC_APP_URL` se aplica en el **próximo** deploy (sin impacto ahora: emails
    apagados). `CRON_SECRET` opcional.

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
