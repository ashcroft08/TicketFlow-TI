import { db } from '../db';
import { categorias_bitacora } from '../db/schema';
import { eq, asc, sql, and } from 'drizzle-orm';

export class CategoriaBitacoraRepository {
    async getAll() {
        return await db.query.categorias_bitacora.findMany({
            where: sql`${categorias_bitacora.deleted_at} IS NULL`,
            orderBy: [asc(categorias_bitacora.nombre)]
        });
    }

    async getActive() {
        return await db.query.categorias_bitacora.findMany({
            where: and(
                eq(categorias_bitacora.estado, true),
                sql`${categorias_bitacora.deleted_at} IS NULL`
            ),
            orderBy: [asc(categorias_bitacora.nombre)]
        });
    }

    async getById(id: number) {
        return await db.query.categorias_bitacora.findFirst({
            where: and(
                eq(categorias_bitacora.id_categoria_bitacora, id),
                sql`${categorias_bitacora.deleted_at} IS NULL`
            )
        });
    }

    async create(data: { nombre: string }) {
        const [newCategory] = await db.insert(categorias_bitacora)
            .values({
                nombre: data.nombre,
                estado: true
            })
            .returning();
        return newCategory;
    }

    async update(id: number, data: { nombre?: string, estado?: boolean }) {
        const updateData: any = {};
        if (data.nombre !== undefined) updateData.nombre = data.nombre;
        if (data.estado !== undefined) updateData.estado = data.estado;
        updateData.updated_at = new Date();

        const [updatedCategory] = await db.update(categorias_bitacora)
            .set(updateData)
            .where(eq(categorias_bitacora.id_categoria_bitacora, id))
            .returning();
        return updatedCategory;
    }

    async delete(id: number) {
        return await db.update(categorias_bitacora)
            .set({ deleted_at: new Date() })
            .where(eq(categorias_bitacora.id_categoria_bitacora, id))
            .returning();
    }
}
