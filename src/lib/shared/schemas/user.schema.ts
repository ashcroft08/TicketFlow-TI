import { z } from 'zod';

export const profileSchema = z.object({
    nombre: z.string().min(3, 'Nombre muy corto'),
    email: z.string().email('Email inválido'),
    username: z.string().min(4, 'Username muy corto'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;
