const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/')));
const rooms = {}; // Store room information

io.on('connection', (socket) => {
    console.log('A user connected');

    const updateUsersList = (roomId) => {
        io.to(roomId).emit('user list', rooms[roomId].users);
    };

    socket.on('create room', ({ username, roomId }) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { users: [] };
        }
    
        // Add the user only if they are not already in the room
        if (!rooms[roomId].users.includes(username)) {
            rooms[roomId].users.push(username);
        }
    
        socket.username = username;
        socket.roomId = roomId;
        socket.join(roomId);
    
        socket.emit('room joined', { username, roomId });
        io.to(roomId).emit('user joined', `${username} has created and joined the room`);
        updateUsersList(roomId);  // Update user list
    });
    
    socket.on('join room', ({ username, roomId }) => {
        if (rooms[roomId]) {
            // Add the user only if they are not already in the room
            if (!rooms[roomId].users.includes(username)) {
                rooms[roomId].users.push(username);
                socket.emit('room joined', { username, roomId });
                io.to(roomId).emit('user joined', `${username} has joined the room`);
            }
            socket.join(roomId);
            updateUsersList(roomId);  // Update user list
        } else {
            socket.emit('room not found', `Room ${roomId} does not exist`);
        }
    });
    

    socket.on('chat message', ({ roomId, msg }) => {
        io.to(roomId).emit('chat message', `${socket.username}: ${msg}`);
    });

    socket.on('disconnect', () => {
        if (socket.username && socket.roomId && rooms[socket.roomId]) {
            const roomUsers = rooms[socket.roomId].users;
            const userIndex = roomUsers.indexOf(socket.username);
    
            // Delay the leave notification to ensure it's not a quick reconnect
            setTimeout(() => {
                // Check again if the user is still disconnected (in case of a reconnection)
                if (io.sockets.adapter.rooms.get(socket.roomId)?.size === 0) {
                    if (userIndex !== -1) {
                        roomUsers.splice(userIndex, 1);
                    }
                    io.to(socket.roomId).emit('user left', `${socket.username} has left the chat`);
                    updateUsersList(socket.roomId);  // Update user list
                    socket.leave(socket.roomId);
                }
            }, 1000); // 1 second delay
        }
    });
    
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
