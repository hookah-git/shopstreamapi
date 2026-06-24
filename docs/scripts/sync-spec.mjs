import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../swagger.json');
const dest = resolve(here, '../public/openapi.json');

const spec = JSON.parse(readFileSync(src, 'utf8'));

if (!Array.isArray(spec.servers) || spec.servers.length === 0) {
  spec.servers = [
    {
      url: 'https://shop-stream.ru/api',
      description: 'Production',
    },
  ];
}

mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(spec, null, 2));
console.log(`[sync:spec] ${src} -> ${dest} (servers: ${spec.servers.length})`);
