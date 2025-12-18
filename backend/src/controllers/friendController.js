// backend/src/controllers/friendController.js
import { prisma } from "../config/db.js";

// Send friend request
const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        if (senderId === parseInt(receiverId)) {
            return res.status(400).json({ error: "Cannot send friend request to yourself" });
        }

        // Check if receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: parseInt(receiverId) }
        });

        if (!receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if request already exists
        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId: parseInt(receiverId) },
                    { senderId: parseInt(receiverId), receiverId: senderId }
                ]
            }
        });

        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return res.status(400).json({ error: "Already friends" });
            }
            return res.status(400).json({ error: "Friend request already exists" });
        }

        // Create friend request
        const friendRequest = await prisma.friendRequest.create({
            data: {
                senderId,
                receiverId: parseInt(receiverId),
                status: 'pending'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        res.status(201).json({
            status: "success",
            message: "Friend request sent",
            data: { friendRequest }
        });
    } catch (error) {
        console.error("Send friend request error:", error);
        res.status(500).json({ error: "Failed to send friend request" });
    }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!friendRequest) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        if (friendRequest.receiverId !== userId) {
            return res.status(403).json({ 
                error: "You can only accept requests sent to you" 
            });
        }

        if (friendRequest.status === 'accepted') {
            return res.status(400).json({ error: "Request already accepted" });
        }

        const updatedRequest = await prisma.friendRequest.update({
            where: { id: parseInt(requestId) },
            data: { status: 'accepted' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        res.status(200).json({
            status: "success",
            message: "Friend request accepted",
            data: { friendRequest: updatedRequest }
        });
    } catch (error) {
        console.error("Accept friend request error:", error);
        res.status(500).json({ error: "Failed to accept friend request" });
    }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!friendRequest) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        if (friendRequest.receiverId !== userId) {
            return res.status(403).json({ 
                error: "You can only reject requests sent to you" 
            });
        }

        await prisma.friendRequest.update({
            where: { id: parseInt(requestId) },
            data: { status: 'rejected' }
        });

        res.status(200).json({
            status: "success",
            message: "Friend request rejected"
        });
    } catch (error) {
        console.error("Reject friend request error:", error);
        res.status(500).json({ error: "Failed to reject friend request" });
    }
};

// Cancel sent friend request
const cancelFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!friendRequest) {
            return res.status(404).json({ error: "Friend request not found" });
        }

        if (friendRequest.senderId !== userId) {
            return res.status(403).json({ 
                error: "You can only cancel requests you sent" 
            });
        }

        await prisma.friendRequest.delete({
            where: { id: parseInt(requestId) }
        });

        res.status(200).json({
            status: "success",
            message: "Friend request cancelled"
        });
    } catch (error) {
        console.error("Cancel friend request error:", error);
        res.status(500).json({ error: "Failed to cancel friend request" });
    }
};

// Remove friend (unfriend)
const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        const friendRequest = await prisma.friendRequest.findFirst({
            where: {
                status: 'accepted',
                OR: [
                    { senderId: userId, receiverId: parseInt(friendId) },
                    { senderId: parseInt(friendId), receiverId: userId }
                ]
            }
        });

        if (!friendRequest) {
            return res.status(404).json({ error: "Friendship not found" });
        }

        await prisma.friendRequest.delete({
            where: { id: friendRequest.id }
        });

        res.status(200).json({
            status: "success",
            message: "Friend removed"
        });
    } catch (error) {
        console.error("Remove friend error:", error);
        res.status(500).json({ error: "Failed to remove friend" });
    }
};

// Get pending friend requests (received)
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        bio: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            status: "success",
            data: { requests }
        });
    } catch (error) {
        console.error("Get pending requests error:", error);
        res.status(500).json({ error: "Failed to fetch pending requests" });
    }
};

// Get all friends
const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const friendRequests = await prisma.friendRequest.findMany({
            where: {
                status: 'accepted',
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        bio: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        bio: true
                    }
                }
            }
        });

        // Extract friend data (the user who is NOT the current user)
        const friends = friendRequests.map(req => 
            req.senderId === userId ? req.receiver : req.sender
        );

        res.status(200).json({
            status: "success",
            data: { friends }
        });
    } catch (error) {
        console.error("Get friends error:", error);
        res.status(500).json({ error: "Failed to fetch friends" });
    }
};

export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getPendingRequests,
    getFriends
};