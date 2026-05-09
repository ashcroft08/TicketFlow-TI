import { db } from '../db';
import { activos_ti, movimientos_inventario, tipos_movimientos } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class InventoryRepository {
    async getMovementTypes() {
        return await db.query.tipos_movimientos.findMany({
            where: eq(tipos_movimientos.estado, true),
            orderBy: (tipos, { asc }) => [asc(tipos.tipo_movimiento)]
        });
    }

    async updateAssetStatus(id_activo: number, estado: string) {
        const [updatedAsset] = await db.update(activos_ti)
            .set({ 
                estado,
                updated_at: new Date()
            })
            .where(eq(activos_ti.id_activo, id_activo))
            .returning();
            
        return updatedAsset;
    }

    async registerMovement(data: {
        id_ticket: number;
        id_activo: number;
        id_tipo_movimiento: number;
        motivo?: string;
    }) {
        const [newMovement] = await db.insert(movimientos_inventario)
            .values({
                id_ticket: data.id_ticket,
                id_activo: data.id_activo,
                id_tipo_movimiento: data.id_tipo_movimiento,
                motivo: data.motivo || null,
                cantidad: 1
            })
            .returning();
            
        return newMovement;
    }
    
    async getAssetMovements(id_activo: number) {
        return await db.query.movimientos_inventario.findMany({
            where: eq(movimientos_inventario.id_activo, id_activo),
            with: {
                tipo: true,
                ticket: true
            },
            orderBy: [desc(movimientos_inventario.created_at)]
        });
    }
}
