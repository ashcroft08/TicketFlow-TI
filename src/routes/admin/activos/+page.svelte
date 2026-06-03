<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Monitor, Plus, Edit2, Trash2, Eye, Search, X, Check, MapPin, User as UserIcon, Tag, Hash, Calendar, Info, Activity, ChevronLeft, ChevronRight, Scan } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success((form as any).message || '¡Activo de inventario guardado correctamente!');
            } else if (form.error) {
                toast.error((form as any).error);
            }
        }
    });
    
    let searchQuery = $state('');
    let showModal = $state(false);
    let editingAsset = $state<any>(null);

    // --- Configuración del escáner de código de barras ---
    let showScanModal = $state(false);
    let html5QrCodeScanner: any = null;
    let cameraDevices = $state<any[]>([]);
    let selectedDeviceId = $state('');
    let isScannerRunning = $state(false);
    let Html5Qrcode: any;
    let Html5QrcodeFormats: any;

    onMount(async () => {
        const module = await import('html5-qrcode');
        Html5Qrcode = module.Html5Qrcode;
        Html5QrcodeFormats = module.Html5QrcodeSupportedFormats;
    });

    const startScanner = async () => {
        if (!Html5Qrcode) {
            toast.error('El módulo de escaneo aún no se ha cargado.');
            return;
        }
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                cameraDevices = devices;
                const backCamera = devices.find((device: any) => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('trasera') || 
                    device.label.toLowerCase().includes('environment')
                );
                selectedDeviceId = backCamera ? backCamera.id : devices[0].id;
                
                showScanModal = true;
                setTimeout(() => {
                    initScannerInstance();
                }, 100);
            } else {
                toast.error('No se encontraron cámaras disponibles en este dispositivo.');
            }
        } catch (err: any) {
            console.error(err);
            toast.error('Error al acceder a la cámara. Asegúrate de dar los permisos correspondientes.');
        }
    };

    const initScannerInstance = () => {
        if (html5QrCodeScanner) {
            try {
                html5QrCodeScanner.clear();
            } catch (e) {}
        }

        // Restringir formatos soportados para optimizar el rendimiento y velocidad de escaneo
        const supportedFormats = Html5QrcodeFormats ? [
            Html5QrcodeFormats.CODE_128,
            Html5QrcodeFormats.CODE_39,
            Html5QrcodeFormats.CODE_93,
            Html5QrcodeFormats.ITF,
            Html5QrcodeFormats.CODABAR,
            Html5QrcodeFormats.EAN_13,
            Html5QrcodeFormats.EAN_8,
            Html5QrcodeFormats.UPC_A,
            Html5QrcodeFormats.UPC_E,
            Html5QrcodeFormats.QR_CODE
        ] : [];

        html5QrCodeScanner = new Html5Qrcode("reader", {
            formatsToSupport: supportedFormats
        });

        html5QrCodeScanner.start(
            selectedDeviceId,
            {
                fps: 30, // Máxima tasa de fotogramas para detección instantánea
                aspectRatio: 1.777778, // Relación de aspecto panorámica 16:9 para capturar todo el ancho
                videoConstraints: {
                    facingMode: "environment",
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 }
                }
            },
            (decodedText: string) => {
                numeroSerie = decodedText;
                toast.success('¡Código escaneado correctamente!');
                
                try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                } catch (e) {}

                closeScanner();
            },
            (errorMessage: string) => {}
        ).then(() => {
            isScannerRunning = true;
        }).catch((err: any) => {
            console.error("No se pudo iniciar el escáner: ", err);
            toast.error("Error al iniciar la cámara.");
        });
    };

    const handleCameraChange = () => {
        if (isScannerRunning && html5QrCodeScanner) {
            html5QrCodeScanner.stop().then(() => {
                initScannerInstance();
            });
        }
    };

    const closeScanner = () => {
        showScanModal = false;
        isScannerRunning = false;
        if (html5QrCodeScanner) {
            try {
                html5QrCodeScanner.stop().then(() => {
                    html5QrCodeScanner.clear();
                    html5QrCodeScanner = null;
                }).catch((e: any) => {
                    console.error("Error deteniendo escáner:", e);
                    html5QrCodeScanner = null;
                });
            } catch (e) {
                html5QrCodeScanner = null;
            }
        }
    };

    onDestroy(() => {
        if (html5QrCodeScanner) {
            try {
                html5QrCodeScanner.stop().catch(() => {});
            } catch(e) {}
        }
    });

    // Historial directo (Icono Ojo)
    let showHistoryModal = $state(false);
    let historyAsset = $state<any>(null);

    const openHistory = (asset: any) => {
        historyAsset = asset;
        showHistoryModal = true;
    };

    const closeHistory = () => {
        showHistoryModal = false;
        historyAsset = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (showModal) closeModal();
            if (showHistoryModal) closeHistory();
        }
    };

    // Filtros de búsqueda avanzados
    let selectedFilterSucursalId = $state('');
    let selectedFilterCajaId = $state('');

    // Cajas elegibles reactivamente según la sucursal del filtro
    const filterableCajas = $derived(
        data.cajas.filter(c => {
            if (!selectedFilterSucursalId) return false;
            return c.id_sucursal?.toString() === selectedFilterSucursalId;
        })
    );

    // Resetear caja elegida si ya no pertenece a la sucursal seleccionada en el filtro
    $effect(() => {
        if (selectedFilterCajaId && selectedFilterSucursalId) {
            const isValid = filterableCajas.some(c => c.id_caja.toString() === selectedFilterCajaId);
            if (!isValid) {
                selectedFilterCajaId = '';
            }
        }
    });

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(10);

    const filteredActivos = $derived(
        data.activos.filter(a => {
            const matchesSearch = !searchQuery || 
                a.catalogo?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.numero_serie?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.codigo_inventario?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.sucursal?.nombre?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSucursal = !selectedFilterSucursalId || 
                a.id_sucursal?.toString() === selectedFilterSucursalId;

            const matchesCaja = !selectedFilterCajaId || 
                a.id_caja?.toString() === selectedFilterCajaId;

            return matchesSearch && matchesSucursal && matchesCaja;
        }).sort((a, b) => {
            if (!a.id_caja && !b.id_caja) return 0;
            if (!a.id_caja) return 1;
            if (!b.id_caja) return -1;
            return (a.caja?.nombre || '').localeCompare(b.caja?.nombre || '');
        })
    );

    const totalPages = $derived(Math.ceil(filteredActivos.length / itemsPerPage));
    const paginatedActivos = $derived(
        filteredActivos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    const groupedRows = $derived.by(() => {
        const rows = paginatedActivos.map(asset => ({
            asset,
            cajaSpan: 1
        }));
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cajaSpan === 0) continue;
            const currentCajaId = rows[i].asset.id_caja;
            let span = 1;
            for (let j = i + 1; j < rows.length; j++) {
                if (rows[j].asset.id_caja === currentCajaId) {
                    span++;
                    rows[j].cajaSpan = 0;
                } else {
                    break;
                }
            }
            rows[i].cajaSpan = span;
        }
        return rows;
    });

    // Resetear página cuando cambia la búsqueda o los filtros
    $effect(() => {
        if (searchQuery || selectedFilterSucursalId || selectedFilterCajaId) {
            currentPage = 1;
        }
    });

    // --- Estado reactivo del formulario de activos ---
    let selectedCatalogoId = $state('');
    let selectedSucursalId = $state('');
    let selectedUsuarioId = $state('');
    let selectedCajaId = $state('');
    let numeroSerie = $state('');
    let codigoInventario = $state('');
    let isCodigoManuallyEdited = $state(false);

    // Filtrar cajas pertenecientes a la sucursal seleccionada
    const filteredCajas = $derived(
        data.cajas.filter(c => {
            if (!selectedSucursalId) return true;
            return c.id_sucursal?.toString() === selectedSucursalId ||
                   (editingAsset && editingAsset.id_caja === c.id_caja);
        })
    );

    // Resetear la caja si ya no pertenece a la sucursal seleccionada
    $effect(() => {
        if (selectedCajaId && selectedSucursalId) {
            const isCajaValid = filteredCajas.some(c => c.id_caja.toString() === selectedCajaId);
            if (!isCajaValid) {
                selectedCajaId = '';
            }
        }
    });

    // Filtrar usuarios pertenecientes a la sucursal seleccionada
    const filteredUsers = $derived(
        data.users.filter(u => {
            if (!selectedSucursalId) return true;
            return u.id_sucursal?.toString() === selectedSucursalId ||
                   (editingAsset && editingAsset.id_usuario_asignado === u.id_usuario);
        })
    );

    // Resetear el usuario asignado si ya no pertenece a la sucursal seleccionada
    $effect(() => {
        if (selectedUsuarioId && selectedSucursalId) {
            const isUserValid = filteredUsers.some(u => u.id_usuario.toString() === selectedUsuarioId);
            if (!isUserValid) {
                selectedUsuarioId = '';
            }
        }
    });

    // Auto-generación inteligente de código de inventario
    $effect(() => {
        if (!isCodigoManuallyEdited && !editingAsset) {
            const cat = data.catalogos.find(c => c.id_catalogo.toString() === selectedCatalogoId);
            const branch = data.branches.find(b => b.id_sucursal.toString() === selectedSucursalId);
            
            if (cat && branch) {
                // Código del tipo o primeras 3 letras del tipo en mayúsculas
                const tipoCode = cat.tipo?.codigo || cat.tipo?.tipo?.slice(0, 3).toUpperCase() || 'ACT';
                
                // Prefijo limpio de la sucursal (ej: La Concordia -> LAC, Matriz -> MAT)
                const branchName = branch.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                const branchWords = branchName.split(/\s+/).filter(w => w.length > 0);
                let branchCode = 'SUC';
                if (branchWords.length > 1) {
                    branchCode = branchWords.map(w => w[0]).join('').slice(0, 3);
                } else if (branchWords[0]) {
                    branchCode = branchWords[0].slice(0, 3);
                }

                // Suffix basado en número de serie o PEND si está vacío
                let suffix = '';
                if (numeroSerie.trim()) {
                    const cleanSerie = numeroSerie.replace(/[^A-Za-z0-9]/g, '');
                    suffix = cleanSerie.slice(-6).toUpperCase();
                } else {
                    suffix = 'PEND';
                }

                codigoInventario = `${tipoCode}-${branchCode}-${suffix}`;
            } else {
                codigoInventario = '';
            }
        }
    });

    const openCreate = () => {
        editingAsset = null;
        selectedCatalogoId = '';
        selectedSucursalId = '';
        selectedUsuarioId = '';
        selectedCajaId = '';
        numeroSerie = '';
        codigoInventario = '';
        isCodigoManuallyEdited = false;
        showModal = true;
    };

    const openEdit = (asset: any) => {
        editingAsset = asset;
        selectedCatalogoId = asset.id_catalogo?.toString() || '';
        selectedSucursalId = asset.id_sucursal?.toString() || '';
        selectedUsuarioId = asset.id_usuario_asignado?.toString() || '';
        selectedCajaId = asset.id_caja?.toString() || '';
        numeroSerie = asset.numero_serie || '';
        codigoInventario = asset.codigo_inventario || '';
        isCodigoManuallyEdited = true; // No sobreescribir al editar existentes
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        editingAsset = null;
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'activo': return 'bg-success/10 text-success';
            case 'en_reparacion': return 'bg-warning/10 text-warning';
            case 'baja': return 'bg-error/10 text-error';
            case 'bodega': return 'bg-primary/10 text-primary';
            default: return 'bg-text-dim/10 text-text-dim';
        }
    };
</script>

<svelte:head>
    <title>Activos TI - TicketFlow TI</title>
</svelte:head>

<svelte:window onkeydown={handleKeyDown} />

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Monitor class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Inventario Operativo</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Activos Tecnológicos</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Control de hardware y periféricos de la red.</p>
        </div>

        <button 
            onclick={openCreate}
            class="btn-primary flex items-center gap-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Registrar Activo</span>
        </button>
    </header>

    <!-- Buscador y Filtros Avanzados -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Búsqueda General -->
        <div class="relative group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Buscar por serie, código, modelo..."
                aria-label="Buscar activos"
                class="w-full h-12 pl-11 pr-4 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
            />
        </div>

        <!-- Filtro por Sucursal -->
        <div class="relative">
            <select 
                bind:value={selectedFilterSucursalId}
                aria-label="Filtrar por sucursal"
                class="w-full h-12 px-4 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white appearance-none bg-[right_1rem_center] bg-no-repeat cursor-pointer"
                style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m4 6 4 4 4-4%22/%3E%3C/svg%3E');"
            >
                <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Todas las Sucursales</option>
                {#each data.branches as branch}
                    <option value={branch.id_sucursal.toString()} class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{branch.nombre}</option>
                {/each}
            </select>
        </div>

        <!-- Filtro por Caja -->
        <div class="relative">
            <select 
                bind:value={selectedFilterCajaId}
                disabled={!selectedFilterSucursalId}
                aria-label="Filtrar por caja"
                class="w-full h-12 px-4 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white appearance-none bg-[right_1rem_center] bg-no-repeat cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m4 6 4 4 4-4%22/%3E%3C/svg%3E');"
            >
                <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                    {selectedFilterSucursalId ? 'Todas las Cajas' : 'Selecciona una Sucursal...'}
                </option>
                {#each filterableCajas as caja}
                    <option value={caja.id_caja.toString()} class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{caja.nombre}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de activos tecnológicos">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Caja</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Equipo / Tipo</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Identificación</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Ubicación / Usuario</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Estado</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each groupedRows as row (row.asset.id_activo)}
                        {@const asset = row.asset}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            {#if row.cajaSpan > 0}
                                <td rowspan={row.cajaSpan} class="px-5 py-4 border-r border-slate-200/10 dark:border-slate-800/50 bg-slate-500/5 dark:bg-slate-900/40 align-middle text-center min-w-[130px]">
                                    {#if asset.caja}
                                        <div class="flex flex-col items-center justify-center gap-0.5 animate-scale-in">
                                            <span class="text-[9px] font-black uppercase tracking-widest text-primary/70">Caja</span>
                                            <span class="text-sm font-extrabold text-slate-800 dark:text-white">{asset.caja.nombre}</span>
                                        </div>
                                    {:else}
                                        <div class="flex flex-col items-center justify-center gap-0.5">
                                            <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Sin Caja</span>
                                            <span class="text-[10px] font-semibold italic text-text-dim">Disponible</span>
                                        </div>
                                    {/if}
                                </td>
                            {/if}
                            <td class="px-5 py-3">
                                <div>
                                    <p class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{asset.catalogo?.nombre}</p>
                                    <p class="text-[9px] uppercase tracking-widest text-primary font-bold">{asset.catalogo?.tipo?.tipo}</p>
                                </div>
                            </td>
                            <td class="px-5 py-3 space-y-1">
                                <div class="text-[10px] font-medium text-text-main dark:text-dark-text-main">
                                    <span class="text-text-dim text-[9px] font-bold tracking-wider uppercase mr-1">S/N:</span>{asset.numero_serie || 'S/N'}
                                </div>
                                <div class="text-[9px] text-text-dim font-bold uppercase">
                                    <span class="opacity-50 text-[8px] mr-1">COD:</span>{asset.codigo_inventario || 'No Cod.'}
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                <div class="space-y-1">
                                    <div class="text-[10px] font-medium text-text-main dark:text-dark-text-main flex-wrap">
                                        {asset.sucursal?.nombre}
                                    </div>
                                    <div class="text-[10px] italic text-text-dim">
                                        {asset.usuario_asignado?.nombre || 'Stock Disponible'}
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest {getStatusStyles(asset.estado)} border border-current/10">
                                    {asset.estado.replace('_', ' ')}
                                </span>
                            </td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button onclick={() => openHistory(asset)} aria-label={`Ver historial de ${asset.catalogo?.nombre}`} class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                                        <Eye class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                    <button onclick={() => openEdit(asset)} aria-label={`Editar activo ${asset.catalogo?.nombre}`} class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                                        <Edit2 class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                    <form 
                                        use:enhance 
                                        action="?/delete" 
                                        method="POST" 
                                    >
                                        <input type="hidden" name="id" value={asset.id_activo} />
                                        <button 
                                            type="button" 
                                            onclick={(e) => {
                                                const form = e.currentTarget.closest('form');
                                                if (form) {
                                                    confirmState.ask(
                                                        '¿Eliminar Activo de Inventario?',
                                                        `¿Estás seguro de eliminar permanentemente el activo "${asset.codigo_inventario || 'este activo'}" del inventario?`,
                                                        () => form.requestSubmit()
                                                    );
                                                }
                                            }}
                                            aria-label={`Eliminar activo ${asset.catalogo?.nombre}`} 
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}

                    {#if filteredActivos.length === 0}
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-text-dim italic text-sm">
                                No se encontraron activos en el inventario maestro.
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
                    Página {currentPage} de {totalPages} ({filteredActivos.length} activos en total)
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
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="modal-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <Monitor class="w-5 h-5" />
                    </div>
                    <h2 id="modal-title" class="text-lg font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">
                        {editingAsset ? 'Actualizar Activo TI' : 'Registro de Nuevo Activo'}
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
                action={editingAsset ? '?/update' : '?/create'} 
                method="POST" 
                class="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
                {#if editingAsset}
                    <input type="hidden" name="id" value={editingAsset.id_activo} />
                {/if}

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label for="id_catalogo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Modelo de Equipo</label>
                        <select id="id_catalogo" name="id_catalogo" bind:value={selectedCatalogoId} required class="input-compact w-full">
                            <option value="">Seleccionar del catálogo...</option>
                            {#each data.catalogos as cat}
                                <option value={cat.id_catalogo.toString()}>
                                    {cat.nombre} ({cat.tipo?.tipo})
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="id_sucursal" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Ubicación / Sede</label>
                        <select id="id_sucursal" name="id_sucursal" bind:value={selectedSucursalId} required class="input-compact w-full">
                            <option value="">Asignar a sucursal...</option>
                            {#each data.branches as branch}
                                <option value={branch.id_sucursal.toString()}>{branch.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="numero_serie" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Número de Serie</label>
                        <div class="relative flex items-center">
                            <Hash class="absolute left-3 w-4 h-4 text-text-dim opacity-50 pointer-events-none" />
                            <input id="numero_serie" type="text" name="numero_serie" bind:value={numeroSerie} placeholder="Ej: S/N 123456" class="input-compact w-full pl-10 pr-10" />
                            <button 
                                type="button" 
                                onclick={startScanner} 
                                class="absolute right-2 p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none"
                                title="Escanear Código de Barras"
                                aria-label="Escanear código de barras con la cámara"
                            >
                                <Scan class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="codigo_inventario" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Código de Inventario</label>
                        <div class="relative">
                            <Tag class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input 
                                id="codigo_inventario" 
                                type="text" 
                                name="codigo_inventario" 
                                bind:value={codigoInventario} 
                                oninput={() => isCodigoManuallyEdited = true}
                                placeholder="Ej: ACT-001" 
                                class="input-compact w-full pl-10" 
                            />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="estado" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Estado de Operación</label>
                        <select id="estado" name="estado" class="input-compact w-full">
                            <option value="activo" selected={editingAsset?.estado === 'activo'}>Activo / Operacional</option>
                            <option value="bodega" selected={editingAsset?.estado === 'bodega'}>En Bodega / Stock</option>
                            <option value="en_reparacion" selected={editingAsset?.estado === 'en_reparacion'}>En Servicio Técnico</option>
                            <option value="baja" selected={editingAsset?.estado === 'baja'}>Fuera de Servicio (Baja)</option>
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="id_usuario_asignado" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Usuario Responsable</label>
                        <select id="id_usuario_asignado" name="id_usuario_asignado" bind:value={selectedUsuarioId} class="input-compact w-full">
                            <option value="">Sin asignar (Disponible)</option>
                            {#each filteredUsers as user}
                                <option value={user.id_usuario.toString()}>{user.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="id_caja" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Caja (Punto de Venta)</label>
                        <select id="id_caja" name="id_caja" bind:value={selectedCajaId} class="input-compact w-full">
                            <option value="">Sin asignar (Suelto / Bodega)</option>
                            {#each filteredCajas as caja}
                                <option value={caja.id_caja.toString()}>{caja.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="fecha_adquisicion" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Fecha de Ingreso</label>
                        <div class="relative">
                            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="fecha_adquisicion" type="date" name="fecha_adquisicion" value={editingAsset?.fecha_adquisicion || ''} class="input-compact w-full pl-10" />
                        </div>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label for="observaciones" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Especificaciones / Notas Técnicas</label>
                    <div class="relative">
                        <Info class="absolute left-3 top-3 w-4 h-4 text-text-dim opacity-50" />
                        <textarea id="observaciones" name="observaciones" value={editingAsset?.observaciones || ''} rows="3" class="input-compact w-full pl-10 pt-2.5"></textarea>
                    </div>
                </div>

                {#if editingAsset}
                    <div class="space-y-2 border-t border-white/5 pt-4">
                        <span class="block text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Historial de Traslados y Movimientos</span>
                        {#if editingAsset.movimientos && editingAsset.movimientos.length > 0}
                            <div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {#each editingAsset.movimientos as mov}
                                    <div class="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5 rounded-xl p-3 flex flex-col gap-1 text-xs">
                                        <div class="flex justify-between items-start">
                                            <span class="font-bold text-primary dark:text-blue-400 uppercase tracking-wide">
                                                {mov.tipo?.tipo_movimiento || 'Movimiento'}
                                            </span>
                                            <span class="text-[10px] text-text-dim">
                                                {new Date(mov.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {#if mov.motivo}
                                            <p class="text-text-main dark:text-dark-text-main italic font-medium">"{mov.motivo}"</p>
                                        {/if}
                                        {#if mov.id_ticket}
                                            <div class="text-[9px] text-text-dim font-bold uppercase tracking-wider">Ref: Ticket #{mov.id_ticket}</div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="p-3 bg-primary/5 dark:bg-white/5 border border-dashed border-primary/10 dark:border-white/5 rounded-xl text-center text-xs text-text-dim italic">
                                Sin traslados ni movimientos registrados para este activo.
                            </div>
                        {/if}
                    </div>
                {/if}

                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        {editingAsset ? 'Actualizar Ficha' : 'Completar Registro'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
{#if showScanModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="scan-modal-title"
        class="fixed inset-0 bg-dark-bg-main/90 backdrop-blur-md z-[70] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeScanner()}
    >
        <div 
            class="glass-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary animate-pulse">
                        <Scan class="w-5 h-5" />
                    </div>
                    <h2 id="scan-modal-title" class="text-sm font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">
                        Escanear Código de Barras
                    </h2>
                </div>
                <button onclick={closeScanner} aria-label="Cerrar escáner" class="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                    <X class="w-5 h-5 text-text-dim aria-hidden=true" />
                </button>
            </div>

            <div class="p-6 space-y-4">
                {#if cameraDevices.length > 1}
                    <div class="space-y-1">
                        <label for="camera-select" class="text-[9px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Seleccionar Cámara</label>
                        <select 
                            id="camera-select" 
                            bind:value={selectedDeviceId} 
                            onchange={handleCameraChange}
                            class="input-compact w-full text-xs"
                        >
                            {#each cameraDevices as device}
                                <option value={device.id}>{device.label || `Cámara ${device.id}`}</option>
                            {/each}
                        </select>
                    </div>
                {/if}

                <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-black/45 border border-white/5 flex items-center justify-center">
                    <div id="reader" class="w-full h-full object-cover"></div>
                </div>

                <p class="text-[10px] text-center text-text-dim dark:text-dark-text-dim font-medium italic">
                    Apunta con la cámara trasera al código de barras del equipo.
                </p>

                <div class="flex justify-center pt-2">
                    <button 
                        type="button" 
                        onclick={closeScanner} 
                        class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg"
                    >
                        Cancelar y escribir a mano
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal de Historial Directo (Icono Ojo) -->
{#if showHistoryModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeHistory()}
    >
        <div 
            class="glass-card w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <Activity class="w-5 h-5 animate-pulse" />
                    </div>
                    <h2 id="history-modal-title" class="text-lg font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">
                        Historial de Movimientos
                    </h2>
                </div>
                <button onclick={closeHistory} aria-label="Cerrar modal" class="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                    <X class="w-5 h-5 text-text-dim aria-hidden=true" />
                </button>
            </div>

            <div class="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {#if historyAsset}
                    <!-- Resumen del Activo -->
                    <div class="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5 rounded-xl p-4 space-y-2">
                        <h3 class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{historyAsset.catalogo?.nombre}</h3>
                        <p class="text-[9px] uppercase tracking-widest text-primary font-bold">{historyAsset.catalogo?.tipo?.tipo}</p>
                        <div class="grid grid-cols-2 gap-3 text-xs text-text-dim pt-2 border-t border-white/5">
                            <div><span class="font-semibold text-text-main dark:text-dark-text-main">S/N:</span> {historyAsset.numero_serie || 'N/A'}</div>
                            <div><span class="font-semibold text-text-main dark:text-dark-text-main">INV:</span> {historyAsset.codigo_inventario || 'N/A'}</div>
                            <div class="col-span-2"><span class="font-semibold text-text-main dark:text-dark-text-main">Ubicación:</span> {historyAsset.sucursal?.nombre || 'General'}</div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <span class="block text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Línea de Tiempo de Traslados</span>
                        
                        {#if historyAsset.movimientos && historyAsset.movimientos.length > 0}
                            <div class="relative pl-6 border-l border-primary/20 dark:border-white/10 space-y-6">
                                {#each historyAsset.movimientos as mov}
                                    <div class="relative">
                                        <!-- Timeline Dot -->
                                        <div class="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 dark:ring-white/5"></div>
                                        
                                        <div class="bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5 rounded-xl p-4 flex flex-col gap-1.5 text-xs shadow-sm">
                                            <div class="flex justify-between items-start">
                                                <span class="font-bold text-primary dark:text-blue-400 uppercase tracking-wide">
                                                    {mov.tipo?.tipo_movimiento || 'Movimiento'}
                                                </span>
                                                <span class="text-[10px] text-text-dim">
                                                    {new Date(mov.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {#if mov.motivo}
                                                <p class="text-text-main dark:text-dark-text-main italic font-medium">"{mov.motivo}"</p>
                                            {/if}
                                            {#if mov.id_ticket}
                                                <div class="text-[9px] text-text-dim font-bold uppercase tracking-wider">Ref: Ticket #{mov.id_ticket}</div>
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="p-6 bg-primary/5 dark:bg-white/5 border border-dashed border-primary/10 dark:border-white/5 rounded-xl text-center text-xs text-text-dim italic">
                                Sin traslados ni movimientos registrados para este activo.
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="px-8 py-4 bg-primary/5 border-t border-white/5 flex justify-end">
                <button type="button" onclick={closeHistory} class="px-6 py-2 bg-slate-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg">
                    Cerrar Historial
                </button>
            </div>
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

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
</style>
