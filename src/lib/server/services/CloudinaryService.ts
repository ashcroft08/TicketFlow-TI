import { v2 as cloudinary } from 'cloudinary';
import { env } from '$env/dynamic/private';

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

export class CloudinaryService {
    
    /**
     * Sube un buffer de imagen a Cloudinary usando Streams.
     * @param fileBuffer Buffer del archivo a subir.
     * @param folder Carpeta en Cloudinary (opcional).
     * @returns Promesa con la respuesta de Cloudinary (URL, public_id, etc.)
     */
    async uploadImage(fileBuffer: Buffer, folder: string = 'ticket_adjuntos'): Promise<{ url: string, public_id: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folder, resource_type: 'auto' },
                (error, result) => {
                    if (error) {
                        console.error("Error al subir a Cloudinary:", error);
                        return reject(error);
                    }
                    if (result) {
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id
                        });
                    } else {
                        reject(new Error("No se obtuvo resultado de Cloudinary."));
                    }
                }
            );

            // Escribir el buffer al stream
            uploadStream.end(fileBuffer);
        });
    }

    /**
     * Elimina TODOS los recursos en la cuenta de Cloudinary.
     * ADVERTENCIA: Esta acción es destructiva.
     */
    async deleteAllResources(): Promise<void> {
        try {
            console.log("Iniciando limpieza de Cloudinary...");
            const result = await cloudinary.api.delete_all_resources();
            console.log("Limpieza completada:", result);
        } catch (error) {
            console.error("Error al limpiar Cloudinary:", error);
            throw error;
        }
    }
}
