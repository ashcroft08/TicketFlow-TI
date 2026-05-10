import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user;

    // Si no hay sesión, al login
    if (!user) {
        throw redirect(303, '/');
    }

    // Si no es ADMIN, bloqueamos el acceso
    if (user.cod_rol !== 'ADMIN') {
        throw error(403, {
            message: 'Acceso denegado. Se requieren privilegios de administrador.'
        });
    }

    return {
        user
    };
};
