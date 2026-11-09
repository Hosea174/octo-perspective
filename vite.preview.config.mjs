// @ts-check
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

/** @type {import('vite').Plugin} */
const compressedWasm = {
  name: 'compressed-wasm-preview',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
      if (!/^\/wasm\/vision_wasm_(?:nosimd_)?internal\.wasm$/.test(pathname) || !['GET', 'HEAD'].includes(req.method ?? '')) return next();
      res.setHeader('Vary', 'Origin, Accept-Encoding');
      if (req.headers.range) return next();
      /** @type {Map<string, number>} */
      const accepted = new Map();
      for (const part of (req.headers['accept-encoding'] ?? '').split(',')) {
        const [name, ...params] = part.trim().toLowerCase().split(';');
        const q = params.find(param => param.trim().startsWith('q='));
        accepted.set(name, q ? Number(q.trim().slice(2)) : 1);
      }
      const choices = [['br', 'br'], ['gzip', 'gz']].map(([encoding, suffix]) => ({ encoding, suffix, q: accepted.get(encoding) ?? accepted.get('*') ?? 0 })).filter(choice => choice.q > 0).sort((a, b) => b.q - a.q);
      const choice = choices.find(item => existsSync(path.resolve('dist/wasm', `${path.basename(pathname)}.${item.suffix}`)));
      if (!choice) return next();
      const file = path.resolve('dist/wasm', `${path.basename(pathname)}.${choice.suffix}`);
      res.setHeader('Content-Type', 'application/wasm');
      res.setHeader('Content-Encoding', choice.encoding);
      res.setHeader('Content-Length', statSync(file).size);
      if (req.method === 'HEAD') return res.end();
      createReadStream(file).on('error', error => res.destroy(error)).pipe(res);
    });
  },
};

export default defineConfig({
  build: { outDir: 'dist' },
  preview: { host: '127.0.0.1', port: 4321, strictPort: true },
  plugins: [compressedWasm],
});
