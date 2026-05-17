<script lang="ts">
    import { fade, scale, slide } from 'svelte/transition';
    import { MessageSquare, X, User, Send } from 'lucide-svelte';
    import { enhance } from '$app/forms';

    let { 
        isOpen = $bindable(false), 
        ticket
    } = $props<{
        isOpen: boolean;
        ticket: any;
    }>();

    let commentContent = $state('');

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };
</script>

{#if isOpen}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" transition:fade={{ duration: 200 }}>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl w-full h-full cursor-default" onclick={() => isOpen = false} aria-label="Cerrar chat"></button>
        <div 
            class="relative w-full max-w-2xl h-[80vh] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col" 
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-modal-title"
            transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}
        >
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <MessageSquare class="w-6 h-6 text-indigo-600 aria-hidden=true" />
                    <h2 id="chat-modal-title" class="text-xl font-bold text-slate-900 dark:text-white">Chat de Gestión</h2>
                </div>
                <button onclick={() => isOpen = false} aria-label="Cerrar modal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"><X class="w-6 h-6 text-slate-400 aria-hidden=true" /></button>
            </div>
            <div class="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 custom-scrollbar">
                {#if ticket.comentarios && ticket.comentarios.length > 0}
                    {#each ticket.comentarios as comment}
                        <div transition:slide class="flex gap-4 p-4 rounded-2xl border {comment.usuario?.cod_rol === 'ADMIN' ? 'bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20 ml-8' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 mr-8'}">
                            <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><User class="w-4 h-4 text-slate-500" aria-hidden="true" /></div>
                            <div class="space-y-1 flex-grow">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-slate-900 dark:text-white">{comment.usuario?.nombre}</span>
                                    <span class="text-[9px] text-slate-400">{formatDate(comment.created_at)}</span>
                                </div>
                                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{comment.comentario}</p>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No hay mensajes aún.</div>
                {/if}
            </div>
            <div class="p-6 border-t border-slate-100 dark:border-slate-800">
                <form use:enhance={() => { return async ({ result }) => { if (result.type === 'success') commentContent = ''; }; }} action="?/addComment" method="POST" class="flex gap-2">
                    <input bind:value={commentContent} name="content" placeholder="Escribe un mensaje..." aria-label="Escribir mensaje de chat" class="flex-grow p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-indigo-500/20" />
                    <button type="submit" disabled={!commentContent.trim()} aria-label="Enviar mensaje" class="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"><Send class="w-5 h-5 aria-hidden=true" /></button>
                </form>
            </div>
        </div>
    </div>
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.2); border-radius: 10px; }
</style>
