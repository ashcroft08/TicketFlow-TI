import { z } from 'zod';

export const ticketSchema = z.object({
    titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título es demasiado largo'),
    descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    id_activo: z.number().optional().nullable(),
    id_categoria: z.number().optional().nullable(),
    id_nivel_atencion: z.number().optional().nullable(),
});

export const commentSchema = z.object({
    id_ticket: z.number(),
    comentario: z.string().min(2, 'El comentario es muy corto'),
    tipo_comentario: z.enum(['publico', 'interno']).default('publico'),
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
