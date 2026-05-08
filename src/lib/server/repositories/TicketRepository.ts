import { db } from '../db';
import { tickets, ticket_adjuntos, usuarios, estados_tickets, categorias, ticket_comentarios } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class TicketRepository {
    async createTicket(data: {
        id_usuario_creador: number;
        titulo: string;
        descripcion: string;
        id_activo?: number;
        adjuntos?: { url: string; public_id: string; nombre: string }[];
    }) {
        // Find default "Abierto" state
        const estadoAbierto = await db.query.estados_tickets.findFirst({
            where: eq(estados_tickets.nombre, 'Abierto')
        });

        const idEstado = estadoAbierto?.id_estado;

        const [newTicket] = await db.insert(tickets).values({
            created_by: data.id_usuario_creador,
            titulo: data.titulo,
            descripcion: data.descripcion,
            id_activo: data.id_activo,
            id_estado: idEstado
        }).returning();

        // Guardar adjuntos si existen
        if (data.adjuntos && data.adjuntos.length > 0) {
            const adjuntosData = data.adjuntos.map(adj => ({
                id_ticket: newTicket.id_ticket,
                nombre: adj.nombre,
                imagen_public_id: adj.public_id,
                imagen_url: adj.url
            }));
            await db.insert(ticket_adjuntos).values(adjuntosData);
        }

        return newTicket;
    }

    async getTicketsByCreator(userId: number) {
        return await db.query.tickets.findMany({
            where: eq(tickets.created_by, userId),
            with: {
                estado: true,
                categoria: true,
                activo_ti: {
                    with: {
                        catalogo: true
                    }
                }
            },
            orderBy: [desc(tickets.created_at)]
        });
    }

    async getTicketById(ticketId: number) {
        return await db.query.tickets.findFirst({
            where: eq(tickets.id_ticket, ticketId),
            with: {
                estado: true,
                categoria: true,
                creador: {
                    with: { rol: true }
                },
                usuario_asignado: {
                    with: { rol: true }
                },
                activo_ti: {
                    with: {
                        catalogo: true,
                        sucursal: true
                    }
                },
                adjuntos: true,
                comentarios: {
                    with: {
                        usuario: {
                            with: { rol: true }
                        }
                    },
                    orderBy: (comentarios, { asc }) => [asc(comentarios.created_at)]
                }
            }
        });
    }

    async addComment(data: {
        id_ticket: number;
        id_usuario: number;
        comentario: string;
        tipo_comentario?: string;
    }) {
        const [newComment] = await db.insert(ticket_comentarios).values({
            id_ticket: data.id_ticket,
            id_usuario: data.id_usuario,
            comentario: data.comentario,
            tipo_comentario: data.tipo_comentario || 'publico'
        }).returning();

        return newComment;
    }
}
