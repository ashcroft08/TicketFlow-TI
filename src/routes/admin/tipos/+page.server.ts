import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { CatalogRepository } from '$lib/server/repositories/CatalogRepository';

const catalogRepository = new CatalogRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const tipos = await catalogRepository.getAllTipos();

    return {
        tipos
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const tipo = data.get('tipo')?.toString()?.trim();
        const codigo = data.get('codigo')?.toString()?.trim() || null;

        if (!tipo) {
            return fail(400, { error: 'El nombre del tipo es requerido' });
        }

        try {
            await catalogRepository.createTipo({ tipo, codigo });
            return { success: true };
        } catch (err) {
            console.error('Error al crear tipo:', err);
            return fail(500, { error: 'Error al crear tipo' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const tipo = data.get('tipo')?.toString()?.trim();
        const codigo = data.get('codigo')?.toString()?.trim() || null;

        if (!id || !tipo) {
            return fail(400, { error: 'Datos incompletos' });
        }

        try {
            await catalogRepository.updateTipo(id, { tipo, codigo });
            return { success: true };
        } catch (err) {
            console.error('Error al actualizar tipo:', err);
            return fail(500, { error: 'Error al actualizar' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await catalogRepository.deleteTipo(id);
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar tipo:', err);
            return fail(500, { error: 'No se puede eliminar porque tiene artículos asociados en el catálogo' });
        }
    }
};
