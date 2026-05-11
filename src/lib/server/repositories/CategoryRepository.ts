import { db } from '../db';
import { categorias } from '../db/schema';
import { eq, asc, sql, and } from 'drizzle-orm';

export class CategoryRepository {
    async getAll() {
        return await db.query.categorias.findMany({
            where: sql`${categorias.deleted_at} IS NULL`,
            orderBy: [asc(categorias.nombre_tecnico)]
        });
    }

    async getActive() {
        return await db.query.categorias.findMany({
            where: and(
                eq(categorias.estado, true),
                sql`${categorias.deleted_at} IS NULL`
            ),
            orderBy: [asc(categorias.nombre_tecnico)]
        });
    }

    async create(data: { nombre: string }) {
        const [newCategory] = await db.insert(categorias)
            .values({
                nombre_tecnico: data.nombre,
                estado: true
            })
            .returning();
        return newCategory;
    }

    async update(id: number, data: { nombre?: string, estado?: boolean }) {
        const updateData: any = {};
        if (data.nombre !== undefined) updateData.nombre_tecnico = data.nombre;
        if (data.estado !== undefined) updateData.estado = data.estado;

        const [updatedCategory] = await db.update(categorias)
            .set(updateData)
            .where(eq(categorias.id_categoria, id))
            .returning();
        return updatedCategory;
    }

    async delete(id: number) {
        return await db.update(categorias)
            .set({ deleted_at: new Date() })
            .where(eq(categorias.id_categoria, id))
            .returning();
    }

    async getDeleted() {
        return await db.query.categorias.findMany({
            where: sql`${categorias.deleted_at} IS NOT NULL`,
            orderBy: [asc(categorias.nombre_tecnico)]
        });
    }

    async restore(id: number) {
        return await db.update(categorias)
            .set({ deleted_at: null })
            .where(eq(categorias.id_categoria, id))
            .returning();
    }
}
