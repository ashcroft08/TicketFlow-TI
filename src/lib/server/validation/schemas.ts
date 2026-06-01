import { z } from 'zod';

// --- ESQUEMAS DE AUTENTICACIÓN ---

export const LoginSchema = z.object({
	username: z.string().min(1, 'El usuario o correo es obligatorio'),
	password: z.string().min(1, 'La contraseña es obligatoria')
});

export const ForgotPasswordSchema = z.object({
	identifier: z.string().min(1, 'El correo o usuario es obligatorio')
});

// --- ESQUEMAS DE USUARIO ---

export const CreateUserSchema = z.object({
	id_rol: z.coerce.number().int().positive('Debe seleccionar un rol válido'),
	id_sucursal: z.coerce.number().int().positive('Debe seleccionar una sucursal válida'),
	nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
	username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').max(100),
	email: z.string().email('Por favor, ingrese un correo válido').max(255),
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(255)
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true }).extend({
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(255).optional()
});

// --- ESQUEMAS DE TICKETS ---

export const CreateTicketSchema = z.object({
	titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
	descripcion: z.string().min(10, 'La descripción debe detallar el problema (mínimo 10 caracteres)'),
	id_categoria: z.coerce.number().int().positive('Debe seleccionar una categoría válida').optional().nullable(),
	id_activo: z.coerce.number().int().positive().optional().nullable(),
	id_nivel_atencion: z.coerce.number().int().positive().optional().nullable()
});

export const UpdateTicketSchema = z.object({
	id_estado: z.coerce.number().int().positive().optional(),
	id_categoria: z.coerce.number().int().positive().optional(),
	id_nivel_atencion: z.coerce.number().int().positive().optional(),
	notas_tecnico: z.string().optional().nullable(),
	id_usuario: z.coerce.number().int().positive().optional().nullable() // Asignación de técnico
});

export const CreateCommentSchema = z.object({
	id_ticket: z.coerce.number().int().positive(),
	comentario: z.string().min(1, 'El comentario no puede estar vacío'),
	tipo_comentario: z.enum(['publico', 'interno']).default('publico')
});

// --- ESQUEMAS DE ACTIVOS TI (INVENTARIO) ---

export const CreateAssetSchema = z.object({
	id_sucursal: z.coerce.number().int().positive('Debe seleccionar una sucursal válida'),
	id_catalogo: z.coerce.number().int().positive('Debe seleccionar un artículo del catálogo'),
	id_usuario_asignado: z.coerce.number().int().positive().optional().nullable(),
	numero_serie: z.string().max(200).optional().nullable(),
	codigo_inventario: z.string().max(100).optional().nullable(),
	estado: z.enum(['activo', 'en_reparacion', 'bodega', 'baja']).default('bodega'),
	observaciones: z.string().optional().nullable(),
	fecha_adquisicion: z.string().or(z.date()).optional().nullable()
});

export const UpdateAssetSchema = CreateAssetSchema.partial();

// --- INFERENCIA DE TIPOS TYPESCRIPT ---

export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;
