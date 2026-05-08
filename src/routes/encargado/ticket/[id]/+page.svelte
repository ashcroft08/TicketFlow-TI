<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { ArrowLeft, Calendar, Monitor, Send, Paperclip, AlertCircle, Clock, CheckCircle2, HelpCircle } from 'lucide-svelte';
    import type { ActionData, PageData } from './$types';

    let { data, form } = $props<{ data: PageData; form: ActionData }>();

    // Ref para el contenedor del chat para auto-scroll
    let chatContainer: HTMLElement;
    let isSubmitting = $state(false);

    // Auto scroll al final del chat
    const scrollToBottom = () => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    $effect(() => {
        // Ejecutar auto-scroll cuando cambie la longitud de los comentarios
        const _ = data.ticket?.comentarios?.length;
        scrollToBottom();
    });

    // Polling: Refrescar los datos en segundo plano cada 5 segundos
    $effect(() => {
        const interval = setInterval(() => {
            invalidateAll();
        }, 5000);

        return () => clearInterval(interval);
    });

    let ticket = $derived(data.ticket);

    // Helper para estados
    const getStatusStyles = (nombre: string) => {
        switch (nombre) {
            case 'Abierto': return { icon: AlertCircle, bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-500/20 dark:border-blue-500/30' };
            case 'En Progreso': return { icon: Clock, bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-500/20 dark:border-amber-500/30' };
            case 'Resuelto': return { icon: CheckCircle2, bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-500/20 dark:border-emerald-500/30' };
            case 'Cerrado': return { icon: CheckCircle2, bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/20 dark:border-slate-500/30' };
            default: return { icon: HelpCircle, bg: 'bg-gray-500/10 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-500/20 dark:border-gray-500/30' };
        }
    };

    const status = getStatusStyles(ticket.estado?.nombre || '');

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleString('es-ES', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };
</script>

<svelte:head>
    <title>Ticket #{ticket.id_ticket} - TicketFlow TI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-body-md text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
    
    <!-- Header Navegación -->
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/60 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <a href="/encargado/dashboard" class="p-2 -ml-2 rounded-xl text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400 hover:bg-primary/10 dark:hover:bg-blue-500/10 transition-colors">
                    <ArrowLeft class="w-5 h-5" />
                </a>
                <div class="flex flex-col">
                    <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ticket #{ticket.id_ticket}</span>
                    <h1 class="font-h3 text-base sm:text-lg font-bold leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">{ticket.titulo}</h1>
                </div>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border {status.bg} {status.text} {status.border}">
                <status.icon class="w-3.5 h-3.5" />
                <span>{ticket.estado?.nombre || 'Pendiente'}</span>
            </div>
        </div>
    </header>

    <!-- Contenido Principal Split-Screen -->
    <main class="flex-grow max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-64px)] overflow-hidden">
        
        <!-- PANEL IZQUIERDO: Detalles del Ticket (Oculto en móvil) -->
        <div class="hidden lg:flex lg:col-span-5 flex-col gap-6 lg:h-full lg:overflow-y-auto pr-2 lg:pb-6 custom-scrollbar">
            
            <!-- Tarjeta Info -->
            <div class="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4">{ticket.titulo}</h2>
                
                <div class="flex flex-col gap-4">
                    <div>
                        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Descripción</span>
                        <p class="text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            {ticket.descripcion}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Equipo Afectado</span>
                            <div class="flex items-center gap-2 text-sm font-medium">
                                <Monitor class="w-4 h-4 text-primary dark:text-blue-400" />
                                <span class="truncate">{ticket.activo_ti?.catalogo?.nombre || 'General'}</span>
                            </div>
                        </div>
                        <div>
                            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Creado el</span>
                            <div class="flex items-center gap-2 text-sm font-medium">
                                <Calendar class="w-4 h-4 text-primary dark:text-blue-400" />
                                <span>{formatDate(ticket.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Galería de Adjuntos -->
            {#if ticket.adjuntos && ticket.adjuntos.length > 0}
                <div class="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] p-6 shadow-sm">
                    <h3 class="text-sm font-bold flex items-center gap-2 mb-4">
                        <Paperclip class="w-4 h-4 text-slate-500" />
                        Imágenes Adjuntas ({ticket.adjuntos.length})
                    </h3>
                    <div class="grid grid-cols-2 gap-3">
                        {#each ticket.adjuntos as adjunto}
                            <a href={adjunto.imagen_url} target="_blank" rel="noopener noreferrer" class="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img src={adjunto.imagen_url} alt={adjunto.nombre} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span class="text-white text-xs font-semibold">Ver Completa</span>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <!-- PANEL DERECHO: Chat Interno -->
        <div class="lg:col-span-7 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] shadow-sm flex flex-col h-full lg:h-[calc(100vh-100px)]">
            
            <!-- Cabecera Chat -->
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 rounded-t-[24px]">
                <h3 class="font-bold text-sm">Chat Interno</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Comunícate con el técnico asignado</p>
            </div>

            <!-- Área de Mensajes -->
            <div bind:this={chatContainer} class="flex-grow p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                
                {#if ticket.comentarios.length === 0}
                    <div class="m-auto text-center opacity-50">
                        <div class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                            <Send class="w-8 h-8 text-primary" />
                        </div>
                        <p class="text-sm">Aún no hay mensajes.</p>
                        <p class="text-xs">Escribe el primer comentario abajo.</p>
                    </div>
                {/if}

                {#each ticket.comentarios as comentario}
                    {@const isMe = comentario.id_usuario === data.user.id}
                    {@const senderName = isMe ? 'Tú' : (comentario.usuario?.nombre || 'Usuario')}
                    {@const senderRole = comentario.usuario?.rol?.cod_rol === 'TECHNICIAN' ? 'Técnico' : 'Encargado'}

                    <div class="flex flex-col max-w-[85%] {isMe ? 'self-end items-end' : 'self-start items-start'}">
                        <div class="flex items-baseline gap-2 mb-1 px-1">
                            <span class="text-xs font-semibold {isMe ? 'text-primary dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}">{senderName}</span>
                            {#if !isMe}
                                <span class="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{senderRole}</span>
                            {/if}
                            <span class="text-[10px] text-slate-400">{formatDate(comentario.created_at)}</span>
                        </div>
                        
                        <div class="px-4 py-2.5 rounded-2xl text-sm shadow-sm
                            {isMe 
                                ? 'bg-primary dark:bg-blue-600 text-white rounded-tr-sm' 
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-tl-sm text-slate-800 dark:text-slate-200'}">
                            <p class="whitespace-pre-wrap break-words">{comentario.comentario}</p>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Input Chat -->
            <div class="p-4 bg-white/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/60 rounded-b-[24px]">
                <form 
                    method="POST" 
                    action="?/sendComment"
                    class="flex gap-2"
                    use:enhance={() => {
                        isSubmitting = true;
                        return async ({ update }) => {
                            await update({ reset: true });
                            isSubmitting = false;
                            scrollToBottom();
                        };
                    }}
                >
                    <input 
                        type="text" 
                        name="comentario" 
                        placeholder="Escribe un mensaje..."
                        required
                        autocomplete="off"
                        class="flex-grow h-12 px-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/30 focus:border-primary dark:focus:border-blue-500 text-sm text-slate-800 dark:text-white"
                        disabled={isSubmitting}
                    />
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        class="h-12 w-12 shrink-0 bg-primary dark:bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-primary/90 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                        <Send class="w-5 h-5 -ml-0.5" />
                    </button>
                </form>
            </div>

        </div>
    </main>
</div>

<style>
    /* Estilos para el scrollbar para que se vea premium */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.3);
        border-radius: 10px;
    }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(71, 85, 105, 0.5);
    }
</style>
