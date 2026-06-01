import { db } from '../db';
import { cajas } from '../db/schema';
import { eq, asc, and, sql } from 'drizzle-orm';

export class CajaRepository {
    async getAll() {
        return await db.query.cajas.findMany({
            where: sql`${cajas.deleted_at} IS NULL`,
            with: {
                sucursal: true
            },
            orderBy: [asc(cajas.nombre)]
        });
    }

    async getActive() {
        return await db.query.cajas.findMany({
            where: and(
                eq(cajas.estado, true),
                sql`${cajas.deleted_at} IS NULL`
            ),
            with: {
                sucursal: true
            },
            orderBy: [asc(cajas.nombre)]
        });
    }

    async getBySucursal(idSucursal: number) {
        return await db.query.cajas.findMany({
            where: and(
                eq(cajas.id_sucursal, idSucursal),
                eq(cajas.estado, true),
                sql`${cajas.deleted_at} IS NULL`
            ),
            orderBy: [asc(cajas.nombre)]
        });
    }

    async getById(id: number) {
        return await db.query.cajas.findFirst({
            where: and(
                eq(cajas.id_caja, id),
                sql`${cajas.deleted_at} IS NULL`
            ),
            with: {
                sucursal: true
            }
        });
    }

    async create(data: { nombre: string; id_sucursal: number }) {
        const [newCaja] = await db.insert(cajas)
            .values({
                nombre: data.nombre,
                id_sucursal: data.id_sucursal,
                estado: true,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();
        return newCaja;
    }

    async update(id: number, data: { nombre?: string; id_sucursal?: number; estado?: boolean }) {
        const [updatedCaja] = await db.update(cajas)
            .set({
                ...data,
                updated_at: new Date()
            })
            .where(eq(cajas.id_caja, id))
            .returning();
        return updatedCaja;
    }

    async delete(id: number) {
        return await db.update(cajas)
            .set({ deleted_at: new Date() })
            .where(eq(cajas.id_caja, id))
            .returning();
    }
}
