# Roles del Sistema — DeskTrack

## Contexto general

Sistema PWA de soporte técnico e inventario TI para empresas con múltiples sucursales.
Maneja tickets de soporte, activos tecnológicos (equipos, accesorios, repuestos) y movimientos de inventario.

Stack: Express.js + Node.js + MySQL + SvelteKit (PWA)

---

## Roles disponibles

| Rol | cod_rol | Descripción corta |
|---|---|---|
| Administrador | `admin` | Configura y gestiona todo el sistema |
| Encargado | `encargado` | Crea y hace seguimiento de tickets |
| Técnico | `tecnico` | Resuelve tickets y gestiona inventario |

---

## 👤 Administrador (`admin`)

### Responsabilidades
- Gestiona usuarios: crear, activar, desactivar, asignar rol y sucursal
- Configura todos los catálogos del sistema
- Registra y administra sucursales
- Registra equipos en el inventario
- Ve todos los tickets de todas las sucursales
- Genera reportes de equipos, movimientos y tickets
- Gestiona personas externas (talleres de reparación)
- Administra proyectos de software

### Tablas y permisos

| Tabla | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|
| USUARIOS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| ROLES | ❌ | ✅ | ❌ | ❌ |
| SUCURSAL | ✅ | ✅ | ✅ | ❌ (soft delete) |
| ESTADOS_TICKETS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| CATEGORIAS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| NIVEL_ATENCION | ✅ | ✅ | ✅ | ❌ (soft delete) |
| TIPOS_MOVIMIENTOS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| TIPOS_ARTICULOS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| CATALOGO_ARTICULOS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| ACTIVOS_TI | ✅ | ✅ | ✅ | ❌ (soft delete) |
| PERSONAS | ✅ | ✅ | ✅ | ❌ (soft delete) |
| PROYECTOS_SOFTWARE | ✅ | ✅ | ✅ | ❌ (soft delete) |
| TICKETS | ❌ | ✅ (todos) | ❌ | ❌ |
| MOVIMIENTOS_INVENTARIO | ❌ | ✅ | ❌ | ❌ |

### Restricciones
- No crea tickets
- No resuelve tickets
- No registra movimientos de inventario
- El DELETE siempre es lógico (soft delete vía `deleted_at`)

---

## 👤 Encargado (`encargado`)

### Responsabilidades
- Crea tickets cuando algo falla en su sucursal
- Al crear el ticket: selecciona categoría, nivel de urgencia y puede vincular el activo específico que falla (`id_activo`)
- Sube fotos o capturas como adjuntos
- Comenta en sus tickets para dar contexto o responder al técnico
- Hace seguimiento del estado de sus propios tickets

### Tablas y permisos

| Tabla | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|
| TICKETS | ✅ | ✅ (solo propios) | ❌ | ❌ |
| TICKET_ADJUNTOS | ✅ | ✅ (solo propios) | ❌ | ❌ |
| TICKET_COMENTARIOS | ✅ | ✅ (solo propios) | ❌ | ❌ |
| ACTIVOS_TI | ❌ | ✅ (solo su sucursal) | ❌ | ❌ |
| CATALOGO_ARTICULOS | ❌ | ✅ | ❌ | ❌ |
| ESTADOS_TICKETS | ❌ | ✅ | ❌ | ❌ |
| CATEGORIAS | ❌ | ✅ | ❌ | ❌ |
| NIVEL_ATENCION | ❌ | ✅ | ❌ | ❌ |

### Restricciones
- Solo ve tickets creados por él (`created_by = id_usuario`)
- Solo ve activos de su propia sucursal (`id_sucursal`)
- No puede cambiar el estado de un ticket
- No puede editar ni eliminar sus tickets una vez creados
- No ve las `notas_tecnico` del técnico

---

## 👤 Técnico (`tecnico`)

### Responsabilidades
- Ve todos los tickets asignados a él
- Actualiza el estado del ticket conforme avanza
- Agrega notas técnicas internas (`notas_tecnico`) — el encargado no las ve
- Comenta en el ticket para comunicarse con el encargado
- Registra movimientos de inventario al actuar sobre equipos
- Actualiza el estado del activo TI (`en_reparacion`, `activo`, `baja`)
- Sube adjuntos como evidencia del trabajo realizado
- Cierra el ticket llenando `fecha_cierre`

### Tablas y permisos

| Tabla | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|
| TICKETS | ❌ | ✅ (asignados a él) | ✅ (estado, notas, fecha_cierre) | ❌ |
| TICKET_COMENTARIOS | ✅ | ✅ | ❌ | ❌ |
| TICKET_ADJUNTOS | ✅ | ✅ | ❌ | ❌ |
| ACTIVOS_TI | ❌ | ✅ | ✅ (estado, observaciones) | ❌ |
| MOVIMIENTOS_INVENTARIO | ✅ | ✅ | ❌ | ❌ |
| PERSONAS | ❌ | ✅ | ❌ | ❌ |
| TIPOS_MOVIMIENTOS | ❌ | ✅ | ❌ | ❌ |
| CATALOGO_ARTICULOS | ❌ | ✅ | ❌ | ❌ |
| ESTADOS_TICKETS | ❌ | ✅ | ❌ | ❌ |

### Tipos de movimiento que registra

| codigo | Descripción | Cuándo |
|---|---|---|
| `salida_reparacion` | Equipo sale a taller externo | Diagnóstico requiere reparación externa |
| `retorno_reparacion` | Equipo vuelve del taller | Equipo reparado regresa |
| `instalacion` | Repuesto instalado en equipo | Se cambia RAM, disco, fuente, etc. |
| `baja` | Equipo dado de baja definitiva | Irreparable o fuera de uso |
| `entrada` | Ingreso de equipo/repuesto nuevo | Admin normalmente, técnico ocasionalmente |

### Restricciones
- No crea tickets
- No puede dar de baja activos directamente — lo hace vía movimiento tipo `baja`
- Solo ve tickets donde `id_usuario = su id`
- No gestiona usuarios ni catálogos

---

## Campos clave en TICKETS según rol

| Campo | Quién lo llena | Cuándo |
|---|---|---|
| `created_by` | Encargado | Al crear el ticket |
| `id_usuario` | Administrador o sistema | Al asignar el técnico |
| `id_activo` | Encargado | Al crear (opcional) |
| `id_estado` | Técnico | Al actualizar progreso |
| `notas_tecnico` | Técnico | Durante resolución (privado) |
| `fecha_cierre` | Técnico | Al cerrar el ticket |
| `updated_by` | Técnico o Admin | En cada actualización |

---

## Flujo completo entre roles

```
ENCARGADO                    TÉCNICO                    ADMINISTRADOR
─────────────                ────────────               ─────────────
1. Crea ticket      →        2. Recibe ticket asignado  Configura catálogos
3. Sube adjuntos    →        4. Revisa y diagnostica    Gestiona usuarios
5. Responde         ←→       6. Comenta / pregunta      Ve reportes globales
   comentarios               7. Registra movimiento     Controla inventario
8. Ve estado        ←        9. Actualiza estado
   actualizado              10. Cierra ticket
```

---

## Estructura de base de datos relevante

### Tablas de catálogos (solo Admin gestiona)
- `ROLES` — roles del sistema
- `SUCURSAL` — sucursales de la empresa
- `ESTADOS_TICKETS` — estados posibles de un ticket (color incluido)
- `CATEGORIAS` — categorías de tickets (hardware, software, red, etc.)
- `NIVEL_ATENCION` — prioridades con orden numérico
- `TIPOS_MOVIMIENTOS` — tipos de movimiento de inventario con código
- `TIPOS_ARTICULOS` — tipos de activo (equipo, accesorio, repuesto)
- `CATALOGO_ARTICULOS` — modelos específicos con marca y modelo
- `PERSONAS` — talleres externos de reparación

### Tablas de operación
- `USUARIOS` — usuarios del sistema con rol y sucursal
- `TICKETS` — tickets de soporte (núcleo del sistema)
- `TICKET_ADJUNTOS` — imágenes adjuntas a tickets (Cloudinary)
- `TICKET_COMENTARIOS` — hilo de conversación por ticket
- `ACTIVOS_TI` — equipos físicos individuales con estado y asignación
- `MOVIMIENTOS_INVENTARIO` — historial de todos los movimientos de activos
- `PROYECTOS_SOFTWARE` — proyectos de desarrollo asignados a técnicos

### Relaciones críticas
- `TICKETS.created_by` → USUARIOS (Encargado que reportó)
- `TICKETS.id_usuario` → USUARIOS (Técnico asignado)
- `TICKETS.id_activo` → ACTIVOS_TI (equipo involucrado, opcional)
- `ACTIVOS_TI.id_sucursal` → SUCURSAL (dónde vive el equipo)
- `ACTIVOS_TI.id_usuario_asignado` → USUARIOS (técnico en reparación, opcional)
- `ACTIVOS_TI.id_catalogo` → CATALOGO_ARTICULOS → TIPOS_ARTICULOS
- `MOVIMIENTOS_INVENTARIO.id_activo` → ACTIVOS_TI
- `MOVIMIENTOS_INVENTARIO.id_ticket` → TICKETS (opcional)
- `MOVIMIENTOS_INVENTARIO.id_persona` → PERSONAS (taller externo, opcional)

---

## Notas para implementación

- El stock de activos **no se guarda**, se calcula con `COUNT()` sobre `ACTIVOS_TI` filtrado por `estado = 'activo'`
- Todos los DELETE son **soft delete** vía campo `deleted_at`
- El campo `notas_tecnico` en TICKETS es **privado** — el Encargado no debe verlo en la API
- Al cambiar estado de un activo a `baja` siempre debe existir un registro en `MOVIMIENTOS_INVENTARIO` con `codigo = 'baja'`
- `id_usuario` en TICKETS puede ser NULL al crear — se asigna después
- El nombre del sistema es **DeskTrack**
