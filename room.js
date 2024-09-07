const socket = io();

const createRoomForm = document.getElementById('create-room-form');
const joinRoomForm = document.getElementById('join-room-form');
const createUsername = document.getElementById('create-username');
const joinUsername = document.getElementById('join-username');
const roomIdInput = document.getElementById('room-id');
const errorMessage = document.getElementById('error-message');

// Handle room creation
createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = createUsername.value.trim();
    const roomId = generateRoomId(); // Generate room ID here

    if (username) {
        socket.emit('create room', { username, roomId });
        window.location.href = `chat.html?username=${username}&roomId=${roomId}`;
    }
});


// Handle joining a room
joinRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = joinUsername.value.trim();
    const roomId = roomIdInput.value.trim();

    if (username && roomId) {
        socket.emit('join room', { username, roomId });
    }
});

socket.on('room joined', (room) => {
    window.location.href = `chat.html?username=${room.username}&roomId=${room.roomId}`;
});

socket.on('room not found', (message) => {
    // Display the error message to the user
    errorMessage.textContent = "wrong room id";
    errorMessage.style.display = 'block';
});

function generateRoomId() {
  return  Math.random().toString(36).substring(2, 10);
}
window.location.href = `chat.html?username=${username}&roomId=${roomId}`;
