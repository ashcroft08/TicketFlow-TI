import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';
import { InventoryRepository } from '$lib/server/repositories/InventoryRepository';

const ticketRepository = new TicketRepository();
const referenceDataRepository = new ReferenceDataRepository();
const inventoryRepository = new InventoryRepository();

export const load: PageServerLoad = async ({ params, locals }) => {
    // Validar sesión y rol (TECH o ADMIN)
    const user = locals.user;
    if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
        throw error(401, 'No autorizado');
    }

    const ticketId = parseInt(params.id, 10);
    if (isNaN(ticketId)) {
        throw error(400, 'ID de ticket inválido');
    }

    const ticket = await ticketRepository.getTicketById(ticketId);

    if (!ticket) {
        throw error(404, 'Ticket no encontrado');
    }

    // Cargar catálogos para los selectores
    const [categorias, estados, niveles, tiposMovimiento] = await Promise.all([
        referenceDataRepository.getCategorias(),
        referenceDataRepository.getEstadosTickets(),
        referenceDataRepository.getNivelesAtencion(),
        inventoryRepository.getMovementTypes()
    ]);

    // Si el ticket tiene un activo asignado, cargamos su historial de movimientos
    let movimientosActivo: Awaited<ReturnType<typeof inventoryRepository.getAssetMovements>> = [];
    if (ticket.id_activo) {
        movimientosActivo = await inventoryRepository.getAssetMovements(ticket.id_activo);
    }

    // Calculate unread comments count
    const userLectura = ticket.lecturas?.find(l => l.id_usuario === user.id);
    const ultimaLecturaTime = userLectura ? new Date(userLectura.ultima_lectura).getTime() : 0;
    
    const unread_count = ticket.comentarios?.filter(
        (c) => c.created_at && new Date(c.created_at).getTime() > ultimaLecturaTime && c.id_usuario !== user.id
    ).length || 0;

    return {
        user,
        ticket,
        categorias,
        estados,
        niveles,
        tiposMovimiento,
        movimientosActivo,
        unread_count
    };
};

export const actions: Actions = {
    updateDetails: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
            return fail(401, { error: 'No autorizado' });
        }

        const ticketId = parseInt(params.id, 10);
        const data = await request.formData();

        const id_estado = data.get('id_estado')?.toString();
        const id_categoria = data.get('id_categoria')?.toString();
        const id_nivel_atencion = data.get('id_nivel_atencion')?.toString();
        const notas_tecnico = data.get('notas_tecnico')?.toString();

        const updateData: any = { updated_by: user.id };
        if (id_estado) updateData.id_estado = parseInt(id_estado, 10);
        if (id_categoria) updateData.id_categoria = parseInt(id_categoria, 10);
        if (id_nivel_atencion) updateData.id_nivel_atencion = parseInt(id_nivel_atencion, 10);
        if (notas_tecnico !== undefined) updateData.notas_tecnico = notas_tecnico;

        try {
            await ticketRepository.updateTicket(ticketId, updateData);
            return { success: true, message: '¡Detalles del ticket actualizados!' };
        } catch (err) {
            console.error('Error al actualizar ticket:', err);
            return fail(500, { error: 'Error al guardar los cambios' });
        }
    },

    sendComment: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
            return fail(401, { error: 'No autorizado' });
        }

        const ticketId = parseInt(params.id, 10);
        const data = await request.formData();
        const comentario = data.get('comentario')?.toString();

        if (!comentario || comentario.trim() === '') {
            return fail(400, { error: 'El comentario no puede estar vacío' });
        }

        try {
            await ticketRepository.addComment({
                id_ticket: ticketId,
                id_usuario: user.id,
                comentario: comentario.trim(),
                tipo_comentario: 'publico'
            });
            return { success: true };
        } catch (err) {
            console.error('Error al enviar comentario:', err);
            return fail(500, { error: 'Error al enviar el mensaje' });
        }
    },
    
    claim: async ({ params, locals }) => {
        const user = locals.user;
        if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
            return fail(401, { error: 'No autorizado' });
        }

        const ticketId = parseInt(params.id, 10);

        try {
            await ticketRepository.claimTicket(ticketId, user.id);
            return { success: true, message: '¡Has tomado este ticket exitosamente!' };
        } catch (err) {
            console.error('Error al reclamar ticket:', err);
            return fail(500, { error: 'Ocurrió un error al asignar el ticket' });
        }
    },

    registerAssetMovement: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
            return fail(401, { error: 'No autorizado' });
        }

        const ticketId = parseInt(params.id, 10);
        const data = await request.formData();
        
        const id_activo = parseInt(data.get('id_activo')?.toString() || '', 10);
        const id_tipo_movimiento = parseInt(data.get('id_tipo_movimiento')?.toString() || '', 10);
        const nuevo_estado = data.get('nuevo_estado')?.toString();
        const motivo = data.get('motivo')?.toString();

        if (isNaN(id_activo) || isNaN(id_tipo_movimiento) || !nuevo_estado) {
            return fail(400, { error: 'Faltan campos obligatorios para registrar el movimiento' });
        }

        try {
            // 1. Registrar el movimiento
            await inventoryRepository.registerMovement({
                id_ticket: ticketId,
                id_activo,
                id_tipo_movimiento,
                motivo
            });

            // 2. Actualizar el estado del activo
            await inventoryRepository.updateAssetStatus(id_activo, nuevo_estado);

            return { success: true, message: '¡Movimiento de inventario registrado y estado actualizado!' };
        } catch (err) {
            console.error('Error al registrar movimiento:', err);
            return fail(500, { error: 'Error al registrar el movimiento de inventario' });
        }
    }
};
