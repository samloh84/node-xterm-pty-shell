const http = require('http');
const nodePath = require('path');
const child_process = require('child_process');
const os = require('os');

const _ = require('lodash');
const express = require('express');
const node_pty = require('node-pty');

const app = express();
const express_ws = require('express-ws')(app);
const server = http.createServer(app);


const shell_command = os.platform() === 'win32' ? 'powershell.exe' : 'bash';


app.ws('/shell', function (ws, req) {

    console.log('user connected');

    let shell = node_pty.spawn(shell_command, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: _.merge({}, process.env, {LANG: 'C.UTF-8'})
    });

    shell.on('error', function (err) {
        console.error(err.stack);
        process.exit(1);
    });

    shell.on('data', function (data) {
        ws.send(data);
    });

    ws.on('message', function (data) {
        shell.write(data);
    });

    ws.on('close', function () {
        console.log('user disconnected');
        shell.kill();
    })

});

app.use(express.static(nodePath.resolve(process.cwd(), 'static')));


app.listen(3000, function () {
    console.log('Listening on port 3000');
});
