import { series, parallel } from 'gulp';
import { spawnSync } from 'child_process';
import yargs from 'yargs/yargs';

import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;
const host = `root@NanoPi-NEO3.local`;
const dir = `~/mission-control`;

function clean(done) {
    spawnSync('rm', ['-rf', 'dist'], { stdio: 'inherit' });
    done();
}

export function buildServer(done) {
    spawnSync('npm', ['run', 'build:server'], { stdio: 'inherit' });
    done();
}

export function buildClient(done) {
    spawnSync('npm', ['run', 'build:client'], { stdio: 'inherit' });
    done();
}

export function copyAdditionalFiles(done) {
    spawnSync('cp', ['package.json', 'dist/package.json'], {
        stdio: 'inherit',
    });
    done();
}

export function uploadToDevice(done) {
    const install = argv.install;
    const clean = argv.clean;

    if (clean) {
        console.log(`Cleaning directory on ${host}`);
        spawnSync('ssh', [host, `rm -rf ${dir}`], { stdio: 'inherit' });
    }

    console.log(`Copying files to ${host}`);
    spawnSync('ssh', [host, `mkdir -p ${dir}`], {
        stdio: 'inherit',
    }); // Ensure directory exists
    console.log(`Please wait while files are copied...`);
    spawnSync('rsync', ['-r', 'dist/', `${host}:${dir}`], {
        stdio: 'inherit',
    });

    if (install) {
        console.log(`Installing dependencies on ${host}`);
        console.log(`Please wait while dependencies are installed...`);
        spawnSync(
            'ssh',
            [host, '-t', `bash -i -c 'cd ${dir} && npm install --omit=dev'`],
            { stdio: 'inherit' },
        );
    }
    done();
}

export function start(done) {
    spawnSync('ssh', [host, '-t', `bash -i -c 'cd ${dir} && npm start'`], {
        stdio: 'inherit',
    });
    done();
}

export const build = series(
    clean,
    parallel(buildClient, buildServer),
    copyAdditionalFiles,
);
export const deploy = series(build, uploadToDevice);
