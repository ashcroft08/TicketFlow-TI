import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AuthService } from '$lib/server/services/AuthService';
import { createSessionToken, SESSION_COOKIE } from '$lib/server/auth';

const authService = new AuthService();

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const identifier = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!identifier || !password) {
            return fail(400, { error: 'Por favor, ingrese usuario o correo y contraseña', username: identifier });
        }

        const result = await authService.login(identifier, password);

        if (!result.success || !result.user) {
            return fail(401, { error: result.error, username: identifier });
        }

        // Crear el token JWT con los datos del usuario
        const token = createSessionToken({
            id: result.user.id,
            nombre: result.user.nombre,
            email: result.user.email,
            username: result.user.username,
            cod_rol: result.user.cod_rol,
            rol: result.user.rol,
            id_sucursal: result.user.id_sucursal,
            token_version: result.user.token_version
        });

        // Guardar el token en una cookie HttpOnly segura
        cookies.set(SESSION_COOKIE, token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: false, // En producción cambiar a true (HTTPS)
            maxAge: 60 * 60 * 8 // 8 horas
        });

        // Redirigir según el rol
        const codRol = result.user.cod_rol;
        if (codRol === 'ADMIN') throw redirect(303, '/admin/dashboard');
        if (codRol === 'TECH') throw redirect(303, '/tecnico');
        if (codRol === 'STORE_MANAGER') throw redirect(303, '/encargado/dashboard');
        
        throw redirect(303, '/encargado/dashboard');
    },
    logout: async ({ cookies }) => {
        cookies.delete(SESSION_COOKIE, { path: '/' });
        throw redirect(303, '/');
    }
};
