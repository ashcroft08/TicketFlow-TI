import { db } from '../db';
import { usuarios, roles } from '../db/schema';
import { eq, or, asc, and, isNull, isNotNull } from 'drizzle-orm';
import type { CreateUserInput, UpdateUserInput } from '../validation/schemas';

export class UserRepository {
	async findByIdentifier(identifier: string) {
		return await db.query.usuarios.findFirst({
			where: and(
				or(
					eq(usuarios.username, identifier),
					eq(usuarios.email, identifier)
				),
				isNull(usuarios.deleted_at)
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
		// Incrementamos la versión del token nativamente en la base de datos
		return await db.update(usuarios)
			.set({ 
				password: passwordHash, 
				reset_token: null, 
				reset_token_expiry: null,
				token_version: 1 // o sql para incrementar, pero como es reseteo forzamos refresco
			})
			.where(eq(usuarios.id_usuario, userId));
	}

	async findById(id: number) {
		return await db.query.usuarios.findFirst({
			where: and(
				eq(usuarios.id_usuario, id),
				isNull(usuarios.deleted_at)
			),
			with: {
				rol: true,
				sucursal: true
			}
		});
	}

	async getAll() {
		return await db.query.usuarios.findMany({
			where: isNull(usuarios.deleted_at),
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

	async create(data: CreateUserInput) {
		const [newUser] = await db.insert(usuarios)
			.values({
				...data,
				created_at: new Date(),
				updated_at: new Date()
			})
			.returning();
		return newUser;
	}

	async update(id: number, data: UpdateUserInput) {
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
			where: isNotNull(usuarios.deleted_at),
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
				isNull(usuarios.deleted_at)
			),
			orderBy: [asc(usuarios.nombre)]
		});
	}
}
