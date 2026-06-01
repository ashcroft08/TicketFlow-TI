import { db } from '../db';
import { activos_ti, movimientos_inventario, tipos_movimientos } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export class InventoryRepository {
    async getMovementTypes(onlyActive = true) {
        const whereClause = onlyActive ? eq(tipos_movimientos.estado, true) : undefined;
        return await db.query.tipos_movimientos.findMany({
            where: whereClause,
            orderBy: [asc(tipos_movimientos.tipo_movimiento)]
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

    // --- Métodos CRUD para Tipos de Movimientos de Inventario ---

    async createMovementType(data: { tipo_movimiento: string; codigo: string }) {
        const [newType] = await db.insert(tipos_movimientos)
            .values({
                tipo_movimiento: data.tipo_movimiento,
                codigo: data.codigo,
                estado: true
            })
            .returning();
        return newType;
    }

    async updateMovementType(id: number, data: { tipo_movimiento?: string; codigo?: string; estado?: boolean }) {
        const [updatedType] = await db.update(tipos_movimientos)
            .set(data)
            .where(eq(tipos_movimientos.id_tipo_movimiento, id))
            .returning();
        return updatedType;
    }

    async deleteMovementType(id: number) {
        // Desactivación lógica (estado: false) para no romper históricos de movimientos
        const [deletedType] = await db.update(tipos_movimientos)
            .set({ estado: false })
            .where(eq(tipos_movimientos.id_tipo_movimiento, id))
            .returning();
        return deletedType;
    }
}
