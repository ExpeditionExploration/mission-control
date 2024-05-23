import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
    ssr: {
        external: true
    },
    build: {
        emptyOutDir: false,
        sourcemap: true,
        // rollupOptions: {
        //     output: {
        //         entryFileNames: 'client.js',
        //     }
        // }
    },
    plugins: [react()],
    resolve: {
        alias: [
            // { find: '@inject', replacement: fileURLToPath(new URL('./src/inject.ts', import.meta.url)) },
            // { find: '@module', replacement: fileURLToPath(new URL('./src/module.ts', import.meta.url)) },
            { find: 'src', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        ]
    }
})
