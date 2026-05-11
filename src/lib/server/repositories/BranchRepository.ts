import { db } from '../db';
import { sucursal } from '../db/schema';
import { eq, asc, and, ilike, sql } from 'drizzle-orm';

export class BranchRepository {
    async getAll() {
        return await db.query.sucursal.findMany({
            where: sql`${sucursal.deleted_at} IS NULL`,
            orderBy: [asc(sucursal.nombre)]
        });
    }

    async getActive() {
        return await db.query.sucursal.findMany({
            where: and(
                eq(sucursal.estado, true),
                sql`${sucursal.deleted_at} IS NULL`
            ),
            orderBy: [asc(sucursal.nombre)]
        });
    }

    async getById(id: number) {
        return await db.query.sucursal.findFirst({
            where: and(
                eq(sucursal.id_sucursal, id),
                sql`${sucursal.deleted_at} IS NULL`
            )
        });
    }

    async create(data: { nombre: string }) {
        const [newBranch] = await db.insert(sucursal)
            .values({
                nombre: data.nombre,
                estado: true,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();
        return newBranch;
    }

    async update(id: number, data: { nombre?: string, estado?: boolean }) {
        const [updatedBranch] = await db.update(sucursal)
            .set({
                ...data,
                updated_at: new Date()
            })
            .where(eq(sucursal.id_sucursal, id))
            .returning();
        return updatedBranch;
    }

    async delete(id: number) {
        return await db.update(sucursal)
            .set({ deleted_at: new Date() })
            .where(eq(sucursal.id_sucursal, id))
            .returning();
    }

    async getDeleted() {
        return await db.query.sucursal.findMany({
            where: sql`${sucursal.deleted_at} IS NOT NULL`,
            orderBy: [asc(sucursal.nombre)]
        });
    }

    async restore(id: number) {
        return await db.update(sucursal)
            .set({ deleted_at: null })
            .where(eq(sucursal.id_sucursal, id))
            .returning();
    }
}
