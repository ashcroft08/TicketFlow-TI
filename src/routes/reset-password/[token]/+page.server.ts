import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AuthService } from '$lib/server/services/AuthService';

const authService = new AuthService();

export const load: PageServerLoad = async ({ params }) => {
    // Podríamos validar el token aquí también para mostrar un error antes de que el usuario intente resetear
    return { token: params.token };
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        const password = data.get('password')?.toString();
        const confirmPassword = data.get('confirmPassword')?.toString();
        const token = params.token;

        if (!password || !confirmPassword) {
            return fail(400, { error: 'Por favor, complete todos los campos' });
        }

        if (password !== confirmPassword) {
            return fail(400, { error: 'Las contraseñas no coinciden' });
        }

        const result = await authService.resetPassword(token, password);

        if (!result.success) {
            return fail(400, { error: result.error });
        }

        return { success: true, message: 'Tu contraseña ha sido restablecida con éxito' };
    }
};
