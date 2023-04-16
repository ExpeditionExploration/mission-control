const {spawn, exec} = require('child_process');

const c = exec( {shell: '/bin/zsh', stdio: ['pipe', 'pipe', 'pipe']})
c.stdout.on('data', (data) => console.log(data.toString()))
c.stderr.on('data', (data) => console.log(data.toString()))
setInterval(()=>c.stdin.write('echo "hello world"'), 1000)