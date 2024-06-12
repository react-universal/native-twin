import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';
import assetsJSON from '@entur/vite-plugin-assets-json';

export default defineConfig({
  assetsInclude: ['**/*.json'],
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: 'inline',
      plugins: [importMetaUrlPlugin as any],
    },
  },
  worker: {
    format: 'es',
  },
  plugins: [
    vsixPlugin(),
    assetsJSON(),
    {
      // For the *-language-features extensions which use SharedArrayBuffer
      name: 'configure-response-headers',
      apply: 'serve',
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'credentials');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          next();
        });
      },
    },

    {
      name: 'force-prevent-transform-assets',
      apply: 'serve',
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (req.originalUrl != null) {
              const pathname = new URL(req.originalUrl, import.meta.url).pathname;
              if (pathname.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                res.write(fs.readFileSync(path.join(__dirname, pathname)));
                res.end();
              }

              if (pathname.endsWith('.json')) {
                console.log('JSON: ', pathname);
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.write(fs.readFileSync(path.join(__dirname, pathname)));
                res.end();
              }
            }

            next();
          });
        };
      },
    },
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    fs: {
      allow: ['/'],
    },
  },
  define: {
    rootDirectory: JSON.stringify(__dirname),
  },
  build: {
    rollupOptions: {
      // plugins: [vsixPlugin()],
      logLevel: 'debug',
      // external: ['@babel/traverse'],
    },
  },
  resolve: {
    dedupe: ['vscode'],
  },
});
