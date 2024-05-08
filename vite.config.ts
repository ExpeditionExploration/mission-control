import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [babel({
        babelConfig: {
            babelrc: false,
            configFile: false,
            presets: ["@babel/preset-react", "@babel/preset-typescript"],
            // plugins: ['babel-plugin-transform-typescript-metadata']
            // plugins: [
            //     [
            //         "@babel/plugin-proposal-decorators",
            //         { legacy: true },
            //     ],
            // ],
        },
    })],
})
