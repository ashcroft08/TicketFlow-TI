import { db } from '../db';
import { usuarios } from '../db/schema';
import { eq, or } from 'drizzle-orm';

export class UserRepository {
    async findByIdentifier(identifier: string) {
        return await db.query.usuarios.findFirst({
            where: or(
                eq(usuarios.username, identifier),
                eq(usuarios.email, identifier)
            ),
            with: {
                rol: true,
                sucursal: true
            }
        });
    }

    async updateResetToken(userId: number, token: string | null, expiry: Date | null) {
        return await db.update(usuarios)
            .set({ reset_token: token, reset_token_expiry: expiry })
            .where(eq(usuarios.id_usuario, userId));
    }

    async findByResetToken(token: string) {
        return await db.query.usuarios.findFirst({
            where: eq(usuarios.reset_token, token)
        });
    }

    async updatePassword(userId: number, passwordHash: string) {
        return await db.update(usuarios)
            .set({ 
                password: passwordHash, 
                reset_token: null, 
                reset_token_expiry: null 
            })
            .where(eq(usuarios.id_usuario, userId));
    }
}
