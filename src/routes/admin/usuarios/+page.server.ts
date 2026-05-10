import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { BranchRepository } from '$lib/server/repositories/BranchRepository';
import bcrypt from 'bcryptjs';

const userRepository = new UserRepository();
const branchRepository = new BranchRepository();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.cod_rol !== 'ADMIN') {
        throw redirect(303, '/');
    }

    const [allUsers, roles, branches] = await Promise.all([
        userRepository.getAll(),
        userRepository.getRoles(),
        branchRepository.getActive()
    ]);

    // Filtrar al usuario logueado por seguridad (que se gestione desde su Perfil)
    const users = allUsers.filter(u => u.id_usuario !== locals.user.id);

    return {
        users,
        roles,
        branches
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();
        const username = data.get('username')?.toString();
        const email = data.get('email')?.toString();
        const password = data.get('password')?.toString();
        const id_rol = parseInt(data.get('id_rol')?.toString() || '0');
        const id_sucursal = parseInt(data.get('id_sucursal')?.toString() || '0');

        if (!nombre || !username || !email || !password || !id_rol) {
            return fail(400, { error: 'Todos los campos son obligatorios' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await userRepository.create({
                nombre,
                username,
                email,
                password: hashedPassword,
                id_rol,
                id_sucursal: id_sucursal || null,
                estado: true
            });
            return { success: true };
        } catch (err: any) {
            console.error('Error al crear usuario:', err);
            if (err.code === '23505') {
                return fail(400, { error: 'El username o email ya existe' });
            }
            return fail(500, { error: 'Error interno al crear usuario' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString();
        const username = data.get('username')?.toString();
        const email = data.get('email')?.toString();
        const id_rol = parseInt(data.get('id_rol')?.toString() || '0');
        const id_sucursal = parseInt(data.get('id_sucursal')?.toString() || '0');
        const estado = data.get('estado') === 'true';
        const newPassword = data.get('password')?.toString();

        if (!id || !nombre || !username || !email || !id_rol) {
            return fail(400, { error: 'Datos incompletos' });
        }

        try {
            const updateData: any = {
                nombre,
                username,
                email,
                id_rol,
                id_sucursal: id_sucursal || null,
                estado
            };

            if (newPassword && newPassword.trim() !== '') {
                updateData.password = await bcrypt.hash(newPassword, 10);
            }

            await userRepository.update(id, updateData);
            return { success: true };
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            return fail(500, { error: 'Error al actualizar' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user || locals.user.cod_rol !== 'ADMIN') return fail(401);

        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        if (!id) return fail(400);

        try {
            await userRepository.delete(id);
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            return fail(500, { error: 'No se puede eliminar porque tiene tickets asociados' });
        }
    }
};
