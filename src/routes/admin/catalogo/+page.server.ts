import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { CatalogRepository } from '$lib/server/repositories/CatalogRepository';

const catalogRepository = new CatalogRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const [catalogos, tipos] = await Promise.all([
        catalogRepository.getAll(),
        catalogRepository.getAllTipos()
    ]);

    return {
        catalogos,
        tipos
    };
};

export const actions: Actions = {
    // --- Acciones de Catálogo de Artículos ---
    createItem: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString()?.trim();
        const marca = data.get('marca')?.toString()?.trim() || null;
        const modelo = data.get('modelo')?.toString()?.trim() || null;
        const id_tipo = parseInt(data.get('id_tipo')?.toString() || '0') || null;

        if (!nombre) {
            return fail(400, { error: 'El nombre es requerido' });
        }

        try {
            await catalogRepository.create({
                nombre,
                marca,
                modelo,
                id_tipo,
                created_by: locals.user.id
            });
            return { success: true };
        } catch (err) {
            console.error('Error al crear artículo del catálogo:', err);
            return fail(500, { error: 'Error al crear el artículo' });
        }
    },

    updateItem: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString()?.trim();
        const marca = data.get('marca')?.toString()?.trim() || null;
        const modelo = data.get('modelo')?.toString()?.trim() || null;
        const id_tipo = parseInt(data.get('id_tipo')?.toString() || '0') || null;

        if (!id || !nombre) {
            return fail(400, { error: 'Datos incompletos' });
        }

        try {
            await catalogRepository.update(id, {
                nombre,
                marca,
                modelo,
                id_tipo,
                updated_by: locals.user.id
            });
            return { success: true };
        } catch (err) {
            console.error('Error al actualizar artículo:', err);
            return fail(500, { error: 'Error al actualizar' });
        }
    },

    deleteItem: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await catalogRepository.delete(id);
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar artículo:', err);
            return fail(500, { error: 'No se puede eliminar porque tiene activos asociados' });
        }
    },


};
