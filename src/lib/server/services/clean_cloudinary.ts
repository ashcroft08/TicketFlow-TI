import { v2 as cloudinary } from 'cloudinary';

async function main() {
    // Configurar usando variables de entorno que tsx --env-file inyecta
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log("Iniciando script de limpieza de Cloudinary...");
    try {
        const result = await cloudinary.api.delete_all_resources();
        console.log("¡Limpieza terminada con éxito!", result);
    } catch (error) {
        console.error("Hubo un error limpiando Cloudinary:", error);
    }
}

main().catch(console.error);
