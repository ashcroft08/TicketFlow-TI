<script lang="ts">
    import { BookOpen, Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight, AlertCircle, Settings2, Calendar, Clock, FileText, User, Tag } from 'lucide-svelte';
    import { fade, scale, slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    // Estado del Formulario / Modales
    let showModal = $state(false);
    let editingRecord = $state<any>(null);
    let searchQuery = $state('');
    let userFilter = $state('');
    let categoryFilter = $state('');
    let dateFrom = $state('');
    let dateTo = $state('');

    // Campos del Formulario Reactivos
    let fecha = $state(data.todayStr);
    let titulo = $state('');
    let inputHoras = $state(1);
    let inputMinutos = $state(0);
    let descripcion = $state('');
    let idCategoriaBitacora = $state('');

    let formError = $derived(form?.error);

    // Toast de resultado de acciones
    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success(form.message || '¡Cambios aplicados con éxito!');
                closeModal();
            } else if (form.error) {
                toast.error(form.error);
            }
        }
    });

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(10);

    const filteredBitacoras = $derived(
        data.bitacoras.filter(b => {
            const matchesSearch = b.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 b.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesUser = userFilter === '' || b.id_usuario === parseInt(userFilter);
            
            // Filtro por Fechas (b.fecha en formato YYYY-MM-DD)
            const matchesDateFrom = dateFrom === '' || b.fecha >= dateFrom;
            const matchesDateTo = dateTo === '' || b.fecha <= dateTo;

            // Filtro por Categoría
            const matchesCategory = categoryFilter === '' || b.id_categoria_bitacora === parseInt(categoryFilter);
            
            return matchesSearch && matchesUser && matchesDateFrom && matchesDateTo && matchesCategory;
        })
    );

    const totalPages = $derived(Math.ceil(filteredBitacoras.length / itemsPerPage));
    const paginatedBitacoras = $derived(
        filteredBitacoras.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página al filtrar o buscar
    $effect(() => {
        if (searchQuery || userFilter || dateFrom || dateTo || categoryFilter || itemsPerPage) {
            currentPage = 1;
        }
    });

    const clearFilters = () => {
        searchQuery = '';
        userFilter = '';
        categoryFilter = '';
        dateFrom = '';
        dateTo = '';
    };

    // Calcular horas registradas dinámicamente para el usuario actual hoy
    const horasHoy = $derived(
        data.bitacoras
            .filter(b => b.fecha === data.todayStr && b.id_usuario === data.user.id)
            .reduce((sum, b) => sum + parseFloat(b.horas_dedicadas), 0)
    );

    const progressPercentage = $derived(Math.min((horasHoy / 8) * 100, 100));

    const getProgressColor = (horas: number) => {
        if (horas === 0) return 'bg-slate-700';
        if (horas < 4) return 'bg-error shadow-error/30';
        if (horas < 8) return 'bg-warning shadow-warning/30';
        return 'bg-success shadow-success/30';
    };

    // Formateador de Esfuerzo amigable
    const formatEsfuerzo = (horasDec: string | number) => {
        const value = typeof horasDec === 'string' ? parseFloat(horasDec) : horasDec;
        const totalMin = Math.round(value * 60);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} hrs`;
        return `${h}h ${m}m`;
    };

    const openCreate = () => {
        editingRecord = null;
        fecha = data.todayStr;
        titulo = '';
        inputHoras = 1;
        inputMinutos = 0;
        descripcion = '';
        idCategoriaBitacora = '';
        showModal = true;
    };

    const openEdit = (record: any) => {
        editingRecord = record;
        fecha = data.todayStr;
        titulo = record.titulo;
        
        const totalMin = Math.round(parseFloat(record.horas_dedicadas) * 60);
        inputHoras = Math.floor(totalMin / 60);
        inputMinutos = totalMin % 60;

        descripcion = record.descripcion;
        idCategoriaBitacora = record.id_categoria_bitacora ? record.id_categoria_bitacora.toString() : '';
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        editingRecord = null;
    };

    // Formateador de Fecha amigable
    const formatDate = (dateStr: string) => {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
    };
</script>

<svelte:head>
    <title>Bitácora de Actividades - TicketFlow TI</title>
</svelte:head>

<!-- ===== REPORTE DE IMPRESIÓN (Solo visible al imprimir) ===== -->
<div class="hidden print:block print:mb-8 text-black bg-white w-full">
    <div class="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
        <div>
            <h1 class="text-2xl font-bold uppercase tracking-widest text-slate-900">Reporte de Bitácora</h1>
            <p class="text-sm text-slate-600 mt-1">TicketFlow TI - Operaciones y Control</p>
        </div>
        <div class="text-right">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha de Impresión</p>
            <p class="text-sm font-semibold">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Filtros Aplicados</h3>
            <ul class="text-xs text-slate-700 space-y-1.5">
                <li><span class="font-semibold text-slate-900">Búsqueda:</span> {searchQuery || 'Ninguna'}</li>
                <li><span class="font-semibold text-slate-900">Administrador:</span> {userFilter ? data.admins.find(a => a.id_usuario.toString() === userFilter)?.nombre || 'Todos' : 'Todos'}</li>
                <li><span class="font-semibold text-slate-900">Categoría:</span> {categoryFilter ? data.categorias.find(c => c.id_categoria_bitacora.toString() === categoryFilter)?.nombre || 'Todas' : 'Todas'}</li>
                <li><span class="font-semibold text-slate-900">Periodo:</span> {dateFrom ? formatDate(dateFrom) : 'Inicio'} - {dateTo ? formatDate(dateTo) : 'Fin'}</li>
            </ul>
        </div>
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resumen de Actividades</h3>
            <ul class="text-xs text-slate-700 space-y-1.5">
                <li class="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span class="font-semibold text-slate-900">Total Actividades:</span> 
                    <span class="font-bold text-primary">{filteredBitacoras.length}</span>
                </li>
                <li class="flex justify-between items-center pt-1">
                    <span class="font-semibold text-slate-900">Esfuerzo Total:</span> 
                    <span class="font-bold text-primary">{formatEsfuerzo(filteredBitacoras.reduce((sum, b) => sum + parseFloat(b.horas_dedicadas), 0))}</span>
                </li>
            </ul>
        </div>
    </div>
</div>
<!-- ========================================================= -->

<div class="space-y-6 animate-fade-in-up relative">
    <!-- Orbes decorativos flotantes -->
    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-blob"></div>

    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <BookOpen class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Operaciones</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Bitácora</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Registra, documenta y audita tu esfuerzo y actividades diarias como Administrador de TI.</p>
        </div>

        <div class="flex items-center gap-2.5 no-print">
            <a 
                href="/admin/bitacora/categorias"
                class="btn-secondary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
                <Tag class="w-4 h-4 text-primary" />
                <span class="uppercase tracking-tighter text-xs">Categorías</span>
            </a>
            <button 
                onclick={openCreate}
                class="btn-primary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
                <Plus class="w-4 h-4" />
                <span class="uppercase tracking-tighter text-xs">Nueva Actividad</span>
            </button>
        </div>
    </header>

    <!-- Widget de Meta de Horas / Jornada de Trabajo -->
    <section class="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden shadow-xl no-print">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <Clock class="w-5 h-5 text-primary" />
                    <h2 class="text-base font-bold text-text-main dark:text-dark-text-main">Meta Diaria de Jornada</h2>
                </div>
                <p class="text-xs text-text-dim max-w-md">Es recomendable registrar al menos 8 horas de esfuerzo diario. Ayuda a documentar tus incidencias y control operativo.</p>
            </div>

            <!-- Visualizador del progreso -->
            <div class="flex-grow max-w-md space-y-2.5">
                <div class="flex justify-between items-end text-xs font-semibold">
                    <span class="text-text-dim">Tu Jornada Hoy: <strong class="text-text-main dark:text-dark-text-main font-bold">{formatEsfuerzo(horasHoy)} / 8h 00m</strong></span>
                    {#if horasHoy >= 8}
                        <span class="text-success font-bold animate-pulse flex items-center gap-1">
                            <span>★</span> ¡Jornada Completada!
                        </span>
                    {:else}
                        <span class="text-text-dim">Faltan {formatEsfuerzo(Math.max(0, 8 - horasHoy))}</span>
                    {/if}
                </div>
                <!-- Barra de progreso -->
                <div class="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                        class="h-full rounded-full transition-all duration-700 ease-out shadow {getProgressColor(horasHoy)}"
                        style="width: {progressPercentage}%"
                    ></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Controles de Filtros y Búsqueda -->
    <div class="glass-card p-5 rounded-xl border border-white/5 space-y-4 no-print">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="flex items-center gap-2">
                <Settings2 class="w-4 h-4 text-primary" />
                <h3 class="text-xs font-bold uppercase tracking-wider text-text-main dark:text-dark-text-main">Filtros de Búsqueda</h3>
            </div>
            
            <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                {#if searchQuery || userFilter || categoryFilter || dateFrom || dateTo}
                    <button 
                        onclick={clearFilters}
                        class="text-xs font-bold uppercase tracking-widest text-error hover:text-error/80 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-error/10 focus:outline-none"
                    >
                        <X class="w-3.5 h-3.5" /> Limpiar Filtros
                    </button>
                {/if}
                
                <button 
                    onclick={() => {
                        const originalItems = itemsPerPage;
                        itemsPerPage = Math.max(filteredBitacoras.length, 1);
                        setTimeout(() => {
                            window.print();
                            itemsPerPage = originalItems;
                        }, 100);
                    }}
                    class="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10 border border-primary/20 focus:outline-none"
                >
                    <FileText class="w-3.5 h-3.5" /> Imprimir Reporte
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <!-- Buscador -->
            <div class="flex flex-col gap-1.5 lg:col-span-1">
                <label for="filter-search" class="text-[9px] font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim px-1">Buscar por Actividad</label>
                <div class="relative group">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
                    <input 
                        id="filter-search"
                        type="text" 
                        bind:value={searchQuery}
                        placeholder="Buscar título o descripción..."
                        aria-label="Buscar actividades"
                        class="w-full pl-11 pr-4 py-2.5 bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs text-text-main dark:text-dark-text-main"
                    />
                </div>
            </div>

            <!-- Filtro por Administrador -->
            <div class="flex flex-col gap-1.5">
                <label for="filter-user" class="text-[9px] font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim px-1">Administrador</label>
                <div class="relative">
                    <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <select
                        id="filter-user"
                        bind:value={userFilter}
                        aria-label="Filtrar por administrador"
                        class="w-full pl-11 pr-8 py-2.5 bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs appearance-none cursor-pointer text-text-main dark:text-dark-text-main"
                    >
                        <option value="">Todos</option>
                        {#each data.admins as admin}
                            <option value={admin.id_usuario.toString()}>{admin.nombre}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Filtro por Categoría -->
            <div class="flex flex-col gap-1.5">
                <label for="filter-category" class="text-[9px] font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim px-1">Categoría</label>
                <div class="relative">
                    <Tag class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <select
                        id="filter-category"
                        bind:value={categoryFilter}
                        aria-label="Filtrar por categoría"
                        class="w-full pl-11 pr-8 py-2.5 bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs appearance-none cursor-pointer text-text-main dark:text-dark-text-main"
                    >
                        <option value="">Todas</option>
                        {#each data.categorias as cat}
                            <option value={cat.id_categoria_bitacora.toString()}>{cat.nombre}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Fechas Desde / Hasta -->
            <div class="grid grid-cols-2 gap-2 lg:col-span-2">
                <div class="flex flex-col gap-1.5">
                    <label for="filter-date-from" class="text-[9px] font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim px-1">Desde</label>
                    <div class="relative flex items-center group">
                        <Calendar class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors pointer-events-none z-10" />
                        <input 
                            id="filter-date-from"
                            type="date" 
                            bind:value={dateFrom}
                            aria-label="Fecha inicio"
                            onclick={(e) => e.currentTarget.showPicker()}
                            class="w-full pl-11 pr-4 py-2.5 bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs text-text-main dark:text-dark-text-main cursor-pointer animate-fade-in-up"
                        />
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label for="filter-date-to" class="text-[9px] font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim px-1">Hasta</label>
                    <div class="relative flex items-center group">
                        <Calendar class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors pointer-events-none z-10" />
                        <input 
                            id="filter-date-to"
                            type="date" 
                            bind:value={dateTo}
                            aria-label="Fecha fin"
                            onclick={(e) => e.currentTarget.showPicker()}
                            class="w-full pl-11 pr-4 py-2.5 bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs text-text-main dark:text-dark-text-main cursor-pointer animate-fade-in-up"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabla Obsidian Premium -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="overflow-x-auto" role="region" tabindex="0" aria-label="Tabla de bitácora de administrador">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Fecha</th>
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Administrador</th>
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Categoría</th>
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Actividad / Tarea</th>
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Esfuerzo</th>
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Detalle</th>
                        <th scope="col" class="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedBitacoras as log (log.id_bitacora)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <!-- Fecha -->
                            <td class="px-5 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-2">
                                    <Calendar class="w-4 h-4 text-text-dim" />
                                    <span class="text-xs font-bold text-text-main dark:text-dark-text-main">
                                        {formatDate(log.fecha)}
                                    </span>
                                </div>
                            </td>

                            <!-- Administrador -->
                            <td class="px-5 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-1.5 text-xs font-semibold text-text-main dark:text-dark-text-main">
                                    <User class="w-3.5 h-3.5 text-text-dim" />
                                    {log.usuario?.nombre || 'Administrador'}
                                </div>
                            </td>

                            <!-- Categoría -->
                            <td class="px-5 py-4 whitespace-nowrap">
                                {#if log.categoria}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                        {log.categoria.nombre}
                                    </span>
                                {:else}
                                    <span class="text-[10px] text-text-dim italic">Sin categoría</span>
                                {/if}
                            </td>

                            <!-- Título -->
                            <td class="px-5 py-4">
                                <span class="text-sm font-bold text-text-main dark:text-dark-text-main group-hover:text-primary transition-colors block">
                                    {log.titulo}
                                </span>
                            </td>

                            <!-- Horas -->
                            <td class="px-5 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-1 text-xs font-mono text-text-main dark:text-dark-text-main">
                                    <Clock class="w-3.5 h-3.5 text-primary/70" />
                                    <span>{formatEsfuerzo(log.horas_dedicadas)}</span>
                                </div>
                            </td>

                            <!-- Descripción -->
                            <td class="px-5 py-4 max-w-sm">
                                <p class="text-[11px] text-text-dim line-clamp-2 leading-relaxed">
                                    {log.descripcion}
                                </p>
                            </td>

                            <!-- Acciones -->
                            <td class="px-5 py-4 text-right whitespace-nowrap">
                                <div class="flex justify-end gap-1">
                                    {#if log.id_usuario === data.user.id}
                                        <button 
                                            onclick={() => openEdit(log)}
                                            aria-label={`Editar actividad ${log.titulo}`}
                                            class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <Edit2 class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                        <form 
                                            use:enhance 
                                            action="?/delete" 
                                            method="POST" 
                                            class="inline-block"
                                        >
                                            <input type="hidden" name="id" value={log.id_bitacora} />
                                            <button 
                                                type="button"
                                                onclick={(e) => {
                                                    const form = e.currentTarget.closest('form');
                                                    if (form) {
                                                        confirmState.ask(
                                                            '¿Eliminar Registro de Bitácora?',
                                                            `¿Estás seguro de eliminar el registro "${log.titulo}"? Esta acción ocultará la tarea del reporte.`,
                                                            () => form.requestSubmit()
                                                        );
                                                    }
                                                }}
                                                aria-label={`Eliminar actividad ${log.titulo}`}
                                                class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                            >
                                                <Trash2 class="w-4 h-4 aria-hidden=true" />
                                            </button>
                                        </form>
                                    {:else}
                                        <span class="text-[10px] text-text-dim italic pr-2">Solo lectura</span>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}

                    {#if filteredBitacoras.length === 0}
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center text-text-dim dark:text-dark-text-dim italic text-sm">
                                No se encontraron actividades registradas en la bitácora.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Paginación Premium -->
        <div class="px-6 py-4 bg-primary/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <!-- Registros por página -->
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim">Mostrar</span>
                <select 
                    bind:value={itemsPerPage} 
                    aria-label="Registros por página"
                    class="bg-white/5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main dark:text-dark-text-main cursor-pointer"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim">por página</span>
            </div>

            <!-- Información de registros -->
            {#if filteredBitacoras.length > 0}
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim text-center">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredBitacoras.length)} de {filteredBitacoras.length} actividades
                </span>
            {:else}
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim text-center">
                    0 actividades encontradas
                </span>
            {/if}

            <!-- Botones de navegación -->
            {#if totalPages > 1}
                <div class="flex items-center gap-1">
                    <button 
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        aria-label="Página anterior"
                        class="p-2 glass-card rounded-lg disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary border border-white/5"
                    >
                        <ChevronLeft class="w-3.5 h-3.5" />
                    </button>

                    <!-- Renderizado inteligente de números de página -->
                    {#each Array.from({ length: totalPages }) as _, i}
                        {@const pageNum = i + 1}
                        {#if pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1}
                            <button 
                                onclick={() => currentPage = pageNum}
                                class="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all border {currentPage === pageNum ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'glass-card border-white/5 text-text-dim hover:text-primary'}"
                            >
                                {pageNum}
                            </button>
                        {/if}
                        {#if (pageNum === 2 && currentPage > 3) || (pageNum === totalPages - 1 && currentPage < totalPages - 2)}
                            <span class="text-text-dim px-1 text-xs">...</span>
                        {/if}
                    {/each}

                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        aria-label="Página siguiente"
                        class="p-2 glass-card rounded-lg disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary border border-white/5"
                    >
                        <ChevronRight class="w-3.5 h-3.5" />
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Modal Premium de Creación/Edición -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div 
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-labelledby="modal-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card-premium w-full max-w-lg overflow-hidden p-6 sm:p-8 animate-scale-in"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <!-- Cabecera del Modal -->
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-xl text-primary animate-pulse">
                        <Settings2 class="w-5 h-5" />
                    </div>
                    <h2 id="modal-title" class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                        {editingRecord ? 'Editar Registro' : 'Registrar Actividad'}
                    </h2>
                </div>
                <button onclick={closeModal} aria-label="Cerrar modal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                    <X class="w-5 h-5 text-text-dim" />
                </button>
            </div>

            <!-- Formulario -->
            <form 
                use:enhance
                action={editingRecord ? '?/update' : '?/create'}
                method="POST" 
                class="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
            >
                {#if formError}
                    <div class="bg-error/10 text-error border border-error/20 p-3 rounded-xl flex items-center gap-2 text-xs font-bold" transition:slide>
                        <AlertCircle class="w-4 h-4 shrink-0" />
                        {formError}
                    </div>
                {/if}

                {#if editingRecord}
                    <input type="hidden" name="id" value={editingRecord.id_bitacora} />
                {/if}

                <!-- Fila 1: Fecha e Esfuerzo (Horas y Minutos) -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="space-y-1.5">
                        <label for="fecha" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1 flex items-center gap-1">
                            <Calendar class="w-3 h-3 text-primary" /> Fecha
                        </label>
                        <input 
                            id="fecha" 
                            type="date" 
                            bind:value={fecha} 
                            disabled 
                            class="input-compact h-11 w-full dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary text-sm text-slate-800 dark:text-white opacity-60 cursor-not-allowed" 
                        />
                        <input type="hidden" name="fecha" value={fecha} />
                    </div>

                    <div class="space-y-1.5">
                        <label for="horas" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1 flex items-center gap-1">
                            <Clock class="w-3 h-3 text-primary" /> Horas
                        </label>
                        <input 
                            id="horas" 
                            type="number" 
                            min="0" 
                            max="24"
                            name="horas" 
                            bind:value={inputHoras} 
                            required 
                            placeholder="0" 
                            class="input-compact h-11 w-full dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary text-sm text-slate-800 dark:text-white" 
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="minutos" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1 flex items-center gap-1">
                            <Clock class="w-3 h-3 text-primary" /> Minutos
                        </label>
                        <input 
                            id="minutos" 
                            type="number" 
                            min="0" 
                            max="59"
                            name="minutos" 
                            bind:value={inputMinutos} 
                            required 
                            placeholder="0" 
                            class="input-compact h-11 w-full dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary text-sm text-slate-800 dark:text-white" 
                        />
                    </div>
                </div>

                <!-- Campo: Categoría -->
                <div class="space-y-1.5">
                    <label for="id_categoria_bitacora" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1 flex items-center gap-1">
                        <Tag class="w-3 h-3 text-primary" /> Categoría *
                    </label>
                    <select 
                        id="id_categoria_bitacora" 
                        name="id_categoria_bitacora" 
                        bind:value={idCategoriaBitacora} 
                        required
                        class="input-compact h-11 w-full dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary text-sm text-slate-800 dark:text-white cursor-pointer" 
                    >
                        <option value="">-- Seleccionar Categoría --</option>
                        {#each data.categorias as cat}
                            <option value={cat.id_categoria_bitacora.toString()}>{cat.nombre}</option>
                        {/each}
                    </select>
                </div>

                <!-- Campo Fila 2: Título -->
                <div class="space-y-1.5">
                    <label for="titulo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1 flex items-center gap-1">
                        <FileText class="w-3 h-3 text-primary" /> Título de Actividad *
                    </label>
                    <input 
                        id="titulo" 
                        type="text" 
                        name="titulo" 
                        bind:value={titulo} 
                        required 
                        placeholder="Ej: Migración de base de datos de producción..." 
                        class="input-compact h-11 w-full" 
                    />
                </div>

                <!-- Campo Fila 3: Descripción -->
                <div class="space-y-1.5">
                    <label for="descripcion" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Descripción Detallada *</label>
                    <textarea 
                        id="descripcion" 
                        name="descripcion" 
                        bind:value={descripcion} 
                        required 
                        rows="5" 
                        placeholder="Redacta en detalle las tareas y resultados alcanzados..." 
                        class="input-compact w-full pt-2.5 resize-none"
                    ></textarea>
                </div>

                <!-- Botonera -->
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8">
                        {editingRecord ? 'Guardar Cambios' : 'Registrar Actividad'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    @reference "../../layout.css";

    /* Alinea verticalmente las celdas arriba para evitar desfases con textos multilínea */
    table tbody td {
        vertical-align: top;
    }

    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite alternate ease-in-out; }

    .animate-fade-in-up {
        animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: color-mix(in srgb, var(--color-primary, #4f46e5) 20%, transparent);
        border-radius: 9999px;
    }

    /* Estilos Premium de Impresión / PDF */
    @media print {
        @page {
            size: A4 landscape;
            margin: 1.2cm;
        }
        :global(body) {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        :global(aside), :global(header), .no-print, :global(#role-selector) {
            display: none !important;
        }
        :global(.lg\:pl-64) {
            padding-left: 0 !important;
        }
        .glass-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
        }
        
        /* Ajustes específicos de la tabla para impresión */
        .overflow-x-auto {
            overflow: visible !important;
        }
        table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 10px !important;
        }
        table th {
            background-color: #f8fafc !important;
            color: #334155 !important;
            border-bottom: 2px solid #cbd5e1 !important;
            font-size: 10px !important;
            padding: 10px 8px !important;
            text-align: left !important;
        }
        table td {
            border-bottom: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
            font-size: 11px !important;
            padding: 12px 8px !important;
            page-break-inside: avoid !important;
        }
        table tr {
            page-break-inside: avoid !important;
        }
        table tr:nth-child(even) td {
            background-color: #f8fafc !important;
        }

        /* Ocultar acciones en tabla al imprimir */
        table th:last-child,
        table td:last-child {
            display: none !important;
        }

        /* Forzar colores oscuros para texto e íconos en impresión para máxima legibilidad */
        .text-text-dim, .text-text-main, .dark\:text-dark-text-main, .dark\:text-dark-text-dim {
            color: #000000 !important;
        }
        .text-primary {
            color: #4f46e5 !important;
        }
        
        /* Badges de categorías */
        .bg-primary\/10 {
            background-color: #e0e7ff !important;
            border: 1px solid #c7d2fe !important;
            color: #4338ca !important;
        }
        
        /* Limitar el ancho de la descripción para que no rompa el diseño */
        .max-w-sm {
            max-width: 400px !important;
        }
        .line-clamp-2 {
            display: block !important;
            -webkit-line-clamp: unset !important;
        }
    }
</style>
