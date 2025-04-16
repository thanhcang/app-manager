import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
    root: 'src/frontend',
    build: {
        outDir: '../../dist/frontend',
        emptyOutDir: true,
    },
    plugins: [reactPlugin()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/frontend'),
        },
    },
    server: {
        host: true, // 👈 binds to 0.0.0.0 to allow LAN access
        port: 5173,
        allowedHosts: ['cang-vm.sg'],
    }
});