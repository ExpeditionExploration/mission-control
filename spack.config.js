const { config } = require('@swc/core/spack');

module.exports = config({
    mode: 'production',
    entry: {
        web: __dirname + '/client/client.tsx',
    },
    output: {
        path: __dirname + '/build',
    },
});
