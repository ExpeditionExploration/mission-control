const { series, parallel } = require('gulp');
const { spawnSync } = require('child_process');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv

function clean(done) {
    spawnSync('rm', ['-rf', './build'], { stdio: 'inherit' });
    spawnSync('mkdir', ['build'], { stdio: 'inherit' });
    done();
}

function server(done) {
    spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
    spawnSync('cp', ['-r', 'server/dist/', 'build'], { stdio: 'inherit' });
    spawnSync('cp', ['server/package.json', 'build'], { stdio: 'inherit' });
    done();
}

function client(done) {
    spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
    spawnSync('cp', ['-r', 'client/dist/', 'build/public'], { stdio: 'inherit' });
    done();
}

function deploy(done) {
    // const password = argv.p;
    // const doInstall = argv.i;
    const updateOnly = argv.update;
    const host = 'pi@raspberrypi.local';
    const dir = '~/mission/mission-control';
    if (!updateOnly) {
        console.log(`Cleaning directory on ${host}`);
        spawnSync('ssh', [host, `rm -rf ${dir}`], { stdio: 'inherit' });
    }

    console.log(`Copying files to ${host}`);
    spawnSync('rsync', ['-r', 'build/', `${host}:${dir}`], { stdio: 'inherit' });

    if (!updateOnly) {
        console.log(`Installing dependencies on ${host}`);
        spawnSync('ssh', [host, `cd ${dir}`, '&&', 'npm install --omit=dev'], { stdio: 'inherit' });
    }
    done();
}

exports.build = series(
    clean,
    parallel(server, client)
);
exports.deploy = deploy;