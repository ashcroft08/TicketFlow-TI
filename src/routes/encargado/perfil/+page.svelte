<script lang="ts">
    import { User, Mail, Lock, Shield, Save, CheckCircle2, AlertCircle, MapPin, Briefcase, Activity, Camera, LogOut } from 'lucide-svelte';
    import { enhance } from '$app/forms';
    import { fade, slide } from 'svelte/transition';

    let { data, form } = $props();
    let loading = $state(false);
</script>

<svelte:head>
    <title>Perfil - TicketFlow TI</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
    <!-- Header removido - Info ahora en Navbar -->


    {#if form?.success}
        <div 
            class="p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 text-success"
            transition:slide
        >
            <CheckCircle2 class="w-4 h-4" />
            <p class="text-[11px] font-bold uppercase tracking-tight">{form.message}</p>
        </div>
    {/if}

    {#if form?.error}
        <div 
            class="p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error"
            transition:slide
        >
            <AlertCircle class="w-4 h-4" />
            <p class="text-[11px] font-bold uppercase tracking-tight">{form.error}</p>
        </div>
    {/if}

    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Tarjeta de Identidad (Izquierda) -->
        <div class="space-y-4">
            <div class="glass-card rounded-lg p-6 text-center relative overflow-hidden group">
                <!-- Efecto de fondo sutil -->
                <div class="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
                
                <div class="relative inline-block mb-4">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary/20 ring-4 ring-white/10">
                        {data.profile.nombre[0]}
                    </div>
                    <div class="absolute bottom-0 right-0 w-5 h-5 bg-success border-2 border-white dark:border-dark-bg-main rounded-full shadow-lg"></div>
                </div>
                
                <h3 class="text-lg font-bold text-text-main dark:text-dark-text-main tracking-tight leading-none mb-1">{data.profile.nombre}</h3>
                <p class="text-[10px] font-bold text-text-dim uppercase tracking-widest">@{data.profile.username}</p>
                
                <div class="mt-6 pt-6 border-t border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-left">
                        <div class="p-2 bg-primary/5 rounded-md text-primary">
                            <Briefcase class="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p class="text-[8px] font-bold text-text-dim uppercase tracking-widest leading-none mb-0.5">Rango Operativo</p>
                            <p class="text-xs font-bold text-text-main dark:text-dark-text-main">{data.profile.rol}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 text-left">
                        <div class="p-2 bg-primary/5 rounded-md text-primary">
                            <MapPin class="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p class="text-[8px] font-bold text-text-dim uppercase tracking-widest leading-none mb-0.5">Sede Asignada</p>
                            <p class="text-xs font-bold text-text-main dark:text-dark-text-main">{data.profile.sucursal || 'General'}</p>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex flex-col gap-3">
                    <span class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-[9px] font-bold uppercase tracking-widest text-success border border-success/20">
                        <Activity class="w-3 h-3" />
                        Sesión Verificada
                    </span>

                    <form action="/?/logout" method="POST" use:enhance class="w-full lg:hidden">
                        <button 
                            type="submit"
                            class="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-2 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest border border-red-500/10 hover:border-red-500/30"
                        >
                            <LogOut class="w-3.5 h-3.5" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>

        </div>

        <!-- Editor de Datos (Derecha) -->
        <div class="lg:col-span-2">
            <form 
                action="?/updateProfile" 
                method="POST" 
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        loading = false;
                        await update();
                    };
                }}
                class="glass-card rounded-lg p-8 space-y-6"
            >
                <div class="flex items-center gap-2 mb-2 border-b border-white/5 pb-4">
                    <Activity class="w-4 h-4 text-primary" />
                    <h4 class="text-sm font-bold text-text-main dark:text-dark-text-main uppercase tracking-widest">Ajustes Generales</h4>
                </div>

                <div class="grid sm:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label for="nombre" class="text-[10px] font-bold text-text-dim uppercase tracking-widest px-1">Nombre Completo</label>
                        <div class="relative">
                            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim opacity-50" />
                            <input type="text" id="nombre" name="nombre" value={data.profile.nombre} required class="input-compact w-full pl-10" />
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label for="email" class="text-[10px] font-bold text-text-dim uppercase tracking-widest px-1">Email de Contacto</label>
                        <div class="relative">
                            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim opacity-50" />
                            <input type="email" id="email" name="email" value={data.profile.email} required class="input-compact w-full pl-10" />
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-primary/5 rounded-lg border border-primary/10 space-y-4">
                    <div class="flex items-center gap-3">
                        <Lock class="w-4 h-4 text-primary" />
                        <h4 class="text-xs font-bold text-text-main dark:text-dark-text-main uppercase tracking-widest">Protección de Cuenta</h4>
                    </div>
                    <div class="space-y-1.5">
                        <label for="password" class="text-[10px] font-bold text-text-dim uppercase tracking-widest px-1">Actualizar Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Ingrese nueva clave si desea cambiarla..."
                            class="input-compact w-full"
                        />
                        <p class="text-[9px] text-text-dim italic px-1 font-medium">* Se requiere un mínimo de 6 caracteres para mayor seguridad.</p>
                    </div>
                </div>

                <div class="flex justify-end pt-4 gap-3">
                    <button 
                        type="submit" 
                        disabled={loading}
                        class="btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
                    >
                        {#if loading}
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span class="text-xs uppercase tracking-widest">Sincronizando...</span>
                        {:else}
                            <Save class="w-4 h-4" />
                            <span class="text-xs uppercase tracking-widest">Guardar Cambios</span>
                        {/if}
                    </button>
                </div>
            </form>
        </div>
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
