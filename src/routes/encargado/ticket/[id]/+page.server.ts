import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';

const ticketRepository = new TicketRepository();

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(303, '/');
    }

    const ticketId = parseInt(params.id, 10);
    if (isNaN(ticketId)) {
        throw error(400, 'ID de ticket inválido');
    }

    const ticket = await ticketRepository.getTicketById(ticketId);

    if (!ticket) {
        throw error(404, 'Ticket no encontrado');
    }

    // Seguridad: verificar que el usuario logueado sea el creador o tenga un rol superior
    if (locals.user.cod_rol === 'STORE_MANAGER' && ticket.created_by !== locals.user.id) {
        throw error(403, 'No tienes permiso para ver este ticket');
    }

    return {
        user: locals.user,
        ticket
    };
};

export const actions: Actions = {
    sendComment: async ({ request, params, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'No autorizado' });
        }

        const ticketId = parseInt(params.id, 10);
        if (isNaN(ticketId)) {
            return fail(400, { error: 'ID de ticket inválido' });
        }

        const data = await request.formData();
        const comentario = data.get('comentario')?.toString().trim();

        if (!comentario) {
            return fail(400, { error: 'El comentario no puede estar vacío', empty: true });
        }

        try {
            await ticketRepository.addComment({
                id_ticket: ticketId,
                id_usuario: locals.user.id,
                comentario
            });

            return { success: true };
        } catch (err) {
            console.error('Error al enviar comentario:', err);
            return fail(500, { error: 'Ocurrió un error al enviar el mensaje' });
        }
    }
};
