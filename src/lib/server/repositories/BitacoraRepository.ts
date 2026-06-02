import { db } from '../db';
import { bitacora_admin } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export interface CreateBitacoraInput {
    id_usuario: number;
    fecha: string; // Formato YYYY-MM-DD
    titulo: string;
    horas_dedicadas: string; // Guardado como string porque numeric en PG retorna como string para precisión
    descripcion: string;
    id_categoria_bitacora?: number | null;
}

export interface UpdateBitacoraInput {
    fecha?: string;
    titulo?: string;
    horas_dedicadas?: string;
    descripcion?: string;
    id_categoria_bitacora?: number | null;
}

export class BitacoraRepository {
    async getAllByUser(id_usuario: number) {
        return await db.query.bitacora_admin.findMany({
            where: and(
                eq(bitacora_admin.id_usuario, id_usuario),
                sql`${bitacora_admin.deleted_at} IS NULL`
            ),
            with: {
                categoria: true
            },
            orderBy: [desc(bitacora_admin.fecha), desc(bitacora_admin.created_at)]
        });
    }

    async getAll() {
        return await db.query.bitacora_admin.findMany({
            where: sql`${bitacora_admin.deleted_at} IS NULL`,
            with: {
                usuario: {
                    columns: {
                        nombre: true,
                        username: true
                    }
                },
                categoria: true
            },
            orderBy: [desc(bitacora_admin.fecha), desc(bitacora_admin.created_at)]
        });
    }

    async getById(id: number) {
        return await db.query.bitacora_admin.findFirst({
            where: and(
                eq(bitacora_admin.id_bitacora, id),
                sql`${bitacora_admin.deleted_at} IS NULL`
            ),
            with: {
                categoria: true
            }
        });
    }

    async getHoursForUserDate(id_usuario: number, fechaStr: string): Promise<number> {
        const result = await db.select({
            total: sql<string>`coalesce(sum(${bitacora_admin.horas_dedicadas}), 0)`
        })
        .from(bitacora_admin)
        .where(
            and(
                eq(bitacora_admin.id_usuario, id_usuario),
                eq(bitacora_admin.fecha, fechaStr),
                sql`${bitacora_admin.deleted_at} IS NULL`
            )
        );

        return parseFloat(result[0]?.total || '0');
    }

    async create(data: CreateBitacoraInput) {
        const [newRecord] = await db.insert(bitacora_admin)
            .values({
                id_usuario: data.id_usuario,
                fecha: data.fecha,
                titulo: data.titulo,
                horas_dedicadas: data.horas_dedicadas,
                descripcion: data.descripcion,
                id_categoria_bitacora: data.id_categoria_bitacora || null,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();
        return newRecord;
    }

    async update(id: number, data: UpdateBitacoraInput) {
        const [updatedRecord] = await db.update(bitacora_admin)
            .set({
                fecha: data.fecha,
                titulo: data.titulo,
                horas_dedicadas: data.horas_dedicadas,
                descripcion: data.descripcion,
                id_categoria_bitacora: data.id_categoria_bitacora === undefined ? undefined : (data.id_categoria_bitacora || null),
                updated_at: new Date()
            })
            .where(eq(bitacora_admin.id_bitacora, id))
            .returning();
        return updatedRecord;
    }

    async delete(id: number) {
        return await db.update(bitacora_admin)
            .set({ deleted_at: new Date() })
            .where(eq(bitacora_admin.id_bitacora, id))
            .returning();
    }
}
