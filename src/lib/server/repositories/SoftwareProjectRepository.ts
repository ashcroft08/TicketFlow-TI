import { db } from '../db';
import { proyectos_software } from '../db/schema';
import { eq, asc, and, sql } from 'drizzle-orm';

export interface CreateProjectInput {
    nombre: string;
    descripcion?: string | null;
    version?: string | null;
    estado?: string | null;
    id_encargado?: number | null;
    url_repositorio?: string | null;
}

export interface UpdateProjectInput {
    nombre?: string;
    descripcion?: string | null;
    version?: string | null;
    estado?: string | null;
    id_encargado?: number | null;
    url_repositorio?: string | null;
    estado_registro?: boolean;
}

export class SoftwareProjectRepository {
    async getAll() {
        return await db.query.proyectos_software.findMany({
            where: sql`${proyectos_software.deleted_at} IS NULL`,
            with: {
                encargado: true
            },
            orderBy: [asc(proyectos_software.nombre)]
        });
    }

    async getById(id: number) {
        return await db.query.proyectos_software.findFirst({
            where: and(
                eq(proyectos_software.id_proyecto, id),
                sql`${proyectos_software.deleted_at} IS NULL`
            ),
            with: {
                encargado: true
            }
        });
    }

    async create(data: CreateProjectInput) {
        const [newProject] = await db.insert(proyectos_software)
            .values({
                nombre: data.nombre,
                descripcion: data.descripcion || null,
                version: data.version || null,
                estado: data.estado || null,
                id_encargado: data.id_encargado || null,
                url_repositorio: data.url_repositorio || null,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();
        return newProject;
    }

    async update(id: number, data: UpdateProjectInput) {
        const [updatedProject] = await db.update(proyectos_software)
            .set({
                nombre: data.nombre,
                descripcion: data.descripcion,
                version: data.version,
                estado: data.estado,
                id_encargado: data.id_encargado,
                url_repositorio: data.url_repositorio,
                updated_at: new Date()
            })
            .where(eq(proyectos_software.id_proyecto, id))
            .returning();
        return updatedProject;
    }

    async delete(id: number) {
        return await db.update(proyectos_software)
            .set({ deleted_at: new Date() })
            .where(eq(proyectos_software.id_proyecto, id))
            .returning();
    }
}
