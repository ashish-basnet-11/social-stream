// backend/src/controllers/userController.js
import { prisma } from "../config/db.js";

// Get current user's profile
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatar: true,
                provider: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        sentFriendRequests: {
                            where: { status: 'accepted' }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    ...user,
                    postsCount: user._count.posts,
                    friendsCount: user._count.sentFriendRequests,
                    _count: undefined
                }
            }
        });
    } catch (error) {
        console.error("Get my profile error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

// Update current user's profile
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(bio !== undefined && { bio })
            },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatar: true,
                createdAt: true
            }
        });

        res.status(200).json({
            status: "success",
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const avatarUrl = req.file.path; // Cloudinary URL

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatar: true
            }
        });

        res.status(200).json({
            status: "success",
            message: "Avatar uploaded successfully",
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error("Upload avatar error:", error);
        res.status(500).json({ error: "Failed to upload avatar" });
    }
};

// Get any user's profile by ID
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUserId = parseInt(userId);
        const currentUserId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatar: true,
                createdAt: true,
                _count: { select: { posts: true } }
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        let friendshipStatus = 'none';
        let friendsCount = 0;
        let mutualFriends = [];

        // 1. Get Friendship status and total count
        const friendsCountData = await prisma.friendRequest.count({
            where: {
                OR: [
                    { senderId: targetUserId, status: 'accepted' },
                    { receiverId: targetUserId, status: 'accepted' }
                ]
            }
        });
        friendsCount = friendsCountData;

        if (currentUserId) {
            // Check status between Me and Target
            const friendRequest = await prisma.friendRequest.findFirst({
                where: {
                    OR: [
                        { senderId: currentUserId, receiverId: targetUserId },
                        { senderId: targetUserId, receiverId: currentUserId }
                    ]
                }
            });

            if (friendRequest) {
                if (friendRequest.status === 'accepted') friendshipStatus = 'friends';
                else if (friendRequest.senderId === currentUserId) friendshipStatus = 'request_sent';
                else friendshipStatus = 'request_received';
            }

            // 2. LOGIC FOR MUTUAL FRIENDS
            if (currentUserId !== targetUserId) {
                // Find friends of current user
                const myFriendsRequests = await prisma.friendRequest.findMany({
                    where: { OR: [{ senderId: currentUserId, status: 'accepted' }, { receiverId: currentUserId, status: 'accepted' }] },
                    select: { senderId: true, receiverId: true }
                });
                const myFriendIds = myFriendsRequests.map(r => r.senderId === currentUserId ? r.receiverId : r.senderId);

                // Find mutuals: Friends of target user who are also in myFriendIds
                mutualFriends = await prisma.user.findMany({
                    where: {
                        id: { in: myFriendIds },
                        OR: [
                            { sentFriendRequests: { some: { receiverId: targetUserId, status: 'accepted' } } },
                            { receivedFriendRequests: { some: { senderId: targetUserId, status: 'accepted' } } }
                        ]
                    },
                    select: { id: true, name: true, avatar: true },
                    take: 3 // Only need a few for the preview
                });
            }
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    ...user,
                    postsCount: user._count.posts,
                    friendsCount,
                    friendshipStatus,
                    mutualFriends, // Now this is sent to the frontend!
                    _count: undefined
                }
            }
        });
    } catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user?.id;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                error: "Search query must be at least 2 characters" 
            });
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: currentUserId } }, // Exclude current user
                    {
                        OR: [
                            { name: { contains: query} }, //, mode: 'insensitive' 
                            { email: { contains: query} } //, mode: 'insensitive' 
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true
            },
            take: 10
        });

        res.status(200).json({
            status: "success",
            data: { users }
        });
    } catch (error) {
        console.error("Search users error:", error);
        res.status(500).json({ error: "Failed to search users" });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // 1. Get IDs of people you already have a relationship with (any status)
        const existingInteractions = await prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: currentUserId },
                    { receiverId: currentUserId }
                ]
            },
            select: {
                senderId: true,
                receiverId: true
            }
        });

        // 2. Map out the IDs to exclude (them + yourself)
        const excludedIds = new Set();
        excludedIds.add(currentUserId);
        existingInteractions.forEach(req => {
            excludedIds.add(req.senderId);
            excludedIds.add(req.receiverId);
        });

        // 3. Find users not in that excluded set
        const suggestedUsers = await prisma.user.findMany({
            where: {
                id: { notIn: Array.from(excludedIds) }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                bio: true
            },
            take: 5
        });

        res.status(200).json({
            status: "success",
            data: { users: suggestedUsers }
        });
    } catch (error) {
        console.error("Get suggestions error:", error);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
};

export { 
    getMyProfile, 
    updateMyProfile,
    uploadAvatar,
    getUserProfile, 
    searchUsers,
    getSuggestions 
};