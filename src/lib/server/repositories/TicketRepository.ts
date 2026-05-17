import { db } from '../db';
import { tickets, ticket_adjuntos, usuarios, estados_tickets, categorias, ticket_comentarios } from '../db/schema';
import { eq, desc, isNull, and, sql } from 'drizzle-orm';

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
            where: and(
                eq(tickets.created_by, userId),
                sql`${tickets.deleted_at} IS NULL`
            ),
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
                },
                lecturas: true
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

    // --- Métodos para el Técnico ---

    async getTicketsByAssignee(userId: number) {
        return await db.query.tickets.findMany({
            where: and(
                eq(tickets.id_usuario, userId),
                sql`${tickets.deleted_at} IS NULL`
            ),
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

    async getUnassignedTickets() {
        return await db.query.tickets.findMany({
            where: and(
                isNull(tickets.id_usuario),
                sql`${tickets.deleted_at} IS NULL`
            ),
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

    async claimTicket(ticketId: number, userId: number) {
        const [updatedTicket] = await db.update(tickets)
            .set({ 
                id_usuario: userId,
                updated_by: userId,
                updated_at: new Date()
            })
            .where(eq(tickets.id_ticket, ticketId))
            .returning();
        return updatedTicket;
    }

    async updateTicket(ticketId: number, data: {
        id_estado?: number;
        id_categoria?: number;
        id_nivel_atencion?: number;
        notas_tecnico?: string;
        updated_by: number;
    }) {
        const updateData: any = {
            updated_by: data.updated_by,
            updated_at: new Date()
        };
        
        if (data.id_estado !== undefined) updateData.id_estado = data.id_estado;
        if (data.id_categoria !== undefined) updateData.id_categoria = data.id_categoria;
        if (data.id_nivel_atencion !== undefined) updateData.id_nivel_atencion = data.id_nivel_atencion;
        if (data.notas_tecnico !== undefined) updateData.notas_tecnico = data.notas_tecnico;

        const [updatedTicket] = await db.update(tickets)
            .set(updateData)
            .where(eq(tickets.id_ticket, ticketId))
            .returning();
            
        return updatedTicket;
    }
    async getAllTickets(includeDeleted = false) {
        const whereClause = includeDeleted 
            ? undefined 
            : sql`${tickets.deleted_at} IS NULL`;

        return await db.query.tickets.findMany({
            where: whereClause,
            with: {
                estado: true,
                categoria: true,
                creador: true,
                usuario_asignado: true,
                activo_ti: {
                    with: {
                        catalogo: true,
                        sucursal: true
                    }
                }
            },
            orderBy: [desc(tickets.created_at)]
        });
    }

    async deleteTicket(id: number) {
        return await db.update(tickets)
            .set({ deleted_at: new Date() })
            .where(eq(tickets.id_ticket, id))
            .returning();
    }

    async restoreTicket(id: number) {
        return await db.update(tickets)
            .set({ deleted_at: null })
            .where(eq(tickets.id_ticket, id))
            .returning();
    }

    async assignTicket(ticketId: number, userId: string | number) {
        const [updatedTicket] = await db.update(tickets)
            .set({ 
                id_usuario: typeof userId === 'string' ? parseInt(userId) : userId,
                updated_at: new Date()
            })
            .where(eq(tickets.id_ticket, ticketId))
            .returning();
        return updatedTicket;
    }

    async updateTicketStatus(ticketId: number, statusId: number) {
        const [updatedTicket] = await db.update(tickets)
            .set({ 
                id_estado: statusId,
                updated_at: new Date()
            })
            .where(eq(tickets.id_ticket, ticketId))
            .returning();
        return updatedTicket;
    }
}
