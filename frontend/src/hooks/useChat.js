import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { getSocket, joinConversation, leaveConversation, emitTyping } from '../services/socket';

export const useChat = (conversationId = null) => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    // Fetch all conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations();
            setConversations(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch conversations');
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (convId, page = 1) => {
        try {
            setLoading(true);
            const response = await chatAPI.getMessages(convId, page);
            setMessages(response.data.messages);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch messages');
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(async (convId, content) => {
        try {
            const response = await chatAPI.sendMessage(convId, content);
            // Message will be added via socket event
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send message');
            console.error('Error sending message:', err);
            throw err;
        }
    }, []);

    // Mark conversation as read
    const markAsRead = useCallback(async (convId) => {
        try {
            await chatAPI.markAsRead(convId);
            // Update local conversations to reset unread count
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === convId ? { ...conv, unreadCount: 0 } : conv
                )
            );
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    }, []);

    // Get or create conversation
    const getOrCreateConversation = useCallback(async (otherUserId) => {
        try {
            setLoading(true);
            const response = await chatAPI.getOrCreateConversation(otherUserId);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create conversation');
            console.error('Error creating conversation:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a message
    const deleteMessage = useCallback(async (messageId) => {
        try {
            await chatAPI.deleteMessage(messageId);
            // Message will be removed via socket event
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete message');
            console.error('Error deleting message:', err);
            throw err;
        }
    }, []);

    // Socket event listeners
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // Listen for new messages
        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);

            // Update last message in conversations
            setConversations(prev =>
                prev.map(conv => {
                    if (conv.id === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: message,
                            updatedAt: message.createdAt,
                            unreadCount: conv.id === conversationId ? 0 : (conv.unreadCount || 0) + 1
                        };
                    }
                    return conv;
                })
            );
        };

        // Listen for typing indicators
        const handleUserTyping = ({ userId, isTyping }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (isTyping) {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }
                return newSet;
            });
        };

        // Listen for user status
        const handleUserStatus = ({ userId, online }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (online) {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }
                return newSet;
            });
        };

        // Listen for message deletion
        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        };

        // Listen for messages read
        const handleMessagesRead = ({ conversationId: convId }) => {
            if (convId === conversationId) {
                setMessages(prev =>
                    prev.map(msg => ({ ...msg, isRead: true }))
                );
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_status', handleUserStatus);
        socket.on('message_deleted', handleMessageDeleted);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_status', handleUserStatus);
            socket.off('message_deleted', handleMessageDeleted);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [conversationId]);

    // Join/leave conversation rooms
    useEffect(() => {
        if (conversationId) {
            joinConversation(conversationId);
            markAsRead(conversationId);

            return () => {
                leaveConversation(conversationId);
            };
        }
    }, [conversationId, markAsRead]);

    // Handle typing
    const handleTyping = useCallback((isTyping) => {
        if (conversationId) {
            emitTyping(conversationId, isTyping);
        }
    }, [conversationId]);

    // Calculate total unread count
    const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

    return {
        conversations,
        messages,
        loading,
        error,
        typingUsers,
        onlineUsers,
        totalUnreadCount,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markAsRead,
        getOrCreateConversation,
        deleteMessage,
        handleTyping
    };
};
