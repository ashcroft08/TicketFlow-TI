import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';

const ticketRepository = new TicketRepository();

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const includeDeleted = url.searchParams.get('eliminados') === 'true';
    
    // Fetch all to get counts
    const allTickets = await ticketRepository.getAllTickets(true);
    
    const activeTickets = allTickets.filter(t => !t.deleted_at);
    const deletedTickets = allTickets.filter(t => t.deleted_at);

    return {
        tickets: includeDeleted ? deletedTickets : activeTickets,
        includeDeleted,
        counts: {
            active: activeTickets.length,
            deleted: deletedTickets.length
        }
    };
};

export const actions: Actions = {
    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400);

        try {
            await ticketRepository.deleteTicket(id);
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar ticket:', err);
            return fail(500, { error: 'Error al eliminar el ticket' });
        }
    },

    restore: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400);

        try {
            await ticketRepository.restoreTicket(id);
            return { success: true };
        } catch (err) {
            console.error('Error al restaurar ticket:', err);
            return fail(500, { error: 'Error al restaurar el ticket' });
        }
    }
};
