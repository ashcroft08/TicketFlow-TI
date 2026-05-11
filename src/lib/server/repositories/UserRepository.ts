import { db } from '../db';
import { usuarios, roles } from '../db/schema';
import { eq, or, sql, asc, and } from 'drizzle-orm';

export class UserRepository {
    async findByIdentifier(identifier: string) {
        return await db.query.usuarios.findFirst({
            where: and(
                or(
                    eq(usuarios.username, identifier),
                    eq(usuarios.email, identifier)
                ),
                sql`${usuarios.deleted_at} IS NULL`
            ),
            with: {
                rol: true,
                sucursal: true
            }
        });
    }

    async updateResetToken(userId: number, token: string | null, expiry: Date | null) {
        return await db.update(usuarios)
            .set({ reset_token: token, reset_token_expiry: expiry })
            .where(eq(usuarios.id_usuario, userId));
    }

    async findByResetToken(token: string) {
        return await db.query.usuarios.findFirst({
            where: eq(usuarios.reset_token, token)
        });
    }

    async updatePassword(userId: number, passwordHash: string) {
        return await db.update(usuarios)
            .set({ 
                password: passwordHash, 
                reset_token: null, 
                reset_token_expiry: null,
                token_version: sql`${usuarios.token_version} + 1`
            })
            .where(eq(usuarios.id_usuario, userId));
    }

    async findById(id: number) {
        return await db.query.usuarios.findFirst({
            where: and(
                eq(usuarios.id_usuario, id),
                sql`${usuarios.deleted_at} IS NULL`
            ),
            with: {
                rol: true,
                sucursal: true
            }
        });
    }

    async getAll() {
        return await db.query.usuarios.findMany({
            where: sql`${usuarios.deleted_at} IS NULL`,
            with: {
                rol: true,
                sucursal: true
            },
            orderBy: [asc(usuarios.nombre)]
        });
    }

    async getRoles() {
        return await db.query.roles.findMany({
            where: eq(roles.estado, true)
        });
    }

    async create(data: any) {
        const [newUser] = await db.insert(usuarios)
            .values({
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();
        return newUser;
    }

    async update(id: number, data: any) {
        const [updatedUser] = await db.update(usuarios)
            .set({
                ...data,
                updated_at: new Date()
            })
            .where(eq(usuarios.id_usuario, id))
            .returning();
        return updatedUser;
    }

    async delete(id: number) {
        return await db.update(usuarios)
            .set({ deleted_at: new Date() })
            .where(eq(usuarios.id_usuario, id))
            .returning();
    }

    async getDeleted() {
        return await db.query.usuarios.findMany({
            where: sql`${usuarios.deleted_at} IS NOT NULL`,
            with: {
                rol: true,
                sucursal: true
            },
            orderBy: [asc(usuarios.nombre)]
        });
    }

    async restore(id: number) {
        return await db.update(usuarios)
            .set({ deleted_at: null })
            .where(eq(usuarios.id_usuario, id))
            .returning();
    }

    async getUsersByRole(roleCode: string) {
        const role = await db.query.roles.findFirst({
            where: eq(roles.cod_rol, roleCode)
        });

        if (!role) return [];

        return await db.query.usuarios.findMany({
            where: and(
                eq(usuarios.id_rol, role.id_rol),
                sql`${usuarios.deleted_at} IS NULL`
            ),
            orderBy: [asc(usuarios.nombre)]
        });
    }
}
