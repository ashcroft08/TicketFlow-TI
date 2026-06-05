import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.svelte')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Si ya tiene offlineEnhance o no tiene use:enhance, saltar (excepto que sea el de settings que ya modificamos a medias)
    if (content.includes('use:enhance') && !content.includes('offlineEnhance')) {
        
        // Reemplazar use:enhance
        content = content.replace(/use:enhance/g, 'use:offlineEnhance');
        
        // Inyectar import
        content = content.replace(/<script([^>]*)>/, `<script$1>\n\timport { offlineEnhance } from '$lib/client/offlineEnhance';`);
        
        fs.writeFileSync(file, content);
        changedCount++;
    }
});

console.log(`Migrated ${changedCount} files.`);
