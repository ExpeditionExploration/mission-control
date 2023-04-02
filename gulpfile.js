const { series, parallel } = require('gulp');
const { spawnSync } = require('child_process');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv

function clean(done) {
    spawnSync('rm', ['-rf', 'build'], { stdio: 'inherit' });
    spawnSync('mkdir', ['build'], { stdio: 'inherit' });
    done();
}

function server(done) {
    spawnSync('rm', ['-rf', 'dist'], { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
    spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
    spawnSync('cp', ['-r', 'server/dist/', 'build'], { stdio: 'inherit' });
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
    const host = `jupiter2@explorationsystems.local`;
    const dir = `/home/xs/ExplorationSystems/MissionControl`;

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
        spawnSync('ssh', [host, `cd ${dir} && npm install --omit=dev`], { stdio: 'inherit' });
    }
    done();
}

exports.build = series(
    clean,
    // server
    parallel(server, client)
);
exports.deploy = deploy;