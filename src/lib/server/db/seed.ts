import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL no está definida en el archivo .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
	console.log('--- Iniciando Seed Limpio de Producción ---');

	// 1. Insertar Sucursales (si no existen)
	console.log('Verificando sucursales...');
	const sucursalesData = [
		{ nombre: 'Matriz' },
		{ nombre: 'La Concordia' },
		{ nombre: 'Quinindé' },
		{ nombre: 'El Carmen' },
		{ nombre: 'Pedernales' },
		{ nombre: 'Atacames' }
	];

	const existingSucursal = await db.query.sucursal.findFirst();
	if (!existingSucursal) {
		console.log('Insertando sucursales iniciales...');
		for (const suc of sucursalesData) {
			await db.insert(schema.sucursal).values(suc);
		}
	} else {
		console.log('Las sucursales ya existen. Omitiendo.');
	}

	// Obtener la sucursal Matriz
	const matrizSucursal = await db.query.sucursal.findFirst({
		where: (sucursales, { eq }) => eq(sucursales.nombre, 'Matriz')
	});

	if (!matrizSucursal) {
		throw new Error('No se pudo encontrar o insertar la sucursal Matriz inicial.');
	}

	// 2. Insertar Roles (si no existen)
	console.log('Verificando roles...');
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
	console.log('Roles listos.');

	// 3. Insertar Estados de Tickets (si no existen)
	console.log('Verificando estados de tickets...');
	const estadosData = [
		{ nombre: 'Abierto', color: '#3b82f6' }, // Azul
		{ nombre: 'En Progreso', color: '#eab308' }, // Amarillo
		{ nombre: 'Resuelto', color: '#22c55e' }, // Verde
		{ nombre: 'Cerrado', color: '#64748b' } // Gris
	];

	const existingEstado = await db.query.estados_tickets.findFirst();
	if (!existingEstado) {
		console.log('Insertando estados de tickets iniciales...');
		for (const estado of estadosData) {
			await db.insert(schema.estados_tickets).values(estado);
		}
	} else {
		console.log('Los estados de tickets ya existen. Omitiendo.');
	}

	// 4. Insertar Administrador Inicial
	console.log('Verificando usuario administrador...');
	const adminRole = await db.query.roles.findFirst({
		where: (roles, { eq }) => eq(roles.cod_rol, 'ADMIN')
	});

	if (adminRole) {
		const adminUser = process.env.ADMIN_USER;
		const adminPass = process.env.ADMIN_PASS;

		if (!adminUser || !adminPass) {
			throw new Error('ADMIN_USER o ADMIN_PASS no están definidas en el archivo .env');
		}

		const adminEmail = process.env.ADMIN_EMAIL || 'admin@ticketflow.com';

		// Buscar si ya existe el usuario para no duplicarlo
		const adminExist = await db.query.usuarios.findFirst({
			where: eq(schema.usuarios.username, adminUser)
		});

		if (!adminExist) {
			console.log(`Insertando usuario administrador inicial: ${adminUser}...`);
			const hashedPassword = await bcrypt.hash(adminPass, 10);
			
			await db.insert(schema.usuarios).values({
				id_rol: adminRole.id_rol,
				id_sucursal: matrizSucursal.id_sucursal,
				nombre: 'Administrador Sistema',
				username: adminUser,
				email: adminEmail,
				password: hashedPassword,
				estado: true
			});
			console.log('Usuario administrador inicial insertado.');
		} else {
			console.log('El usuario administrador ya existe. Omitiendo.');
		}
	}

	console.log('--- Seed de producción completado con éxito ---');
	process.exit(0);
}

main().catch((err) => {
	console.error('Error durante el seed:', err);
	process.exit(1);
});
