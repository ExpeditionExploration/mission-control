import ServerModule from '../ServerModule';
import si from 'systeminformation';
// https://systeminformation.io/cpu.html
export class Stats extends ServerModule {
    static id = 'stats';

    constructor(...args: [any]) {
        super(...args);

        setInterval(async () => {
            const [cpu, mem, temp] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.cpuTemperature(),
            ]);
            this.send({
                cpu: cpu.currentLoad,
                mem: mem.free / mem.total * 100,
                temp: temp.main
            });
        }, 1000)
    }
}