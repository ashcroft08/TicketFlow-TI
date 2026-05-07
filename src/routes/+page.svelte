<script lang="ts">
    import { User, Lock, ArrowRight } from 'lucide-svelte';
    import type { ActionData } from './$types';
    import logo from '$lib/assets/img/TicketFlow_logo.webp';

    let { form }: { form: ActionData } = $props();

    // Estado para animar los iconos cuando el input tiene el foco
    let focusedField = $state<string | null>(null);
</script>

<svelte:head>
    <title>TicketFlow TI - Iniciar Sesión</title>
</svelte:head>

<!-- Contenedor principal con fondo premium (gradiente sutil animado) -->
<div class="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden font-body-md text-on-background selection:bg-primary/20 selection:text-primary">
    
    <!-- Elementos decorativos de fondo (Mesh Gradient / Blobs) -->
    <div class="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div class="absolute top-0 -right-4 w-96 h-96 bg-surface-dim/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-96 h-96 bg-secondary-fixed/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

    <!-- Tarjeta de Login (Glassmorphism / Premium Card) -->
    <main class="relative w-full max-w-[420px] px-4 sm:px-6 z-10 animate-fade-in-up">
        <div class="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[24px] p-8 sm:p-10 flex flex-col gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
            
            <header class="flex flex-col items-center gap-2 text-center">
                <div class="flex items-center justify-center text-primary mb-2 transform transition-transform duration-500 hover:scale-105">
                    <img src={logo} alt="TicketFlow Logo" class="h-14 sm:h-16 object-contain drop-shadow-sm" />
                </div>
                <div>
                    <h2 class="font-h2 text-xl sm:text-2xl text-on-surface font-bold tracking-tight">Bienvenido de nuevo</h2>
                    <p class="text-xs sm:text-sm text-on-surface-variant mt-1">Ingresa tus credenciales para continuar</p>
                </div>
            </header>

            {#if form?.error}
                <div class="bg-error/10 text-error border border-error/20 p-3.5 rounded-xl text-center text-sm font-medium animate-shake flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    {form.error}
                </div>
            {/if}
            
            {#if form?.success}
                <div class="bg-secondary/10 text-secondary border border-secondary/20 p-3.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    {form.message}
                </div>
            {/if}

            <form method="POST" class="flex flex-col gap-6">
                <!-- Campo Usuario -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider transition-colors group-focus-within:text-primary" for="username">Usuario o Correo</label>
                    <div class="relative">
                        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors duration-200 {focusedField === 'username' ? 'text-primary' : 'text-outline/70'}">
                            <User size={18} strokeWidth={focusedField === 'username' ? 2.5 : 2} />
                        </div>
                        <input
                            onfocus={() => focusedField = 'username'}
                            onblur={() => focusedField = null}
                            class="w-full h-12 pl-11 pr-4 bg-white/50 border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-outline/40 transition-all duration-200 hover:bg-white"
                            id="username" name="username" placeholder="ej: jdoe o juan@correo.com" required type="text" value={form?.username ?? ''} />
                    </div>
                </div>

                <!-- Campo Contraseña -->
                <div class="flex flex-col gap-2 group">
                    <div class="flex items-center justify-between">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider transition-colors group-focus-within:text-primary" for="password">Contraseña</label>
                        <a class="text-xs font-semibold text-primary hover:text-primary-container transition-colors hover:underline"
                            href="/forgot-password">¿Olvidaste tu clave?</a>
                    </div>
                    <div class="relative">
                        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors duration-200 {focusedField === 'password' ? 'text-primary' : 'text-outline/70'}">
                            <Lock size={18} strokeWidth={focusedField === 'password' ? 2.5 : 2} />
                        </div>
                        <input
                            onfocus={() => focusedField = 'password'}
                            onblur={() => focusedField = null}
                            class="w-full h-12 pl-11 pr-4 bg-white/50 border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-outline/40 transition-all duration-200 hover:bg-white"
                            id="password" name="password" placeholder="••••••••" required type="password" />
                    </div>
                </div>

                <!-- Botón -->
                <button
                    class="mt-2 h-12 w-full bg-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] active:translate-y-0 relative overflow-hidden group"
                    type="submit">
                    <!-- Efecto de brillo en hover -->
                    <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight size={18} class="transition-transform group-hover:translate-x-1" />
                </button>
            </form>
        </div>
    </main>
</div>

<style>
    /* Animaciones modernas */
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
        animation: blob 10s infinite alternate ease-in-out;
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    .animation-delay-4000 {
        animation-delay: 4s;
    }
    @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake {
        animation: shake 0.4s ease-in-out;
    }
    @keyframes shimmer {
        100% { transform: translateX(100%); }
    }
    .animate-shimmer {
        animation: shimmer 2s infinite;
    }
</style>
