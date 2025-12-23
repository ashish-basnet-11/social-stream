import { prisma } from "../config/db.js";
import { createNotification, removeNotification } from "../utils/notif.js"; // Adjust path if needed

// Toggle like on a post (like if not liked, unlike if already liked)
const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) return res.status(404).json({ error: "Post not found" });

        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId: parseInt(postId) } }
        });

        if (existingLike) {
            // --- UNLIKE LOGIC ---
            await prisma.like.delete({
                where: { userId_postId: { userId, postId: parseInt(postId) } }
            });

            // DELETE THE NOTIFICATION
            await removeNotification({
                recipientId: post.authorId,
                senderId: userId,
                type: 'LIKE',
                postId: post.id
            });

            const likesCount = await prisma.like.count({
                where: { postId: parseInt(postId) }
            });

            return res.status(200).json({ status: "success", data: { isLiked: false, likesCount } });

        } else {
            // --- LIKE LOGIC ---
            await prisma.like.create({
                data: { userId, postId: parseInt(postId) }
            });

            // CREATE THE NOTIFICATION
            await createNotification({
                recipientId: post.authorId,
                senderId: userId,
                type: 'LIKE',
                postId: post.id
            });

            const likesCount = await prisma.like.count({
                where: { postId: parseInt(postId) }
            });

            return res.status(201).json({ status: "success", data: { isLiked: true, likesCount } });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle like" });
    }
};

// Get all users who liked a post
const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        const likes = await prisma.like.findMany({
            where: { postId: parseInt(postId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            status: "success",
            data: {
                likes: likes.map(like => ({
                    user: like.user,
                    likedAt: like.createdAt
                })),
                count: likes.length
            }
        });
    } catch (error) {
        console.error("Get likes error:", error);
        res.status(500).json({ error: "Failed to fetch likes" });
    }
};

export { toggleLike, getPostLikes };