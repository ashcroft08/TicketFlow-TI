import { db } from '../db';
import { activos_ti, catalogo_articulos, tipos_articulos, sucursal, usuarios } from '../db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';

export class AssetRepository {
    async getAll() {
        return await db.query.activos_ti.findMany({
            where: sql`${activos_ti.deleted_at} IS NULL`,
            with: {
                catalogo: {
                    with: {
                        tipo: true
                    }
                },
                sucursal: true,
                usuario_asignado: true
            },
            orderBy: [desc(activos_ti.created_at)]
        });
    }

    async getCatalogs() {
        return await db.query.catalogo_articulos.findMany({
            with: {
                tipo: true
            },
            orderBy: [asc(catalogo_articulos.nombre)]
        });
    }

    async create(data: any) {
        const [newAsset] = await db.insert(activos_ti)
            .values({
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();
        return newAsset;
    }

    async update(id: number, data: any) {
        const [updatedAsset] = await db.update(activos_ti)
            .set({
                ...data,
                updated_at: new Date()
            })
            .where(eq(activos_ti.id_activo, id))
            .returning();
        return updatedAsset;
    }

    async delete(id: number) {
        return await db.update(activos_ti)
            .set({ deleted_at: new Date() })
            .where(eq(activos_ti.id_activo, id))
            .returning();
    }
}
