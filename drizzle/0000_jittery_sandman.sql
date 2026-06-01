CREATE TABLE "activos_ti" (
	"id_activo" serial PRIMARY KEY NOT NULL,
	"id_sucursal" integer,
	"id_catalogo" integer,
	"id_usuario_asignado" integer,
	"id_caja" integer,
	"numero_serie" varchar(200),
	"codigo_inventario" varchar(100),
	"estado" varchar(50) NOT NULL,
	"observaciones" text,
	"fecha_adquisicion" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cajas" (
	"id_caja" serial PRIMARY KEY NOT NULL,
	"id_sucursal" integer NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"estado" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "catalogo_articulos" (
	"id_catalogo" serial PRIMARY KEY NOT NULL,
	"id_tipo" integer,
	"created_by" integer,
	"updated_by" integer,
	"nombre" varchar(200) NOT NULL,
	"marca" varchar(100),
	"modelo" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id_categoria" serial PRIMARY KEY NOT NULL,
	"nombre_tecnico" varchar(200) NOT NULL,
	"estado" boolean DEFAULT true,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "estados_tickets" (
	"id_estado" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"color" varchar(20),
	"estado" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "movimientos_inventario" (
	"id_movimiento" serial PRIMARY KEY NOT NULL,
	"id_ticket" integer,
	"id_activo" integer,
	"id_persona" integer,
	"id_tipo_movimiento" integer,
	"cantidad" integer DEFAULT 1,
	"motivo" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "nivel_atencion" (
	"id_nivel_atencion" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"orden" integer,
	"estado" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id_persona" serial PRIMARY KEY NOT NULL,
	"nombre_razon_social" varchar(200) NOT NULL,
	"identificacion" varchar(20),
	"telefono" varchar(20),
	"direccion" varchar(200),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "proyectos_software" (
	"id_proyecto" serial PRIMARY KEY NOT NULL,
	"id_encargado" integer,
	"nombre" varchar(200) NOT NULL,
	"descripcion" text,
	"version" varchar(50),
	"estado" varchar(50),
	"url_repositorio" varchar(250),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id_rol" serial PRIMARY KEY NOT NULL,
	"rol" varchar(100) NOT NULL,
	"cod_rol" varchar(50) NOT NULL,
	"estado" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "roles_cod_rol_unique" UNIQUE("cod_rol")
);
--> statement-breakpoint
CREATE TABLE "sucursal" (
	"id_sucursal" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"estado" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ticket_adjuntos" (
	"id_adjunto" serial PRIMARY KEY NOT NULL,
	"id_ticket" integer,
	"nombre" varchar(200),
	"imagen_public_id" varchar(200),
	"imagen_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_comentarios" (
	"id_comentario" serial PRIMARY KEY NOT NULL,
	"id_ticket" integer,
	"id_usuario" integer,
	"comentario" text,
	"tipo_comentario" varchar(20) DEFAULT 'publico',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ticket_lecturas" (
	"id_ticket" integer NOT NULL,
	"id_usuario" integer NOT NULL,
	"ultima_lectura" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_lecturas_id_ticket_id_usuario_pk" PRIMARY KEY("id_ticket","id_usuario")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id_ticket" serial PRIMARY KEY NOT NULL,
	"id_estado" integer,
	"id_categoria" integer,
	"id_nivel_atencion" integer,
	"id_usuario" integer,
	"id_activo" integer,
	"id_caja" integer,
	"created_by" integer,
	"updated_by" integer,
	"titulo" varchar(200) NOT NULL,
	"descripcion" text,
	"notas_tecnico" text,
	"fecha_cierre" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tipos_articulos" (
	"id_tipo" serial PRIMARY KEY NOT NULL,
	"tipo" varchar(200) NOT NULL,
	"codigo" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tipos_movimientos" (
	"id_tipo_movimiento" serial PRIMARY KEY NOT NULL,
	"tipo_movimiento" varchar(100) NOT NULL,
	"codigo" varchar(50),
	"estado" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id_usuario" serial PRIMARY KEY NOT NULL,
	"id_rol" integer,
	"id_sucursal" integer,
	"nombre" varchar(100) NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"reset_token" varchar(255),
	"reset_token_expiry" timestamp,
	"token_version" integer DEFAULT 1 NOT NULL,
	"estado" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "usuarios_username_unique" UNIQUE("username"),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activos_ti" ADD CONSTRAINT "activos_ti_id_sucursal_sucursal_id_sucursal_fk" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activos_ti" ADD CONSTRAINT "activos_ti_id_catalogo_catalogo_articulos_id_catalogo_fk" FOREIGN KEY ("id_catalogo") REFERENCES "public"."catalogo_articulos"("id_catalogo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activos_ti" ADD CONSTRAINT "activos_ti_id_usuario_asignado_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario_asignado") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activos_ti" ADD CONSTRAINT "activos_ti_id_caja_cajas_id_caja_fk" FOREIGN KEY ("id_caja") REFERENCES "public"."cajas"("id_caja") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cajas" ADD CONSTRAINT "cajas_id_sucursal_sucursal_id_sucursal_fk" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalogo_articulos" ADD CONSTRAINT "catalogo_articulos_id_tipo_tipos_articulos_id_tipo_fk" FOREIGN KEY ("id_tipo") REFERENCES "public"."tipos_articulos"("id_tipo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalogo_articulos" ADD CONSTRAINT "catalogo_articulos_created_by_usuarios_id_usuario_fk" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalogo_articulos" ADD CONSTRAINT "catalogo_articulos_updated_by_usuarios_id_usuario_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_ticket_tickets_id_ticket_fk" FOREIGN KEY ("id_ticket") REFERENCES "public"."tickets"("id_ticket") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_activo_activos_ti_id_activo_fk" FOREIGN KEY ("id_activo") REFERENCES "public"."activos_ti"("id_activo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_persona_personas_id_persona_fk" FOREIGN KEY ("id_persona") REFERENCES "public"."personas"("id_persona") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_tipo_movimiento_tipos_movimientos_id_tipo_movimiento_fk" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "public"."tipos_movimientos"("id_tipo_movimiento") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyectos_software" ADD CONSTRAINT "proyectos_software_id_encargado_usuarios_id_usuario_fk" FOREIGN KEY ("id_encargado") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_adjuntos" ADD CONSTRAINT "ticket_adjuntos_id_ticket_tickets_id_ticket_fk" FOREIGN KEY ("id_ticket") REFERENCES "public"."tickets"("id_ticket") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comentarios" ADD CONSTRAINT "ticket_comentarios_id_ticket_tickets_id_ticket_fk" FOREIGN KEY ("id_ticket") REFERENCES "public"."tickets"("id_ticket") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comentarios" ADD CONSTRAINT "ticket_comentarios_id_usuario_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_lecturas" ADD CONSTRAINT "ticket_lecturas_id_ticket_tickets_id_ticket_fk" FOREIGN KEY ("id_ticket") REFERENCES "public"."tickets"("id_ticket") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_lecturas" ADD CONSTRAINT "ticket_lecturas_id_usuario_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_estado_estados_tickets_id_estado_fk" FOREIGN KEY ("id_estado") REFERENCES "public"."estados_tickets"("id_estado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_categoria_categorias_id_categoria_fk" FOREIGN KEY ("id_categoria") REFERENCES "public"."categorias"("id_categoria") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_nivel_atencion_nivel_atencion_id_nivel_atencion_fk" FOREIGN KEY ("id_nivel_atencion") REFERENCES "public"."nivel_atencion"("id_nivel_atencion") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_usuario_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_activo_activos_ti_id_activo_fk" FOREIGN KEY ("id_activo") REFERENCES "public"."activos_ti"("id_activo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_id_caja_cajas_id_caja_fk" FOREIGN KEY ("id_caja") REFERENCES "public"."cajas"("id_caja") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_usuarios_id_usuario_fk" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_updated_by_usuarios_id_usuario_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_roles_id_rol_fk" FOREIGN KEY ("id_rol") REFERENCES "public"."roles"("id_rol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_sucursal_sucursal_id_sucursal_fk" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;