<script lang="ts">
    import { Users, Plus, Edit2, Trash2, Search, X, Check, Shield, MapPin, Mail, User as UserIcon, Lock, Activity, ChevronLeft, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data, form } = $props();
    let formError = $derived(form?.error);
    
    let searchQuery = $state('');
    let showModal = $state(false);
    let editingUser = $state<any>(null);

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(8);

    const filteredUsers = $derived(
        data.users.filter(u => 
            u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = $derived(Math.ceil(filteredUsers.length / itemsPerPage));
    const paginatedUsers = $derived(
        filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página cuando cambia la búsqueda
    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    const openCreate = () => {
        editingUser = null;
        showModal = true;
    };

    const openEdit = (user: any) => {
        editingUser = user;
        showModal = true;
    };

    let showPassword = $state(false);
    let showConfirmPassword = $state(false);

    const closeModal = () => {
        showModal = false;
        editingUser = null;
        showPassword = false;
        showConfirmPassword = false;
    };
</script>

<svelte:head>
    <title>Usuarios - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Users class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Administración</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Gestión de Usuarios</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Control de acceso y perfiles del sistema.</p>
        </div>

        <button 
            onclick={openCreate}
            class="btn-primary flex items-center gap-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Nuevo Usuario</span>
        </button>
    </header>

    <!-- Buscador -->
    <div class="relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Buscar por nombre, email o username..."
            aria-label="Buscar usuarios"
            class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de usuarios">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Identidad</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Rol / Permisos</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Sucursal</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Estado</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedUsers as user (user.id_usuario)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-5 py-3">
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{user.nombre}</span>
                                    <span class="text-[10px] text-text-dim dark:text-dark-text-dim font-medium italic">{user.email}</span>
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                                    <Shield class="w-3 h-3" />
                                    {user.rol?.rol || 'N/A'}
                                </span>
                            </td>
                            <td class="px-5 py-3">
                                <div class="flex items-center gap-1.5 text-[10px] font-medium text-text-dim dark:text-dark-text-dim">
                                    <MapPin class="w-3 h-3 opacity-50" />
                                    {user.sucursal?.nombre || 'Sede Central'}
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 rounded-full {user.estado ? 'bg-success' : 'bg-error'} shadow-sm"></div>
                                    <span class="text-[10px] font-bold uppercase tracking-tighter {user.estado ? 'text-success' : 'text-error'}">
                                        {user.estado ? 'Operativo' : 'Inactivo'}
                                    </span>
                                </div>
                            </td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button 
                                        onclick={() => openEdit(user)}
                                        aria-label={`Editar usuario ${user.nombre}`}
                                        class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <Edit2 class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                    <form 
                                        use:enhance={({ cancel }) => {
                                            if (!confirm('¿Eliminar permanentemente este usuario?')) return cancel();
                                        }} 
                                        action="?/delete" 
                                        method="POST" 
                                    >
                                        <input type="hidden" name="id" value={user.id_usuario} />
                                        <button 
                                            type="submit"
                                            aria-label={`Eliminar usuario ${user.nombre}`}
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}

                    {#if filteredUsers.length === 0}
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-text-dim italic text-sm">
                                No se encontraron usuarios en el registro maestro.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Footer con Paginación -->
        {#if totalPages > 1}
            <div class="px-6 py-4 bg-primary/5 border-t border-white/5 flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim">
                    Mostrando {paginatedUsers.length} de {filteredUsers.length} registros (Página {currentPage} de {totalPages})
                </span>
                <div class="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        aria-label="Página anterior"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronLeft class="w-4 h-4 aria-hidden=true" />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        aria-label="Página siguiente"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronRight class="w-4 h-4 aria-hidden=true" />
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Modal Premium -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <Activity class="w-5 h-5" />
                    </div>
                    <h2 id="modal-title" class="text-lg font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">
                        {editingUser ? 'Actualizar Registro' : 'Nuevo Registro Maestro'}
                    </h2>
                </div>
                <button onclick={closeModal} aria-label="Cerrar modal" class="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                    <X class="w-5 h-5 text-text-dim aria-hidden=true" />
                </button>
            </div>

            <form 
                use:enhance={() => {
                    return async ({ result, update }) => {
                        await update();
                        if (result.type === 'success') closeModal();
                    };
                }} 
                action={editingUser ? '?/update' : '?/create'} 
                method="POST" 
                class="p-8 space-y-6"
            >
                {#if formError}
                    <div role="alert" class="bg-error/10 text-error border border-error/20 p-3 rounded-lg flex items-center gap-2 text-xs font-bold">
                        <AlertCircle class="w-4 h-4 shrink-0 aria-hidden=true" />
                        {formError}
                    </div>
                {/if}

                {#if editingUser}
                    <input type="hidden" name="id" value={editingUser.id_usuario} />
                {/if}

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label for="nombre" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Nombre Completo</label>
                        <div class="relative">
                            <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="nombre" type="text" name="nombre" value={editingUser?.nombre || ''} required minlength="3" placeholder="Ej: Juan Pérez" class="input-compact w-full pl-10" aria-invalid={!!formError} />
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label for="username" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Username</label>
                        <div class="relative">
                            <Shield class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="username" type="text" name="username" value={editingUser?.username || ''} required minlength="3" placeholder="Ej: jperez" class="input-compact w-full pl-10" aria-invalid={!!formError} />
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label for="email" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Email Corporativo</label>
                        <div class="relative">
                            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="email" type="email" name="email" value={editingUser?.email || ''} required placeholder="correo@empresa.com" class="input-compact w-full pl-10" aria-invalid={!!formError} />
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label for="password" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">{editingUser ? 'Nueva Clave (Safe)' : 'Contraseña Maestro'}</label>
                        <div class="relative">
                            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="password" type={showPassword ? 'text' : 'password'} name="password" required={!editingUser} minlength="6" placeholder={editingUser ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'} class="input-compact w-full pl-10 pr-10" aria-invalid={!!formError} />
                            <button type="button" onclick={() => showPassword = !showPassword} class="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim/65 hover:text-primary transition-colors focus:outline-none" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                {#if showPassword}
                                    <EyeOff class="w-4 h-4" />
                                {:else}
                                    <Eye class="w-4 h-4" />
                                {/if}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label for="confirm_password" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">{editingUser ? 'Confirmar Nueva Clave' : 'Confirmar Contraseña'}</label>
                        <div class="relative">
                            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="confirm_password" type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" required={!editingUser} minlength="6" placeholder={editingUser ? 'Repite la nueva clave' : 'Repite la contraseña'} class="input-compact w-full pl-10 pr-10" aria-invalid={!!formError} />
                            <button type="button" onclick={() => showConfirmPassword = !showConfirmPassword} class="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim/65 hover:text-primary transition-colors focus:outline-none" aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                {#if showConfirmPassword}
                                    <EyeOff class="w-4 h-4" />
                                {:else}
                                    <Eye class="w-4 h-4" />
                                {/if}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label for="id_rol" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Rol Operativo</label>
                        <select id="id_rol" name="id_rol" required class="input-compact w-full appearance-none bg-no-repeat bg-[right_1rem_center]" aria-invalid={!!formError}>
                            <option value="" disabled selected={!editingUser}>Selecciona un rol...</option>
                            {#each data.roles as rol}
                                <option value={rol.id_rol} selected={editingUser?.id_rol === rol.id_rol}>{rol.rol}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label for="id_sucursal" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Sucursal</label>
                        <select id="id_sucursal" name="id_sucursal" required class="input-compact w-full appearance-none" aria-invalid={!!formError}>
                            <option value="" disabled selected={!editingUser?.id_sucursal}>Selecciona una sucursal...</option>
                            {#each data.branches as branch}
                                <option value={branch.id_sucursal} selected={editingUser?.id_sucursal === branch.id_sucursal}>{branch.nombre}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                {#if editingUser}
                    <div class="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="estado" value="true" checked={editingUser.estado} class="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary transition-all" />
                            <span class="text-xs font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight group-hover:text-primary transition-colors">Estado de Cuenta Activo</span>
                        </label>
                    </div>
                {/if}

                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

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
