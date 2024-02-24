import { ChildProcess, spawn } from 'child_process';
import debug from 'debug';
import { EventEmitter } from 'stream';

const PAYLOAD_IDENTIFIER = '__WORKER__:';

type WorkerPayload = {
    data: any;
    action: 'event' | 'log';
    event: string;
}

export class Worker {
    private readonly events = new EventEmitter();

    constructor(
        private readonly worker: ChildProcess,
        private readonly log: debug.Debugger) {

        worker.stdout?.on('data', (data: Buffer) => {
            const message = data.toString();
            try {
                const [rawPrint, rawPayload] = message.split(PAYLOAD_IDENTIFIER);
                if (rawPayload) {
                    const payload = JSON.parse(rawPayload) as WorkerPayload;

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
                } else {
                    // If the payload identifier is not found, just log the message to debug
                    console.log(rawPrint);
                }
            } catch (error) {
                console.error('Worker error', error);
            }
        });
    }
    on(event: string, callback: (data: any) => void) {
        this.events.on(event, callback);
    }
    emit(event: string, data: any) {
        if (this.worker.stdin) {
            this.log('Emitting event', event, data);
            this.worker.stdin.write(JSON.stringify({
                event,
                // Send an object so that it can correctly serialize the data and allows for future expansion
                data,
            }) + '\n');
        } else {
            this.log('Worker stdin not available');
        }
    }

    static loadPythonWorker(workerPath: string, log: debug.Debugger) {
        const worker = spawn('python3', ['-u', '-c', pythonLoader(workerPath)], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        worker.stderr?.on('data', (data: Buffer) => {
            console.error('Worker error', data.toString());
        });
        worker.on('error', (error) => {
            console.error('Worker error', error);
        });

        return new this(worker, log);
    }
}


const pythonLoader = (workerPath: string) => `
import sys
import json
import threading
import importlib.util
spec = importlib.util.spec_from_file_location('worker', '${workerPath}')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

payload_identifier = '${PAYLOAD_IDENTIFIER}'
events = {}

def on(event, callback):
    if event not in events:
        events[event] = []

    events[event].append(callback)

def emit(event, data):
    print(f"{payload_identifier}{json.dumps({'action': 'event', 'event': event, 'data': data}, indent=0)}")

def log(data):
    print(f"{payload_identifier}{json.dumps({'action': 'log', 'data': data}, indent=0)}")

# Load the worker
def startWorker():
    module.worker(on , emit, log)

# Listen for incoming data from the parent process
def listenForData():
    for line in sys.stdin:
        line = line.rstrip()

        try:
            payload = json.loads(line)

            # Adding this causes the worker to hang sometimes for some reason
            # It might be because the worker is blocking the event loop, but I'm not sure
            # It doesn't make sense because the because it seems like the event runs multiple times.
            # log(f"Received payload: {json.dumps(payload, indent=4)}") 

            event = payload.get('event')
            
            if event in events:
                for callback in events[event]:
                    callback(payload.get('data'))
        except json.JSONDecodeError as e:
            print(f"Invalid JSON: {e}")
            continue

# thread1 = threading.Thread(target=startWorker)
# thread2 = threading.Thread(target=listenForData)

# thread1.start()
# thread2.start()

startWorker()
listenForData()
`;