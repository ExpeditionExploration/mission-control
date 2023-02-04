import Module from '../Module';
import si from 'systeminformation';
// https://systeminformation.io/cpu.html
export const Stats: Module = {
    controller: ({
        send,
        events
    }) => {
        setInterval(async () => {
            const [cpu, mem, temp] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.cpuTemperature(),
            ]);
            send({
                cpu: cpu.currentLoad,
                mem: mem.free / mem.total * 100,
                temp: temp.main
            });
        }, 1000)
    }
}