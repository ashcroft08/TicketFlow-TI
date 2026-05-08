# TicketFlow TI — Contexto del Proyecto

## 🎯 Descripción General
**TicketFlow TI** es un ERP interno de gestión de soporte técnico para una empresa con múltiples sucursales. Permite crear tickets de soporte, asignarlos a técnicos, gestionar inventario de activos TI, y llevar trazabilidad completa. Está diseñado para funcionar como **PWA** (Progressive Web App) aunque no requiere funcionalidad offline (IndexedDB descartado).

**Repositorio:** https://github.com/ashcroft08/TicketFlow-TI
**Commits en español.**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | SvelteKit (Svelte 5 con runes: `$props()`, `$state()`) |
| **Base de Datos** | PostgreSQL |
| **ORM** | Drizzle ORM (con `drizzle-kit push` para sincronizar) |
| **CSS** | Tailwind CSS v4 (con variables `@theme` en `layout.css`) |
| **Iconos** | `lucide-svelte` |
| **Autenticación** | JWT con `jsonwebtoken` (cookies HttpOnly) |
| **Hashing** | `bcryptjs` |
| **Correo** | `nodemailer` (Gmail SMTP con App Password) |
| **Gestor de Paquetes** | `pnpm` |

> [!IMPORTANT]
> **NO usar Better Auth.** Se intentó integrar pero es incompatible con el esquema personalizado (`id_usuario` serial en vez del `id` texto que Better Auth espera). Se descartó a favor de JWT propio.

---

## 🏗️ Arquitectura (Clean Architecture)

```
src/
├── lib/
│   ├── assets/img/                 # Logo (TicketFlow_logo.webp)
│   └── server/
│       ├── db/
│       │   ├── index.ts            # Conexión Drizzle
│       │   ├── schema.ts           # Esquema completo de la BD
│       │   └── seed.ts             # Script de sembrado inicial
│       ├── repositories/
│       │   └── UserRepository.ts   # Capa de acceso a datos (queries)
│       └── services/
│           ├── AuthService.ts      # Lógica de negocio: login, reset password
│           └── EmailService.ts     # Envío de correos (nodemailer)
├── routes/
│   ├── +page.svelte                # LOGIN (ruta raíz `/`)
│   ├── +page.server.ts             # Acción del login (valida + crea JWT)
│   ├── forgot-password/            # Solicitar recuperación de contraseña
│   ├── reset-password/[token]/     # Formulario para nueva contraseña
│   ├── layout.css                  # Variables de diseño Tailwind v4
│   └── +layout.svelte              # Layout global
├── hooks.server.ts                 # Middleware: validación de sesión JWT + protección de rutas
└── app.d.ts                        # Tipos globales (SessionUser en Locals)
```

### Patrón: Repository → Service → Action
1. **Repository** (`UserRepository.ts`): Solo consultas SQL (Drizzle). Sin lógica de negocio.
2. **Service** (`AuthService.ts`): Lógica de negocio (validar credenciales, hashear, generar tokens).
3. **Actions** (`+page.server.ts`): Controladores de SvelteKit. Orquestan servicios y manejan HTTP.

---

## 🔐 Sistema de Autenticación

### Login
- El usuario puede iniciar sesión con **username O email** (campo `identifier`).
- Se busca en la BD con `findByIdentifier()` que usa `OR` en Drizzle.
- Se valida la contraseña con `bcryptjs.compare()`.
- Se crea un JWT firmado con `jsonwebtoken` que incluye: `id`, `nombre`, `email`, `username`, `cod_rol`, `rol`, `id_sucursal`, `token_version`.
- El JWT se almacena en una cookie `HttpOnly`, `SameSite: strict`, con duración de **8 horas**.

### Protección de Rutas (`hooks.server.ts`)
- Lee la cookie JWT en cada petición.
- Verifica la firma con `jwt.verify()`.
- **Versionamiento de tokens**: Compara `token_version` del JWT con el de la BD. Si el usuario cambió su contraseña, la versión se incrementa y todas las sesiones antiguas se invalidan automáticamente.
- Si el usuario está inactivo (`estado = false`), la sesión se rechaza.
- Rutas protegidas: `/admin`, `/tecnico`, `/dashboard`.
- Si un usuario logueado intenta acceder a `/`, se redirige según su rol.

### Recuperación de Contraseña
1. Usuario ingresa su username o email en `/forgot-password`.
2. Se genera un token con `crypto.randomBytes(32)` y se guarda en la BD con expiración de 1 hora.
3. Se envía un correo con un botón que enlaza a `/reset-password/[token]`.
4. El usuario establece su nueva contraseña, que se hashea y guarda. Se incrementa `token_version`.

### Correo
- Se usa Gmail SMTP con una "App Password" (autenticación de 2 factores de Google).
- El logo se adjunta como CID para que se muestre incrustado en el correo.
- Se incluye versión de texto plano para evitar filtros de spam.

---

## 🗃️ Esquema de Base de Datos (Resumen)

### Tablas principales:
| Tabla | Propósito |
|---|---|
| `roles` | ADMIN, TECH, STORE_MANAGER |
| `sucursal` | Matriz, La Concordia, Quininde, etc. |
| `usuarios` | Usuarios del sistema (login, email, password, token_version) |
| `tickets` | Solicitudes de soporte técnico |
| `ticket_adjuntos` | Imágenes adjuntas a tickets |
| `ticket_comentarios` | Comentarios públicos/internos |
| `estados_tickets` | Estados del ticket (abierto, en progreso, cerrado) |
| `categorias` | Categorías técnicas |
| `nivel_atencion` | Prioridades (baja, media, alta, crítica) |
| `activos_ti` | Equipos/activos de TI (PCs, impresoras, etc.) |
| `catalogo_articulos` | Catálogo de productos |
| `tipos_articulos` | Tipos de artículos |
| `movimientos_inventario` | Entradas, salidas, reparaciones |
| `personas` | Proveedores/talleres externos |
| `proyectos_software` | Proyectos de software internos |

### Columna `token_version` (usuarios):
- Empieza en `1`.
- Se incrementa cada vez que se resetea la contraseña.
- Se usa para invalidar todas las sesiones JWT anteriores al cambio.

### Relaciones importantes:
- Un usuario pertenece a un **rol** y una **sucursal**.
- Un ticket es **creado por** un usuario y **asignado a** otro (técnico).
- Los activos se asocian a sucursales y usuarios.

---

## 🎨 Sistema de Diseño

### Fuente de verdad: `src/plantilla/DESIGN.md`
- Colores definidos como variables CSS en `layout.css` usando `@theme` de Tailwind v4.
- Paleta basada en Material Design 3 (Primary, Secondary, Surface, Error, etc.).
- Diseño "Glassmorphism" con `backdrop-blur`, bordes translúcidos y sombras suaves.

### Animaciones:
- `blob`: Movimiento orgánico de los fondos decorativos.
- `fade-in-up`: Entrada suave desde abajo.
- `shake`: Sacudida para mensajes de error.
- `shimmer`: Efecto de brillo (definido pero no activo actualmente).

---

## 👤 Roles del Sistema

| Código | Rol | Dashboard | Descripción |
|---|---|---|---|
| `ADMIN` | Administrador | `/admin` | Gestión completa: usuarios, configuración, reportes |
| `TECH` | Técnico | `/tecnico` | Atender tickets, registrar movimientos de inventario |
| `STORE_MANAGER` | Encargado de tienda | `/dashboard` | Crear tickets, ver estado de sus solicitudes |

---

## 📋 Variables de Entorno (`.env`)

```env
DATABASE_URL="postgres://..."
ORIGIN="http://localhost:5173"
JWT_SECRET="..."
ADMIN_USER="admin"
ADMIN_PASS="admin123"
ADMIN_EMAIL="correo@ejemplo.com"
GMAIL_USER="correo@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

---

## ✅ Estado Actual (Mayo 2026)

### Completado:
- [x] Login funcional con JWT (username o email)
- [x] Diseño premium del login (Glassmorphism, animaciones, responsive PWA)
- [x] Recuperación de contraseña por correo (con logo incrustado)
- [x] Versionamiento de tokens JWT (invalidación de sesiones al cambiar clave)
- [x] Protección de rutas por rol
- [x] Redirección automática según rol al loguearse
- [x] Esquema completo de base de datos definido
- [x] Seed script funcional

### Pendiente (próximo paso):
- [ ] **Vista del Encargado (STORE_MANAGER)**: Crear tickets, ver "Mis Tickets"
- [ ] Vista del Técnico: Bandeja de tickets asignados
- [ ] Vista del Admin: CRUD de usuarios, configuración
- [ ] Logout funcional
- [ ] Gestión de inventario
- [ ] Comentarios en tickets
- [ ] Adjuntos en tickets
- [ ] Service Worker para PWA (cache del shell)

---

## ⚠️ Notas Importantes para Continuidad

1. **Svelte 5**: Usar `$props()` en vez de `export let`. Usar `$state()` para reactividad.
2. **No usar Better Auth**: Incompatible con `id_usuario` serial. Usar el sistema JWT propio.
3. **Logs de debug**: Hay `console.log('DEBUG SESIÓN:')` en `hooks.server.ts`. **Eliminarlos antes de producción.**
4. **Ruta API**: Puede quedar una carpeta `src/routes/api/auth/` de Better Auth. **Eliminarla.**
5. **Tailwind v4**: Las clases personalizadas se definen en `layout.css` con `@theme`, no en `tailwind.config`.
