'use strict';

const path = require('path');
const socketio = require('socket.io');
const RoomManager = require(path.join(__dirname, 'modules', 'roommanager.js'));

const io = socketio.listen(58100);
const room_manager = new RoomManager();


io.sockets.on("connection", (socket) => {
    /* ペアリングトークン作成要求 */
    socket.on("make_pairing_token", (data) => {
        /* 作成したペアリングトークンを返す */
        const token = room_manager.makePairToken(socket);
        console.log('make pairing token: ', token);
        socket.emit('pairing_token', {body: token});
    });

    /* ペアリングトークンの入力 */
    socket.on('input_pairing_token', (data) => {
        /* トークンと合致するルームが見つかればユーザを入室 */
        console.log('input_pairng_token: ', data.body);
        const room = room_manager.getSameToken(data.body);
        if(room) {
            socket.join(room.token);
            room.socket.join(room.token);
            console.log('make room: ', room.token);
            io.to(room.token).emit('join_room', {body: room.token});
        } else {
            socket.emit('error_message', {body: 'there is no room with your token'});
        }
    });

    socket.on('createGuiderShareWindow', (data) => {
        console.log(data)
    io.emit('createGuiderShareWindow', data);
    });
    socket.on('createTraineeShareWindow', (data) => {
        console.log(data)
    io.emit('createTraineeShareWindow', data);
    });
    socket.on('closeWindow', (data) => {
    io.emit('closeWindow', data);
    });
    socket.on('move', (data) => {
    io.emit('move', data);
    });
    socket.on('resize', (data) => {
    io.emit('resize', data);
    });
    socket.on('updated', (data) => {
    io.emit('updated', data);
    });
    socket.on('scroll', (data) => {
    io.emit('scroll', data);
    });
    socket.on('create_guider_window', (data) => {
        console.log('create_guider_window', data);
        socket.to(data.room).emit('create_guider_window', data);
    });
});
