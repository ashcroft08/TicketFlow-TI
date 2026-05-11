<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { ArrowLeft, Calendar, Monitor, Send, Paperclip, AlertCircle, Clock, CheckCircle2, HelpCircle, Save, FileText, Settings2, ChevronDown, ChevronUp, UserPlus, Package, Wrench, History } from 'lucide-svelte';
    import type { ActionData, PageData } from './$types';

    let { data, form } = $props<{ data: PageData; form: ActionData }>();

    let chatContainer: HTMLElement;
    let isSubmittingChat = $state(false);
    let isSubmittingDetails = $state(false);
    let activeDetailTab = $state<'info' | 'gestion'>('gestion');
    let isManagementExpanded = $state(true);

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

    // Polling: Refrescar los datos en segundo plano cada 5 segundos para el chat
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

    let status = $derived(getStatusStyles(ticket.estado?.nombre || ''));

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleString('es-ES', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    let isClosed = $derived(ticket.estado?.nombre === 'Resuelto' || ticket.estado?.nombre === 'Cerrado');
    let isAdmin = $derived(data.user.cod_rol === 'ADMIN');
    let canEdit = $derived(isAdmin || !isClosed);
    let canChat = $derived(!isClosed && !!ticket.id_usuario);
</script>

<svelte:head>
    <title>Gestión Ticket #{ticket.id_ticket} - TicketFlow TI</title>
</svelte:head>

<div class="bg-slate-50 dark:bg-slate-900 font-body-md text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col overflow-hidden">
    
    <!-- Header Navegación removido - Info ahora en Navbar -->

    <!-- Contenido Principal Split-Screen -->
    <main class="flex-grow max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8 h-[calc(100vh-160px)] lg:overflow-hidden">




        
        <!-- PANEL IZQUIERDO: Información y Gestión -->
        <div class="w-full lg:w-1/2 flex flex-col gap-6 lg:h-full lg:overflow-y-auto pr-2 pb-2 lg:pb-6 custom-scrollbar">
            
            <!-- Notificación de Éxito o Error -->
            {#if form?.success && form?.message}
                <div class="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                    <CheckCircle2 class="w-5 h-5 shrink-0" />
                    <p class="text-sm font-medium">{form.message}</p>
                </div>
            {/if}
            {#if form?.error}
                <div class="bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                    <AlertCircle class="w-5 h-5 shrink-0" />
                    <p class="text-sm font-medium">{form.error}</p>
                </div>
            {/if}

            <div class="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] shadow-sm overflow-hidden flex flex-col shrink-0">
                <!-- Header con botón de plegado (Solo móvil) -->
                <div class="lg:hidden px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 class="w-3.5 h-3.5" /> Panel de Gestión
                    </span>
                    <button 
                        onclick={() => isManagementExpanded = !isManagementExpanded}
                        class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500"
                    >
                        {#if isManagementExpanded}
                            <ChevronUp class="w-4 h-4" />
                        {:else}
                            <ChevronDown class="w-4 h-4" />
                        {/if}
                    </button>
                </div>

                {#if isManagementExpanded}
                    <!-- Pestañas de Gestión vs Info -->
                    <div class="flex border-b border-slate-200 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50">
                    <button 
                        onclick={() => activeDetailTab = 'gestion'}
                        class="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors {activeDetailTab === 'gestion' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    >
                        <Settings2 class="w-4 h-4" /> Gestión y Diagnóstico
                    </button>
                    <button 
                        onclick={() => activeDetailTab = 'info'}
                        class="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors {activeDetailTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    >
                        <FileText class="w-4 h-4" /> Problema
                    </button>
                    {#if ticket.activo_ti}
                        <button 
                            onclick={() => activeDetailTab = 'activo'}
                            class="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors {activeDetailTab === 'activo' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        >
                            <Package class="w-4 h-4" /> Inventario
                        </button>
                    {/if}
                </div>

                <div class="p-6">
                    {#if !ticket.id_usuario}
                        <!-- Estado: Sin Asignar -->
                        <div class="flex flex-col items-center text-center py-4">
                            <div class="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                                <UserPlus class="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 class="text-lg font-bold mb-2">Ticket sin Asignar</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                                Debes tomar este ticket antes de poder realizar diagnósticos o contactar al encargado.
                            </p>
                            <form method="POST" action="?/claim" use:enhance={() => {
                                isSubmittingDetails = true;
                                return async ({ update }) => {
                                    await update();
                                    isSubmittingDetails = false;
                                };
                            }} class="w-full">
                                <button type="submit" disabled={isSubmittingDetails} class="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                                    {#if isSubmittingDetails}
                                        <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Asignando...
                                    {:else}
                                        <UserPlus class="w-5 h-5" />
                                        Tomar este Ticket
                                    {/if}
                                </button>
                            </form>
                        </div>
                    {:else if activeDetailTab === 'gestion'}
                        <!-- Formulario de Gestión Técnica -->
                        <form method="POST" action="?/updateDetails" class="flex flex-col gap-5" use:enhance={() => {
                            isSubmittingDetails = true;
                            return async ({ update }) => {
                                await update({ reset: false });
                                isSubmittingDetails = false;
                            };
                        }}>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex flex-col gap-1.5">
                                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" for="id_estado">Estado</label>
                                    <select name="id_estado" id="id_estado" disabled={!isAdmin && isClosed} class="h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:opacity-50">
                                        {#each data.estados as estado}
                                            <option value={estado.id_estado} selected={ticket.id_estado === estado.id_estado}>{estado.nombre}</option>
                                        {/each}
                                    </select>
                                </div>
                                <div class="flex flex-col gap-1.5">
                                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" for="id_nivel_atencion">Nivel de Urgencia</label>
                                    <select name="id_nivel_atencion" id="id_nivel_atencion" disabled={!canEdit} class="h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:opacity-50">
                                        <option value="">-- Seleccionar --</option>
                                        {#each data.niveles as nivel}
                                            <option value={nivel.id_nivel_atencion} selected={ticket.id_nivel_atencion === nivel.id_nivel_atencion}>{nivel.nombre}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" for="id_categoria">Categoría del Problema</label>
                                <select name="id_categoria" id="id_categoria" disabled={!canEdit} class="h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:opacity-50">
                                    <option value="">-- Clasificar Problema --</option>
                                    {#each data.categorias as categoria}
                                        <option value={categoria.id_categoria} selected={ticket.id_categoria === categoria.id_categoria}>{categoria.nombre_tecnico}</option>
                                    {/each}
                                </select>
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between" for="notas_tecnico">
                                    Notas Técnicas (Privadas)
                                    <span class="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">Solo visible para Técnicos</span>
                                </label>
                                <textarea name="notas_tecnico" id="notas_tecnico" rows="4" disabled={!canEdit} placeholder="Escribe el diagnóstico, pasos realizados, repuestos necesarios..." class="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm custom-scrollbar disabled:opacity-50">{ticket.notas_tecnico || ''}</textarea>
                            </div>

                            <button type="submit" disabled={isSubmittingDetails || !canEdit} class="mt-2 w-full h-11 bg-slate-800 dark:bg-slate-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                                {#if isSubmittingDetails}
                                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Guardando...
                                {:else}
                                    <Save class="w-4 h-4" />
                                    Guardar Cambios
                                {/if}
                            </button>
                        </form>
                    {:else if activeDetailTab === 'info'}
                        <!-- Información Reportada -->
                        <div class="flex flex-col gap-5">
                            <div>
                                <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Descripción del Encargado</span>
                                <p class="text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    {ticket.descripcion}
                                </p>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Equipo Afectado</span>
                                    <div class="flex items-center gap-1.5 text-sm font-semibold mt-1">
                                        <Monitor class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span class="truncate">{ticket.activo_ti?.catalogo?.nombre || 'Ninguno'}</span>
                                    </div>
                                    {#if ticket.activo_ti}
                                        <div class="text-xs text-slate-500 mt-1 pl-5">SN: {ticket.activo_ti.numero_serie}</div>
                                    {/if}
                                </div>
                                <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Reportado por</span>
                                    <div class="text-sm font-semibold mt-1">{ticket.creador?.nombre}</div>
                                    <div class="text-xs text-slate-500 mt-1">{ticket.activo_ti?.sucursal?.nombre || 'Sucursal Principal'}</div>
                                </div>
                            </div>

                            <!-- Galería de Adjuntos -->
                            {#if ticket.adjuntos && ticket.adjuntos.length > 0}
                                <div>
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                                        <Paperclip class="w-3.5 h-3.5" />
                                        Evidencia ({ticket.adjuntos.length})
                                    </h3>
                                    <div class="grid grid-cols-3 gap-2">
                                        {#each ticket.adjuntos as adjunto}
                                            <a href={adjunto.imagen_url} target="_blank" rel="noopener noreferrer" class="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                                <img src={adjunto.imagen_url} alt={adjunto.nombre} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                            </a>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {:else if activeDetailTab === 'activo' && ticket.activo_ti}
                        <!-- Gestión de Activo e Inventario -->
                        <div class="flex flex-col gap-6">
                            <!-- Resumen del Activo -->
                            <div class="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                        <Monitor class="w-5 h-5" />
                                        <h3 class="font-bold text-sm">{ticket.activo_ti.catalogo?.nombre}</h3>
                                    </div>
                                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider 
                                        {ticket.activo_ti.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                         ticket.activo_ti.estado === 'en_reparacion' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                         ticket.activo_ti.estado === 'baja' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                         'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}">
                                        {ticket.activo_ti.estado.replace('_', ' ')}
                                    </span>
                                </div>
                                <div class="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                                    <div><span class="font-semibold text-slate-800 dark:text-slate-200">S/N:</span> {ticket.activo_ti.numero_serie || 'N/A'}</div>
                                    <div><span class="font-semibold text-slate-800 dark:text-slate-200">INV:</span> {ticket.activo_ti.codigo_inventario || 'N/A'}</div>
                                    <div class="col-span-2"><span class="font-semibold text-slate-800 dark:text-slate-200">Ubicación:</span> {ticket.activo_ti.sucursal?.nombre || 'General'}</div>
                                </div>
                            </div>

                            <!-- Formulario de Movimiento -->
                            <form method="POST" action="?/registerAssetMovement" class="flex flex-col gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50" use:enhance={() => {
                                isSubmittingDetails = true;
                                return async ({ update }) => {
                                    await update({ reset: false });
                                    isSubmittingDetails = false;
                                };
                            }}>
                                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Registrar Movimiento de Inventario</h4>
                                
                                <input type="hidden" name="id_activo" value={ticket.id_activo} />

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="flex flex-col gap-1.5">
                                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400" for="id_tipo_movimiento">Acción a realizar *</label>
                                        <select name="id_tipo_movimiento" id="id_tipo_movimiento" required disabled={!canEdit} class="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:opacity-50">
                                            <option value="">Seleccionar Acción...</option>
                                            {#each data.tiposMovimiento as tipo}
                                                <option value={tipo.id_tipo_movimiento}>{tipo.tipo_movimiento}</option>
                                            {/each}
                                        </select>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400" for="nuevo_estado">Nuevo Estado del Activo *</label>
                                        <select name="nuevo_estado" id="nuevo_estado" required disabled={!canEdit} class="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm disabled:opacity-50">
                                            <option value="activo" selected={ticket.activo_ti.estado === 'activo'}>Activo (Operativo)</option>
                                            <option value="en_reparacion" selected={ticket.activo_ti.estado === 'en_reparacion'}>En Reparación</option>
                                            <option value="bodega" selected={ticket.activo_ti.estado === 'bodega'}>Bodega (Reserva)</option>
                                            <option value="baja" selected={ticket.activo_ti.estado === 'baja'}>Dado de Baja</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-1.5">
                                    <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400" for="motivo">Motivo / Observaciones (Opcional)</label>
                                    <textarea name="motivo" id="motivo" rows="2" disabled={!canEdit} placeholder="Ej. Se envía a taller externo por fallo de placa madre..." class="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm custom-scrollbar disabled:opacity-50"></textarea>
                                </div>

                                <button type="submit" disabled={isSubmittingDetails || !canEdit} class="mt-1 w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                    {#if isSubmittingDetails}
                                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Registrando...
                                    {:else}
                                        <Save class="w-4 h-4" />
                                        Guardar Movimiento
                                    {/if}
                                </button>
                            </form>
                            
                            <!-- Historial de Movimientos -->
                            {#if data.movimientosActivo && data.movimientosActivo.length > 0}
                                <div>
                                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pl-1">Historial Reciente del Activo</h4>
                                    <div class="flex flex-col gap-2">
                                        {#each data.movimientosActivo as mov}
                                            <div class="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 flex flex-col gap-1.5 text-sm">
                                                <div class="flex justify-between items-start">
                                                    <span class="font-semibold text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wide">{mov.tipo?.tipo_movimiento}</span>
                                                    <span class="text-[10px] text-slate-400">{new Date(mov.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                {#if mov.motivo}
                                                    <p class="text-slate-600 dark:text-slate-300 text-xs italic">"{mov.motivo}"</p>
                                                {/if}
                                                <div class="text-[10px] text-slate-400 mt-1">Ref: Ticket #{mov.id_ticket}</div>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
                {/if}
            </div>
        </div>

        <!-- PANEL DERECHO: Chat Interno -->
        <div class="w-full lg:w-1/2 flex flex-col bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] shadow-sm h-[600px] lg:h-full">

            
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 rounded-t-[24px] flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-sm">Canal de Comunicación</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Conversación con el Encargado</p>
                </div>
                <!-- Botón visible solo en móvil para cambiar entre Info/Chat, opcional, por ahora en móvil solo mostramos el chat para simplificar igual que el encargado -->
            </div>

            <!-- Área de Mensajes -->
            <div bind:this={chatContainer} class="flex-grow p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                
                {#if ticket.comentarios.length === 0}
                    <div class="m-auto text-center opacity-50">
                        <div class="w-16 h-16 mx-auto mb-4 bg-blue-600/10 rounded-full flex items-center justify-center">
                            <Send class="w-8 h-8 text-blue-600" />
                        </div>
                        <p class="text-sm">Aún no hay mensajes.</p>
                        <p class="text-xs">Escribe para pedir más detalles al encargado.</p>
                    </div>
                {/if}

                {#each ticket.comentarios as comentario}
                    {@const isMe = comentario.id_usuario === data.user.id}
                    {@const senderName = isMe ? 'Tú (Técnico)' : (comentario.usuario?.nombre || 'Usuario')}
                    {@const senderRole = isMe ? 'Técnico' : 'Encargado'}

                    <div class="flex flex-col max-w-[85%] {isMe ? 'self-end items-end' : 'self-start items-start'}">
                        <div class="flex items-baseline gap-2 mb-1 px-1">
                            <span class="text-[11px] font-semibold {isMe ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}">{senderName}</span>
                            <span class="text-[9px] text-slate-400">{formatDate(comentario.created_at)}</span>
                        </div>
                        
                        <div class="px-4 py-2.5 rounded-2xl text-sm shadow-sm
                            {isMe 
                                ? 'bg-blue-600 text-white rounded-tr-sm' 
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
                        isSubmittingChat = true;
                        return async ({ update }) => {
                            await update({ reset: true });
                            isSubmittingChat = false;
                            scrollToBottom();
                        };
                    }}
                >
                    <input 
                        type="text" 
                        name="comentario" 
                        placeholder={!canChat ? (isClosed ? "Ticket finalizado - Chat cerrado" : "Debes tomar el ticket para chatear...") : "Escribe un mensaje al encargado..."}
                        required
                        autocomplete="off"
                        class="flex-grow h-12 px-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm text-slate-800 dark:text-white disabled:opacity-50"
                        disabled={isSubmittingChat || !canChat}
                    />
                    <button 
                        type="submit"
                        disabled={isSubmittingChat || !canChat}
                        class="h-12 w-12 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {#if isSubmittingChat}
                            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {:else}
                            <Send class="w-5 h-5 -ml-0.5" />
                        {/if}
                    </button>
                </form>
            </div>

        </div>
    </main>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 10px; }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(71, 85, 105, 0.5); }
</style>
