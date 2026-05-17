<script lang="ts">
    import { enhance } from '$app/forms';
    import { Ticket, Plus, X, Monitor, Calendar, Clock, AlertCircle, CheckCircle2, HelpCircle, ArrowRight, LogOut } from 'lucide-svelte';
    import type { ActionData, PageData } from './$types';
    import { modalState } from '$lib/states/ui.svelte';

    let { data, form } = $props<{ data: PageData; form: ActionData }>();

    let isSubmitting = $state(false);
    let focusedField = $state<string | null>(null);

    // Formateador de fechas
    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper para colores e iconos de estado
    const getStatusStyles = (nombre: string) => {
        switch (nombre) {
            case 'Abierto': return { icon: AlertCircle, bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-500/20 dark:border-blue-500/30' };
            case 'En Progreso': return { icon: Clock, bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' };
            case 'Resuelto': return { icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' };
            case 'Cerrado': return { icon: CheckCircle2, bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' };
            default: return { icon: HelpCircle, bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/20' };
        }
    };
</script>

<svelte:head>
    <title>Dashboard - TicketFlow TI</title>
</svelte:head>

<!-- Contenedor principal con fondo premium -->
<div class="relative font-body-md selection:bg-primary/20 selection:text-primary transition-colors duration-300">
    

    <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in-up">
        
        <!-- Header del Dashboard -->
        <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2 bg-primary/10 dark:bg-blue-500/20 rounded-xl">
                        <Ticket class="w-6 h-6 text-primary dark:text-blue-400" />
                    </div>
                    <span class="text-sm font-semibold tracking-wider uppercase text-primary dark:text-blue-400">Portal de Soporte</span>
                </div>
                <h1 class="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                    Tus Tickets
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-lg">
                    Hola, <span class="font-semibold text-slate-700 dark:text-slate-300">{data.user?.nombre}</span>. Aquí puedes hacer seguimiento a tus incidentes o reportar uno nuevo.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button
                    onclick={() => modalState.showNewTicketModal = true}
                    class="hidden sm:flex group h-12 px-6 bg-primary dark:bg-blue-600 text-white font-semibold text-sm rounded-xl items-center justify-center gap-2 hover:bg-primary/90 dark:hover:bg-blue-500 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] relative overflow-hidden shrink-0"
                >
                    <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
                    <Plus class="w-5 h-5 transition-transform group-hover:rotate-90" />
                    <span>Nuevo Ticket</span>
                </button>

                <!-- Logout button removed, now in navbar -->

            </div>
        </header>

        <!-- Notificaciones -->
        {#if form?.success}
            <div class="mb-8 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                <CheckCircle2 class="w-5 h-5 shrink-0" />
                <p class="text-sm font-medium">{form.message}</p>
            </div>
        {/if}

        <!-- Cuadrícula de Tickets (Cards Premium) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each data.tickets as ticket}
                {@const status = getStatusStyles(ticket.estado?.nombre || '')}
                <a href="/encargado/ticket/{ticket.id_ticket}" class="block group bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] p-5 sm:p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                    
                    <div class="flex justify-between items-start gap-4 mb-3 sm:mb-4">
                        <h3 class="font-h3 text-sm sm:text-base md:text-lg text-slate-800 dark:text-white font-bold leading-snug line-clamp-2">
                            {ticket.titulo}
                        </h3>
                        <div class="flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold whitespace-nowrap border {status.bg} {status.text} {status.border}">
                            <status.icon class="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                            <span>{ticket.estado?.nombre || 'Pendiente'}</span>
                        </div>
                    </div>

                    <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-300 line-clamp-3 mb-4 sm:mb-6 flex-grow">
                        {ticket.descripcion}
                    </p>

                    <div class="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2.5 sm:gap-3">
                        <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                            <Monitor class="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />
                            <span class="truncate">{ticket.activo_ti?.catalogo?.nombre || 'Equipo General'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 dark:text-slate-300">
                                <Calendar class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{formatDate(ticket.created_at)}</span>
                            </div>
                            {#if ticket.categoria}
                                <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                    {ticket.categoria.nombre_tecnico}
                                </span>
                            {/if}
                        </div>
                    </div>
                </a>
            {:else}

                <!-- Estado Vacío Premium -->
                <div class="col-span-full py-16 px-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/50 rounded-[32px] flex flex-col items-center justify-center text-center">
                    <div class="w-24 h-24 mb-6 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
                        <Ticket class="w-12 h-12 stroke-[1.5]" />
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">Todo en orden</h3>
                    <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm sm:text-base">
                        Actualmente no tienes tickets activos. Si experimentas algún problema con tu equipo, repórtalo aquí.
                    </p>
                    <button
                        onclick={() => modalState.showNewTicketModal = true}
                        class="mt-8 group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                    >
                        Crear mi primer ticket
                        <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            {/each}
        </div>
    </main>
</div>

<!-- Modal Creación (Mismo estilo que el Login) -->
{#if modalState.showNewTicketModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <!-- Backdrop con blur fuerte -->
        <button 
            type="button"
            class="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md transition-opacity cursor-default"
            onclick={() => modalState.showNewTicketModal = false}
            aria-label="Cerrar modal"
        ></button>

        <!-- Tarjeta del Formulario -->
        <div class="relative w-full max-w-[480px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[28px] shadow-[0_8px_40px_rgb(0,0,0,0.12)] p-6 sm:p-8 animate-fade-in-up my-auto">
            
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="font-h2 text-xl sm:text-2xl text-slate-800 dark:text-white font-bold tracking-tight">Reportar Problema</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Describe el incidente para que podamos ayudarte.</p>
                </div>
                <button 
                    onclick={() => modalState.showNewTicketModal = false}
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>

            <form 
                method="POST" 
                action="?/createTicket"
                enctype="multipart/form-data"
                use:enhance={() => {
                    isSubmitting = true;
                    return async ({ update }) => {
                        await update();
                        isSubmitting = false;
                        if (form?.success) modalState.showNewTicketModal = false;
                    };
                }}
                class="flex flex-col gap-5"
            >
                <!-- Título -->
                <div class="flex flex-col gap-1.5 group">
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors group-focus-within:text-primary" for="titulo">
                        Título breve <span class="text-error">*</span>
                    </label>
                    <div class="relative">
                        <input 
                            onfocus={() => focusedField = 'titulo'}
                            onblur={() => focusedField = null}
                            type="text" 
                            id="titulo" 
                            name="titulo" 
                            required
                            placeholder="Ej: La impresora principal no imprime"
                            class="w-full h-12 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-white placeholder:text-slate-400 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                            value={form?.titulo ?? ''}
                        />
                    </div>
                </div>

                <!-- Activo TI -->
                <div class="flex flex-col gap-1.5 group">
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors group-focus-within:text-primary" for="id_activo">
                        Equipo Afectado <span class="text-error">*</span>
                    </label>
                    <div class="relative">
                        <select 
                            onfocus={() => focusedField = 'id_activo'}
                            onblur={() => focusedField = null}
                            id="id_activo" 
                            name="id_activo" 
                            required
                            class="w-full h-12 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-white transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="" disabled selected class="text-slate-400">Seleccionar equipo...</option>
                            {#each data.activos as activo}
                                <option value={activo.id_activo} selected={form?.id_activo === activo.id_activo.toString()}>
                                    {activo.catalogo?.nombre} ({activo.codigo_inventario})
                                </option>
                            {/each}
                        </select>
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <!-- Descripción -->
                <div class="flex flex-col gap-1.5 group">
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors group-focus-within:text-primary" for="descripcion">
                        Detalle del problema <span class="text-error">*</span>
                    </label>
                    <div class="relative">
                        <textarea 
                            onfocus={() => focusedField = 'descripcion'}
                            onblur={() => focusedField = null}
                            id="descripcion" 
                            name="descripcion" 
                            rows="4"
                            required
                            placeholder="Menciona qué sucedía justo antes del error..."
                            class="w-full p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-800 dark:text-white placeholder:text-slate-400 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900 resize-none"
                        >{form?.descripcion ?? ''}</textarea>
                    </div>
                </div>

                <!-- Adjuntos (Imágenes) -->
                <div class="flex flex-col gap-1.5 group">
                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors group-focus-within:text-primary" for="adjuntos">
                        Adjuntar Imágenes (Opcional)
                    </label>
                    <div class="relative">
                        <input 
                            type="file" 
                            id="adjuntos" 
                            name="adjuntos" 
                            multiple
                            accept="image/*"
                            class="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-colors file:cursor-pointer cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 file:h-full h-12 flex items-center"
                        />
                    </div>
                </div>

                {#if form?.error}
                    <div class="bg-error/10 text-error border border-error/20 p-3 rounded-xl text-xs font-medium animate-shake flex items-center gap-2">
                        <AlertCircle class="w-4 h-4 shrink-0" />
                        {form.error}
                    </div>
                {/if}

                <!-- Botones -->
                <div class="flex items-center gap-3 mt-2">
                    <button 
                        type="button"
                        onclick={() => modalState.showNewTicketModal = false}
                        class="flex-1 h-12 bg-transparent text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        class="flex-[2] h-12 bg-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                        {#if isSubmitting}
                            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {:else}
                            <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
                            <span>Enviar Reporte</span>
                            <ArrowRight size={16} class="transition-transform group-hover:translate-x-1" />
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
    .animation-delay-4000 { animation-delay: 4s; }
    
    @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(15px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.4s ease-in-out; }
    
    @keyframes shimmer { 100% { transform: translateX(100%); } }
    .animate-shimmer { animation: shimmer 2.5s infinite; }
</style>
