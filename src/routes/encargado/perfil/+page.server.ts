import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { createSessionToken, SESSION_COOKIE } from '$lib/server/auth';
import bcrypt from 'bcryptjs';

const userRepo = new UserRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/');
    
    const user = await userRepo.findById(locals.user.id);
    if (!user) throw redirect(302, '/');

    return {
        profile: {
            nombre: user.nombre,
            email: user.email,
            username: user.username,
            rol: user.rol?.rol,
            sucursal: user.sucursal?.nombre
        }
    };
};

export const actions: Actions = {
    updateProfile: async ({ request, locals, cookies }) => {
        if (!locals.user) return fail(401);

        const formData = await request.formData();
        const nombre = formData.get('nombre')?.toString();
        const email = formData.get('email')?.toString();
        const newPassword = formData.get('password')?.toString();

        if (!nombre || !email) {
            return fail(400, { error: 'Nombre y correo son obligatorios' });
        }

        try {
            const updateData: any = {
                nombre,
                email
            };

            if (newPassword && newPassword.length > 0) {
                if (newPassword.length < 6) {
                    return fail(400, { error: 'La contraseña debe tener al menos 6 caracteres' });
                }
                updateData.password = await bcrypt.hash(newPassword, 10);
                updateData.token_version = (locals.user.token_version || 1) + 1;
            }

            const updatedUser = await userRepo.update(locals.user.id, updateData);

            // Re-generar token de sesión para actualizar datos en la UI (nombre, etc.)
            const newToken = createSessionToken({
                id: locals.user.id,
                nombre: updatedUser.nombre,
                email: updatedUser.email,
                username: updatedUser.username,
                cod_rol: locals.user.cod_rol,
                rol: locals.user.rol,
                id_sucursal: locals.user.id_sucursal,
                token_version: updatedUser.token_version
            });

            cookies.set(SESSION_COOKIE, newToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: false, // Cambiar a true en producción
                maxAge: 60 * 60 * 8
            });

            return { success: true, message: 'Perfil actualizado correctamente' };
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return fail(500, { error: 'Ocurrió un error al actualizar el perfil' });
        }
    }
};
