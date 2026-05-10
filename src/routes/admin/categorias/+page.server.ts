import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { CategoryRepository } from '$lib/server/repositories/CategoryRepository';

const categoryRepository = new CategoryRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const categorias = await categoryRepository.getAll();

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
            return fail(400, { error: 'El nombre es requerido' });
        }

        try {
            await categoryRepository.create({ nombre: nombre.trim() });
            return { success: true };
        } catch (err) {
            console.error('Error al crear categoría:', err);
            return fail(500, { error: 'Error al crear' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString();
        const estado = data.get('estado') === 'true';

        if (!id || !nombre || nombre.trim() === '') {
            return fail(400, { error: 'Datos inválidos' });
        }

        try {
            await categoryRepository.update(id, { nombre: nombre.trim(), estado });
            return { success: true };
        } catch (err) {
            console.error('Error al actualizar categoría:', err);
            return fail(500, { error: 'Error al actualizar' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await categoryRepository.delete(id);
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar categoría:', err);
            return fail(500, { error: 'No se puede eliminar porque tiene tickets asociados' });
        }
    }
};
