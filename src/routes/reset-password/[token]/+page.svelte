<script lang="ts">
    import { Lock, ArrowLeft, CheckCircle } from 'lucide-svelte';
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
    let loading = $state(false);
</script>

<svelte:head>
    <title>TicketFlow TI - Establecer Nueva Contraseña</title>
</svelte:head>

<div class="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden font-body-md text-on-background">
    
    <!-- Elementos decorativos de fondo -->
    <div class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div class="absolute -bottom-8 left-20 w-96 h-96 bg-secondary-fixed/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>

    <main class="relative w-full max-w-[420px] px-4 sm:px-6 z-10 animate-fade-in-up">
        <div class="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[24px] p-8 sm:p-10 flex flex-col gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            
            <header class="flex flex-col items-center gap-2 text-center">
                <div class="flex items-center justify-center text-primary mb-2">
                     <div class="bg-primary/10 p-4 rounded-full">
                        <Lock size={32} />
                     </div>
                </div>
                <div>
                    <h2 class="font-h2 text-xl sm:text-2xl text-on-surface font-bold tracking-tight">Nueva Contraseña</h2>
                    <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Ingresa tu nueva contraseña para el sistema</p>
                </div>
            </header>

            {#if form?.error}
                <div class="bg-error/10 text-error border border-error/20 p-3.5 rounded-xl text-center text-sm font-medium animate-shake">
                    {form.error}
                </div>
            {/if}
            
            {#if form?.success}
                <div class="flex flex-col items-center gap-4 text-center">
                    <CheckCircle size={48} class="text-secondary" />
                    <div class="bg-secondary/10 text-secondary border border-secondary/20 p-3.5 rounded-xl text-sm font-medium">
                        {form.message}
                    </div>
                    <a href="/" class="mt-2 w-full h-12 bg-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                        Ir al Iniciar Sesión
                    </a>
                </div>
            {:else}
                <form method="POST" class="flex flex-col gap-6" onsubmit={() => loading = true}>
                    <div class="flex flex-col gap-2 group">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" for="password">Nueva Contraseña</label>
                        <div class="relative">
                            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-outline/70">
                                <Lock size={18} />
                            </div>
                            <input
                                class="w-full h-12 pl-11 pr-4 bg-white/50 border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface"
                                id="password" name="password" placeholder="••••••••" required type="password" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 group">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" for="confirmPassword">Confirmar Contraseña</label>
                        <div class="relative">
                            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-outline/70">
                                <Lock size={18} />
                            </div>
                            <input
                                class="w-full h-12 pl-11 pr-4 bg-white/50 border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface"
                                id="confirmPassword" name="confirmPassword" placeholder="••••••••" required type="password" />
                        </div>
                    </div>

                    <button
                        class="mt-2 h-12 w-full bg-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                        type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Restablecer Contraseña'}
                    </button>
                </form>
            {/if}
        </div>
    </main>
</div>

<style>
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
    @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.4s ease-in-out; }
</style>
