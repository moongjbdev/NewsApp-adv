// Socket service for handling realtime notifications
let io = null;
let userSocketMap = {};

// Initialize socket service
function initializeSocket(socketIO) {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, id] of Object.entries(userSocketMap)) {
        if (id === socket.id) {
          delete userSocketMap[userId];
          console.log(`User ${userId} disconnected from socket ${socket.id}`);
          break;
        }
      }
    });
  });
}

// Send realtime notification to a specific user
function sendRealtimeNotification(userId, notification) {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot send realtime notification');
    return;
  }
  
  const socketId = userSocketMap[userId];
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    console.log(`Realtime notification sent to user ${userId} via socket ${socketId}`);
  } else {
    console.log(`User ${userId} not connected, notification will be delivered when they reconnect`);
  }
}

// Get connected users count
function getConnectedUsersCount() {
  return Object.keys(userSocketMap).length;
}

// Get user socket map (for debugging)
function getUserSocketMap() {
  return { ...userSocketMap };
}

module.exports = {
  initializeSocket,
  sendRealtimeNotification,
  getConnectedUsersCount,
  getUserSocketMap
}; 