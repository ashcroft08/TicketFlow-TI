import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BitacoraRepository } from '$lib/server/repositories/BitacoraRepository';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { CategoriaBitacoraRepository } from '$lib/server/repositories/CategoriaBitacoraRepository';

const bitacoraRepository = new BitacoraRepository();
const userRepository = new UserRepository();
const categoriaBitacoraRepository = new CategoriaBitacoraRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    // Fecha de hoy en formato local YYYY-MM-DD
    const todayStr = new Date().toLocaleDateString('sv');

    const [allBitacoras, allAdmins, totalHorasHoy, categorias] = await Promise.all([
        bitacoraRepository.getAll(),
        userRepository.getUsersByRole('ADMIN'),
        bitacoraRepository.getHoursForUserDate(locals.user.id, todayStr),
        categoriaBitacoraRepository.getActive()
    ]);

    // Filtrar bitácoras y admins para excluir al Administrador por defecto ("Admin")
    const isDefaultAdmin = (u: { username: string; nombre: string } | null | undefined) => {
        if (!u) return false;
        const username = u.username.toLowerCase();
        const nombre = u.nombre.toLowerCase();
        return username === 'admin' || nombre === 'administrador sistema';
    };

    const bitacoras = allBitacoras.filter(b => !isDefaultAdmin(b.usuario));
    const admins = allAdmins.filter(a => !isDefaultAdmin(a));

    return {
        bitacoras,
        admins,
        totalHorasHoy,
        todayStr,
        categorias
    };
};

// Función auxiliar para convertir horas y minutos a string de esfuerzo amigable
const formatEsfuerzoFriendly = (horasDec: number) => {
    const totalMin = Math.round(horasDec * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const fecha = data.get('fecha')?.toString() || new Date().toLocaleDateString('sv');
        const titulo = data.get('titulo')?.toString();
        const horas = parseInt(data.get('horas')?.toString() || '0');
        const minutos = parseInt(data.get('minutos')?.toString() || '0');
        const descripcion = data.get('descripcion')?.toString();
        const id_categoria_bitacora = data.get('id_categoria_bitacora') ? parseInt(data.get('id_categoria_bitacora')!.toString()) : null;

        if (!titulo || titulo.trim() === '') {
            return fail(400, { error: 'El título de la actividad es requerido' });
        }
        if (horas < 0 || minutos < 0 || minutos > 59) {
            return fail(400, { error: 'Rango de horas o minutos inválido' });
        }
        if (horas === 0 && minutos === 0) {
            return fail(400, { error: 'Debes ingresar al menos 1 minuto de esfuerzo' });
        }
        if (!descripcion || descripcion.trim() === '') {
            return fail(400, { error: 'La descripción detallada es requerida' });
        }

        const nuevoEsfuerzo = horas + minutos / 60;

        try {
            // Validar que la suma total para este día no exceda las 8 horas
            const totalHorasDia = await bitacoraRepository.getHoursForUserDate(locals.user.id, fecha);
            if (totalHorasDia + nuevoEsfuerzo > 8.0) {
                const registradas = totalHorasDia;
                const disponibles = Math.max(0, 8.0 - registradas);
                return fail(400, { 
                    error: `Superas el límite de 8 horas de esfuerzo diario para el día ${fecha}. Ya tienes registrados ${formatEsfuerzoFriendly(registradas)} y solo te quedan disponibles ${formatEsfuerzoFriendly(disponibles)}.` 
                });
            }

            await bitacoraRepository.create({
                id_usuario: locals.user.id,
                fecha,
                titulo: titulo.trim(),
                horas_dedicadas: nuevoEsfuerzo.toFixed(2),
                descripcion: descripcion.trim(),
                id_categoria_bitacora
            });

            return { success: true, message: 'Actividad registrada con éxito en tu bitácora' };
        } catch (err) {
            console.error('Error al registrar bitácora:', err);
            return fail(500, { error: 'Error al guardar la actividad en la base de datos' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const fecha = data.get('fecha')?.toString() || new Date().toLocaleDateString('sv');
        const titulo = data.get('titulo')?.toString();
        const horas = parseInt(data.get('horas')?.toString() || '0');
        const minutos = parseInt(data.get('minutos')?.toString() || '0');
        const descripcion = data.get('descripcion')?.toString();
        const id_categoria_bitacora = data.get('id_categoria_bitacora') ? parseInt(data.get('id_categoria_bitacora')!.toString()) : null;

        if (!id) return fail(400, { error: 'ID de la actividad requerido' });
        if (!titulo || titulo.trim() === '') {
            return fail(400, { error: 'El título de la actividad es requerido' });
        }
        if (horas < 0 || minutos < 0 || minutos > 59) {
            return fail(400, { error: 'Rango de horas o minutos inválido' });
        }
        if (horas === 0 && minutos === 0) {
            return fail(400, { error: 'Debes ingresar al menos 1 minuto de esfuerzo' });
        }
        if (!descripcion || descripcion.trim() === '') {
            return fail(400, { error: 'La descripción detallada es requerida' });
        }

        const nuevoEsfuerzo = horas + minutos / 60;

        try {
            const existing = await bitacoraRepository.getById(id);
            if (!existing || existing.id_usuario !== locals.user.id) {
                return fail(403, { error: 'No tienes permiso para modificar esta actividad' });
            }

            // Validar que la suma total para este día (descontando el registro anterior) no exceda las 8 horas
            const totalHorasDia = await bitacoraRepository.getHoursForUserDate(locals.user.id, fecha);
            const anteriorEsfuerzo = parseFloat(existing.horas_dedicadas);
            const totalSinAnterior = totalHorasDia - anteriorEsfuerzo;

            if (totalSinAnterior + nuevoEsfuerzo > 8.0) {
                const disponibles = Math.max(0, 8.0 - totalSinAnterior);
                return fail(400, { 
                    error: `Superas el límite de 8 horas diarias de esfuerzo para el día ${fecha}. Ya tienes otros registros por ${formatEsfuerzoFriendly(totalSinAnterior)} en este día y solo te quedan disponibles ${formatEsfuerzoFriendly(disponibles)}.` 
                });
            }

            await bitacoraRepository.update(id, {
                fecha,
                titulo: titulo.trim(),
                horas_dedicadas: nuevoEsfuerzo.toFixed(2),
                descripcion: descripcion.trim(),
                id_categoria_bitacora
            });

            return { success: true, message: 'Actividad actualizada correctamente' };
        } catch (err) {
            console.error('Error al actualizar bitácora:', err);
            return fail(500, { error: 'Error al actualizar la actividad' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            const existing = await bitacoraRepository.getById(id);
            if (!existing || existing.id_usuario !== locals.user.id) {
                return fail(403, { error: 'No tienes permiso para eliminar esta actividad' });
            }

            await bitacoraRepository.delete(id);
            return { success: true, message: 'Actividad de la bitácora con éxito' };
        } catch (err) {
            console.error('Error al eliminar bitácora:', err);
            return fail(500, { error: 'Error al eliminar la actividad' });
        }
    }
};
