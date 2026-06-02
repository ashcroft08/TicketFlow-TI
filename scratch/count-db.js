import postgres from 'postgres';

async function main() {
    const localUrl = process.env.DATABASE_URL;
    const prodUrl = process.env.DATABASE_URL_PROD;

    const sqlLocal = postgres(localUrl);
    const sqlProd = postgres(prodUrl, { ssl: { rejectUnauthorized: false } });

    try {
        const [lCat, lAct] = await Promise.all([
            sqlLocal`SELECT count(*) FROM catalogo_articulos`,
            sqlLocal`SELECT count(*) FROM activos_ti`
        ]);

        const [pCat, pAct] = await Promise.all([
            sqlProd`SELECT count(*) FROM catalogo_articulos`,
            sqlProd`SELECT count(*) FROM activos_ti`
        ]);

        console.log('--- CONTEO DE FILAS ---');
        console.log('LOCAL:', {
            catalogo_articulos: lCat[0].count,
            activos_ti: lAct[0].count
        });
        console.log('PRODUCCION:', {
            catalogo_articulos: pCat[0].count,
            activos_ti: pAct[0].count
        });

    } catch (e) {
        console.error(e);
    } finally {
        await sqlLocal.end();
        await sqlProd.end();
    }
}

main();
