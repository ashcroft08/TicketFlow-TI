import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { CategoriaBitacoraRepository } from '$lib/server/repositories/CategoriaBitacoraRepository';

const categoriaBitacoraRepository = new CategoriaBitacoraRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const categorias = await categoriaBitacoraRepository.getAll();

    return {
        categorias
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();

        if (!nombre || nombre.trim() === '') {
            return fail(400, { error: 'El nombre de la categoría es requerido' });
        }

        try {
            await categoriaBitacoraRepository.create({
                nombre: nombre.trim()
            });
            return { success: true, message: 'Categoría creada con éxito' };
        } catch (err) {
            console.error('Error al crear categoría de bitácora:', err);
            return fail(500, { error: 'Error al crear la categoría' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString();
        const estadoVal = data.get('estado')?.toString();

        if (!id) return fail(400, { error: 'ID de la categoría requerido' });
        if (!nombre || nombre.trim() === '') {
            return fail(400, { error: 'El nombre de la categoría es requerido' });
        }

        const estado = estadoVal === 'true';

        try {
            const existing = await categoriaBitacoraRepository.getById(id);
            if (!existing) {
                return fail(404, { error: 'La categoría no existe o ha sido eliminada' });
            }

            await categoriaBitacoraRepository.update(id, {
                nombre: nombre.trim(),
                estado
            });

            return { success: true, message: 'Categoría actualizada con éxito' };
        } catch (err) {
            console.error('Error al actualizar categoría de bitácora:', err);
            return fail(500, { error: 'Error al actualizar la categoría' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID de la categoría requerido' });

        try {
            const existing = await categoriaBitacoraRepository.getById(id);
            if (!existing) {
                return fail(404, { error: 'La categoría no existe' });
            }

            await categoriaBitacoraRepository.delete(id);
            return { success: true, message: 'Categoría eliminada con éxito' };
        } catch (err) {
            console.error('Error al eliminar categoría de bitácora:', err);
            return fail(500, { error: 'Error al eliminar la categoría' });
        }
    }
};
