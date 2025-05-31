import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    ssr: {
        external: true,
    },
    build: {
        emptyOutDir: false,
        sourcemap: true,
        // minify: true,
        // terserOptions: {
        //     mangle: true,
        //     compress: true,
        // }
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                spatial: resolve(
                    __dirname,
                    'src/modules/spatial/window/index.html',
                ),
            },
        },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: [
            {
                find: 'src',
                replacement: fileURLToPath(new URL('./src', import.meta.url)),
            },
        ],
    },
});
