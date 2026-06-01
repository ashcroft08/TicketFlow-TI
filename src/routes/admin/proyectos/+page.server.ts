import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { SoftwareProjectRepository } from '$lib/server/repositories/SoftwareProjectRepository';
import { UserRepository } from '$lib/server/repositories/UserRepository';

const projectRepository = new SoftwareProjectRepository();
const userRepository = new UserRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const [proyectos, usuarios] = await Promise.all([
        projectRepository.getAll(),
        userRepository.getAll()
    ]);

    return {
        proyectos,
        usuarios
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();
        const descripcion = data.get('descripcion')?.toString() || null;
        const version = data.get('version')?.toString() || null;
        const estado = data.get('estado')?.toString() || null;
        const id_encargado = parseInt(data.get('id_encargado')?.toString() || '0') || null;
        const url_repositorio = data.get('url_repositorio')?.toString() || null;

        if (!nombre || nombre.trim() === '') {
            return fail(400, { error: 'El nombre del proyecto es requerido' });
        }

        try {
            await projectRepository.create({
                nombre: nombre.trim(),
                descripcion,
                version,
                estado,
                id_encargado,
                url_repositorio
            });
            return { success: true, message: 'Proyecto de software registrado con éxito' };
        } catch (err) {
            console.error('Error al registrar proyecto:', err);
            return fail(500, { error: 'Error al registrar el proyecto' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString();
        const descripcion = data.get('descripcion')?.toString() || null;
        const version = data.get('version')?.toString() || null;
        const estado = data.get('estado')?.toString() || null;
        const id_encargado = parseInt(data.get('id_encargado')?.toString() || '0') || null;
        const url_repositorio = data.get('url_repositorio')?.toString() || null;

        if (!id || !nombre || nombre.trim() === '') {
            return fail(400, { error: 'Datos incompletos' });
        }

        try {
            await projectRepository.update(id, {
                nombre: nombre.trim(),
                descripcion,
                version,
                estado,
                id_encargado,
                url_repositorio
            });
            return { success: true, message: 'Proyecto actualizado con éxito' };
        } catch (err) {
            console.error('Error al actualizar proyecto:', err);
            return fail(500, { error: 'Error al actualizar el proyecto' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400, { error: 'ID requerido' });

        try {
            await projectRepository.delete(id);
            return { success: true, message: 'Proyecto eliminado con éxito' };
        } catch (err) {
            console.error('Error al eliminar proyecto:', err);
            return fail(500, { error: 'Error al eliminar el proyecto' });
        }
    }
};
