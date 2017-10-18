const port = system.args[1];
let app = require('http').createServer(handler)
let io = require('socket.io')(app);
let fs = require('fs');

app.listen(port);

function handler(req, res) {
    if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
}

io.on('connection', function (socket) {
    socket.on('start', function (data) {

    });
});