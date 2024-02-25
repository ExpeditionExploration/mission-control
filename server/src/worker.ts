import { ChildProcess, spawn } from 'child_process';
import debug from 'debug';
import { EventEmitter } from 'stream';
import fs from 'fs';
import path from 'path';
import config from './config';
import WebSocket, { WebSocketServer } from 'ws';

type WorkerPayload = {
    data: any;
    action: 'event' | 'log';
    event: string;
}

export class Worker {
    private readonly events = new EventEmitter();
    private socket?: WebSocket;
    private server: WebSocketServer;
    private worker?: ChildProcess;
    private log: debug.Debugger;
    static baseSocketPort: number = 17506
    static workerIndex: number = 0;

    constructor(
        private readonly workerPath: string,
        log: debug.Debugger) {
        this.log = log.extend('Worker');

        const socketPort = Worker.getNextSocketPort();

        this.server = new WebSocketServer({
            port: socketPort,
        });
        this.server.on('connection', (ws) => {
            this.events.emit('ready');
            ws.on('message', (data) => {
                const payload = JSON.parse(data.toString()) as WorkerPayload;
                console.log('Payload', payload);
                switch (payload.action) {
                    case 'event':
                        this.events.emit(payload.event, payload.data);
                        break;
                    case 'log':
                        this.log(payload.data);
                        break;
                    default:
                        this.log('Unknown payload action', payload);
                        break;
                }
                // this.server.clients.forEach(function each(client) {
                //     if (client !== ws && client.readyState === WebSocket.OPEN) {
                //         client.send(data, { binary: isBinary });
                //     }
                // });
            });
        });

        this.server.on('listening', () => {
            // Only start the worker once the server is listening
            console.log('Listening on', socketPort);
            switch (path.extname(workerPath)) {
                case '.py':
                    this.worker = spawn(config.workers.python.cmd, ['-u', path.join(__dirname, 'worker.py'), workerPath, socketPort.toString()], {
                        stdio: 'inherit'
                    });
                    break;
                default:
                    throw new Error('Unsupported worker type');
            }

        })

        // setTimeout(() => {
        //     this.connect();
        // }, 1000)

        // worker.stdout?.on('data', (data: Buffer) => {
        //     const message = data.toString();
        //     try {
        //         const [rawPrint, rawPayload] = message.split(PAYLOAD_IDENTIFIER);
        //         if (rawPayload) {
        //             const payload = JSON.parse(rawPayload) as WorkerPayload;

        //             switch (payload.action) {
        //                 case 'event':
        //                     this.events.emit(payload.event, payload.data);
        //                     break;
        //                 case 'log':
        //                     this.log(payload.data);
        //                     break;
        //                 default:
        //                     this.log('Unknown payload action', payload);
        //                     break;
        //             }
        //         } else {
        //             // If the payload identifier is not found, just log the message to debug
        //             console.log(rawPrint);
        //         }
        //     } catch (error) {
        //         console.error('Worker error', error);
        //     }
        // });
    }

    // private connect() {
    //     if (this.socket) {
    //         this.socket.close();
    //     }

    //     try {
    //         this.socket = new WebSocket(`ws://localhost:${this.socketPort}`, {
    //             perMessageDeflate: false
    //         });

    //         this.socket.on('close', () => {
    //             this.log('Socket closed');
    //             this.connect();
    //         })
    //     } catch (error) {
    //         process.nextTick(() => {
    //             this.connect();
    //         });
    //     }
    // }

    on(event: string, callback: (data: any) => void) {
        this.events.on(event, callback);
    }
    emit(event: string, data: any) {
        this.server.clients.forEach(client => {
            client.send(JSON.stringify({
                event,
                data,
            }));
        });
        // if (this.worker.stdin) {
        //     this.log('Emitting event', event, data);
        //     // try {
        //     //     this.socket.send(JSON.stringify({
        //     //         event,
        //     //         // Send an object so that it can correctly serialize the data and allows for future expansion
        //     //         data,
        //     //     }));
        //     // } catch (error) {
        //     //     this.log('Error sending to worker', error);
        //     // }
        //     this.worker.stdin.write(JSON.stringify({
        //         event,
        //         // Send an object so that it can correctly serialize the data and allows for future expansion
        //         data,
        //     }) + '\n');
        // } else {
        //     this.log('Worker socket not available');
        // }
    }

    static getNextSocketPort() {
        const nextIndex = Worker.workerIndex++;
        return Worker.baseSocketPort + nextIndex;
    }

    // static replaceStaticVariablesInLoader(loader: string, {
    //     socketPort,
    //     workerPath
    // }: {
    //     socketPort: number;
    //     workerPath: string;
    // }) {
    //     loader = loader.replace(/__SOCKET_PORT__/g, socketPort.toString());
    //     loader = loader.replace(/__WORKER_PATH__/g, workerPath);
    //     return loader;
    // }

    static loadPythonWorker(workerPath: string) {
        const socketPort = Worker.getNextSocketPort();

        const worker = spawn(config.workers.python.cmd, ['-u', path.join(__dirname, 'worker.py'), workerPath, socketPort.toString()], {
            stdio: 'inherit'
        });
        return worker;
    }
}

