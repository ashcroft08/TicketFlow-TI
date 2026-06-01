import postgres from 'postgres';

async function main() {
	const localUrl = process.env.DATABASE_URL;
	const prodUrl = process.env.DATABASE_URL_PROD;

	if (!localUrl) {
		console.error('❌ Error: DATABASE_URL (local) no está definida en el entorno.');
		process.exit(1);
	}
	if (!prodUrl) {
		console.error('❌ Error: DATABASE_URL_PROD (producción) no está definida en el entorno.');
		process.exit(1);
	}

	console.log('🔌 Conectando con las bases de datos...');
	console.log(`🏠 Local: ${localUrl.split('@')[1] || localUrl}`);
	console.log(`🌐 Producción: ${prodUrl.split('@')[1] || prodUrl}`);

	const sqlProd = postgres(prodUrl, { ssl: { rejectUnauthorized: false } });
	const sqlLocal = postgres(localUrl);

	try {
		// 1. Obtener todas las tablas del esquema público
		console.log('🔍 Consultando tablas en el esquema público de producción...');
		const tablesResult = await sqlProd`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			  AND table_type = 'BASE TABLE'
			  AND table_name NOT LIKE '_drizzle_migrations%'
			  AND table_name NOT LIKE 'pg_%'
		`;

		const tables = tablesResult.map((t) => t.table_name);
		console.log(`📦 Encontradas ${tables.length} tablas para sincronizar: ${tables.join(', ')}`);

		if (tables.length === 0) {
			console.log('⚠️ No se encontraron tablas para sincronizar.');
			return;
		}

		// Desactivar temporalmente restricciones de claves foráneas y triggers en local
		console.log('🚧 Desactivando restricciones y triggers locales...');
		await sqlLocal`SET session_replication_role = 'replica';`;

		// Vaciar todas las tablas locales juntas al inicio para evitar que el CASCADE borre datos ya sincronizados
		console.log('🧹 Vaciando todas las tablas locales...');
		const truncateQuery = tables.map((t) => `"${t}"`).join(', ');
		await sqlLocal.unsafe(`TRUNCATE TABLE ${truncateQuery} CASCADE`);
		console.log('✅ Todas las tablas locales vaciadas con éxito.');

		for (const table of tables) {
			console.log(`\n⏳ Procesando tabla: "${table}"...`);

			// Obtener los datos de producción
			const rows = await sqlProd.unsafe(`SELECT * FROM "${table}"`);
			console.log(`📥 Descargados ${rows.length} registros de producción para "${table}".`);

			if (rows.length > 0) {
				// Insertar en lotes en la base de datos local
				// postgres-js nos permite hacer inserciones de arrays de objetos fácilmente
				const batchSize = 100;
				for (let i = 0; i < rows.length; i += batchSize) {
					const batch = rows.slice(i, i + batchSize);
					await sqlLocal`INSERT INTO ${sqlLocal(table)} ${sqlLocal(batch)}`;
				}
				console.log(`✅ ${rows.length} registros insertados en local para "${table}".`);
			} else {
				console.log(`ℹ️ La tabla "${table}" está vacía en producción. Sin registros para insertar.`);
			}
		}

		// Reactivar restricciones y triggers en local
		console.log('\n🚧 Reactivando restricciones y triggers locales...');
		await sqlLocal`SET session_replication_role = 'origin';`;

		// 2. Corregir y actualizar secuencias auto-incrementales
		console.log('🔄 Actualizando secuencias de autoincremento...');
		const columnsWithSequences = await sqlLocal`
			SELECT table_name, column_name
			FROM information_schema.columns
			WHERE table_schema = 'public'
			  AND (column_default LIKE 'nextval%' OR is_identity = 'YES')
		`;

		for (const col of columnsWithSequences) {
			const { table_name, column_name } = col;

			// Obtener el valor máximo actual
			const maxValResult = await sqlLocal.unsafe(`SELECT COALESCE(MAX("${column_name}"), 0) AS max_val FROM "${table_name}"`);
			const maxVal = parseInt(maxValResult[0].max_val, 10);

			// Comprobar si existe una secuencia asociada a esta columna
			const seqResult = await sqlLocal.unsafe(`SELECT pg_get_serial_sequence('"${table_name}"', '${column_name}') AS seq_name`);
			const seqName = seqResult[0]?.seq_name;

			if (seqName) {
				const nextVal = maxVal + 1;
				await sqlLocal.unsafe(`SELECT setval('${seqName}', ${nextVal}, false)`);
				console.log(`⚡ Secuencia "${seqName}" establecida en el siguiente valor: ${nextVal}`);
			}
		}

		console.log('\n🎉 ¡Sincronización finalizada con éxito!');
	} catch (error) {
		console.error('\n❌ Ocurrió un error durante la sincronización:', error);
		// Aseguramos que se reactiven las restricciones si falla a mitad
		try {
			await sqlLocal`SET session_replication_role = 'origin';`;
		} catch (_) {}
	} finally {
		await sqlProd.end();
		await sqlLocal.end();
	}
}

main();
