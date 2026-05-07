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
		
		await db
			.insert(schema.usuarios)
			.values({
				id_rol: adminRole.id_rol,
                id_sucursal: matrizSucursal.id_sucursal,
				nombre: 'Administrador Sistema',
				username: adminUser,
				password: hashedPassword, // Contraseña encriptada
				estado: true
			})
			.onConflictDoNothing();
	}

	console.log('--- Seed completado con éxito ---');
	process.exit(0);
}

main().catch((err) => {
	console.error('Error durante el seed:', err);
	process.exit(1);
});
