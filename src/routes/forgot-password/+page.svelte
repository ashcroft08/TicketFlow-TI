<script lang="ts">
    import { User, ArrowLeft, Send } from 'lucide-svelte';
    import type { ActionData } from './$types';
    import logoClaro from '$lib/assets/img/TicketFlow_logo_modo_claro.webp';
    import logoOscuro from '$lib/assets/img/TicketFlow_logo_modo_oscuro.webp';

    let { form }: { form: ActionData } = $props();
    let loading = $state(false);
    let focusedField = $state<string | null>(null);
</script>

<svelte:head>
    <title>TicketFlow TI - Recuperar Contraseña</title>
</svelte:head>

<!-- Contenedor principal: Split Screen en desktop, Full Screen en móvil -->
<div class="relative h-[100dvh] w-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden font-body-md selection:bg-primary/20 selection:text-primary">
    
    <!-- LADO IZQUIERDO: Visual / Branding (Solo Desktop) -->
    <div class="hidden lg:flex lg:w-[45%] xl:w-[55%] relative overflow-hidden bg-slate-900 h-screen sticky top-0">
        <!-- Mesh Gradient dinámico con CSS -->
        <div class="absolute inset-0 opacity-40">
            <div class="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600 blur-[120px] animate-blob"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600 blur-[120px] animate-blob animation-delay-2000"></div>
            <div class="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-primary blur-[120px] animate-blob animation-delay-4000"></div>
        </div>
        
        <!-- Overlay Gradiente -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/40 via-slate-900/80 to-slate-900"></div>
        
        <!-- Contenido de Branding -->
        <div class="relative z-10 w-full h-full flex flex-col justify-center p-16 xl:p-24">
            <div class="animate-fade-in-up mb-12">
                <img src={logoOscuro} alt="TicketFlow Logo" class="h-24 xl:h-32 object-contain drop-shadow-2xl" />
            </div>
            
            <div class="animate-fade-in-up delay-150">
                <h1 class="text-5xl xl:text-7xl font-bold text-white leading-tight mb-8">
                    Recupera tu<br/>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                        aceso.
                    </span>
                </h1>
                <p class="text-xl text-slate-300 max-w-xl leading-relaxed opacity-90">
                    No te preocupes, sucede. Ingresa tus datos y te ayudaremos a volver al sistema en cuestión de minutos.
                </p>
            </div>
        </div>
    </div>

    <!-- LADO DERECHO: Formulario -->
    <main class="flex-grow flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto custom-scrollbar h-full">
        <!-- Contenedor para Blobs (Evita scroll horizontal) -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="lg:hidden absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div class="lg:hidden absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div class="w-full max-w-[420px] animate-fade-in">
            <!-- Header Móvil (Logo) -->
            <div class="flex flex-col items-center mb-8 lg:items-start lg:mb-12">
                <div class="mb-6 transform transition-all duration-500 hover:scale-105 lg:hidden">
                    <img src={logoClaro} alt="TicketFlow Logo" class="h-16 object-contain dark:hidden" />
                    <img src={logoOscuro} alt="TicketFlow Logo" class="h-16 object-contain hidden dark:block" />
                </div>
                <h2 class="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Recuperar Clave</h2>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-center lg:text-left">
                    {form?.success ? '¡Enlace enviado!' : 'Enviaremos un enlace de recuperación a tu correo.'}
                </p>
            </div>

            {#if form?.error}
                <div class="mb-6 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-4 rounded-2xl text-sm font-medium animate-shake flex items-center gap-3">
                    <div class="p-2 bg-red-500/20 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    {form.error}
                </div>
            {/if}

            {#if form?.success}
                <div class="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-6 rounded-2xl text-center text-sm font-medium flex flex-col items-center gap-4 animate-fade-in">
                    <div class="p-3 bg-green-500/20 rounded-full">
                        <Send size={24} />
                    </div>
                    <p>{form.message}</p>
                    <a href="/" class="mt-2 w-full h-12 bg-slate-900 dark:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:bg-black dark:hover:bg-green-500">
                        <ArrowLeft size={18} /> Volver al Login
                    </a>
                </div>
            {:else}
                <form method="POST" class="flex flex-col gap-6" onsubmit={() => loading = true}>
                    <div class="flex flex-col gap-2 group">
                        <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1 transition-colors group-focus-within:text-primary dark:group-focus-within:text-blue-400" for="identifier">Usuario o Correo</label>
                        <div class="relative">
                            <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors duration-200 {focusedField === 'identifier' ? 'text-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}">
                                <User size={20} strokeWidth={focusedField === 'identifier' ? 2.5 : 2} />
                            </div>
                            <input
                                onfocus={() => focusedField = 'identifier'}
                                onblur={() => focusedField = null}
                                class="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-blue-500/10 focus:border-primary dark:focus:border-blue-500 text-[15px] text-slate-800 dark:text-white placeholder:text-slate-400 transition-all duration-300 shadow-sm"
                                id="identifier" name="identifier" placeholder="ej: jdoe o juan@correo.com" required type="text" aria-invalid={!!form?.error} />
                        </div>
                    </div>

                    <button
                        class="mt-4 h-14 w-full bg-slate-900 dark:bg-blue-600 text-white font-bold text-[15px] rounded-2xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-blue-500 shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 group"
                        type="submit" disabled={loading}>
                        <Send size={20} class={loading ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'} />
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>

                    <a href="/" class="text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1">
                        <ArrowLeft size={16} /> Cancelar y volver
                    </a>
                </form>
            {/if}

            <footer class="mt-12 text-center">
                <p class="text-xs text-slate-400 dark:text-slate-600">
                    &copy; {new Date().getFullYear()} TicketFlow TI. Soporte TI Simplificado.
                </p>
            </footer>
        </div>
    </main>
</div>

<style>
    :global(body, html) {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden !important;
    }

    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
    
    @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 1s ease-out forwards; }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.4s ease-in-out; }

    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.2); border-radius: 10px; }
</style>
