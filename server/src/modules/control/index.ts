import Module from '../Module';
import si from 'systeminformation';
// https://systeminformation.io/cpu.html
export const Control: Module = {
    controller: ({
        send,
        events
    }) => {
        events.on('module:Control', (data) => {
            console.log(data)
        });
        
    }
}