import { Injectable, OnModuleInit } from '@nestjs/common';
import cp, { ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import { Transform } from 'stream';

const Pipe2Jpeg: {
    new(): Transform;
} = require('pipe2jpeg');

@Injectable()
export class MediaService {
    stream: ChildProcessWithoutNullStreams | null = null;
    p2j = new Pipe2Jpeg();

    startStream() { }

    getDevices() {
        throw new Error('Method not implemented.');
    }
}
