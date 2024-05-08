import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from "node:url";


// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                client: path.join(__dirname, './index.html'),
                server: path.join(__dirname, './src/server/server.ts'),
            },
            output: {
                entryFileNames: '[name].js',
            }
        }
    },
    // Set the output directory to the dist folder

    plugins: [react({
        tsDecorators: true,
    })],
    resolve: {
        alias: [
            { find: '@', replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
        ]
    }
})
