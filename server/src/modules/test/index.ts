// https://systeminformation.io/cpu.html
import { ModuleWithWorker } from '../../types';

const workerTest: ModuleWithWorker = ({ emit, log, worker }) => {
    let count = 0;

    worker.on('res', (data: number) => {
        count = data;
        console.log(count);
    })

    setInterval(() => {

        worker.emit('calc', count);
    }, 1);
};

workerTest.id = 'WorkerTest';
workerTest.worker = './worker.py';

export default workerTest;

