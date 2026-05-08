import { db } from '../db';
import { activos_ti } from '../db/schema';
import { eq } from 'drizzle-orm';

export class ReferenceDataRepository {
    async getActivosBySucursal(idSucursal: number) {
        return await db.query.activos_ti.findMany({
            where: eq(activos_ti.id_sucursal, idSucursal),
            with: {
                catalogo: true
            }
        });
    }
}
