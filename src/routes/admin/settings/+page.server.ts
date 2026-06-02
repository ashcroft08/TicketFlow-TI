import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';
import { InventoryRepository } from '$lib/server/repositories/InventoryRepository';
import { CajaRepository } from '$lib/server/repositories/CajaRepository';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';
import { CategoriaBitacoraRepository } from '$lib/server/repositories/CategoriaBitacoraRepository';

const referenceDataRepository = new ReferenceDataRepository();
const inventoryRepository = new InventoryRepository();
const cajaRepository = new CajaRepository();
const branchRepository = new BranchRepository();
const categoriaBitacoraRepository = new CategoriaBitacoraRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const [estados, movimientos, cajas, sucursales, categoriasBitacora] = await Promise.all([
        referenceDataRepository.getEstadosTickets(false),
        inventoryRepository.getMovementTypes(false),
        cajaRepository.getAll(),
        branchRepository.getActive(),
        categoriaBitacoraRepository.getAll()
    ]);

    return {
        estados,
        movimientos,
        cajas,
        sucursales,
        categoriasBitacora
    };
};

export const actions: Actions = {
    // --- ACCIONES PARA ESTADOS DE TICKETS ---
    createEstado: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString()?.trim();
        const color = data.get('color')?.toString()?.trim() || '#3b82f6';

        if (!nombre) {
            return fail(400, { error: 'El nombre del estado es requerido' });
        }

        try {
            await referenceDataRepository.createEstado({ nombre, color });
            return { success: true, message: '¡Estado creado exitosamente!' };
        } catch (err) {
            console.error('Error al crear estado:', err);
            return fail(500, { error: 'Error al crear el estado del ticket' });
        }
    },

    updateEstado: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString()?.trim();
        const color = data.get('color')?.toString()?.trim();
        const estado = data.get('estado')?.toString() === 'true';

        if (!id || !nombre || !color) {
            return fail(400, { error: 'Datos incompletos para actualizar' });
        }

        try {
            await referenceDataRepository.updateEstado(id, { nombre, color, estado });
            return { success: true, message: '¡Estado actualizado correctamente!' };
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            return fail(500, { error: 'Error al actualizar el estado del ticket' });
        }
    },

    deleteEstado: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await referenceDataRepository.deleteEstado(id);
            return { success: true, message: '¡Estado desactivado con éxito!' };
        } catch (err) {
            console.error('Error al eliminar estado:', err);
            return fail(500, { error: 'Error al desactivar el estado del ticket' });
        }
    },

    // --- ACCIONES PARA TIPOS DE MOVIMIENTOS ---
    createMovementType: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const tipo_movimiento = data.get('tipo_movimiento')?.toString()?.trim();
        const codigo = data.get('codigo')?.toString()?.trim() || '';

        if (!tipo_movimiento) {
            return fail(400, { error: 'El nombre del movimiento es requerido' });
        }

        try {
            await inventoryRepository.createMovementType({ tipo_movimiento, codigo });
            return { success: true, message: '¡Tipo de movimiento creado exitosamente!' };
        } catch (err) {
            console.error('Error al crear tipo de movimiento:', err);
            return fail(500, { error: 'Error al crear el tipo de movimiento de inventario' });
        }
    },

    updateMovementType: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const tipo_movimiento = data.get('tipo_movimiento')?.toString()?.trim();
        const codigo = data.get('codigo')?.toString()?.trim() || '';
        const estado = data.get('estado')?.toString() === 'true';

        if (!id || !tipo_movimiento) {
            return fail(400, { error: 'Datos incompletos para actualizar' });
        }

        try {
            await inventoryRepository.updateMovementType(id, { tipo_movimiento, codigo, estado });
            return { success: true, message: '¡Tipo de movimiento actualizado correctamente!' };
        } catch (err) {
            console.error('Error al actualizar tipo de movimiento:', err);
            return fail(500, { error: 'Error al actualizar el tipo de movimiento de inventario' });
        }
    },

    deleteMovementType: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await inventoryRepository.deleteMovementType(id);
            return { success: true, message: '¡Tipo de movimiento desactivado con éxito!' };
        } catch (err) {
            console.error('Error al eliminar tipo de movimiento:', err);
            return fail(500, { error: 'Error al desactivar el tipo de movimiento de inventario' });
        }
    },

    // --- ACCIONES PARA CAJAS ---
    createCaja: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString()?.trim();
        const id_sucursal = parseInt(data.get('id_sucursal')?.toString() || '0');

        if (!nombre || !id_sucursal) {
            return fail(400, { error: 'El nombre de la caja y la sucursal son requeridos' });
        }

        try {
            await cajaRepository.create({ nombre, id_sucursal });
            return { success: true, message: '¡Caja creada exitosamente!' };
        } catch (err) {
            console.error('Error al crear caja:', err);
            return fail(500, { error: 'Error al crear la caja' });
        }
    },

    updateCaja: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString()?.trim();
        const id_sucursal = parseInt(data.get('id_sucursal')?.toString() || '0');
        const estado = data.get('estado')?.toString() === 'true';

        if (!id || !nombre || !id_sucursal) {
            return fail(400, { error: 'Datos incompletos para actualizar' });
        }

        try {
            await cajaRepository.update(id, { nombre, id_sucursal, estado });
            return { success: true, message: '¡Caja actualizada correctamente!' };
        } catch (err) {
            console.error('Error al actualizar caja:', err);
            return fail(500, { error: 'Error al actualizar la caja' });
        }
    },

    deleteCaja: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await cajaRepository.delete(id);
            return { success: true, message: '¡Caja desactivada con éxito!' };
        } catch (err) {
            console.error('Error al desactivar caja:', err);
            return fail(500, { error: 'Error al desactivar la caja' });
        }
    },

    // --- ACCIONES PARA CATEGORÍAS DE BITÁCORA ---
    createCategoriaBitacora: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString()?.trim();

        if (!nombre) {
            return fail(400, { error: 'El nombre de la categoría es requerido' });
        }

        try {
            await categoriaBitacoraRepository.create({ nombre });
            return { success: true, message: '¡Categoría de bitácora creada exitosamente!' };
        } catch (err) {
            console.error('Error al crear categoría de bitácora:', err);
            return fail(500, { error: 'Error al crear la categoría' });
        }
    },

    updateCategoriaBitacora: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString()?.trim();
        const estado = data.get('estado')?.toString() === 'true';

        if (!id || !nombre) {
            return fail(400, { error: 'Datos incompletos para actualizar' });
        }

        try {
            await categoriaBitacoraRepository.update(id, { nombre, estado });
            return { success: true, message: '¡Categoría de bitácora actualizada correctamente!' };
        } catch (err) {
            console.error('Error al actualizar categoría de bitácora:', err);
            return fail(500, { error: 'Error al actualizar la categoría' });
        }
    }
};
