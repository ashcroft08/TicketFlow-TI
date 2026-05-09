import { db } from '../db';
import { activos_ti, categorias, estados_tickets, nivel_atencion } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export class ReferenceDataRepository {
    async getActivosBySucursal(idSucursal: number) {
        return await db.query.activos_ti.findMany({
            where: eq(activos_ti.id_sucursal, idSucursal),
            with: {
                catalogo: true
            }
        });
    }

    async getCategorias() {
        return await db.query.categorias.findMany({
            where: eq(categorias.estado, true)
        });
    }

    async getEstadosTickets() {
        return await db.query.estados_tickets.findMany({
            where: eq(estados_tickets.estado, true)
        });
    }

    async getNivelesAtencion() {
        return await db.query.nivel_atencion.findMany({
            where: eq(nivel_atencion.estado, true),
            orderBy: [asc(nivel_atencion.orden)]
        });
    }
}
