import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';
import { InventoryRepository } from '$lib/server/repositories/InventoryRepository';

const ticketRepository = new TicketRepository();
const userRepository = new UserRepository();
const referenceDataRepository = new ReferenceDataRepository();
const inventoryRepository = new InventoryRepository();

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) throw error(404, 'ID de ticket no válido');

    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) throw error(404, 'Ticket no encontrado');

    // Get all technicians for assignment
    const technicians = await userRepository.getUsersByRole('TECNICO');

    // Cargar catálogos usando los mismos repositorios que el técnico (para consistencia)
    const [categorias, estados, niveles, tiposMovimiento] = await Promise.all([
        referenceDataRepository.getCategorias(),
        referenceDataRepository.getEstadosTickets(),
        referenceDataRepository.getNivelesAtencion(),
        inventoryRepository.getMovementTypes()
    ]);

    // Historial de movimientos si hay un activo
    let movimientosActivo = [];
    if (ticket.id_activo) {
        movimientosActivo = await inventoryRepository.getAssetMovements(ticket.id_activo);
    }

    // Calculate unread comments count for admin
    const userLectura = ticket.lecturas?.find(l => l.id_usuario === locals.user.id);
    const ultimaLecturaTime = userLectura ? new Date(userLectura.ultima_lectura).getTime() : 0;
    
    const unread_count = ticket.comentarios?.filter(
        (c) => new Date(c.created_at).getTime() > ultimaLecturaTime && c.id_usuario !== locals.user.id
    ).length || 0;

    return {
        ticket,
        technicians,
        categorias,
        estados,
        niveles,
        tiposMovimiento,
        movimientosActivo,
        unread_count
    };
};

export const actions: Actions = {
    updateStatus: async ({ request, params }) => {
        const data = await request.formData();
        const statusId = parseInt(data.get('statusId') as string);
        const ticketId = parseInt(params.id);

        await ticketRepository.updateTicketStatus(ticketId, statusId);
        return { success: true };
    },

    assignTechnician: async ({ request, params }) => {
        const data = await request.formData();
        const technicianId = data.get('technicianId') as string;
        const ticketId = parseInt(params.id);

        await ticketRepository.assignTicket(ticketId, technicianId);
        return { success: true };
    },

    updateDetails: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || user.cod_rol !== 'ADMIN') {
            return fail(401, { error: 'No autorizado' });
        }

        const formData = await request.formData();
        const ticketId = parseInt(params.id);
        
        const id_estado = parseInt(formData.get('id_estado') as string);
        const id_nivel_atencion = formData.get('id_nivel_atencion') ? parseInt(formData.get('id_nivel_atencion') as string) : undefined;
        const id_categoria = formData.get('id_categoria') ? parseInt(formData.get('id_categoria') as string) : undefined;
        const notas_tecnico = formData.get('notas_tecnico') as string;

        try {
            await ticketRepository.updateTicket(ticketId, {
                id_estado,
                id_nivel_atencion,
                id_categoria,
                notas_tecnico,
                updated_by: user.id_usuario // Importante: usar id_usuario
            });

            return { success: true, message: 'Diagnóstico y gestión actualizados correctamente' };
        } catch (err) {
            console.error('Error al actualizar ticket:', err);
            return fail(500, { error: 'Error al guardar los cambios' });
        }
    },

    registerAssetMovement: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || user.cod_rol !== 'ADMIN') {
            return fail(401, { error: 'No autorizado' });
        }

        const ticketId = parseInt(params.id, 10);
        const data = await request.formData();
        
        const id_activo = parseInt(data.get('id_activo')?.toString() || '', 10);
        const id_tipo_movimiento = parseInt(data.get('id_tipo_movimiento')?.toString() || '', 10);
        const nuevo_estado = data.get('nuevo_estado')?.toString();
        const motivo = data.get('motivo')?.toString();

        if (isNaN(id_activo) || isNaN(id_tipo_movimiento) || !nuevo_estado) {
            return fail(400, { error: 'Faltan campos obligatorios' });
        }

        try {
            await inventoryRepository.registerMovement({
                id_ticket: ticketId,
                id_activo,
                id_tipo_movimiento,
                motivo
            });

            await inventoryRepository.updateAssetStatus(id_activo, nuevo_estado);

            return { success: true, message: 'Movimiento registrado y estado del activo actualizado' };
        } catch (err) {
            console.error('Error en movimiento:', err);
            return fail(500, { error: 'Error al registrar el movimiento' });
        }
    },

    addComment: async ({ request, params, locals }) => {
        const data = await request.formData();
        const content = data.get('content') as string;
        const ticketId = parseInt(params.id);

        if (!content) return { success: false, error: 'Comentario vacío' };

        await ticketRepository.addComment({
            id_ticket: ticketId,
            id_usuario: locals.user!.id_usuario,
            comentario: content
        });
        return { success: true };
    }
};
