import { pgTable, serial, varchar, integer, boolean, timestamp, text, date, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- TABLAS DE CONFIGURACIÓN Y ACCESO ---

export const roles = pgTable('roles', {
	id_rol: serial('id_rol').primaryKey(),
	rol: varchar('rol', { length: 100 }).notNull(),
	cod_rol: varchar('cod_rol', { length: 50 }).notNull().unique(),
	estado: boolean('estado').default(true),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const sucursal = pgTable('sucursal', {
	id_sucursal: serial('id_sucursal').primaryKey(),
	nombre: varchar('nombre', { length: 100 }).notNull(),
	estado: boolean('estado').default(true),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const cajas = pgTable('cajas', {
	id_caja: serial('id_caja').primaryKey(),
	id_sucursal: integer('id_sucursal').references(() => sucursal.id_sucursal).notNull(),
	nombre: varchar('nombre', { length: 100 }).notNull(),
	estado: boolean('estado').default(true),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const usuarios = pgTable('usuarios', {
	id_usuario: serial('id_usuario').primaryKey(),
	id_rol: integer('id_rol').references(() => roles.id_rol),
	id_sucursal: integer('id_sucursal').references(() => sucursal.id_sucursal),
	nombre: varchar('nombre', { length: 100 }).notNull(),
	username: varchar('username', { length: 100 }).notNull().unique(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	reset_token: varchar('reset_token', { length: 255 }),
	reset_token_expiry: timestamp('reset_token_expiry'),
	token_version: integer('token_version').default(1).notNull(),
	estado: boolean('estado').default(true),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

// --- TABLAS DE TICKETS ---

export const estados_tickets = pgTable('estados_tickets', {
	id_estado: serial('id_estado').primaryKey(),
	nombre: varchar('nombre', { length: 100 }).notNull(),
	color: varchar('color', { length: 20 }),
	estado: boolean('estado').default(true)
});

export const categorias = pgTable('categorias', {
	id_categoria: serial('id_categoria').primaryKey(),
	nombre_tecnico: varchar('nombre_tecnico', { length: 200 }).notNull(),
	estado: boolean('estado').default(true),
	deleted_at: timestamp('deleted_at')
});

export const nivel_atencion = pgTable('nivel_atencion', {
	id_nivel_atencion: serial('id_nivel_atencion').primaryKey(),
	nombre: varchar('nombre', { length: 200 }).notNull(),
	orden: integer('orden'),
	estado: boolean('estado').default(true)
});

export const tickets = pgTable('tickets', {
	id_ticket: serial('id_ticket').primaryKey(),
	id_estado: integer('id_estado').references(() => estados_tickets.id_estado),
	id_categoria: integer('id_categoria').references(() => categorias.id_categoria),
	id_nivel_atencion: integer('id_nivel_atencion').references(() => nivel_atencion.id_nivel_atencion),
	id_usuario: integer('id_usuario').references(() => usuarios.id_usuario), // Asignado a
	id_activo: integer('id_activo').references(() => activos_ti.id_activo),
	id_caja: integer('id_caja').references(() => cajas.id_caja),
	created_by: integer('created_by').references(() => usuarios.id_usuario),
	updated_by: integer('updated_by').references(() => usuarios.id_usuario),
	titulo: varchar('titulo', { length: 200 }).notNull(),
	descripcion: text('descripcion'),
	notas_tecnico: text('notas_tecnico'),
	fecha_cierre: timestamp('fecha_cierre'),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const ticket_adjuntos = pgTable('ticket_adjuntos', {
	id_adjunto: serial('id_adjunto').primaryKey(),
	id_ticket: integer('id_ticket').references(() => tickets.id_ticket),
	nombre: varchar('nombre', { length: 200 }),
	imagen_public_id: varchar('imagen_public_id', { length: 200 }),
	imagen_url: varchar('imagen_url', { length: 500 }),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow()
});

export const ticket_comentarios = pgTable('ticket_comentarios', {
	id_comentario: serial('id_comentario').primaryKey(),
	id_ticket: integer('id_ticket').references(() => tickets.id_ticket),
	id_usuario: integer('id_usuario').references(() => usuarios.id_usuario),
	comentario: text('comentario'),
	tipo_comentario: varchar('tipo_comentario', { length: 20 }).default('publico'), // publico | interno
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const ticket_lecturas = pgTable('ticket_lecturas', {
	id_ticket: integer('id_ticket').references(() => tickets.id_ticket).notNull(),
	id_usuario: integer('id_usuario').references(() => usuarios.id_usuario).notNull(),
	ultima_lectura: timestamp('ultima_lectura').defaultNow().notNull()
}, (t) => ({
	pk: primaryKey({ columns: [t.id_ticket, t.id_usuario] })
}));

// --- TABLAS DE INVENTARIO Y ACTIVOS TI ---

export const tipos_articulos = pgTable('tipos_articulos', {
	id_tipo: serial('id_tipo').primaryKey(),
	tipo: varchar('tipo', { length: 200 }).notNull(), // ej: lector, impresora, pc
	codigo: varchar('codigo', { length: 50 }),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const catalogo_articulos = pgTable('catalogo_articulos', {
	id_catalogo: serial('id_catalogo').primaryKey(),
	id_tipo: integer('id_tipo').references(() => tipos_articulos.id_tipo),
	created_by: integer('created_by').references(() => usuarios.id_usuario),
	updated_by: integer('updated_by').references(() => usuarios.id_usuario),
	nombre: varchar('nombre', { length: 200 }).notNull(),
	marca: varchar('marca', { length: 100 }),
	modelo: varchar('modelo', { length: 100 }),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const activos_ti = pgTable('activos_ti', {
	id_activo: serial('id_activo').primaryKey(),
	id_sucursal: integer('id_sucursal').references(() => sucursal.id_sucursal),
	id_catalogo: integer('id_catalogo').references(() => catalogo_articulos.id_catalogo),
	id_usuario_asignado: integer('id_usuario_asignado').references(() => usuarios.id_usuario),
	id_caja: integer('id_caja').references(() => cajas.id_caja),
	numero_serie: varchar('numero_serie', { length: 200 }),
	codigo_inventario: varchar('codigo_inventario', { length: 100 }),
	estado: varchar('estado', { length: 50 }).notNull(), // activo|en_reparacion|baja|bodega
	observaciones: text('observaciones'),
	fecha_adquisicion: date('fecha_adquisicion'),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const tipos_movimientos = pgTable('tipos_movimientos', {
	id_tipo_movimiento: serial('id_tipo_movimiento').primaryKey(),
	tipo_movimiento: varchar('tipo_movimiento', { length: 100 }).notNull(),
	codigo: varchar('codigo', { length: 50 }),
	estado: boolean('estado').default(true),
	created_at: timestamp('created_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const personas = pgTable('personas', {
	id_persona: serial('id_persona').primaryKey(),
	nombre_razon_social: varchar('nombre_razon_social', { length: 200 }).notNull(),
	identificacion: varchar('identificacion', { length: 20 }),
	telefono: varchar('telefono', { length: 20 }),
	direccion: varchar('direccion', { length: 200 }),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

export const movimientos_inventario = pgTable('movimientos_inventario', {
	id_movimiento: serial('id_movimiento').primaryKey(),
	id_ticket: integer('id_ticket').references(() => tickets.id_ticket),
	id_activo: integer('id_activo').references(() => activos_ti.id_activo),
	id_persona: integer('id_persona').references(() => personas.id_persona), // ej: taller externo
	id_tipo_movimiento: integer('id_tipo_movimiento').references(() => tipos_movimientos.id_tipo_movimiento),
	cantidad: integer('cantidad').default(1),
	motivo: text('motivo'),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

// --- OTROS ---

export const proyectos_software = pgTable('proyectos_software', {
	id_proyecto: serial('id_proyecto').primaryKey(),
	id_encargado: integer('id_encargado').references(() => usuarios.id_usuario),
	nombre: varchar('nombre', { length: 200 }).notNull(),
	descripcion: text('descripcion'),
	version: varchar('version', { length: 50 }),
	estado: varchar('estado', { length: 50 }),
	url_repositorio: varchar('url_repositorio', { length: 250 }),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at')
});

// --- DEFINICIÓN DE RELACIONES (Drizzle Relations API) ---

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
	rol: one(roles, { fields: [usuarios.id_rol], references: [roles.id_rol] }),
	sucursal: one(sucursal, { fields: [usuarios.id_sucursal], references: [sucursal.id_sucursal] }),
	tickets_asignados: many(tickets, { relationName: 'tickets_asignados' }),
	tickets_creados: many(tickets, { relationName: 'tickets_creados' }),
	comentarios: many(ticket_comentarios),
	activos_asignados: many(activos_ti),
	lecturas: many(ticket_lecturas)
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	usuarios: many(usuarios)
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
	estado: one(estados_tickets, { fields: [tickets.id_estado], references: [estados_tickets.id_estado] }),
	categoria: one(categorias, { fields: [tickets.id_categoria], references: [categorias.id_categoria] }),
	nivel: one(nivel_atencion, { fields: [tickets.id_nivel_atencion], references: [nivel_atencion.id_nivel_atencion] }),
	usuario_asignado: one(usuarios, { fields: [tickets.id_usuario], references: [usuarios.id_usuario], relationName: 'tickets_asignados' }),
	creador: one(usuarios, { fields: [tickets.created_by], references: [usuarios.id_usuario], relationName: 'tickets_creados' }),
	activo_ti: one(activos_ti, { fields: [tickets.id_activo], references: [activos_ti.id_activo] }),
	caja: one(cajas, { fields: [tickets.id_caja], references: [cajas.id_caja] }),
	adjuntos: many(ticket_adjuntos),
	comentarios: many(ticket_comentarios),
	movimientos: many(movimientos_inventario),
	lecturas: many(ticket_lecturas)
}));

export const ticketComentariosRelations = relations(ticket_comentarios, ({ one }) => ({
	ticket: one(tickets, { fields: [ticket_comentarios.id_ticket], references: [tickets.id_ticket] }),
	usuario: one(usuarios, { fields: [ticket_comentarios.id_usuario], references: [usuarios.id_usuario] })
}));

export const ticketAdjuntosRelations = relations(ticket_adjuntos, ({ one }) => ({
	ticket: one(tickets, { fields: [ticket_adjuntos.id_ticket], references: [tickets.id_ticket] })
}));

export const ticketLecturasRelations = relations(ticket_lecturas, ({ one }) => ({
	ticket: one(tickets, { fields: [ticket_lecturas.id_ticket], references: [tickets.id_ticket] }),
	usuario: one(usuarios, { fields: [ticket_lecturas.id_usuario], references: [usuarios.id_usuario] })
}));

export const activosTiRelations = relations(activos_ti, ({ one, many }) => ({
	sucursal: one(sucursal, { fields: [activos_ti.id_sucursal], references: [sucursal.id_sucursal] }),
	catalogo: one(catalogo_articulos, { fields: [activos_ti.id_catalogo], references: [catalogo_articulos.id_catalogo] }),
	usuario_asignado: one(usuarios, { fields: [activos_ti.id_usuario_asignado], references: [usuarios.id_usuario] }),
	caja: one(cajas, { fields: [activos_ti.id_caja], references: [cajas.id_caja] }),
	tickets: many(tickets),
	movimientos: many(movimientos_inventario)
}));

export const catalogoArticulosRelations = relations(catalogo_articulos, ({ one, many }) => ({
	tipo: one(tipos_articulos, { fields: [catalogo_articulos.id_tipo], references: [tipos_articulos.id_tipo] }),
	activos: many(activos_ti)
}));

export const movimientosInventarioRelations = relations(movimientos_inventario, ({ one }) => ({
	ticket: one(tickets, { fields: [movimientos_inventario.id_ticket], references: [tickets.id_ticket] }),
	activo: one(activos_ti, { fields: [movimientos_inventario.id_activo], references: [activos_ti.id_activo] }),
	persona: one(personas, { fields: [movimientos_inventario.id_persona], references: [personas.id_persona] }),
	tipo: one(tipos_movimientos, { fields: [movimientos_inventario.id_tipo_movimiento], references: [tipos_movimientos.id_tipo_movimiento] })
}));

export const cajasRelations = relations(cajas, ({ one, many }) => ({
	sucursal: one(sucursal, { fields: [cajas.id_sucursal], references: [sucursal.id_sucursal] }),
	activos: many(activos_ti),
	tickets: many(tickets)
}));

export const proyectosSoftwareRelations = relations(proyectos_software, ({ one }) => ({
	encargado: one(usuarios, { fields: [proyectos_software.id_encargado], references: [usuarios.id_usuario] })
}));
