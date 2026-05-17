import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { TicketRepository } from '$lib/server/repositories/TicketRepository';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { ReferenceDataRepository } from '$lib/server/repositories/ReferenceDataRepository';
import { InventoryRepository } from '$lib/server/repositories/InventoryRepository';

const ticketRepository = new TicketRepository();
const userRepository = new UserRepository();
const referenceDataRepository = new ReferenceDataRepository();
const inventoryRepository = new InventoryRepository();

// --- Zod Schemas ---
const updateStatusSchema = z.object({
    statusId: z.coerce.number().int().positive()
});

const assignTechnicianSchema = z.object({
    technicianId: z.coerce.number().int().positive()
});

const updateDetailsSchema = z.object({
    id_estado: z.coerce.number().int().positive(),
    id_nivel_atencion: z.coerce.number().int().positive().optional(),
    id_categoria: z.coerce.number().int().positive().optional(),
    notas_tecnico: z.string().optional()
});

const registerAssetMovementSchema = z.object({
    id_activo: z.coerce.number().int().positive(),
    id_tipo_movimiento: z.coerce.number().int().positive(),
    nuevo_estado: z.string().min(1),
    motivo: z.string().optional()
});

const addCommentSchema = z.object({
    content: z.string().min(1, 'El comentario no puede estar vacío')
});

// Helper functions
function parseFormData<T extends z.ZodTypeAny>(formData: FormData, schema: T): z.infer<T> {
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
        if (value !== '') data[key] = value;
    }
    return schema.parse(data);
}

function handleActionError(err: unknown) {
    if (err instanceof z.ZodError) {
        return fail(400, { error: 'Datos inválidos', issues: err.issues });
    }
    console.error('Action error:', err);
    return fail(500, { error: 'Error interno del servidor' });
}

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) throw error(404, 'ID de ticket no válido');

    const ticket = await ticketRepository.getTicketById(ticketId);
    if (!ticket) throw error(404, 'Ticket no encontrado');

    const [technicians, categorias, estados, niveles, tiposMovimiento] = await Promise.all([
        userRepository.getUsersByRole('TECNICO'),
        referenceDataRepository.getCategorias(),
        referenceDataRepository.getEstadosTickets(),
        referenceDataRepository.getNivelesAtencion(),
        inventoryRepository.getMovementTypes()
    ]);

    let movimientosActivo: Awaited<ReturnType<typeof inventoryRepository.getAssetMovements>> = [];
    if (ticket.id_activo) {
        movimientosActivo = await inventoryRepository.getAssetMovements(ticket.id_activo);
    }

    const userLectura = ticket.lecturas?.find(l => l.id_usuario === locals.user?.id_usuario);
    const ultimaLecturaTime = userLectura ? new Date(userLectura.ultima_lectura).getTime() : 0;
    
    const unread_count = ticket.comentarios?.filter(
        (c) => new Date(c.created_at).getTime() > ultimaLecturaTime && c.id_usuario !== locals.user?.id_usuario
    ).length || 0;

    // Retornamos los datos estructurados y tipados
    return {
        ticket,
        technicians,
        categorias,
        estados,
        niveles,
        tiposMovimiento,
        movimientosActivo,
        unread_count
    };
};

export const actions: Actions = {
    updateStatus: async ({ request, params }) => {
        try {
            const formData = await request.formData();
            const { statusId } = parseFormData(formData, updateStatusSchema);
            const ticketId = parseInt(params.id);

            await ticketRepository.updateTicketStatus(ticketId, statusId);
            return { success: true };
        } catch (err) {
            return handleActionError(err);
        }
    },

    assignTechnician: async ({ request, params }) => {
        try {
            const formData = await request.formData();
            const { technicianId } = parseFormData(formData, assignTechnicianSchema);
            const ticketId = parseInt(params.id);

            await ticketRepository.assignTicket(ticketId, technicianId);
            return { success: true };
        } catch (err) {
            return handleActionError(err);
        }
    },

    updateDetails: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || user.cod_rol !== 'ADMIN') return fail(401, { error: 'No autorizado' });

        try {
            const formData = await request.formData();
            const data = parseFormData(formData, updateDetailsSchema);
            const ticketId = parseInt(params.id);

            await ticketRepository.updateTicket(ticketId, {
                ...data,
                updated_by: user.id_usuario
            });

            return { success: true, message: 'Diagnóstico y gestión actualizados correctamente' };
        } catch (err) {
            return handleActionError(err);
        }
    },

    registerAssetMovement: async ({ request, params, locals }) => {
        const user = locals.user;
        if (!user || user.cod_rol !== 'ADMIN') return fail(401, { error: 'No autorizado' });

        try {
            const ticketId = parseInt(params.id, 10);
            const formData = await request.formData();
            const data = parseFormData(formData, registerAssetMovementSchema);

            await inventoryRepository.registerMovement({
                id_ticket: ticketId,
                id_activo: data.id_activo,
                id_tipo_movimiento: data.id_tipo_movimiento,
                motivo: data.motivo || ''
            });

            await inventoryRepository.updateAssetStatus(data.id_activo, data.nuevo_estado);

            return { success: true, message: 'Movimiento registrado y estado del activo actualizado' };
        } catch (err) {
            return handleActionError(err);
        }
    },

    addComment: async ({ request, params, locals }) => {
        try {
            const formData = await request.formData();
            const { content } = parseFormData(formData, addCommentSchema);
            const ticketId = parseInt(params.id);

            await ticketRepository.addComment({
                id_ticket: ticketId,
                id_usuario: locals.user!.id_usuario,
                comentario: content
            });
            return { success: true };
        } catch (err) {
            return handleActionError(err);
        }
    }
};

