import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthService } from '$lib/server/services/AuthService';

const authService = new AuthService();

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const identifier = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!identifier || !password) {
            return fail(400, { error: 'Por favor, ingrese usuario o correo y contraseña', username: identifier });
        }

        const result = await authService.login(identifier, password);

        if (!result.success) {
            return fail(401, { error: result.error, username: identifier });
        }

        // TODO: Crear sesión con better-auth
        // throw redirect(303, '/dashboard');
        
        return { success: true, message: 'Login exitoso (Integración de sesión pendiente)' };
    }
};
