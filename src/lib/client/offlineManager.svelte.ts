import { db } from './db';
import { toast } from '$lib/state/toast.svelte';

export const offlineState = $state({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0
});

// Actualiza el contador de acciones pendientes
export async function updatePendingCount() {
    try {
        offlineState.pendingCount = await db.offlineQueue.count();
    } catch (e) {
        console.error('Error counting offline actions:', e);
    }
}

// Guarda la acción localmente en IndexedDB
export async function enqueueAction(
    entityType: 'activo' | 'bitacora',
    actionType: 'create' | 'update' | 'delete',
    payload: any
) {
    try {
        await db.offlineQueue.add({
            entityType,
            actionType,
            payload,
            timestamp: Date.now()
        });
        await updatePendingCount();
        toast.info('Guardado localmente. Se sincronizará al detectar conexión a internet.');
    } catch (e) {
        console.error('Error enqueuing action:', e);
        toast.error('Error al guardar localmente.');
    }
}

// Sincroniza las acciones pendientes con el servidor
export async function syncOfflineQueue() {
    if (offlineState.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    try {
        const count = await db.offlineQueue.count();
        if (count === 0) return;

        offlineState.isSyncing = true;
        toast.info(`Sincronizando ${count} cambios pendientes...`);

        const actions = await db.offlineQueue.orderBy('timestamp').toArray();
        
        const response = await fetch('/api/offline-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ actions })
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            const syncedIds = result.syncedIds || [];
            if (syncedIds.length > 0) {
                await db.offlineQueue.bulkDelete(syncedIds);
            }
            await updatePendingCount();
            toast.success('¡Cambios locales sincronizados correctamente con el servidor!');
            
            // Recargar para traer los IDs e info fresca desde PostgreSQL
            window.location.reload();
        } else {
            console.error('Error de sincronización:', result.error);
            toast.error(result.error || 'Error al sincronizar cambios locales.');
        }
    } catch (error) {
        console.error('Error during synchronization:', error);
        toast.error('No se pudo establecer conexión para sincronizar.');
    } finally {
        offlineState.isSyncing = false;
    }
}

// Inicializa el detector de red
export function initOfflineListener() {
    if (typeof window === 'undefined') return;

    offlineState.isOnline = navigator.onLine;
    updatePendingCount();

    const updateStatus = () => {
        offlineState.isOnline = navigator.onLine;
        if (offlineState.isOnline) {
            syncOfflineQueue();
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Ejecutar sincro inicial si hay internet
    if (offlineState.isOnline) {
        syncOfflineQueue();
    }

    return () => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
    };
}
