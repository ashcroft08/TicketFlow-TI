import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';
import { CloudinaryService } from '$lib/server/services/CloudinaryService';
import { CajaRepository } from '$lib/server/repositories/CajaRepository';

const ticketRepository = new TicketRepository();
const referenceDataRepository = new ReferenceDataRepository();
const cloudinaryService = new CloudinaryService();
const cajaRepository = new CajaRepository();

export const load: PageServerLoad = async ({ locals }) => {
    // Si no hay usuario, el hook ya debería haber redirigido, pero por si acaso
    if (!locals.user) {
        throw redirect(303, '/');
    }

    // Asegurarse de que solo el STORE_MANAGER pueda ver esto, o admin para pruebas
    if (locals.user.cod_rol !== 'STORE_MANAGER' && locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const userId = locals.user.id;
    const sucursalId = locals.user.id_sucursal;

    // Obtener los activos asignados a la sucursal del usuario
    const activosSucursal = await referenceDataRepository.getActivosBySucursal(sucursalId);

    // Obtener las cajas de la sucursal del usuario
    const cajasSucursal = sucursalId ? await cajaRepository.getBySucursal(sucursalId) : [];

    // Obtener los tickets creados por este usuario
    const misTickets = await ticketRepository.getTicketsByCreator(userId);

    return {
        user: locals.user,
        activos: activosSucursal,
        cajas: cajasSucursal,
        tickets: misTickets
    };
};

export const actions: Actions = {
    createTicket: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'No autorizado' });
        }

        const data = await request.formData();
        const titulo = data.get('titulo')?.toString().trim();
        const descripcion = data.get('descripcion')?.toString().trim();
        const idActivoStr = data.get('id_activo')?.toString();
        const idCajaStr = data.get('id_caja')?.toString();
        const adjuntosFiles = data.getAll('adjuntos') as File[];

        if (!titulo || !descripcion || !idActivoStr) {
            return fail(400, { 
                error: 'Todos los campos son obligatorios.',
                titulo,
                descripcion,
                id_activo: idActivoStr
            });
        }

        const idActivo = parseInt(idActivoStr, 10);
        const idCaja = idCajaStr ? parseInt(idCajaStr, 10) : null;
        if (isNaN(idActivo)) {
            return fail(400, { error: 'Activo inválido.' });
        }

        try {
            const adjuntosUrls = [];
            // Procesar y subir imágenes si existen
            for (const file of adjuntosFiles) {
                if (file && file.size > 0 && file.type.startsWith('image/')) {
                     const arrayBuffer = await file.arrayBuffer();
                     const buffer = Buffer.from(arrayBuffer);
                     const result = await cloudinaryService.uploadImage(buffer);
                     adjuntosUrls.push({
                         nombre: file.name,
                         url: result.url,
                         public_id: result.public_id
                     });
                }
            }

            await ticketRepository.createTicket({
                id_usuario_creador: locals.user.id,
                titulo,
                descripcion,
                id_activo: idActivo,
                id_caja: idCaja && !isNaN(idCaja) ? idCaja : null,
                adjuntos: adjuntosUrls
            });

            return { success: true, message: 'Ticket creado exitosamente' };
        } catch (error) {
            console.error('Error al crear ticket:', error);
            return fail(500, { error: 'Ocurrió un error al crear el ticket.' });
        }
    }
};
