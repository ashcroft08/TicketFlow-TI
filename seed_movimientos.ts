import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/server/db/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL no encontrada. Asegúrate de usar el flag --env-file=.env');

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seedTodo() {
    // 1. Tipos de Movimientos
    console.log('--- Insertando tipos de movimientos ---');
    const tipos = [
        { tipo_movimiento: 'Revisión Técnica', codigo: 'REV' },
        { tipo_movimiento: 'Envío a Reparación Externa', codigo: 'REP_EXT' },
        { tipo_movimiento: 'Mantenimiento Preventivo', codigo: 'MANT_PREV' },
        { tipo_movimiento: 'Mantenimiento Correctivo', codigo: 'MANT_CORR' },
        { tipo_movimiento: 'Reingreso de Reparación', codigo: 'REINGRESO' },
        { tipo_movimiento: 'Baja Definitiva', codigo: 'BAJA' },
        { tipo_movimiento: 'Asignación a Usuario', codigo: 'ASIGN' },
        { tipo_movimiento: 'Ingreso a Bodega', codigo: 'BODEGA' }
    ];

    for (const tipo of tipos) {
        const exists = await db.query.tipos_movimientos.findFirst({
            where: (t, { eq }) => eq(t.codigo, tipo.codigo)
        });
        if (!exists) {
            await db.insert(schema.tipos_movimientos).values(tipo);
            console.log(`- Creado: ${tipo.tipo_movimiento}`);
        }
    }

    // 2. Niveles de Atención (Urgencia)
    console.log('\n--- Insertando niveles de urgencia ---');
    const niveles = [
        { nombre: 'Baja' },
        { nombre: 'Media' },
        { nombre: 'Alta' },
        { nombre: 'Crítica' }
    ];

    for (const nivel of niveles) {
        const exists = await db.query.nivel_atencion.findFirst({
            where: (n, { eq }) => eq(n.nombre, nivel.nombre)
        });
        if (!exists) {
            await db.insert(schema.nivel_atencion).values(nivel);
            console.log(`- Creado: ${nivel.nombre}`);
        }
    }

    // 3. Categorías de Problema
    console.log('\n--- Insertando categorías de problema ---');
    const categorias = [
        { nombre_tecnico: 'Hardware (PC/Laptops)' },
        { nombre_tecnico: 'Software / Aplicativos' },
        { nombre_tecnico: 'Redes e Internet' },
        { nombre_tecnico: 'Cuentas y Accesos' },
        { nombre_tecnico: 'Impresoras y Periféricos' },
        { nombre_tecnico: 'Correo Electrónico' },
        { nombre_tecnico: 'Soporte Remoto' }
    ];

    for (const cat of categorias) {
        const exists = await db.query.categorias.findFirst({
            where: (c, { eq }) => eq(c.nombre_tecnico, cat.nombre_tecnico)
        });
        if (!exists) {
            await db.insert(schema.categorias).values(cat);
            console.log(`- Creado: ${cat.nombre_tecnico}`);
        }
    }
    
    console.log('\n--- Todo listo ---');
    process.exit(0);
}

seedTodo().catch(console.error);
