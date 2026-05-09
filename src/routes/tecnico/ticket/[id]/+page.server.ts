import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';

const ticketRepository = new TicketRepository();
const referenceDataRepository = new ReferenceDataRepository();

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
    const [categorias, estados, niveles] = await Promise.all([
        referenceDataRepository.getCategorias(),
        referenceDataRepository.getEstadosTickets(),
        referenceDataRepository.getNivelesAtencion()
    ]);

    return {
        user,
        ticket,
        categorias,
        estados,
        niveles
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
    }
};
