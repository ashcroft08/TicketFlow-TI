import Dexie, { type Table } from 'dexie';

export interface LocalTicket {
    id_ticket?: number;
    titulo: string;
    descripcion: string;
    id_estado: number;
    created_at: Date;
    sync_status: 'synced' | 'pending' | 'error';
}

export interface ReferenceData {
    id: number;
    nombre: string;
    tipo: 'estado' | 'categoria' | 'sucursal' | 'nivel';
}

export class TicketFlowDB extends Dexie {
    tickets!: Table<LocalTicket>;
    referenceData!: Table<ReferenceData>;

    constructor() {
        super('TicketFlowDB');
        this.version(1).stores({
            tickets: '++id_ticket, sync_status, created_at',
            referenceData: '++id, tipo, nombre'
        });
    }
}

export const db = new TicketFlowDB();

// Helper to sync reference data from server
export async function syncReferenceData() {
    try {
        const response = await fetch('/api/reference-data');
        if (!response.ok) return;
        
        const data = await response.json();
        
        await db.transaction('rw', db.referenceData, async () => {
            await db.referenceData.clear();
            
            const items: ReferenceData[] = [
                ...data.estados.map((s: any) => ({ id: s.id_estado, nombre: s.nombre, tipo: 'estado' })),
                ...data.categorias.map((c: any) => ({ id: c.id_categoria, nombre: c.nombre, tipo: 'categoria' })),
                ...data.sucursales.map((s: any) => ({ id: s.id_sucursal, nombre: s.nombre, tipo: 'sucursal' })),
                ...data.niveles.map((n: any) => ({ id: n.id_nivel, nombre: n.nombre, tipo: 'nivel' }))
            ];
            
            await db.referenceData.bulkAdd(items);
        });
    } catch (error) {
        console.error('Error syncing reference data to IDB:', error);
    }
}
