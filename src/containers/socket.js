const child_process = require('child_process');
const io = require('socket.io')();

io.on('connection', (client) => {
    // console.log('connected')
    client.on('info', data => {
        console.log(data);
        client.emit('acknowledge', "received");
    });

    client.on('disconnect', () => {
        // console.log('user disconnected');
        io.close()
    });
});


const port = 8080;
io.listen(port);
// console.log('listening on port ', port);

child_process.exec(`b.bat`, (error, stdout, stderr) => {
    // console.log("--------------from py ")
    // if (error) {
    //     console.error(`exec error: ${error}`);
    //     return;
    // }
    // console.log(`stdout: ${stdout}`);
    // console.error(`stderr: ${stderr}`);
    // console.log("--------------end py ")
});


