import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthService } from '$lib/server/services/AuthService';
import { ForgotPasswordSchema } from '$lib/server/validation/schemas';

const authService = new AuthService();

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const identifier = data.get('identifier')?.toString() || '';

		// Validación con Zod
		const parsed = ForgotPasswordSchema.safeParse({ identifier });
		if (!parsed.success) {
			const errorMsg = parsed.error.errors[0]?.message || 'Ingrese su usuario o correo';
			return fail(400, { error: errorMsg });
		}

		const result = await authService.requestPasswordReset(identifier);
		
		return { success: true, message: result.message };
	}
};
