import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

const SESSION_COOKIE = 'ticketflow_session';
const SESSION_DURATION = '8h';

export interface SessionUser {
    id: number;
    nombre: string;
    email: string;
    username: string;
    cod_rol: string;
    rol: string;
    id_sucursal: number;
    token_version: number;
}

export function createSessionToken(user: SessionUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: SESSION_DURATION });
}

export function verifySessionToken(token: string): SessionUser | null {
    try {
        return jwt.verify(token, JWT_SECRET) as SessionUser;
    } catch {
        return null;
    }
}

export { SESSION_COOKIE };
