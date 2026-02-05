import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

let socket = null;

export const initializeSocket = (userId, token) => {
    if (socket && socket.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: {
            token,
            userId
        },
        autoConnect: true
    });

    socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('user_online');
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn('Socket not initialized. Call initializeSocket first.');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinConversation = (conversationId) => {
    if (socket) {
        socket.emit('join_conversation', conversationId);
    }
};

export const leaveConversation = (conversationId) => {
    if (socket) {
        socket.emit('leave_conversation', conversationId);
    }
};

export const emitTyping = (conversationId, isTyping) => {
    if (socket) {
        socket.emit('typing', { conversationId, isTyping });
    }
};

export default socket;
