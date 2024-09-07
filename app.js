const socket = io();

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list');

let reconnected = false;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const roomId = urlParams.get('roomId');
document.getElementById('room-id-display').textContent = roomId;

if (!username || !roomId) {
    window.location.href = 'index.html'; // Redirect if missing params
} else {
    socket.emit('join room', { username, roomId });
}

// Handle form submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;

    if (message.trim()) {
        // Send message to server
        socket.emit('chat message', { roomId, msg: message });

        // Clear input
        messageInput.value = '';
    }
});

socket.on('chat message', (message) => {
    // Display received message
    addMessage(message, message.startsWith(username) ? 'sent' : 'received');
});

// Listen for new user joining
socket.on('user joined', (message) => {
    addNotification(message);
});

// Listen for user leaving
socket.on('user left', (message) => {
    addNotification(message);
});

// Listen for reconnection
socket.on('reconnect', () => {
    if (!reconnected) {
        socket.emit('join room', { username, roomId });
        reconnected = true;
    }
});

// Listen for the updated user list
socket.on('user list', (users) => {
    userList.innerHTML = ''; // Clear current list
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
});

function addMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;
    messages.appendChild(messageElement);

    // Scroll to the latest message
    messages.scrollTop = messages.scrollHeight;
}

function addNotification(notification) {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.textContent = notification;
    messages.appendChild(notificationElement);

    // Scroll to the latest message
    messages.scrollTop = messages.scrollHeight;
}


//     copy to clipboard function
document.getElementById('copy-icon').addEventListener('click', function() {
    // Get the room ID text
    var roomId = document.getElementById('room-id-display').innerText;

    // Copy the room ID to the clipboard
    navigator.clipboard.writeText(roomId).then(function() {
        console.log('Room ID copied to clipboard:', roomId);

        // Show the popup message
        var popup = document.getElementById('copy-popup');
        popup.classList.add('show');

        // Hide the popup message after 2 seconds
        setTimeout(function() {
            popup.classList.remove('show');
        }, 2000);
    }).catch(function(error) {
        console.error('Failed to copy Room ID:', error);
    });
});
