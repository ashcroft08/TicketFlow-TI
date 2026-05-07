import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthService } from '$lib/server/services/AuthService';

const authService = new AuthService();

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const identifier = data.get('identifier')?.toString();

        if (!identifier) {
            return fail(400, { error: 'Por favor, ingrese su usuario o correo electrónico' });
        }

        const result = await authService.requestPasswordReset(identifier);
        
        return { success: true, message: result.message };
    }
};
