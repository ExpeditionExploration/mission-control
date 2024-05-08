import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const config = {
    input: 'client/main.tsx',
    output: {
        dir: 'build',
        // format: 'cjs',
        format: 'es',
    },
    plugins: [
        babel({
            babelConfig: {
                babelrc: false,
                configFile: false,
                presets: ['@babel/preset-react', '@babel/preset-typescript'],
                // plugins: ['babel-plugin-transform-typescript-metadata']
                plugins: ['@babel/plugin-proposal-decorators'],
            },
        }),
        // nodeResolve(),
    ],
};

export default config;
