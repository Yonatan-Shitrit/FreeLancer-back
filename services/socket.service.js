const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        socket.userId = socket.id
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        socket.on('chat newMsg', msg => {
            console.log('Emitting Chat msg', msg);
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // Broadcasting manually:
            socket.broadcast.to(socket.myTopic).emit('chat addMsg', msg)
            // emits only to sockets in the same room
            // gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('chat typing', ({ username, isDoneTyping = false }) => {
            // console.log('username',username);
            // console.log('username',username);
            console.log('broadcasting chat typing');
            broadcast({ type: 'chat userTyping', data: { username, isDoneTyping }, room: socket.myTopic, userId: socket.userId })
        })
        socket.on('chat typing', ({ username, isDoneTyping = false }) => {
            console.log('username', username);
            console.log('isDoneTyping', isDoneTyping);
            //broadcasting manually
            socket.broadcast.to(socket.myTopic).emit('chat test', { username, isDoneTyping })
            // broadcasting using built function
            // broadcast({ type: 'chat test', data: { username, isDoneTyping }, room: socket.myTopic, userId: socket.userId })

        })
        socket.on('watch user', watchedUserId => {
            console.log('watch user', watchedUserId);
            if (socket.watchedUserId === watchedUserId) return;
            if (socket.watchedUserId) {
                socket.leave(socket.watchedUserId)
            }
            socket.join(watchedUserId)
            socket.watchedUserId = watchedUserId
        })
        socket.on('order change', order => {
            console.log('order change broadcast');
            broadcast({ type: 'order update', data: order, userId: socket.userId })
        })
    })
}


async function emitToWatchedUsers(msg) {
    const sockets = await gIo.fetchSockets();
    socketsWithUsers = sockets.filter(socket => socket.watchedUserId)
    console.log('socketsWithUsers.length', socketsWithUsers.length);
    socketsWithUsers.forEach(socket => {
        console.log('Hey', socket.watchedUserId);
        gIo.to(socket.watchedUserId).emit('shop changed', msg)
    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = await _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket 
async function broadcast({ type, data, room = null, userId }) {
    console.log('BROADCASTING', arguments);
    const excludedSocket = await _getUserSocket(userId)
    if (!excludedSocket) {
        // logger.debug('Shouldnt happen, socket not found')
        // _printSockets();
        return;
    }
    logger.debug('broadcast to all but user: ', userId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId == userId)
    return socket;
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}