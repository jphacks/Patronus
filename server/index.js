'use strict';

const socketio = require("socket.io");
const io = socketio.listen(58100);

console.log("start socket.io server.");

io.sockets.on("connection", function (socket) {
    console.log("user connect!");

    socket.on("make_pairing_token", function (data) {
        console.log('make pairing token: ', data);
        socket.emit('pairing_token', data);
    });
});
