import { db } from './db';
import { toast } from '$lib/state/toast.svelte';

/**
 * Guarda los datos del formulario en la cola offline de IndexedDB.
 */
async function queueFormOffline(actionUrl: string, formData: FormData) {
    const payload = Object.fromEntries(formData.entries());

    await db.offlineQueue.add({
        actionUrl,
        payload,
        timestamp: Date.now()
    });

    toast.success('Sin conexión: guardado localmente. Se sincronizará cuando vuelvas a tener internet.');
}

/**
 * Svelte action que reemplaza completamente a `use:enhance` de SvelteKit.
 * 
 * No depende del enhance de SvelteKit. Intercepta el submit del formulario
 * directamente, intenta hacer el fetch, y si falla por cualquier razón de red,
 * encola el formulario en IndexedDB.
 * 
 * Uso: <form use:offlineEnhance> o <form use:offlineEnhance={customCallback}>
 */
export function offlineEnhance(formElement: HTMLFormElement, submitCallback?: Function) {
    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        const formData = new FormData(formElement);
        const actionUrl = formElement.action;

        // --- Protección 1: sabemos que no hay red ---
        if (!navigator.onLine) {
            await queueFormOffline(actionUrl, formData);
            formElement.dispatchEvent(new CustomEvent('offlinesuccess', { bubbles: true }));
            return;
        }

        // --- Intentar enviar al servidor ---
        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'x-sveltekit-action': 'true'
                }
            });

            // Parsear la respuesta de SvelteKit (form actions devuelven JSON)
            let result: any;
            try {
                const text = await response.text();
                // SvelteKit envuelve la respuesta del form action en un formato específico
                // Intentamos parsear como JSON
                result = JSON.parse(text);
            } catch {
                result = {};
            }

            // Extraer datos del resultado de SvelteKit
            // SvelteKit form actions devuelven: { type: number, data: ... }
            // type 1 = success, type 2 = failure, type 3 = redirect, type 4 = error
            const svelteKitResult = result?.data ?? result;
            const resultType = result?.type;

            if (response.ok || resultType === 1 || resultType === 3) {
                // Éxito o redirect
                if (submitCallback) {
                    // Si hay un callback personalizado, lo invocamos con el resultado
                    const callbackResult = submitCallback({ cancel: () => {}, formData, formElement, submitter: event.submitter, action: new URL(actionUrl) });
                    if (typeof callbackResult === 'function') {
                        await callbackResult({ result: { type: 'success', data: svelteKitResult, status: response.status }, update: () => Promise.resolve(), formElement, formData });
                    }
                }

                // Notificar éxito
                if (svelteKitResult?.message) {
                    toast.success(svelteKitResult.message);
                } else if (!submitCallback) {
                    toast.success('¡Cambios guardados correctamente!');
                }

                formElement.dispatchEvent(new CustomEvent('offlinesuccess', { bubbles: true }));

                // Recargar datos de la página
                const { invalidateAll } = await import('$app/navigation');
                await invalidateAll();

            } else {
                // Error del servidor (validación, etc.)
                const errorMsg = svelteKitResult?.error || svelteKitResult?.message || `Error del servidor (${response.status})`;
                toast.error(errorMsg);
            }

        } catch (err) {
            // --- Protección 2: el fetch falló (red caída, DNS, timeout, etc.) ---
            console.warn('Fetch falló, encolando offline:', err);
            await queueFormOffline(actionUrl, formData);
            formElement.dispatchEvent(new CustomEvent('offlinesuccess', { bubbles: true }));
        }
    }

    formElement.addEventListener('submit', handleSubmit);

    return {
        destroy() {
            formElement.removeEventListener('submit', handleSubmit);
        }
    };
}
