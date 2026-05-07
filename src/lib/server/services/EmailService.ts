import nodemailer from 'nodemailer';
import { GMAIL_USER, GMAIL_APP_PASSWORD } from '$env/static/private';
import path from 'path';

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `http://localhost:5173/reset-password/${token}`;
        
        // Ruta al logo local para adjuntarlo como CID
        const logoPath = path.resolve('src/lib/assets/img/TicketFlow_logo.webp');

        const mailOptions = {
            from: `"Soporte TicketFlow TI" <${GMAIL_USER}>`,
            to: email,
            subject: 'Restablecer Contraseña - TicketFlow TI',
            // Versión de texto plano para evitar filtros de spam
            text: `Hola, has solicitado restablecer tu contraseña en TicketFlow TI. Por favor, usa el siguiente enlace para continuar: ${resetUrl}. El enlace es válido por 1 hora.`,
            html: `
                <div style="background-color: #f4f7ff; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="padding: 40px 0 20px 0; background-color: #ffffff;">
                                <img src="cid:logo" alt="TicketFlow Logo" width="180" style="display: block;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px 40px 40px;">
                                <h1 style="color: #003d9b; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">¿Olvidaste tu contraseña?</h1>
                                <p style="color: #434654; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                                    No te preocupes, nos pasa a todos. Haz clic en el botón de abajo para elegir una nueva contraseña y volver a tu cuenta.
                                </p>
                                <table align="center" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="border-radius: 12px;" bgcolor="#003d9b">
                                            <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-family: sans-serif; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; border: 1px solid #003d9b; display: inline-block; font-weight: bold;">
                                                Restablecer Contraseña
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="color: #737685; font-size: 14px; line-height: 1.6; margin-top: 40px; text-align: center;">
                                    Este enlace expirará en <strong>1 hora</strong>. <br>
                                    Si no solicitaste este cambio, puedes ignorar este correo.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f9f9ff; border-top: 1px solid #edf0ff; text-align: center;">
                                <p style="color: #c3c6d6; font-size: 12px; margin: 0;">
                                    © 2024 TicketFlow TI - Gestión de Soporte Técnico
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            `,
            attachments: [
                {
                    filename: 'logo.webp',
                    path: logoPath,
                    cid: 'logo' // El mismo CID que usamos en el <img src="cid:logo">
                }
            ]
        };

        return await this.transporter.sendMail(mailOptions);
    }
}
