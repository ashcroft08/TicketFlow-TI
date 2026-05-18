import { db } from '../db';
import { activos_ti, catalogo_articulos } from '../db/schema';
import { eq, asc, desc, isNull, isNotNull } from 'drizzle-orm';
import type { CreateAssetInput, UpdateAssetInput } from '../validation/schemas';

export class AssetRepository {
	async getAll() {
		return await db.query.activos_ti.findMany({
			where: isNull(activos_ti.deleted_at),
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

	async create(data: CreateAssetInput) {
		const formattedData = {
			...data,
			fecha_adquisicion: data.fecha_adquisicion ? new Date(data.fecha_adquisicion).toISOString().split('T')[0] : null
		};

		const [newAsset] = await db.insert(activos_ti)
			.values({
				...formattedData,
				created_at: new Date(),
				updated_at: new Date()
			})
			.returning();
		return newAsset;
	}

	async update(id: number, data: UpdateAssetInput) {
		const formattedData = {
			...data,
			fecha_adquisicion: data.fecha_adquisicion ? new Date(data.fecha_adquisicion).toISOString().split('T')[0] : null
		};

		const [updatedAsset] = await db.update(activos_ti)
			.set({
				...formattedData,
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

	async getDeleted() {
		return await db.query.activos_ti.findMany({
			where: isNotNull(activos_ti.deleted_at),
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

	async restore(id: number) {
		return await db.update(activos_ti)
			.set({ deleted_at: null })
			.where(eq(activos_ti.id_activo, id))
			.returning();
	}
}
