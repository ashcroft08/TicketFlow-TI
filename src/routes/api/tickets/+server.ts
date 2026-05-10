import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { ticketSchema } from '$lib/shared/schemas/ticket.schema';

const ticketRepo = new TicketRepository();

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        let tickets;
        if (locals.user.cod_rol === 'ADMIN') {
            tickets = await ticketRepo.getAllTickets();
        } else if (locals.user.cod_rol === 'TECH') {
            tickets = await ticketRepo.getTicketsByAssignee(locals.user.id);
        } else {
            tickets = await ticketRepo.getTicketsByCreator(locals.user.id);
        }
        
        return json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validated = ticketSchema.safeParse(body);

        if (!validated.success) {
            return json({ error: 'Datos inválidos', details: validated.error.format() }, { status: 400 });
        }

        const newTicket = await ticketRepo.createTicket({
            id_usuario_creador: locals.user.id,
            titulo: validated.data.titulo,
            descripcion: validated.data.descripcion,
            id_activo: validated.data.id_activo ?? undefined
        });

        return json(newTicket, { status: 201 });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
};
