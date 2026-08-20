# Sufix — Marketplace de servicios para el hogar

Sufix conecta personas con problemas en el hogar (demandantes) con profesionales verificados (oferentes) en Buenos Aires. El demandante publica su problema, los profesionales compiten con propuestas de precio, y el demandante elige y paga la consulta inicial directamente en la plataforma.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 3 |
| Base de datos y auth | Supabase (PostgreSQL + RLS) |
| Tipado | TypeScript 5 |
| Fuentes | Sora (display), Inter (body), Plus Jakarta Sans |
| Deploy | Vercel (recomendado) |

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Correr el proyecto

```bash
npm install
npm run dev
```

---

## Roles de usuario

Hay dos tipos de cuenta, elegidos al registrarse:

- **Demandante** — publica problemas y contrata profesionales.
- **Oferente (Profesional)** — responde publicaciones con propuestas de precio.

El rol se guarda en `user_metadata.es_profesional` (boolean) de Supabase Auth. El header, el marketplace y la página "Mis consultas" adaptan su contenido según el rol.

---

## Journey del Demandante

```
1. REGISTRO
   └─ /registrar → elige "No, busco servicio"
      └─ campos: nombre, apellido, email, contraseña

2. PUBLICAR PROBLEMA
   └─ /publicar → completa título, descripción, categoría, zona, urgencia
      └─ se guarda en tabla `publicaciones` con status = "abierto"

3. VER PROPUESTAS
   └─ /mis-consultas (tab "Activas")
      └─ cada publicación muestra las propuestas recibidas ordenadas por precio
      └─ puede Rechazar o Aceptar cada propuesta

4. ACEPTAR PROPUESTA → FLUJO DE PAGO
   └─ Abre AceptarModal (3 pasos):
      ├─ Paso 1 — Resumen: ve precio + comisión fija $4.500 + total
      ├─ Paso 2 — Transferencia: datos bancarios de Sufix (CVU, alias, mail)
      └─ Paso 3 — Confirmado: datos del profesional desbloqueados

5. CONSULTA CERRADA
   └─ /mis-consultas (tab "Cerradas")
      └─ ve nombre, teléfono (Llamar / WhatsApp), email y zona del profesional
      └─ ve aviso IMPORTANTE con código de 4 dígitos que el profesional le enviará
      └─ debe reenviar ese código al WhatsApp de Sufix (+54 11 5798 0934)
      └─ la publicación desaparece del marketplace automáticamente
```

---

## Journey del Oferente (Profesional)

```
1. REGISTRO
   └─ /registrar → elige "Sí, soy profesional"
      └─ campos extra: DNI, teléfono, rubro (categoría), zona de trabajo
      └─ todo se guarda en user_metadata de Supabase Auth

2. VER MARKETPLACE
   └─ / (homepage) → ve todas las publicaciones abiertas de demandantes
      └─ puede filtrar por categoría, zona y texto

3. ENVIAR PROPUESTA
   └─ Toca "Contactar" en una publicación → abre ContactarModal
      └─ ingresa el precio de su primera consulta
      └─ se guarda en tabla `propuestas` con:
         - profesional_id, nombre_profesional, profesional_email
         - profesional_telefono, profesional_zona, profesional_dni
         - estado = "pendiente"

4. SEGUIMIENTO
   └─ /mis-consultas (tabs: Todas / Pendientes / Aceptadas / Rechazadas)
      ├─ Pendiente — el demandante aún no respondió
      ├─ Aceptada  — el demandante pagó la consulta
      │   └─ ve su código de pago de 4 dígitos para enviar al demandante
      └─ Rechazada — el demandante eligió otra propuesta (precio oculto)
```

---

## Esquema de base de datos (Supabase)

### Tabla `publicaciones`

| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| title | text | Título del problema |
| description | text | Descripción detallada |
| category_slug | text | Categoría (ej: "plomeria") |
| zone | text | Barrio (ej: "Palermo") |
| urgency | text | "hoy" / "esta_semana" / "flexible" |
| status | text | "abierto" / "cerrado" |
| posted_by | text | Nombre visible del demandante |
| photo | text | URL de imagen (opcional) |
| created_at | timestamptz | — |

### Tabla `propuestas`

| Columna | Tipo | Descripción |
|---|---|---|
| id | uuid | PK |
| publicacion_id | text | ID de la publicación |
| profesional_id | uuid | FK → auth.users |
| precio | numeric | Precio propuesto |
| estado | text | "pendiente" / "aceptada" / "rechazada" |
| codigo_pago | text | Código de 4 dígitos generado al aceptar |
| nombre_profesional | text | Nombre completo |
| profesional_email | text | Email del profesional |
| profesional_telefono | text | Teléfono del profesional |
| profesional_zona | text | Zona de trabajo del profesional |
| profesional_dni | text | DNI del profesional |
| titulo | text | Título de la publicación (copia) |
| descripcion | text | Descripción de la publicación (copia) |
| zona | text | Zona de la publicación (copia) |
| categoria | text | Categoría de la publicación (copia) |
| demandante | text | Nombre del demandante (copia) |
| created_at | timestamptz | — |

### Políticas RLS requeridas

```sql
-- SELECT: el profesional ve sus propuestas; el demandante ve las de sus publicaciones
CREATE POLICY "propuestas_select" ON propuestas FOR SELECT
USING (
  profesional_id = auth.uid()
  OR publicacion_id IN (SELECT id::text FROM publicaciones WHERE user_id = auth.uid())
);

-- UPDATE: igual que SELECT
CREATE POLICY "propuestas_update" ON propuestas FOR UPDATE
USING (
  profesional_id = auth.uid()
  OR publicacion_id IN (SELECT id::text FROM publicaciones WHERE user_id = auth.uid())
);

-- UPDATE publicaciones: solo el dueño
CREATE POLICY "publicaciones_update" ON publicaciones FOR UPDATE
USING (user_id = auth.uid());
```

---

## Flujo de pago

El pago se realiza por **transferencia bancaria** a la cuenta de Sufix:

| Dato | Valor |
|---|---|
| CVU | 0000003100036596584321 |
| Alias | matteo.osunaa |
| Teléfono / WhatsApp | +54 11 5798 0934 |
| Email | matteo.osuna@gmail.com |

La comisión de plataforma es **$4.500 fijos** por consulta (se suma al precio del profesional).

Verificación del pago:
1. Al aceptarse una propuesta se genera un `codigo_pago` de 4 dígitos.
2. El oferente lo envía al demandante por WhatsApp.
3. El demandante reenvía ese código al WhatsApp de Sufix (+54 11 5798 0934) para confirmar que el contacto ocurrió.

---

## Categorías disponibles

`plomeria` · `electricidad` · `gas` · `aire` · `cerrajeria` · `pintura` · `carpinteria` · `albanileria` · `electrodomesticos` · `vidrieria`

## Zonas disponibles

Palermo · Recoleta · Belgrano · Núñez · Puerto Madero · Caballito · Villa Crespo · Colegiales · Almagro · Vicente López · Olivos · San Isidro
