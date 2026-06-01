import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { AssetRepository } from '$lib/server/repositories/AssetRepository';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { CajaRepository } from '$lib/server/repositories/CajaRepository';
import { InventoryRepository } from '$lib/server/repositories/InventoryRepository';

const assetRepository = new AssetRepository();
const branchRepository = new BranchRepository();
const userRepository = new UserRepository();
const cajaRepository = new CajaRepository();
const inventoryRepository = new InventoryRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const [activos, catalogos, branches, users, cajas] = await Promise.all([
        assetRepository.getAll(),
        assetRepository.getCatalogs(),
        branchRepository.getActive(),
        userRepository.getAll(), // Para asignar a usuarios
        cajaRepository.getActive()
    ]);

    return {
        activos,
        catalogos,
        branches,
        users,
        cajas
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const assetData = {
            id_catalogo: parseInt(data.get('id_catalogo')?.toString() || '0'),
            id_sucursal: parseInt(data.get('id_sucursal')?.toString() || '0'),
            id_usuario_asignado: parseInt(data.get('id_usuario_asignado')?.toString() || '0') || null,
            id_caja: parseInt(data.get('id_caja')?.toString() || '0') || null,
            numero_serie: data.get('numero_serie')?.toString() || null,
            codigo_inventario: data.get('codigo_inventario')?.toString() || null,
            estado: (data.get('estado')?.toString() || 'activo') as 'activo' | 'en_reparacion' | 'bodega' | 'baja',
            observaciones: data.get('observaciones')?.toString() || null,
            fecha_adquisicion: data.get('fecha_adquisicion')?.toString() || null,
        };

        if (!assetData.id_catalogo || !assetData.id_sucursal) {
            return fail(400, { error: 'Catálogo y Sucursal son requeridos' });
        }

        try {
            await assetRepository.create(assetData);
            return { success: true };
        } catch (err) {
            console.error('Error al crear activo:', err);
            return fail(500, { error: 'Error al crear activo' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const assetData = {
            id_catalogo: parseInt(data.get('id_catalogo')?.toString() || '0'),
            id_sucursal: parseInt(data.get('id_sucursal')?.toString() || '0'),
            id_usuario_asignado: parseInt(data.get('id_usuario_asignado')?.toString() || '0') || null,
            id_caja: parseInt(data.get('id_caja')?.toString() || '0') || null,
            numero_serie: data.get('numero_serie')?.toString() || null,
            codigo_inventario: data.get('codigo_inventario')?.toString() || null,
            estado: (data.get('estado')?.toString() || 'activo') as 'activo' | 'en_reparacion' | 'bodega' | 'baja',
            observaciones: data.get('observaciones')?.toString() || null,
            fecha_adquisicion: data.get('fecha_adquisicion')?.toString() || null,
        };

        if (!id || !assetData.id_catalogo || !assetData.id_sucursal) {
            return fail(400, { error: 'Datos incompletos' });
        }

        try {
            const existingAsset = await assetRepository.getById(id);
            if (existingAsset) {
                const branchChanged = existingAsset.id_sucursal !== assetData.id_sucursal;
                const cajaChanged = existingAsset.id_caja !== assetData.id_caja;

                if (branchChanged || cajaChanged) {
                    const branches = await branchRepository.getActive();
                    const cajas = await cajaRepository.getActive();
                    
                    const origBranchName = existingAsset.sucursal?.nombre || 'Matriz';
                    const origCajaName = existingAsset.caja?.nombre ? `[${existingAsset.caja.nombre}]` : '';
                    
                    const destBranch = branches.find(b => b.id_sucursal === assetData.id_sucursal);
                    const destBranchName = destBranch?.nombre || 'Matriz';
                    const destCaja = cajas.find(c => c.id_caja === assetData.id_caja);
                    const destCajaName = destCaja?.nombre ? `[${destCaja.nombre}]` : '';

                    const movementTypes = await inventoryRepository.getMovementTypes(false);
                    let trasladoType = movementTypes.find(m => m.codigo === 'TRASLADO');
                    if (!trasladoType) {
                        trasladoType = await inventoryRepository.createMovementType({
                            tipo_movimiento: 'Traslado a Sucursal / Caja',
                            codigo: 'TRASLADO'
                        });
                    }

                    await inventoryRepository.registerMovement({
                        id_ticket: null as any,
                        id_activo: id,
                        id_tipo_movimiento: trasladoType.id_tipo_movimiento,
                        motivo: `Traslado de ${origBranchName} ${origCajaName} a ${destBranchName} ${destCajaName}`.replace(/\s+/g, ' ').trim()
                    });
                }
            }

            await assetRepository.update(id, assetData);
            return { success: true };
        } catch (err) {
            console.error('Error al actualizar activo:', err);
            return fail(500, { error: 'Error al actualizar' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400);

        try {
            await assetRepository.delete(id);
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar activo:', err);
            return fail(500, { error: 'No se puede eliminar porque tiene tickets o movimientos asociados' });
        }
    }
};
