import { Server } from "socket.io";

const setupWebSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://192.168.12.250:3008",
                "http://192.168.12.250:3009",
                "http://192.168.12.250:3333",
                "http://192.168.12.250:9030",
            ],
            methods: ["GET", "POST"],
            allowedHeaders: ["Auth-Type", "Content-Type", "Authorization", "token-authorization"],
            credentials: true
        }
    });

    // Store connected users
    const connectedUsers = new Map();
    const adminUsers = new Set();

    io.on('connection', (socket) => {
        // Handle user identification
        socket.on('identify', (userData) => {
            console.log('User identified:', userData);
            
            // Store user data
            connectedUsers.set(socket.id, userData);
            
            // If user is a superadmin, add to admin set
            if (userData.isSuperAdmin) {
                adminUsers.add(socket.id);
            }
            
            // Notify admins about new user connection
            if (!userData.isSuperAdmin) {
                for (const adminId of adminUsers) {
                    io.to(adminId).emit('user-status', {
                        userId: userData.userId,
                        name: userData.name,
                        status: 'online',
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });

        // Handle chat messages
        socket.on('chat-message', (message) => {
            const userData = connectedUsers.get(socket.id);
            
            if (!userData) {
                return; // User not identified
            }
            
            // If sender is admin, send to specific user
            if (userData.isSuperAdmin && message.recipient) {
                // Find socket ID for recipient
                let recipientSocketId = null;
                for (const [socketId, user] of connectedUsers.entries()) {
                    if (user.userId === message.recipient) {
                        recipientSocketId = socketId;
                        break;
                    }
                }
                
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('chat-message', {
                        ...message,
                        isAdmin: true
                    });
                }
            } 
            // If sender is regular user, send to all admins
            else if (!userData.isSuperAdmin) {
                for (const adminId of adminUsers) {
                    io.to(adminId).emit('chat-message', message);
                }
            }
            
            // Always send back to sender for confirmation
            socket.emit('chat-message', message);
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            const userData = connectedUsers.get(socket.id);
            
            if (!userData) {
                return; // User not identified
            }
            
            // If user is admin, send typing indicator to specific user
            if (userData.isSuperAdmin && data.recipient) {
                // Find socket ID for recipient
                let recipientSocketId = null;
                for (const [socketId, user] of connectedUsers.entries()) {
                    if (user.userId === data.recipient) {
                        recipientSocketId = socketId;
                        break;
                    }
                }
                
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('typing', {
                        sender: userData.userId,
                        timestamp: data.timestamp
                    });
                }
            } 
            // If user is regular user, send typing indicator to all admins
            else if (!userData.isSuperAdmin) {
                for (const adminId of adminUsers) {
                    io.to(adminId).emit('typing', {
                        sender: userData.userId,
                        timestamp: data.timestamp
                    });
                }
            }
        });

        // Handle status changes for notices
        socket.on('statusChange', async (data) => {
            try {
                // Broadcast the update to all connected clients
                io.emit('noticeUpdate', {
                    NoticeHeaderID: data.noticeId,
                    // Include any other relevant notice data
                    ESTADO: data.ESTADO,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error handling status change:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            const userData = connectedUsers.get(socket.id);
            
            if (userData) {
                // If user was admin, remove from admin set
                if (userData.isSuperAdmin) {
                    adminUsers.delete(socket.id);
                } 
                // If user was regular user, notify admins
                else {
                    for (const adminId of adminUsers) {
                        io.to(adminId).emit('user-status', {
                            userId: userData.userId,
                            name: userData.name,
                            status: 'offline',
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                
                // Remove user from connected users
                connectedUsers.delete(socket.id);
            }
        });
    });

    return io;
};

export default setupWebSocket;