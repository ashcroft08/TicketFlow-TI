import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';

const branchRepository = new BranchRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const sucursales = await branchRepository.getAll();

    return {
        sucursales
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
            await branchRepository.create({ nombre: nombre.trim() });
            return { success: true, message: 'Sucursal creada exitosamente' };
        } catch (err) {
            console.error('Error al crear sucursal:', err);
            return fail(500, { error: 'Error al crear la sucursal' });
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
            await branchRepository.update(id, { nombre: nombre.trim(), estado });
            return { success: true, message: 'Sucursal actualizada' };
        } catch (err) {
            console.error('Error al actualizar sucursal:', err);
            return fail(500, { error: 'Error al actualizar' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await branchRepository.delete(id);
            return { success: true, message: 'Sucursal eliminada' };
        } catch (err) {
            console.error('Error al eliminar sucursal:', err);
            return fail(500, { error: 'No se puede eliminar la sucursal porque tiene registros asociados' });
        }
    }
};
