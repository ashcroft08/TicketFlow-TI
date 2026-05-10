import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';
import { CategoryRepository } from '$lib/server/repositories/CategoryRepository';

const refRepo = new ReferenceDataRepository();
const branchRepo = new BranchRepository();
const catRepo = new CategoryRepository();

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const [estados, categorias, sucursales, niveles] = await Promise.all([
            refRepo.getEstadosTickets(),
            catRepo.getActive(),
            branchRepo.getActive(),
            refRepo.getNivelesAtencion()
        ]);

        return json({
            estados,
            categorias,
            sucursales,
            niveles
        });
    } catch (error) {
        console.error('Error fetching reference data:', error);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};
