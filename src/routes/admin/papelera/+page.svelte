<script lang="ts">
	import { offlineEnhance } from '$lib/client/offlineEnhance';
    import { Trash2, RotateCcw, Users, MapPin, Tags, Monitor, Search, AlertCircle, PackageOpen } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data } = $props();

    let activeTab = $state<'users' | 'branches' | 'categories' | 'assets'>('users');
    let searchQuery = $state('');

    const tabs = [
        { id: 'users' as const, label: 'Usuarios', icon: Users, dataKey: 'users' },
        { id: 'branches' as const, label: 'Sucursales', icon: MapPin, dataKey: 'branches' },
        { id: 'categories' as const, label: 'Categorías', icon: Tags, dataKey: 'categories' },
        { id: 'assets' as const, label: 'Activos TI', icon: Monitor, dataKey: 'assets' },
    ] as const;

    const totalDeleted = $derived(
        data.deleted.users.length + 
        data.deleted.branches.length + 
        data.deleted.categories.length + 
        data.deleted.assets.length
    );

    const getCount = (key: string) => {
        return (data.deleted as any)[key]?.length || 0;
    };

    // Filtrado por búsqueda
    const filteredUsers = $derived(
        data.deleted.users.filter(u =>
            u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const filteredBranches = $derived(
        data.deleted.branches.filter(b =>
            b.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const filteredCategories = $derived(
        data.deleted.categories.filter(c =>
            c.nombre_tecnico.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const filteredAssets = $derived(
        data.deleted.assets.filter(a =>
            a.catalogo?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.numero_serie?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.codigo_inventario?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const formatDate = (date: string | Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-CO', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };
</script>

<svelte:head>
    <title>Papelera de Reciclaje - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header>
        <div class="flex items-center gap-2 mb-1">
            <Trash2 class="w-4 h-4 text-primary" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Sistema</span>
        </div>
        <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Papelera de Reciclaje</h1>
        <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">
            {totalDeleted} {totalDeleted === 1 ? 'registro eliminado' : 'registros eliminados'} en total. Restaura lo que necesites.
        </p>
    </header>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Secciones de papelera">
        {#each tabs as tab}
            <button
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onclick={() => { activeTab = tab.id; searchQuery = ''; }}
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'glass-card text-text-dim dark:text-dark-text-dim hover:text-primary'}"
            >
                <tab.icon class="w-3.5 h-3.5" />
                {tab.label}
                {#if getCount(tab.dataKey) > 0}
                    <span class="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black {activeTab === tab.id ? 'bg-white/20' : 'bg-error/10 text-error'}">
                        {getCount(tab.dataKey)}
                    </span>
                {/if}
            </button>
        {/each}
    </div>

    <!-- Buscador -->
    <div class="relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Buscar en registros eliminados..."
            aria-label="Buscar en papelera"
            class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
    </div>

    <!-- Contenido por Tab -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <!-- USUARIOS -->
        {#if activeTab === 'users'}
            <div role="tabpanel" id="panel-users" tabindex="0" aria-label="Usuarios eliminados">
                {#if filteredUsers.length === 0}
                    <div class="p-16 text-center">
                        <PackageOpen class="w-12 h-12 text-text-dim/30 mx-auto mb-4 aria-hidden=true" />
                        <p class="text-sm text-text-dim dark:text-dark-text-dim font-medium italic">No hay usuarios eliminados</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-primary/5 border-b border-white/5">
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Identidad</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Rol</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Sucursal</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Eliminado el</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acción</th>
                                </tr>
                            </thead>
                        <tbody class="divide-y divide-white/5">
                            {#each filteredUsers as user (user.id_usuario)}
                                <tr class="group hover:bg-primary/5 transition-colors" transition:fade>
                                    <td class="px-5 py-3">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{user.nombre}</span>
                                            <span class="text-[10px] text-text-dim dark:text-dark-text-dim font-medium italic">{user.email}</span>
                                        </div>
                                    </td>
                                    <td class="px-5 py-3">
                                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                                            {user.rol?.rol || 'N/A'}
                                        </span>
                                    </td>
                                    <td class="px-5 py-3">
                                        <span class="text-[10px] text-text-dim font-medium">{user.sucursal?.nombre || '—'}</span>
                                    </td>
                                    <td class="px-5 py-3">
                                        <span class="text-[10px] text-text-dim font-medium">{formatDate(user.deleted_at)}</span>
                                    </td>
                                    <td class="px-5 py-3 text-right">
                                        <form use:offlineEnhance={() => {
                                            return async ({ update }) => { await update(); };
                                        }} action="?/restoreUser" method="POST">
                                            <input type="hidden" name="id" value={user.id_usuario} />
                                            <button type="submit" aria-label={`Restaurar usuario ${user.nombre}`} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-all text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-success">
                                                <RotateCcw class="w-3.5 h-3.5 aria-hidden=true" />
                                                Restaurar
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
            </div>
        {/if}

        <!-- SUCURSALES -->
        {#if activeTab === 'branches'}
            <div role="tabpanel" id="panel-branches" tabindex="0" aria-label="Sucursales eliminadas">
                {#if filteredBranches.length === 0}
                    <div class="p-16 text-center">
                        <PackageOpen class="w-12 h-12 text-text-dim/30 mx-auto mb-4 aria-hidden=true" />
                        <p class="text-sm text-text-dim dark:text-dark-text-dim font-medium italic">No hay sucursales eliminadas</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-primary/5 border-b border-white/5">
                                    <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Nombre de Sede</th>
                                    <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Eliminada el</th>
                                    <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acción</th>
                                </tr>
                            </thead>
                        <tbody class="divide-y divide-white/5">
                            {#each filteredBranches as branch (branch.id_sucursal)}
                                <tr class="group hover:bg-primary/5 transition-colors" transition:fade>
                                    <td class="px-6 py-3">
                                        <span class="text-sm font-bold text-text-main dark:text-dark-text-main">{branch.nombre}</span>
                                    </td>
                                    <td class="px-6 py-3">
                                        <span class="text-[10px] text-text-dim font-medium">{formatDate(branch.deleted_at)}</span>
                                    </td>
                                    <td class="px-6 py-3 text-right">
                                        <form use:offlineEnhance={() => {
                                            return async ({ update }) => { await update(); };
                                        }} action="?/restoreBranch" method="POST">
                                            <input type="hidden" name="id" value={branch.id_sucursal} />
                                            <button type="submit" aria-label={`Restaurar sucursal ${branch.nombre}`} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-all text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-success">
                                                <RotateCcw class="w-3.5 h-3.5 aria-hidden=true" />
                                                Restaurar
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
            </div>
        {/if}

        <!-- CATEGORÍAS -->
        {#if activeTab === 'categories'}
            <div role="tabpanel" id="panel-categories" tabindex="0" aria-label="Categorías eliminadas">
                {#if filteredCategories.length === 0}
                    <div class="p-16 text-center">
                        <PackageOpen class="w-12 h-12 text-text-dim/30 mx-auto mb-4 aria-hidden=true" />
                        <p class="text-sm text-text-dim dark:text-dark-text-dim font-medium italic">No hay categorías eliminadas</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-primary/5 border-b border-white/5">
                                    <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Nombre Técnico</th>
                                    <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Eliminada el</th>
                                    <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acción</th>
                                </tr>
                            </thead>
                        <tbody class="divide-y divide-white/5">
                            {#each filteredCategories as cat (cat.id_categoria)}
                                <tr class="group hover:bg-primary/5 transition-colors" transition:fade>
                                    <td class="px-6 py-3">
                                        <span class="text-sm font-bold text-text-main dark:text-dark-text-main">{cat.nombre_tecnico}</span>
                                    </td>
                                    <td class="px-6 py-3">
                                        <span class="text-[10px] text-text-dim font-medium">{formatDate(cat.deleted_at)}</span>
                                    </td>
                                    <td class="px-6 py-3 text-right">
                                        <form use:offlineEnhance={() => {
                                            return async ({ update }) => { await update(); };
                                        }} action="?/restoreCategory" method="POST">
                                            <input type="hidden" name="id" value={cat.id_categoria} />
                                            <button type="submit" aria-label={`Restaurar categoría ${cat.nombre_tecnico}`} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-all text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-success">
                                                <RotateCcw class="w-3.5 h-3.5 aria-hidden=true" />
                                                Restaurar
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
            </div>
        {/if}

        <!-- ACTIVOS TI -->
        {#if activeTab === 'assets'}
            <div role="tabpanel" id="panel-assets" tabindex="0" aria-label="Activos eliminados">
                {#if filteredAssets.length === 0}
                    <div class="p-16 text-center">
                        <PackageOpen class="w-12 h-12 text-text-dim/30 mx-auto mb-4 aria-hidden=true" />
                        <p class="text-sm text-text-dim dark:text-dark-text-dim font-medium italic">No hay activos eliminados</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-primary/5 border-b border-white/5">
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Equipo</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Identificación</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Ubicación</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Eliminado el</th>
                                    <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acción</th>
                                </tr>
                            </thead>
                        <tbody class="divide-y divide-white/5">
                            {#each filteredAssets as asset (asset.id_activo)}
                                <tr class="group hover:bg-primary/5 transition-colors" transition:fade>
                                    <td class="px-5 py-3">
                                        <div>
                                            <p class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{asset.catalogo?.nombre}</p>
                                            <p class="text-[9px] uppercase tracking-widest text-primary font-bold">{asset.catalogo?.tipo?.tipo}</p>
                                        </div>
                                    </td>
                                    <td class="px-5 py-3">
                                        <div class="text-[10px] font-medium text-text-main dark:text-dark-text-main">{asset.numero_serie || 'S/N'}</div>
                                        <div class="text-[9px] text-text-dim font-bold uppercase">{asset.codigo_inventario || 'No Cod.'}</div>
                                    </td>
                                    <td class="px-5 py-3">
                                        <span class="text-[10px] text-text-dim font-medium">{asset.sucursal?.nombre || '—'}</span>
                                    </td>
                                    <td class="px-5 py-3">
                                        <span class="text-[10px] text-text-dim font-medium">{formatDate(asset.deleted_at)}</span>
                                    </td>
                                    <td class="px-5 py-3 text-right">
                                        <form use:offlineEnhance={() => {
                                            return async ({ update }) => { await update(); };
                                        }} action="?/restoreAsset" method="POST">
                                            <input type="hidden" name="id" value={asset.id_activo} />
                                            <button type="submit" aria-label={`Restaurar activo ${asset.catalogo?.nombre}`} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-all text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-success">
                                                <RotateCcw class="w-3.5 h-3.5 aria-hidden=true" />
                                                Restaurar
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    @reference "../../layout.css";

    .animate-fade-in-up {
        animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
