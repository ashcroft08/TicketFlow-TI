import { enhance } from '$app/forms';
import { db } from './db';
import { toast } from '$lib/state/toast.svelte';
import type { SubmitFunction } from '@sveltejs/kit';

/**
 * Wrapper universal para SvelteKit `enhance`.
 * Intercepta los envíos de formulario cuando no hay conexión a internet y los guarda en IndexedDB.
 */
export function offlineEnhance(formElement: HTMLFormElement, submitFunction?: SubmitFunction) {
    return enhance(formElement, (params) => {
        if (!navigator.onLine) {
            // Cancelar la petición de red
            params.cancel();
            
            const actionUrl = formElement.action;
            const payload = Object.fromEntries(params.formData.entries());
            
            db.offlineQueue.add({
                actionUrl,
                payload,
                timestamp: Date.now()
            }).then(() => {
                toast.success('Guardado sin conexión. Se sincronizará automáticamente al conectarse a internet.');
                
                // Emitir evento personalizado para que las ventanas modales puedan cerrarse
                formElement.dispatchEvent(new CustomEvent('offlinesuccess', { bubbles: true }));
            }).catch(err => {
                console.error('Error al guardar en la cola offline:', err);
                toast.error('Error al intentar guardar localmente.');
            });
            
            return;
        }
        
        // Comportamiento online normal
        if (submitFunction) {
            return submitFunction(params);
        }
    });
}
