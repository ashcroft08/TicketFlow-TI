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

    // 2. Protección de rutas básica
    const isProtectedRoute = event.url.pathname.startsWith('/admin') || 
                           event.url.pathname.startsWith('/tecnico') || 
                           event.url.pathname.startsWith('/encargado') ||
                           event.url.pathname.startsWith('/dashboard');

    if (isProtectedRoute && !event.locals.user) {
        console.log('Acceso denegado a ruta protegida, redirigiendo al login');
        throw redirect(303, "/");
    }

    // 3. Si el usuario ya está logueado e intenta ir al login, lo mandamos a su dashboard
    if (event.url.pathname === "/" && event.locals.user) {
        const codRol = event.locals.user.cod_rol;
        console.log('Usuario ya logueado, redirigiendo a dashboard:', codRol);
        
        if (codRol === 'ADMIN') throw redirect(303, '/admin');
        if (codRol === 'TECH') throw redirect(303, '/tecnico');
        if (codRol === 'STORE_MANAGER') throw redirect(303, '/encargado/dashboard');
        throw redirect(303, '/dashboard');
    }

    return resolve(event);
};
