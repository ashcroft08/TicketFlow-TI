import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL not defined in env');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);

async function clean() {
  console.log('Limpiando tablas de bitácora...');
  try {
    // Truncar la tabla bitacora_admin y categorias_bitacora
    await client`TRUNCATE TABLE bitacora_admin, categorias_bitacora RESTART IDENTITY CASCADE;`;
    console.log('Tablas limpiadas con éxito.');
  } catch (error) {
    console.error('Error limpiando tablas:', error);
  } finally {
    await client.end();
  }
}

clean();
