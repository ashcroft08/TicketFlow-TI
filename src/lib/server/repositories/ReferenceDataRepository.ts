import { db } from '../db';
import { activos_ti, categorias, estados_tickets, nivel_atencion } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export class ReferenceDataRepository {
    async getActivosBySucursal(idSucursal: number) {
        return await db.query.activos_ti.findMany({
            where: eq(activos_ti.id_sucursal, idSucursal),
            with: {
                catalogo: true,
                caja: true
            }
        });
    }

    async getCategorias() {
        return await db.query.categorias.findMany({
            where: eq(categorias.estado, true)
        });
    }

    async getEstadosTickets(onlyActive = true) {
        const whereClause = onlyActive ? eq(estados_tickets.estado, true) : undefined;
        return await db.query.estados_tickets.findMany({
            where: whereClause,
            orderBy: [asc(estados_tickets.nombre)]
        });
    }

    async getNivelesAtencion() {
        return await db.query.nivel_atencion.findMany({
            where: eq(nivel_atencion.estado, true),
            orderBy: [asc(nivel_atencion.orden)]
        });
    }

    // --- Métodos CRUD para Estados de Tickets ---

    async createEstado(data: { nombre: string; color: string }) {
        const [newEstado] = await db.insert(estados_tickets)
            .values({
                nombre: data.nombre,
                color: data.color,
                estado: true
            })
            .returning();
        return newEstado;
    }

    async updateEstado(id: number, data: { nombre?: string; color?: string; estado?: boolean }) {
        const [updatedEstado] = await db.update(estados_tickets)
            .set(data)
            .where(eq(estados_tickets.id_estado, id))
            .returning();
        return updatedEstado;
    }

    async deleteEstado(id: number) {
        // Hacemos borrado lógico (estado: false) para no romper tickets ya creados
        const [deletedEstado] = await db.update(estados_tickets)
            .set({ estado: false })
            .where(eq(estados_tickets.id_estado, id))
            .returning();
        return deletedEstado;
    }
}
