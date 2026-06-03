import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AssetRepository } from '$lib/server/repositories/AssetRepository';
import { BitacoraRepository } from '$lib/server/repositories/BitacoraRepository';

const assetRepository = new AssetRepository();
const bitacoraRepository = new BitacoraRepository();

export const POST: RequestHandler = async ({ request, locals }) => {
    // Verificar autorización
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        return json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { actions } = await request.json();
        if (!actions || !Array.isArray(actions)) {
            return json({ error: 'Formato de datos inválido' }, { status: 400 });
        }

        const syncedIds: number[] = [];

        for (const action of actions) {
            const { id, entityType, actionType, payload } = action;

            try {
                if (entityType === 'activo') {
                    if (actionType === 'create') {
                        await assetRepository.create(payload);
                    } else if (actionType === 'update') {
                        await assetRepository.update(payload.id, payload.data);
                    } else if (actionType === 'delete') {
                        await assetRepository.delete(payload.id);
                    }
                } else if (entityType === 'bitacora') {
                    if (actionType === 'create') {
                        // Forzar el id del usuario que realiza la sincronización actual
                        await bitacoraRepository.create({
                            ...payload,
                            id_usuario: locals.user.id
                        });
                    } else if (actionType === 'update') {
                        await bitacoraRepository.update(payload.id, payload.data);
                    } else if (actionType === 'delete') {
                        await bitacoraRepository.delete(payload.id);
                    }
                }
                // Si la acción se ejecutó exitosamente, marcar para eliminación local
                if (id !== undefined) {
                    syncedIds.push(id);
                }
            } catch (err) {
                console.error(`Error sincronizando acción individual ${id}:`, err);
                // Si falla una acción, continuamos con las demás para no trabar toda la cola.
            }
        }

        return json({ success: true, syncedIds });
    } catch (err) {
        console.error('Error general de sincronización en servidor:', err);
        return json({ error: 'Error interno del servidor al procesar la sincronización' }, { status: 500 });
    }
};
