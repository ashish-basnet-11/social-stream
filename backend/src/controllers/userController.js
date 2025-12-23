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
                showEmail: true,
                bio: true,
                avatar: true,
                provider: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        sentFriendRequests: { where: { status: 'accepted' } }
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

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
                showEmail: true, // Fetch privacy status
                bio: true,
                avatar: true,
                createdAt: true,
                _count: { select: { posts: true } }
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        // Privacy Logic: Mask email if hidden AND viewer is not the owner
        const canSeeEmail = currentUserId === targetUserId || user.showEmail;

        let friendshipStatus = 'none';
        let friendsCount = 0;
        let mutualFriends = [];

        // Count friends
        friendsCount = await prisma.friendRequest.count({
            where: {
                OR: [
                    { senderId: targetUserId, status: 'accepted' },
                    { receiverId: targetUserId, status: 'accepted' }
                ]
            }
        });

        if (currentUserId) {
            // Check relationship status
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

            // Mutual Friends Logic
            if (currentUserId !== targetUserId) {
                const myFriendsRequests = await prisma.friendRequest.findMany({
                    where: { OR: [{ senderId: currentUserId, status: 'accepted' }, { receiverId: currentUserId, status: 'accepted' }] },
                    select: { senderId: true, receiverId: true }
                });
                const myFriendIds = myFriendsRequests.map(r => r.senderId === currentUserId ? r.receiverId : r.senderId);

                mutualFriends = await prisma.user.findMany({
                    where: {
                        id: { in: myFriendIds },
                        OR: [
                            { sentFriendRequests: { some: { receiverId: targetUserId, status: 'accepted' } } },
                            { receivedFriendRequests: { some: { senderId: targetUserId, status: 'accepted' } } }
                        ]
                    },
                    select: { id: true, name: true, avatar: true },
                    take: 3
                });
            }
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    ...user,
                    email: canSeeEmail ? user.email : null, // MASKING APPLIED HERE
                    postsCount: user._count.posts,
                    friendsCount,
                    friendshipStatus,
                    mutualFriends,
                    _count: undefined
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
};
// Search users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user?.id;

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: currentUserId } },
                    {
                        OR: [
                            { name: { contains: query } },
                            { email: { contains: query } }
                        ]
                    }
                ]
            },
            include: {
                // Use the exact names from your schema
                receivedFriendRequests: { 
                    where: { senderId: currentUserId } 
                },
                sentFriendRequests: { 
                    where: { receiverId: currentUserId } 
                }
            },
            take: 10
        });

        const formattedUsers = users.map(u => {
            // Logic to determine status based on FriendRequest model
            // 1. Check if ANY request between these two is 'accepted'
            const isAccepted = 
                u.receivedFriendRequests.some(r => r.status === 'accepted') || 
                u.sentFriendRequests.some(r => r.status === 'accepted');

            // 2. Check if there is a 'pending' request sent BY the current user
            const isPending = u.receivedFriendRequests.some(r => r.status === 'pending');

            return {
                id: u.id,
                name: u.name,
                avatar: u.avatar,
                bio: u.bio,
                friendshipStatus: isAccepted ? 'friends' : isPending ? 'request_sent' : 'none'
            };
        });

        res.status(200).json({
            status: "success",
            data: { users: formattedUsers }
        });
    } catch (error) {
        console.error("SEARCH ERROR:", error);
        res.status(500).json({ error: "Search failed" });
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