CREATE TABLE "bitacora_admin" (
	"id_bitacora" serial PRIMARY KEY NOT NULL,
	"id_usuario" integer NOT NULL,
	"id_categoria_bitacora" integer,
	"fecha" date DEFAULT now() NOT NULL,
	"titulo" varchar(200) NOT NULL,
	"horas_dedicadas" numeric(4, 2) NOT NULL,
	"descripcion" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "categorias_bitacora" (
	"id_categoria_bitacora" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(150) NOT NULL,
	"estado" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "bitacora_admin" ADD CONSTRAINT "bitacora_admin_id_usuario_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bitacora_admin" ADD CONSTRAINT "bitacora_admin_id_categoria_bitacora_categorias_bitacora_id_categoria_bitacora_fk" FOREIGN KEY ("id_categoria_bitacora") REFERENCES "public"."categorias_bitacora"("id_categoria_bitacora") ON DELETE no action ON UPDATE no action;