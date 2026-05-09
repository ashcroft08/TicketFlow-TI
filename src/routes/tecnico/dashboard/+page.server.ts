import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';

const ticketRepository = new TicketRepository();

export const load: PageServerLoad = async ({ locals }) => {
    // Verificar sesión y rol
    const user = locals.user;
    if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
        throw redirect(303, '/');
    }

    // Cargar todos los tickets asignados al técnico
    const allMisTickets = await ticketRepository.getTicketsByAssignee(user.id);
    
    // Separar en activos y finalizados
    const misTickets = allMisTickets.filter(t => t.estado?.nombre !== 'Resuelto' && t.estado?.nombre !== 'Cerrado');
    const finalizados = allMisTickets.filter(t => t.estado?.nombre === 'Resuelto' || t.estado?.nombre === 'Cerrado');
    
    // Cargar tickets nuevos sin asignar
    const nuevosTickets = await ticketRepository.getUnassignedTickets();

    return {
        user,
        misTickets,
        finalizados,
        nuevosTickets
    };
};

export const actions: Actions = {
    claim: async ({ request, locals }) => {
        const user = locals.user;
        if (!user || (user.cod_rol !== 'TECH' && user.cod_rol !== 'ADMIN')) {
            return fail(401, { error: 'No autorizado' });
        }

        const data = await request.formData();
        const ticketIdStr = data.get('id_ticket')?.toString();

        if (!ticketIdStr) {
            return fail(400, { error: 'ID de ticket requerido' });
        }

        const ticketId = parseInt(ticketIdStr, 10);

        try {
            await ticketRepository.claimTicket(ticketId, user.id);
            return { success: true, message: '¡Ticket asignado exitosamente!' };
        } catch (err) {
            console.error('Error al reclamar ticket:', err);
            return fail(500, { error: 'Ocurrió un error al asignar el ticket' });
        }
    }
};
