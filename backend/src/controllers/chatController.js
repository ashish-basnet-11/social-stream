import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all conversations for the authenticated user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                email: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Format conversations with other participant info and unread count
        const formattedConversations = await Promise.all(
            conversations.map(async (conversation) => {
                const otherParticipant = conversation.participants.find(
                    (p) => p.userId !== userId
                );

                // Get unread message count
                const participant = conversation.participants.find(
                    (p) => p.userId === userId
                );

                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conversation.id,
                        senderId: { not: userId },
                        createdAt: {
                            gt: participant?.lastReadAt || new Date(0)
                        }
                    }
                });

                return {
                    id: conversation.id,
                    otherUser: otherParticipant?.user,
                    lastMessage: conversation.messages[0] || null,
                    unreadCount,
                    updatedAt: conversation.updatedAt
                };
            })
        );

        res.json(formattedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// Get or create a conversation with another user
export const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ error: 'Other user ID is required' });
        }

        if (userId === parseInt(otherUserId)) {
            return res.status(400).json({ error: 'Cannot create conversation with yourself' });
        }

        // Check if users are friends
        const friendship = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: parseInt(otherUserId), status: 'accepted' },
                    { senderId: parseInt(otherUserId), receiverId: userId, status: 'accepted' }
                ]
            }
        });

        if (!friendship) {
            return res.status(403).json({ error: 'You can only chat with friends' });
        }

        // Check if conversation already exists
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: {
                                userId: userId
                            }
                        }
                    },
                    {
                        participants: {
                            some: {
                                userId: parseInt(otherUserId)
                            }
                        }
                    }
                ]
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (existingConversation) {
            const otherParticipant = existingConversation.participants.find(
                (p) => p.userId !== userId
            );

            return res.json({
                id: existingConversation.id,
                otherUser: otherParticipant?.user,
                createdAt: existingConversation.createdAt
            });
        }

        // Create new conversation
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: userId },
                        { userId: parseInt(otherUserId) }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        const otherParticipant = newConversation.participants.find(
            (p) => p.userId !== userId
        );

        res.status(201).json({
            id: newConversation.id,
            otherUser: otherParticipant?.user,
            createdAt: newConversation.createdAt
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: parseInt(conversationId),
                    userId: userId
                }
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'You are not a participant in this conversation' });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: parseInt(conversationId)
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        const total = await prisma.message.count({
            where: {
                conversationId: parseInt(conversationId)
            }
        });

        res.json({
            messages: messages.reverse(), // Reverse to show oldest first
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user is participant
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: parseInt(conversationId),
                    userId: userId
                }
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'You are not a participant in this conversation' });
        }

        // Get other participant for notification
        const otherParticipant = await prisma.conversationParticipant.findFirst({
            where: {
                conversationId: parseInt(conversationId),
                userId: { not: userId }
            }
        });

        // Create message
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                senderId: userId,
                conversationId: parseInt(conversationId)
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        // Update conversation's updatedAt
        await prisma.conversation.update({
            where: { id: parseInt(conversationId) },
            data: { updatedAt: new Date() }
        });

        // Create notification for the other user
        if (otherParticipant) {
            await prisma.notification.create({
                data: {
                    recipientId: otherParticipant.userId,
                    senderId: userId,
                    type: 'MESSAGE',
                    conversationId: parseInt(conversationId)
                }
            });
        }

        // Emit socket event if io is available
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(`conversation_${conversationId}`).emit('new_message', message);

            // Emit notification to the recipient
            if (otherParticipant) {
                io.emit('new_notification', {
                    recipientId: otherParticipant.userId,
                    type: 'MESSAGE',
                    conversationId: parseInt(conversationId)
                });
            }
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        // Update lastReadAt for the participant
        await prisma.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId: parseInt(conversationId),
                    userId: userId
                }
            },
            data: {
                lastReadAt: new Date()
            }
        });

        // Emit socket event if io is available
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(`conversation_${conversationId}`).emit('messages_read', {
                conversationId: parseInt(conversationId),
                userId
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.params;

        // Find message and verify ownership
        const message = await prisma.message.findUnique({
            where: { id: parseInt(messageId) }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own messages' });
        }

        await prisma.message.delete({
            where: { id: parseInt(messageId) }
        });

        // Emit socket event if io is available
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(`conversation_${message.conversationId}`).emit('message_deleted', {
                messageId: parseInt(messageId),
                conversationId: message.conversationId
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
