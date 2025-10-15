import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'repo-database-link.preview.emergentagent.com',
          '.preview.emergentagent.com',
          'localhost',
          '0.0.0.0'
        ],
        hmr: {
          clientPort: 443,
          protocol: 'wss'
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
