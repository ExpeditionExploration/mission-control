const { series, parallel } = require('gulp');
const { spawnSync } = require('child_process');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const host = `root@NanoPi-NEO3.local`;
const dir = `~/mission-control`;

function clean(done) {
    spawnSync('rm', ['-rf', 'build'], { stdio: 'inherit' });
    spawnSync('mkdir', ['build'], { stdio: 'inherit' });
    done();
}

function server(done) {
    spawnSync('rm', ['-rf', 'dist'], { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
    spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
    spawnSync('cp', ['-r', 'server/dist/', 'build'], { stdio: 'inherit' });
    spawnSync('cp', ['server/package.json', 'server/forever.json', 'server/start', 'server/stop', 'build'], {
        stdio: 'inherit',
    });
    spawnSync('cp', ['server/package.json', 'build'], { stdio: 'inherit' });
    done();
}

function client(done) {
    spawnSync('rm', ['-rf', 'dist'], { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
    spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
    spawnSync('cp', ['-r', 'client/dist/', 'build/public'], { stdio: 'inherit' });
    done();
}

function deploy(done) {
    const install = argv.install;
    const clean = argv.clean;

    if (clean) {
        console.log(`Cleaning directory on ${host}`);
        spawnSync('ssh', [host, `rm -rf ${dir}`], { stdio: 'inherit' });
    }

    console.log(`Copying files to ${host}`);
    spawnSync('ssh', [host, `mkdir -p ${dir}`], { stdio: 'inherit' }); // Ensure directory exists
    spawnSync('rsync', ['-r', 'build/', `${host}:${dir}`], { stdio: 'inherit' });

    if (install) {
        console.log(`Installing dependencies on ${host}`);
        console.log(`Please wait while dependencies are installed...`);
        spawnSync('ssh', [host, '-t', `bash -i -c 'cd ${dir} && npm install --omit=dev'`], { stdio: 'inherit' });
    }
    done();
}

exports.build = series(
    clean,
    // server
    parallel(server, client)
);
exports.deploy = deploy;
exports.updateServer = series(server, deploy);

exports.start = function (done) {
    spawnSync('ssh', [host, '-t', `bash -i -c 'cd ${dir} && npm start'`], { stdio: 'inherit' });
};
