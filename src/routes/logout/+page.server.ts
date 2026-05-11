import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SESSION_COOKIE } from '$lib/server/auth';

export const actions: Actions = {
    default: async ({ cookies }) => {
        // Forzar expiración de la cookie con los mismos parámetros
        cookies.set(SESSION_COOKIE, '', { 
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            maxAge: 0
        });
        
        throw redirect(303, '/?logout');
    }
};
