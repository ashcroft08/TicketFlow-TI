import { db } from '../db';
import { catalogo_articulos, tipos_articulos } from '../db/schema';
import { eq, asc, sql } from 'drizzle-orm';

export class CatalogRepository {
	// --- Catálogo de Artículos ---

	async getAll() {
		return await db.query.catalogo_articulos.findMany({
			where: sql`${catalogo_articulos.deleted_at} IS NULL`,
			with: {
				tipo: true
			},
			orderBy: [asc(catalogo_articulos.nombre)]
		});
	}

	async create(data: { nombre: string; marca?: string | null; modelo?: string | null; id_tipo?: number | null; created_by?: number | null }) {
		const [newItem] = await db.insert(catalogo_articulos)
			.values({
				nombre: data.nombre,
				marca: data.marca || null,
				modelo: data.modelo || null,
				id_tipo: data.id_tipo || null,
				created_by: data.created_by || null,
				created_at: new Date(),
				updated_at: new Date()
			})
			.returning();
		return newItem;
	}

	async update(id: number, data: { nombre?: string; marca?: string | null; modelo?: string | null; id_tipo?: number | null; updated_by?: number | null }) {
		const updateData: Record<string, unknown> = { updated_at: new Date() };
		if (data.nombre !== undefined) updateData.nombre = data.nombre;
		if (data.marca !== undefined) updateData.marca = data.marca;
		if (data.modelo !== undefined) updateData.modelo = data.modelo;
		if (data.id_tipo !== undefined) updateData.id_tipo = data.id_tipo;
		if (data.updated_by !== undefined) updateData.updated_by = data.updated_by;

		const [updated] = await db.update(catalogo_articulos)
			.set(updateData)
			.where(eq(catalogo_articulos.id_catalogo, id))
			.returning();
		return updated;
	}

	async delete(id: number) {
		return await db.update(catalogo_articulos)
			.set({ deleted_at: new Date() })
			.where(eq(catalogo_articulos.id_catalogo, id))
			.returning();
	}

	// --- Tipos de Artículos ---

	async getAllTipos() {
		return await db.query.tipos_articulos.findMany({
			where: sql`${tipos_articulos.deleted_at} IS NULL`,
			orderBy: [asc(tipos_articulos.tipo)]
		});
	}

	async createTipo(data: { tipo: string; codigo?: string | null }) {
		const [newTipo] = await db.insert(tipos_articulos)
			.values({
				tipo: data.tipo,
				codigo: data.codigo || null,
				created_at: new Date(),
				updated_at: new Date()
			})
			.returning();
		return newTipo;
	}

	async updateTipo(id: number, data: { tipo?: string; codigo?: string | null }) {
		const updateData: Record<string, unknown> = { updated_at: new Date() };
		if (data.tipo !== undefined) updateData.tipo = data.tipo;
		if (data.codigo !== undefined) updateData.codigo = data.codigo;

		const [updated] = await db.update(tipos_articulos)
			.set(updateData)
			.where(eq(tipos_articulos.id_tipo, id))
			.returning();
		return updated;
	}

	async deleteTipo(id: number) {
		return await db.update(tipos_articulos)
			.set({ deleted_at: new Date() })
			.where(eq(tipos_articulos.id_tipo, id))
			.returning();
	}
}
