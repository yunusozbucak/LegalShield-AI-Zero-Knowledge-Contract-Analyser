import path from 'path';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serves the Vercel Functions in /api during `npm run dev`, so local development
 * matches production without exposing the API key to the browser.
 */
const devApi = (env: Record<string, string>): Plugin => ({
  name: 'dev-api',
  configureServer(server: ViteDevServer) {
    Object.assign(process.env, env);
    server.middlewares.use('/api/analyze', async (req, res) => {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const mod = await server.ssrLoadModule('/api/analyze.ts');
        const handler = mod[req.method ?? 'GET'];
        if (typeof handler !== 'function') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const response: Response = await handler(
          new Request('http://localhost/api/analyze', {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          })
        );
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Dev API error' }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
    // Load all env vars (no VITE_ prefix filter). They are only used server-side
    // and are NOT injected into the client bundle.
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), devApi(env)],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
