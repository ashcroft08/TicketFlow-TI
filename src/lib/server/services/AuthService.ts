import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from './EmailService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class AuthService {
    private userRepository: UserRepository;
    private emailService: EmailService;

    constructor() {
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
    }

    async login(identifier: string, passwordString: string) {
        const user = await this.userRepository.findByIdentifier(identifier);

        if (!user) {
            return { success: false, error: 'Usuario o contraseña incorrectos' };
        }

        if (!user.estado) {
            return { success: false, error: 'Usuario inactivo' };
        }

        const isPasswordValid = await bcrypt.compare(passwordString, user.password);

        if (!isPasswordValid) {
            return { success: false, error: 'Usuario o contraseña incorrectos' };
        }

        return { success: true, user: { id: user.id_usuario, nombre: user.nombre, rol: user.rol?.rol } };
    }

    async requestPasswordReset(identifier: string) {
        const user = await this.userRepository.findByIdentifier(identifier);

        if (!user) {
            // Por seguridad, no revelamos si el usuario existe o no
            return { success: true, message: 'Si el correo existe, se ha enviado un enlace de recuperación.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hora de validez

        await this.userRepository.updateResetToken(user.id_usuario, token, expiry);
        await this.emailService.sendPasswordResetEmail(user.email, token);

        return { success: true, message: 'Si el correo existe, se ha enviado un enlace de recuperación.' };
    }

    async resetPassword(token: string, newPasswordString: string) {
        const user = await this.userRepository.findByResetToken(token);

        if (!user || !user.reset_token_expiry || user.reset_token_expiry < new Date()) {
            return { success: false, error: 'Token inválido o expirado' };
        }

        const hashedPassword = await bcrypt.hash(newPasswordString, 10);
        await this.userRepository.updatePassword(user.id_usuario, hashedPassword);

        return { success: true, message: 'Contraseña actualizada correctamente' };
    }
}
