import { execSync } from 'child_process';

if (!process.env.DATABASE_URL_PROD) {
  console.error('Error: DATABASE_URL_PROD not defined in env');
  process.exit(1);
}

// Sobrescribimos temporalmente DATABASE_URL con la de producción
process.env.DATABASE_URL = process.env.DATABASE_URL_PROD;

console.log('🔄 Ejecutando migraciones en la Base de Datos de Producción...');
try {
  execSync('npx drizzle-kit migrate', { stdio: 'inherit', env: process.env });
  console.log('✅ Migraciones aplicadas exitosamente a producción.');
} catch (error) {
  console.error('❌ Error al aplicar migraciones:', error.message);
  process.exit(1);
}
