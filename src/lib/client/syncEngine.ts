import { db } from './db';
import { toast } from '$lib/state/toast.svelte';
import { invalidateAll } from '$app/navigation';

let isSyncing = false;

export async function processOfflineQueue() {
    if (!navigator.onLine || isSyncing) return;
    
    try {
        const queue = await db.offlineQueue.orderBy('timestamp').toArray();
        if (queue.length === 0) return;
        
        isSyncing = true;
        let syncedCount = 0;
        
        for (const item of queue) {
            const formData = new FormData();
            for (const [key, val] of Object.entries(item.payload)) {
                if (val !== null && val !== undefined) {
                    formData.append(key, val as string);
                }
            }
            
            try {
                const response = await fetch(item.actionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'x-sveltekit-action': 'true'
                    }
                });
                
                if (response.ok) {
                    await db.offlineQueue.delete(item.id!);
                    syncedCount++;
                } else {
                    console.error('Error sincronizando ítem:', item.actionUrl, response.status);
                    // Si el servidor responde 4xx/5xx (ej. validación fallida),
                    // podríamos borrarlo para evitar bucles, pero por seguridad lo mantenemos.
                }
            } catch (err) {
                console.error('Fallo de red durante la sincronización:', err);
                break; // Si falla la red, detenemos todo y esperamos a estar online de nuevo
            }
        }
        
        if (syncedCount > 0) {
            toast.success(`Se sincronizaron ${syncedCount} cambios pendientes con el servidor.`);
            await invalidateAll();
        }
        
    } catch (err) {
        console.error('Error general durante la sincronización:', err);
    } finally {
        isSyncing = false;
    }
}
