const { isAuthorized } = require('./middleware');

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { handleConnection, setNotificationInterval, handleMessageClicked, getShowDurationMilis } = require('./MessageClient');
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.use((socket, next) => {
    if (!isAuthorized(socket.handshake)) {
        const err = new Error();
        err.data = { content: "Invalid Token. Access denied." };
        next(err);
    }
    next();
});

io.on('connection', (socket) => {
    handleConnection(socket);
    const notificationDuration = getShowDurationMilis();
    io.to(socket.id).emit("notification duration", notificationDuration);

    setNotificationInterval(io, socket);

    socket.on('message clicked', (messageId) => {
        handleMessageClicked(socket, messageId);
    });
    socket.on('disconnect', (reason) => {
        console.log("client disconnected. " + reason);
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});