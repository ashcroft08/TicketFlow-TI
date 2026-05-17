<script lang="ts">
    import { Ticket, User, Calendar, Clock, MapPin, Tag, Monitor, MessageSquare, Send, ChevronLeft, UserPlus, CheckCircle2, AlertCircle, History, Info, UserCircle, X, ShieldCheck, LayoutDashboard, ChevronRight, Paperclip, ExternalLink, Settings2, Package, Save, Wrench, FileText, Activity } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    import HistoryModal from './_components/HistoryModal.svelte';
    import MovementModal from './_components/MovementModal.svelte';
    import ChatModal from './_components/ChatModal.svelte';

    let { data, form } = $props();
    const ticket = $derived(data.ticket);
    const technicians = $derived(data.technicians);

    let isChatModalOpen = $state(false);
    let isEditingTech = $state(false);
    let isEditingDiagnostic = $state(false);
    let isHistoryModalOpen = $state(false);
    let isMovementModalOpen = $state(false);
    let activeDetailTab = $state<'gestion' | 'info' | 'activo'>('gestion');
    let isSubmitting = $state(false);

    // Determinar si empezamos en modo edición si no hay datos
    $effect(() => {
        if (!ticket.id_nivel_atencion && !ticket.id_categoria && !ticket.notas_tecnico) {
            isEditingDiagnostic = true;
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'abierto': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
            case 'en proceso': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
            case 'resuelto': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
            case 'cerrado': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/50';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

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

<svelte:head>
    <title>Ticket #{ticket.id_ticket} | {ticket.titulo} - Gestión Maestro</title>
    <meta name="description" content="Gestión y diagnóstico del ticket #{ticket.id_ticket}. Reportado por {ticket.creador?.nombre}. Estado: {ticket.estado?.nombre}." />
    <meta name="theme-color" content="#4f46e5" />
</svelte:head>

<div class="h-full max-w-[1440px] mx-auto w-full flex flex-col space-y-6 animate-fade-in pb-10 px-4 sm:px-6 lg:px-8">
    <!-- Header Compacto -->
    <header class="flex flex-wrap items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div class="flex items-center gap-4">
            <a 
                href="/admin/tickets" 
                aria-label="Volver a la lista de tickets"
                class="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
                <ChevronLeft class="w-5 h-5 aria-hidden=true" />
            </a>
            <div>
                <h1 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="text-indigo-500 opacity-50">#</span>{ticket.id_ticket}
                    <span class="hidden sm:inline text-slate-300 dark:text-slate-700 mx-1">|</span>
                    <span class="truncate max-w-[200px] sm:max-w-md">{ticket.titulo}</span>
                </h1>
                <div class="flex items-center gap-3 mt-1">
                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter {getStatusBadge(ticket.estado?.nombre)}">
                        {ticket.estado?.nombre}
                    </span>
                    <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock class="w-3 h-3" />
                        {formatDate(ticket.created_at)}
                    </span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <div class="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <User class="w-4 h-4 text-blue-600" />
                </div>
                <div class="text-left">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Solicitante</p>
                    <p class="text-xs font-bold text-slate-700 dark:text-slate-300">{ticket.creador?.nombre.split(' ')[0]}</p>
                </div>
            </div>
            <div class="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <MapPin class="w-4 h-4 text-emerald-600" />
                </div>
                <div class="text-left">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Sede</p>
                    <p class="text-xs font-bold text-slate-700 dark:text-slate-300">{ticket.activo_ti?.sucursal?.nombre || 'Matriz'}</p>
                </div>
            </div>
        </div>
    </header>

    <!-- Contenido Principal Grid 12 (8/4) -->
    <div class="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 items-start">
        <!-- Columna Central: Pestañas de Gestión -->
        <div class="lg:col-span-8 flex flex-col min-h-0">
            <!-- Alertas -->
            {#if form?.success && form?.message}
                <div transition:slide class="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 mb-4">
                    <CheckCircle2 class="w-5 h-5" />
                    <p class="text-sm font-bold">{form.message}</p>
                </div>
            {/if}

            <div class="flex-grow bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                <!-- Tabs Interface Premium -->
                <div class="flex border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/30" role="tablist" aria-label="Gestión de detalles del ticket">
                    <button 
                        role="tab"
                        aria-selected={activeDetailTab === 'gestion'}
                        aria-controls="panel-gestion"
                        onclick={() => activeDetailTab = 'gestion'}
                        class="flex-1 py-4 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 {activeDetailTab === 'gestion' ? 'bg-white dark:bg-slate-800 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}"
                    >
                        <Settings2 class="w-4 h-4 aria-hidden=true" /> Diagnóstico
                    </button>
                    <button 
                        role="tab"
                        aria-selected={activeDetailTab === 'info'}
                        aria-controls="panel-info"
                        onclick={() => activeDetailTab = 'info'}
                        class="flex-1 py-4 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 {activeDetailTab === 'info' ? 'bg-white dark:bg-slate-800 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}"
                    >
                        <FileText class="w-4 h-4 aria-hidden=true" /> Problema
                    </button>
                    <button 
                        role="tab"
                        aria-selected={activeDetailTab === 'activo'}
                        aria-controls="panel-activo"
                        onclick={() => activeDetailTab = 'activo'}
                        class="flex-1 py-4 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 {activeDetailTab === 'activo' ? 'bg-white dark:bg-slate-800 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}"
                    >
                        <Package class="w-4 h-4 aria-hidden=true" /> Inventario
                    </button>
                </div>

                <div class="p-6 flex-grow overflow-y-auto custom-scrollbar h-[400px]">
                    {#if activeDetailTab === 'gestion'}
                        <div transition:fade={{ duration: 150 }} class="space-y-6" role="tabpanel" id="panel-gestion" tabindex="0" aria-label="Gestión de Diagnóstico">
                            {#if !isEditingDiagnostic}
                                <!-- Modo Vista Previa -->
                                <div class="space-y-8 animate-fade-in">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div class="space-y-3">
                                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prioridad del Ticket</span>
                                            <div class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                <div class="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">P</div>
                                                <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{data.niveles.find(n => n.id_nivel_atencion === ticket.id_nivel_atencion)?.nombre || 'SIN CLASIFICAR'}</span>
                                            </div>
                                        </div>
                                        <div class="space-y-3">
                                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría Técnica</span>
                                            <div class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                <div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">C</div>
                                                <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{data.categorias.find(c => c.id_categoria === ticket.id_categoria)?.nombre_tecnico || 'SIN CATEGORÍA'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-3">
                                        <div class="flex items-center justify-between ml-1">
                                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Bitácora Técnica (Privada)</span>
                                            <span class="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">Acceso Restringido</span>
                                        </div>
                                        <div class="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl min-h-[120px]">
                                            <p class="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                                {ticket.notas_tecnico || 'No se han registrado notas técnicas adicionales.'}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onclick={() => isEditingDiagnostic = true}
                                        class="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:border-indigo-500 hover:text-indigo-600 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    >
                                        <Settings2 class="w-4 h-4 group-hover:rotate-45 transition-transform aria-hidden=true" />
                                        Editar Información del Diagnóstico
                                    </button>
                                </div>
                            {:else}
                                <!-- Modo Edición -->
                                <form method="POST" action="?/updateDetails" class="space-y-6" use:enhance={() => {
                                    isSubmitting = true;
                                    return async ({ result, update }) => { 
                                        await update({ reset: false }); 
                                        isSubmitting = false; 
                                        if (result.type === 'success') isEditingDiagnostic = false;
                                    };
                                }}>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div class="space-y-2">
                                            <label for="id_nivel_atencion" class="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Prioridad del Ticket</label>
                                            <select id="id_nivel_atencion" name="id_nivel_atencion" aria-label="Prioridad del Ticket" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:ring-indigo-600 transition-all appearance-none cursor-pointer">
                                                <option value="">CLASIFICAR URGENCIA...</option>
                                                {#each data.niveles as nivel}
                                                    <option value={nivel.id_nivel_atencion} selected={ticket.id_nivel_atencion === nivel.id_nivel_atencion}>{nivel.nombre.toUpperCase()}</option>
                                                {:else}
                                                    <option disabled>No hay niveles disponibles</option>
                                                {/each}
                                            </select>
                                        </div>
                                        <div class="space-y-2">
                                            <label for="id_categoria" class="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Categoría Técnica</label>
                                            <select id="id_categoria" name="id_categoria" aria-label="Categoría Técnica" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:ring-indigo-600 transition-all appearance-none cursor-pointer">
                                                <option value="">CLASIFICAR PROBLEMA...</option>
                                                {#each data.categorias as categoria}
                                                    <option value={categoria.id_categoria} selected={ticket.id_categoria === categoria.id_categoria}>{categoria.nombre_tecnico.toUpperCase()}</option>
                                                {:else}
                                                    <option disabled>No hay categorías disponibles</option>
                                                {/each}
                                            </select>
                                        </div>
                                    </div>

                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between ml-1">
                                            <label for="notas_tecnico" class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notas Técnicas (Bitácora Privada)</label>
                                            <span class="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">Acceso Restringido</span>
                                        </div>
                                        <textarea id="notas_tecnico" name="notas_tecnico" aria-label="Notas Técnicas (Bitácora Privada)" rows="5" placeholder="Escribe el diagnóstico detallado, componentes reemplazados o pasos de resolución..." class="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:ring-indigo-600 outline-none transition-all resize-none custom-scrollbar">{ticket.notas_tecnico || ''}</textarea>
                                    </div>
                                    
                                    <input type="hidden" name="id_estado" value={ticket.id_estado} />

                                    <div class="flex gap-3">
                                        <button 
                                            type="button"
                                            onclick={() => isEditingDiagnostic = false}
                                            class="flex-grow py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        >
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={isSubmitting} class="flex-[2] py-4 bg-slate-900 dark:bg-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-slate-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                                            {#if isSubmitting}
                                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                                                GUARDANDO...
                                            {:else}
                                                <Save class="w-4 h-4 aria-hidden=true" />
                                                GUARDAR DIAGNÓSTICO
                                            {/if}
                                        </button>
                                    </div>
                                </form>
                            {/if}
                        </div>
                    {:else if activeDetailTab === 'info'}
                        <div transition:fade={{ duration: 150 }} class="space-y-8 animate-fade-in" role="tabpanel" id="panel-info" tabindex="0" aria-label="Descripción del Problema">
                            <!-- Descripción Principal -->
                            <section class="space-y-3">
                                <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción del Encargado</h3>
                                <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 leading-relaxed text-slate-700 dark:text-slate-200 font-bold whitespace-pre-wrap shadow-sm">
                                    {ticket.descripcion}
                                </div>
                            </section>

                            <!-- Grid de Información Detallada -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Equipo Afectado -->
                                <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800/50 flex items-start gap-4 transition-all hover:border-indigo-500/30">
                                    <div class="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                                        <Monitor class="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Equipo Afectado</p>
                                        <h4 class="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                            {ticket.activo_ti?.catalogo?.nombre || 'EQUIPO GENERAL'}
                                        </h4>
                                        <p class="text-[11px] font-bold text-slate-500 mt-1">SN: {ticket.activo_ti?.numero_serie || 'N/A'}</p>
                                    </div>
                                </div>

                                <!-- Reportado Por -->
                                <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800/50 flex items-start gap-4 transition-all hover:border-emerald-500/30">
                                    <div class="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
                                        <UserCircle class="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Reportado Por</p>
                                        <h4 class="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                            {ticket.creador?.nombre}
                                        </h4>
                                        <p class="text-[11px] font-bold text-slate-500 mt-1">{ticket.activo_ti?.sucursal?.nombre || 'Matriz'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Galería de Evidencias (si existen) -->
                            {#if ticket.adjuntos && ticket.adjuntos.length > 0}
                                <section class="space-y-4 pt-4">
                                    <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Evidencias Adjuntas</h3>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {#each ticket.adjuntos as adjunto}
                                            <a href={adjunto.imagen_url} target="_blank" class="group relative aspect-video overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-sm">
                                                <img src={adjunto.imagen_url} alt={adjunto.nombre} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div class="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <ExternalLink class="w-6 h-6 text-white" />
                                                </div>
                                            </a>
                                        {/each}
                                    </div>
                                </section>
                            {/if}
                        </div>
                    {:else if activeDetailTab === 'activo'}
                        <div transition:fade={{ duration: 150 }} class="space-y-8 animate-fade-in" role="tabpanel" id="panel-activo" tabindex="0" aria-label="Inventario de Activos">
                            <!-- Tarjeta de Activo Pro -->
                            <div class="bg-indigo-600 dark:bg-indigo-500 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div class="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
                                    <div class="flex items-start gap-5">
                                        <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                                            <Monitor class="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <div class="flex items-center gap-3 mb-1">
                                                <h3 class="text-2xl font-black">{ticket.activo_ti?.catalogo?.nombre || 'General'}</h3>
                                                <span class="px-2 py-0.5 rounded-lg bg-white/20 text-[10px] font-black uppercase tracking-widest">{ticket.activo_ti?.estado.replace('_', ' ') || 'ACTIVO'}</span>
                                            </div>
                                            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-indigo-100 font-bold text-xs uppercase tracking-wider">
                                                <span class="flex items-center gap-1.5"><Tag class="w-3.5 h-3.5 opacity-60" /> S/N: {ticket.activo_ti?.numero_serie || 'N/A'}</span>
                                                <span class="flex items-center gap-1.5"><Package class="w-3.5 h-3.5 opacity-60" /> INV: {ticket.activo_ti?.codigo_inventario || 'N/A'}</span>
                                                <span class="flex items-center gap-1.5"><MapPin class="w-3.5 h-3.5 opacity-60" /> {ticket.activo_ti?.sucursal?.nombre || 'Matriz'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {#if ticket.id_activo}
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onclick={() => isHistoryModalOpen = true}
                                        aria-label="Ver movimientos del activo"
                                        class="flex items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] hover:bg-white dark:hover:bg-slate-800 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    >
                                        <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                                            <History class="w-5 h-5 group-hover:rotate-[-45deg] transition-transform aria-hidden=true" />
                                        </div>
                                        <div class="text-left">
                                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Actividad</p>
                                            <p class="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Ver Movimientos</p>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onclick={() => isMovementModalOpen = true}
                                        aria-label="Registrar movimiento del activo"
                                        class="flex items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] hover:bg-white dark:hover:bg-slate-800 transition-all group focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    >
                                        <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                            <Wrench class="w-5 h-5 group-hover:rotate-[45deg] transition-transform aria-hidden=true" />
                                        </div>
                                        <div class="text-left">
                                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mantenimiento</p>
                                            <p class="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Registrar Movimiento</p>
                                        </div>
                                    </button>
                                </div>
                            {:else}
                                <div class="p-12 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                                    <Monitor class="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p class="text-sm font-medium text-slate-400 italic">Este ticket no tiene un activo de inventario vinculado.</p>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Sidebar de Opciones Premium (Restaurada Completamente) -->
        <div class="lg:col-span-4 space-y-6 h-fit">
            <div class="bg-white dark:bg-slate-800 p-2 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/10 flex flex-col h-fit">
                <div class="p-4 pt-6 space-y-6">
                    <!-- Control de Estado Rápido -->
                    <div class="px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-3 mb-3">
                            <Activity class="w-4 h-4 text-indigo-500" aria-hidden="true" />
                            <span class="text-xs font-black uppercase tracking-widest text-slate-400">Estado del Ticket</span>
                        </div>
                        <form use:enhance action="?/updateStatus" method="POST">
                            <select 
                                name="statusId"
                                aria-label="Cambiar estado del ticket"
                                class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-indigo-600 appearance-none cursor-pointer"
                                onchange={(e) => e.target.form.submit()}
                            >
                                {#each data.estados as estado}
                                    <option value={estado.id_estado} selected={ticket.id_estado === estado.id_estado}>
                                        {estado.nombre.toUpperCase()}
                                    </option>
                                {/each}
                            </select>
                        </form>
                    </div>

                    <!-- Responsable TI -->
                    <div class="px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <UserPlus class="w-4 h-4 text-indigo-500" aria-hidden="true" />
                                <span class="text-xs font-black uppercase tracking-widest text-slate-400">Responsable TI</span>
                            </div>
                            {#if ticket.usuario_asignado}
                                <button onclick={() => isEditingTech = !isEditingTech} aria-label="Cambiar asignación de técnico" class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded">{isEditingTech ? 'CANCELAR' : 'REASIGNAR'}</button>
                            {/if}
                        </div>

                        {#if ticket.usuario_asignado && !isEditingTech}
                            <div transition:slide class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><User class="w-4 h-4 text-indigo-600" aria-hidden="true" /></div>
                                <div class="overflow-hidden">
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Técnico Asignado</p>
                                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{ticket.usuario_asignado.nombre}</p>
                                </div>
                            </div>
                        {:else}
                            <div transition:slide>
                                <form use:enhance action="?/assignTechnician" method="POST">
                                    <select name="technicianId" aria-label="Asignar técnico responsable" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-indigo-600 appearance-none cursor-pointer" onchange={(e) => { e.target.form.submit(); isEditingTech = false; }}>
                                        <option value="">SELECCIONAR TÉCNICO...</option>
                                        {#each technicians as tech}<option value={tech.id_usuario} selected={ticket.id_usuario_asignado === tech.id_usuario}>{tech.nombre.toUpperCase()}</option>{/each}
                                    </select>
                                </form>
                            </div>
                        {/if}
                    </div>

                    <!-- Botón Modal Chat -->
                    <button onclick={() => isChatModalOpen = true} aria-label="Abrir chat de gestión" class="w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-600">
                        <div class="flex items-center gap-3"><MessageSquare class="w-5 h-5" aria-hidden="true" /><span class="text-sm font-black uppercase tracking-tight">Bitácora Chat</span></div>
                        <div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">{ticket.comentarios?.length || 0}</span><ChevronRight class="w-4 h-4 opacity-50" aria-hidden="true" /></div>
                    </button>
                </div>

                <div class="mt-4 p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-[32px]">
                    <div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><ShieldCheck class="w-4 h-4 text-indigo-600" /></div><div><p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Nivel Acceso</p><p class="text-xs font-bold text-slate-700 dark:text-slate-300">Control Maestro</p></div></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modales Extraídos a Subcomponentes -->
<HistoryModal 
    bind:isOpen={isHistoryModalOpen} 
    movimientosActivo={data.movimientosActivo} 
    ticketId={ticket.id_ticket} 
/>

<MovementModal 
    bind:isOpen={isMovementModalOpen} 
    ticket={ticket} 
    tiposMovimiento={data.tiposMovimiento} 
/>

<ChatModal 
    bind:isOpen={isChatModalOpen} 
    ticket={ticket} 
/>

<style>
    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.2); border-radius: 10px; }
</style>
