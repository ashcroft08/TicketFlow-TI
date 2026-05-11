import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';
import { CategoryRepository } from '$lib/server/repositories/CategoryRepository';
import { AssetRepository } from '$lib/server/repositories/AssetRepository';

const userRepository = new UserRepository();
const branchRepository = new BranchRepository();
const categoryRepository = new CategoryRepository();
const assetRepository = new AssetRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const [users, branches, categories, assets] = await Promise.all([
        userRepository.getDeleted(),
        branchRepository.getDeleted(),
        categoryRepository.getDeleted(),
        assetRepository.getDeleted()
    ]);

    return {
        deleted: {
            users,
            branches,
            categories,
            assets
        }
    };
};

export const actions: Actions = {
    restoreUser: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (!id) return fail(400, { error: 'ID inválido' });

        try {
            await userRepository.restore(id);
            return { success: true };
        } catch (err) {
            console.error('Error al restaurar usuario:', err);
            return fail(500, { error: 'Error al restaurar usuario' });
        }
    },

    restoreBranch: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (!id) return fail(400, { error: 'ID inválido' });

        try {
            await branchRepository.restore(id);
            return { success: true };
        } catch (err) {
            console.error('Error al restaurar sucursal:', err);
            return fail(500, { error: 'Error al restaurar sucursal' });
        }
    },

    restoreCategory: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (!id) return fail(400, { error: 'ID inválido' });

        try {
            await categoryRepository.restore(id);
            return { success: true };
        } catch (err) {
            console.error('Error al restaurar categoría:', err);
            return fail(500, { error: 'Error al restaurar categoría' });
        }
    },

    restoreAsset: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        if (!id) return fail(400, { error: 'ID inválido' });

        try {
            await assetRepository.restore(id);
            return { success: true };
        } catch (err) {
            console.error('Error al restaurar activo:', err);
            return fail(500, { error: 'Error al restaurar activo' });
        }
    }
};
