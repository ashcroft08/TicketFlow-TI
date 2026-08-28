<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/lib/assets/img/TicketFlow_logo_modo_oscuro.webp">
    <img src="src/lib/assets/img/TicketFlow_logo_modo_claro.webp" alt="Logo de TicketFlow TI" width="240">
  </picture>
</p>

<h1 align="center">TicketFlow TI</h1>

<p align="center">
  Sistema PWA de gestión de tickets de soporte técnico e inventario de activos TI<br>
  para empresas con múltiples sucursales.
</p>

<p align="center">
  <a href="https://ticket-flow-ti.vercel.app"><strong>🚀 Demo en vivo</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-2-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit 2">
  <img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL + Drizzle ORM">
  <img src="https://img.shields.io/badge/PWA-Offline_Sync-5A0FC8?logo=pwa&logoColor=white" alt="PWA">
</p>

## ¿Qué es?

TicketFlow TI es un ERP interno de soporte técnico. Centraliza el ciclo completo de atención: los encargados de tienda crean tickets con evidencia fotográfica, los técnicos los atienden desde su bandeja, y la administración controla inventario, personal y sucursales desde un panel central. Funciona como **PWA instalable con modo offline**: los técnicos pueden escanear activos y registrar movimientos sin conexión, y todo se sincroniza automáticamente al recuperar la red.

## ✨ Características

### 🎫 Gestión de tickets
- Creación de tickets con imágenes adjuntas (Cloudinary)
- Asignación a técnicos, estados, prioridades y categorías técnicas
- Comentarios públicos e internos en cada ticket
- Vista de detalle adaptada a cada rol

### 🖥️ Inventario de activos TI
- Registro de activos por sucursal y usuario asignado
- Catálogo de artículos, tipos y proveedores externos
- Movimientos de inventario: entradas, salidas y reparaciones
- Bitácora de movimientos con categorías
- **Escáner de códigos de barras** para números de serie (cámara del dispositivo)
- Papelera con restauración de registros eliminados

### 📱 PWA con modo offline
- Instalable en móvil y escritorio (`manifest.json` + service worker)
- CRUD offline de activos y bitácora (IndexedDB vía Dexie)
- Sincronización automática al recuperar la conexión
- Página de respaldo para arranque en frío sin internet

### 🔐 Seguridad
- JWT en cookies `HttpOnly` con `SameSite: strict`
- Login con **username o email**
- Hashing de contraseñas con bcrypt
- **Versionamiento de tokens**: cambiar la contraseña invalida todas las sesiones activas
- Recuperación de contraseña por correo (Gmail SMTP con App Password)
- Protección de rutas por rol en `hooks.server.ts`

## 👥 Roles y vistas

| Rol | Ruta | Funciones |
|---|---|---|
| **ADMIN** | `/admin` | Gestión completa: usuarios, sucursales, tickets, activos, catálogo, bitácora, proyectos, configuración |
| **TECH** (Técnico) | `/tecnico` | Bandeja de tickets asignados, diagnóstico, comentarios y perfil |
| **STORE_MANAGER** (Encargado) | `/encargado` | Crear tickets con adjuntos y hacer seguimiento de sus solicitudes |

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | SvelteKit 2 (Svelte 5 con runes) |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL (Supabase en producción) |
| ORM | Drizzle ORM (`drizzle-kit push`) |
| Estilos | Tailwind CSS v4 con tokens `@theme` |
| Autenticación | JWT propio (`jsonwebtoken`) + `bcryptjs` |
| Correo | Nodemailer (Gmail SMTP) |
| Imágenes | Cloudinary |
| Offline | IndexedDB (Dexie) + service worker |
| Escáner | html5-qrcode |
| Validación | Zod |
| Iconos | lucide-svelte |
| Despliegue | Vercel |
| Gestor de paquetes | pnpm |

## 🏗️ Arquitectura

Clean Architecture con patrón **Repository → Service → Action**:

1. **Repository** — solo consultas SQL (Drizzle), sin lógica de negocio.
2. **Service** — lógica de negocio (credenciales, hashing, tokens, correo).
3. **Action** (`+page.server.ts`) — controladores de SvelteKit que orquestan servicios.

```
src/
├── lib/
│   ├── server/
│   │   ├── db/            # Esquema Drizzle, conexión y seed
│   │   ├── repositories/  # Capa de acceso a datos
│   │   ├── services/      # Lógica de negocio
│   │   └── validation/    # Esquemas de validación (Zod)
│   └── assets/            # Logo y recursos gráficos
├── routes/
│   ├── admin/             # Panel administrativo (14 módulos)
│   ├── tecnico/           # Bandeja del técnico
│   ├── encargado/         # Vista del encargado de tienda
│   ├── api/               # Endpoints (tickets, sync offline)
│   ├── offline/           # Página de respaldo PWA
│   └── forgot-password/   # Recuperación de contraseña
└── hooks.server.ts        # Middleware JWT + protección de rutas
```

## ⚙️ Instalación

### Prerrequisitos

- Node.js 20+
- pnpm
- PostgreSQL en ejecución
- (Opcional) Cuenta de Cloudinary y Gmail con App Password para adjuntos y correos

### Pasos

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/ashcroft08/TicketFlow-TI.git
cd TicketFlow-TI
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 3. Sincronizar el esquema de la base de datos
pnpm db:push

# 4. Sembrar datos iniciales (crea el usuario administrador)
pnpm db:seed

# 5. Levantar el servidor de desarrollo
pnpm dev
```

### Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ | Conexión a PostgreSQL local |
| `ORIGIN` | ✅ | URL base (protección CSRF de SvelteKit) |
| `JWT_SECRET` | ✅ | Secreto de firma de tokens (32 bytes en Base64) |
| `ADMIN_USER` / `ADMIN_PASS` / `ADMIN_EMAIL` | ✅ | Credenciales del admin inicial (seed) |
| `DATABASE_URL_PROD` | — | Pooler de Supabase (solo producción) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | — | Correo saliente para recuperación de contraseña |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | — | Almacenamiento de imágenes adjuntas |

## 📜 Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Previsualizar el build |
| `pnpm check` | Verificación de tipos (svelte-check) |
| `pnpm lint` | Prettier + ESLint |
| `pnpm format` | Formatear el código |
| `pnpm db:push` | Sincronizar esquema con la base de datos |
| `pnpm db:generate` | Generar migraciones de Drizzle |
| `pnpm db:migrate` | Aplicar migraciones |
| `pnpm db:studio` | Explorador visual de la base de datos |
| `pnpm db:seed` | Sembrar datos iniciales |
| `pnpm db:pull` | Volcar el esquema desde la base de datos |

## 📈 Estado del proyecto

- ✅ Autenticación completa (login, recuperación de contraseña, invalidación de sesiones)
- ✅ Dashboards por rol: administrador, técnico y encargado
- ✅ Gestión de tickets con comentarios y adjuntos
- ✅ Inventario de activos con escáner de códigos de barras
- ✅ Bitácora de movimientos de inventario
- ✅ PWA con CRUD offline y sincronización automática
- ✅ Desplegado en producción en [Vercel](https://ticket-flow-ti.vercel.app)
