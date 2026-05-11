import { verifySessionToken, SESSION_COOKIE } from "$lib/server/auth";
import { UserRepository } from "$lib/server/repositories/UserRepository";
import { redirect, type Handle } from "@sveltejs/kit";

const userRepository = new UserRepository();

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Leer la cookie de sesión
    const token = event.cookies.get(SESSION_COOKIE);

    if (token) {
        const decodedUser = verifySessionToken(token);
        
        if (decodedUser) {
            // Verificación de seguridad extra: Validar versión del token contra la BD
            const dbUser = await userRepository.findById(decodedUser.id);
            
            const dbVersion = dbUser?.token_version ?? 1;
            const tokenVersion = decodedUser.token_version;
            


            const isVersionValid = dbUser && dbVersion === tokenVersion;
            const isActive = dbUser && dbUser.estado;

            if (isVersionValid && isActive) {
                event.locals.user = decodedUser;
            } else {
                console.log('Sesión rechazada:', { isVersionValid, isActive, userId: decodedUser.id });
                event.cookies.delete(SESSION_COOKIE, { path: '/' });
                event.locals.user = null;
            }
        } else {
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    // 2. Protección de rutas por Rol
    const user = event.locals.user;
    const path = event.url.pathname;

    if (path.startsWith('/admin') && user?.cod_rol !== 'ADMIN') {
        throw redirect(303, user ? (user.cod_rol === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard') : '/');
    }

    if (path.startsWith('/tecnico') && user?.cod_rol !== 'TECH' && user?.cod_rol !== 'ADMIN') {
        throw redirect(303, user ? (user.cod_rol === 'STORE_MANAGER' ? '/encargado/dashboard' : '/admin/dashboard') : '/');
    }

    if (path.startsWith('/encargado') && user?.cod_rol !== 'STORE_MANAGER' && user?.cod_rol !== 'ADMIN') {
        throw redirect(303, user ? (user.cod_rol === 'TECH' ? '/tecnico/dashboard' : '/admin/dashboard') : '/');
    }

    // Protección de rutas básica (si no está logueado)
    const isProtectedRoute = path.startsWith('/admin') || 
                           path.startsWith('/tecnico') || 
                           path.startsWith('/encargado') ||
                           path.startsWith('/dashboard');

    if (isProtectedRoute && !user) {
        throw redirect(303, "/");
    }

    // 3. Si el usuario ya está logueado e intenta ir al login (GET), lo mandamos a su dashboard
    // No redirigimos si se está solicitando un cierre de sesión explícito
    const isLoggingOut = event.url.searchParams.has('logout');
    
    if (isLoggingOut) {
        event.cookies.delete(SESSION_COOKIE, { path: '/' });
        event.locals.user = null;
    }

    if (event.url.pathname === "/" && event.locals.user && event.request.method === 'GET' && !isLoggingOut) {
        const codRol = event.locals.user.cod_rol;
        console.log('Usuario ya logueado, redirigiendo a dashboard:', codRol);
        
        if (codRol === 'ADMIN') throw redirect(303, '/admin/dashboard');
        if (codRol === 'TECH') throw redirect(303, '/tecnico/dashboard');
        if (codRol === 'STORE_MANAGER') throw redirect(303, '/encargado/dashboard');
        throw redirect(303, '/dashboard');
    }

    return resolve(event);
};
