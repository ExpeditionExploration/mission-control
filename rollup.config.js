const resolve = require('@rollup/plugin-node-resolve');
const swc = require('@rollup/plugin-swc');
const replace = require('@rollup/plugin-replace');

module.exports = {
    input: './client/client.tsx',
    output: {
        dir: 'build',
        format: 'cjs',
    },
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        resolve(),
        swc({
            swc: {
                envName: 'production',
                configFile: false,
                jsc: {
                    target: 'esnext',
                    parser: {
                        syntax: 'typescript',
                        tsx: true,
                    },
                    transform: {
                        react: {
                            pragma: 'React.createElement',
                            pragmaFrag: 'React.Fragment',
                            throwIfNamespace: true,
                            development: false,
                        },
                    },
                },
            },
        }),
    ],
};
