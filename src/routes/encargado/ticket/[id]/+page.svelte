<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		Calendar,
		Monitor,
		Send,
		Paperclip,
		AlertCircle,
		Clock,
		CheckCircle2,
		HelpCircle,
		ChevronUp,
		Info,
		MessageSquare,
		Settings2
	} from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
	import { ticketViewState } from '$lib/states/ui.svelte';

	// Ref para el contenedor del chat para auto-scroll
	let chatContainer: HTMLElement;
	let isSubmitting = $state(false);
	let isInfoExpanded = $state(true);

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

	// Polling: Refrescar los datos en segundo plano cada 5 segundos
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
			case 'Abierto':
				return {
					icon: AlertCircle,
					bg: 'bg-blue-500/10 dark:bg-blue-500/20',
					text: 'text-blue-600 dark:text-blue-300',
					border: 'border-blue-500/20 dark:border-blue-500/30'
				};
			case 'En Progreso':
				return {
					icon: Clock,
					bg: 'bg-amber-500/10 dark:bg-amber-500/20',
					text: 'text-amber-600 dark:text-amber-300',
					border: 'border-amber-500/20 dark:border-amber-500/30'
				};
			case 'Resuelto':
				return {
					icon: CheckCircle2,
					bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
					text: 'text-emerald-600 dark:text-emerald-300',
					border: 'border-emerald-500/20 dark:border-emerald-500/30'
				};
			case 'Cerrado':
				return {
					icon: CheckCircle2,
					bg: 'bg-slate-500/10 dark:bg-slate-500/20',
					text: 'text-slate-600 dark:text-slate-300',
					border: 'border-slate-500/20 dark:border-slate-500/30'
				};
			default:
				return {
					icon: HelpCircle,
					bg: 'bg-gray-500/10 dark:bg-gray-500/20',
					text: 'text-gray-600 dark:text-gray-300',
					border: 'border-gray-500/20 dark:border-gray-500/30'
				};
		}
	};

	const status = $derived(getStatusStyles(ticket.estado?.nombre || ''));

	const formatDate = (date: Date | string | null) => {
		if (!date) return '';
		return new Date(date).toLocaleString('es-ES', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	let isClosed = $derived(ticket.estado?.nombre === 'Resuelto' || ticket.estado?.nombre === 'Cerrado');
	let canChat = $derived(!isClosed && !!ticket.id_usuario);
</script>


<svelte:head>
	<title>Ticket #{ticket.id_ticket} - TicketFlow TI</title>
</svelte:head>

<div class="flex flex-col overflow-hidden font-body-md transition-colors duration-300 h-full lg:h-[calc(100vh-160px)]">
	<!-- Header Navegación removido - Info ahora en Navbar -->


	<!-- Contenido Principal Split-Screen -->
	<div class="flex flex-col lg:flex-row lg:gap-8 h-full overflow-hidden">
		<!-- Mobile View Toggle (Eliminado, ahora controlado por MobileNav) -->

		<!-- PANEL IZQUIERDO: Detalles del Ticket -->
		<div
			class="custom-scrollbar flex-col gap-6 pr-2 lg:h-full lg:w-1/2 lg:overflow-y-auto lg:pb-6 {ticketViewState.activeTab ===
			'details'
				? 'flex w-full'
				: 'hidden lg:flex'}"
		>

			<!-- Tarjeta Info -->
			<div
				class="overflow-hidden lg:rounded-[24px] lg:border border-slate-200 bg-transparent lg:bg-white/70 lg:shadow-sm lg:backdrop-blur-xl lg:dark:border-slate-700/60 lg:dark:bg-slate-800/60 h-full flex flex-col"
			>
				<!-- Header con botón de plegado (Solo móvil) -->
				<div
					class="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-3 lg:hidden dark:border-slate-700/60 dark:bg-slate-900/30"
				>
					<span
						class="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase"
					>
						<Info class="h-3.5 w-3.5" /> Detalles del Ticket
					</span>
					<button
						onclick={() => (isInfoExpanded = !isInfoExpanded)}
						class="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
					>
						{#if isInfoExpanded}
							<ChevronUp class="h-4 w-4" />
						{:else}
							<ChevronDown class="h-4 w-4" />
						{/if}
					</button>
				</div>

				{#if isInfoExpanded}
					<div class="p-6">
						<h2 class="mb-4 text-xl font-bold">{ticket.titulo}</h2>

						<div class="flex flex-col gap-4">
							<div>
								<span
									class="mb-1 block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
									>Descripción</span
								>
								<p
									class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-700/50 dark:bg-slate-900/50"
								>
									{ticket.descripcion}
								</p>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div>
									<span
										class="mb-1 block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
										>Equipo Afectado</span
									>
									<div class="flex items-center gap-2 text-sm font-medium">
										<Monitor class="h-4 w-4 text-primary dark:text-blue-400" />
										<span class="truncate">{ticket.activo_ti?.catalogo?.nombre || 'General'}</span>
									</div>
								</div>
								<div>
									<span
										class="mb-1 block text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
										>Creado el</span
									>
									<div class="flex items-center gap-2 text-sm font-medium">
										<Calendar class="h-4 w-4 text-primary dark:text-blue-400" />
										<span>{formatDate(ticket.created_at)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			{#if isInfoExpanded}
				<!-- Galería de Adjuntos -->
				{#if ticket.adjuntos && ticket.adjuntos.length > 0}
					<div
						class="rounded-[24px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/60"
					>
						<h3 class="mb-4 flex items-center gap-2 text-sm font-bold">
							<Paperclip class="h-4 w-4 text-slate-500" />
							Imágenes Adjuntas ({ticket.adjuntos.length})
						</h3>
						<div class="grid grid-cols-2 gap-3">
							{#each ticket.adjuntos as adjunto}
								<a
									href={adjunto.imagen_url}
									target="_blank"
									rel="noopener noreferrer"
									class="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
								>
									<img
										src={adjunto.imagen_url}
										alt={adjunto.nombre}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
									/>
									<div
										class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<span class="text-xs font-semibold text-white">Ver Completa</span>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>

		<!-- PANEL DERECHO: Chat Interno -->
		<div
			class="flex flex-col lg:rounded-[24px] lg:border border-slate-200 bg-transparent lg:bg-white/70 lg:shadow-sm lg:backdrop-blur-xl lg:h-full lg:w-1/2 lg:dark:border-slate-700/60 lg:dark:bg-slate-800/60 {ticketViewState.activeTab ===
			'chat'
				? 'flex h-full w-full'
				: 'hidden lg:flex'}"
		>


			<!-- Cabecera Chat -->
			<div
				class="border-b border-slate-200 lg:bg-white/50 px-6 py-4 dark:border-slate-700/60 lg:dark:bg-slate-800/50 lg:rounded-t-[24px]"
			>
				<h3 class="text-sm font-bold">Canal de Comunicación</h3>
				<p class="text-xs text-slate-500 dark:text-slate-400">
					Conversación con el técnico asignado
				</p>
			</div>

			<!-- Área de Mensajes -->
			<div
				bind:this={chatContainer}
				class="custom-scrollbar flex flex-grow flex-col gap-4 overflow-y-auto bg-slate-50/50 p-6 dark:bg-slate-900/30"
			>
				{#if !ticket.id_usuario}
					<div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-pulse">
						<Clock class="w-5 h-5 text-amber-600 shrink-0" />
						<div class="flex flex-col">
							<p class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Esperando Técnico</p>
							<p class="text-[11px] text-amber-600 dark:text-amber-500/80">Tu solicitud está en espera. Podrás chatear cuando un técnico tome el ticket.</p>
						</div>
					</div>
				{/if}

				{#if ticket.comentarios.length === 0 && ticket.id_usuario}
					<div class="m-auto text-center opacity-50">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
						>
							<Send class="h-8 w-8 text-primary" />
						</div>
						<p class="text-sm">Aún no hay mensajes.</p>
						<p class="text-xs">Escribe el primer comentario abajo.</p>
					</div>
				{/if}

				{#each ticket.comentarios as comentario}
					{@const isMe = comentario.id_usuario === data.user.id}
					{@const senderName = isMe ? 'Tú' : comentario.usuario?.nombre || 'Usuario'}
					{@const senderRole =
						comentario.usuario?.rol?.cod_rol === 'TECHNICIAN' ? 'Técnico' : 'Encargado'}

					<div
						class="flex max-w-[85%] flex-col {isMe
							? 'items-end self-end'
							: 'items-start self-start'}"
					>
						<div class="mb-1 flex items-baseline gap-2 px-1">
							<span
								class="text-xs font-semibold {isMe
									? 'text-primary dark:text-blue-400'
									: 'text-slate-600 dark:text-slate-300'}">{senderName}</span
							>
							{#if !isMe}
								<span
									class="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-400"
									>{senderRole}</span
								>
							{/if}
							<span class="text-[10px] text-slate-400">{formatDate(comentario.created_at)}</span>
						</div>

						<div
							class="rounded-2xl px-4 py-2.5 text-sm shadow-sm
                            {isMe
								? 'rounded-tr-sm bg-primary text-white dark:bg-blue-600'
								: 'rounded-tl-sm border border-slate-200 bg-white text-slate-800 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200'}"
						>
							<p class="break-words whitespace-pre-wrap">{comentario.comentario}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Input Chat -->
			<div
				class="border-t border-slate-200 lg:bg-white/50 p-4 dark:border-slate-700/60 lg:dark:bg-slate-800/50 lg:rounded-b-[24px]"
			>
				<form
					method="POST"
					action="?/sendComment"
					class="flex gap-2"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update({ reset: true });
							isSubmitting = false;
							scrollToBottom();
						};
					}}
				>
					<input
						type="text"
						name="comentario"
						placeholder={!canChat ? (isClosed ? "Ticket finalizado - Chat cerrado" : "Chat bloqueado hasta que se asigne un técnico...") : "Escribe un mensaje al técnico..."}
						required
						autocomplete="off"
						class="h-12 flex-grow rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/30 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
						disabled={!canChat || isSubmitting}
					/>
					<button
						type="submit"
						disabled={!canChat || isSubmitting}
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
					>
						<Send class="-ml-0.5 h-5 w-5" />
					</button>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	/* Estilos para el scrollbar para que se vea premium */
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.3);
		border-radius: 10px;
	}
	:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(71, 85, 105, 0.5);
	}
</style>
