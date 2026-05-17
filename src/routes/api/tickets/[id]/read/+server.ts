import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ticket_lecturas } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
    try {
        const ticketId = parseInt(params.id);
        const userId = locals.user?.id;

        if (!userId || isNaN(ticketId)) {
            return json({ error: 'Unauthorized or invalid ticket ID' }, { status: 400 });
        }

        // Upsert logic for ticket_lecturas
        await db.insert(ticket_lecturas)
            .values({
                id_ticket: ticketId,
                id_usuario: userId,
                ultima_lectura: new Date()
            })
            .onConflictDoUpdate({
                target: [ticket_lecturas.id_ticket, ticket_lecturas.id_usuario],
                set: { ultima_lectura: new Date() }
            });

        return json({ success: true });
    } catch (error) {
        console.error('Error updating read status:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
