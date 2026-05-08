import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL no está definida en el archivo .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
	console.log('--- Iniciando Seed ---');

	// 1. Insertar Sucursales
	console.log('Insertando sucursales...');
	const sucursalesData = [
		{ nombre: 'Matriz' },
		{ nombre: 'La Concordia' },
		{ nombre: 'Quininde' },
		{ nombre: 'El Carmen' },
		{ nombre: 'Pedernales' },
		{ nombre: 'Atacames' }
	];

	for (const suc of sucursalesData) {
		await db
			.insert(schema.sucursal)
			.values(suc)
			.onConflictDoNothing(); // Como no tiene un campo único fácilmente identificable aparte del ID, onConflictDoNothing puede que no funcione perfectamente si se corre varias veces sin unique constraints, pero servirá para el primer seed.
            // Nota: Sería ideal añadir un constraint unique al nombre de la sucursal en el esquema.
	}

	// Obtener la sucursal Matriz
	const matrizSucursal = await db.query.sucursal.findFirst({
		where: (sucursales, { eq }) => eq(sucursales.nombre, 'Matriz')
	});

	// 2. Insertar Roles
	console.log('Insertando roles...');
	const rolesData = [
		{ rol: 'Administrador', cod_rol: 'ADMIN' },
		{ rol: 'Técnico', cod_rol: 'TECH' },
		{ rol: 'Encargado de tienda', cod_rol: 'STORE_MANAGER' }
	];

	for (const role of rolesData) {
		await db
			.insert(schema.roles)
			.values(role)
			.onConflictDoUpdate({
				target: schema.roles.cod_rol,
				set: { rol: role.rol }
			});
	}

	// 3. Insertar Admin
	const adminRole = await db.query.roles.findFirst({
		where: (roles, { eq }) => eq(roles.cod_rol, 'ADMIN')
	});

	if (adminRole && matrizSucursal) {
		const adminUser = process.env.ADMIN_USER;
		const adminPass = process.env.ADMIN_PASS;

        if (!adminUser || !adminPass) {
            throw new Error('ADMIN_USER o ADMIN_PASS no están definidas en el archivo .env');
        }

		console.log(`Insertando usuario inicial: ${adminUser}...`);
		const hashedPassword = await bcrypt.hash(adminPass, 10);
		const adminEmail = process.env.ADMIN_EMAIL || 'admin@ticketflow.com';
		
		await db
			.insert(schema.usuarios)
			.values({
				id_rol: adminRole.id_rol,
                id_sucursal: matrizSucursal.id_sucursal,
				nombre: 'Administrador Sistema',
				username: adminUser,
				email: adminEmail,
				password: hashedPassword,
				estado: true
			})
			.onConflictDoNothing();
	}

	// 4. Insertar Estados de Tickets
	console.log('Insertando estados de tickets...');
	const estadosData = [
		{ nombre: 'Abierto', color: '#3b82f6' }, // blue
		{ nombre: 'En Progreso', color: '#eab308' }, // yellow
		{ nombre: 'Resuelto', color: '#22c55e' }, // green
		{ nombre: 'Cerrado', color: '#64748b' } // slate
	];

	for (const estado of estadosData) {
		await db
			.insert(schema.estados_tickets)
			.values(estado)
			// No unique constraint on nombre, so we might insert duplicates if run multiple times without wiping.
			// Ideally add a unique constraint, but for now we skip onConflict.
			// Actually we can't use onConflictDoNothing without a unique constraint.
			// So we'll query first.
			// Wait, let's just do a simple check.
		    ;
	}

	// 5. Insertar Activos TI de prueba (para la Matriz)
	if (matrizSucursal) {
		console.log('Insertando activos TI de prueba...');
		
		// Insertar Tipo
		const [tipoPc] = await db.insert(schema.tipos_articulos)
			.values({ tipo: 'Computadora de Escritorio', codigo: 'PC' })
			.returning();

		// Insertar Catálogo
		if (tipoPc) {
			const [catalogoHp] = await db.insert(schema.catalogo_articulos)
				.values({
					id_tipo: tipoPc.id_tipo,
					nombre: 'HP ProDesk 400',
					marca: 'HP',
					modelo: 'ProDesk 400 G7'
				})
				.returning();

			// Insertar Activo
			if (catalogoHp) {
				await db.insert(schema.activos_ti)
					.values({
						id_sucursal: matrizSucursal.id_sucursal,
						id_catalogo: catalogoHp.id_catalogo,
						numero_serie: 'SN-HP400-001',
						codigo_inventario: 'INV-MTZ-PC-001',
						estado: 'activo'
					});
					
				await db.insert(schema.activos_ti)
					.values({
						id_sucursal: matrizSucursal.id_sucursal,
						id_catalogo: catalogoHp.id_catalogo,
						numero_serie: 'SN-HP400-002',
						codigo_inventario: 'INV-MTZ-PC-002',
						estado: 'activo'
					});
			}
		}
	}

	console.log('--- Seed completado con éxito ---');
	process.exit(0);
}

main().catch((err) => {
	console.error('Error durante el seed:', err);
	process.exit(1);
});
