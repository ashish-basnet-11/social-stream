import { prisma } from "../config/db.js";

// Toggle like on a post (like if not liked, unlike if already liked)
const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if user already liked this post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: parseInt(postId)
                }
            }
        });

        if (existingLike) {
            // Unlike: delete the like
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId: userId,
                        postId: parseInt(postId)
                    }
                }
            });

            // Get updated likes count
            const likesCount = await prisma.like.count({
                where: { postId: parseInt(postId) }
            });

            return res.status(200).json({
                status: "success",
                message: "Post unliked",
                data: {
                    isLiked: false,
                    likesCount
                }
            });
        } else {
            // Like: create new like
            await prisma.like.create({
                data: {
                    userId: userId,
                    postId: parseInt(postId)
                }
            });

            // Get updated likes count
            const likesCount = await prisma.like.count({
                where: { postId: parseInt(postId) }
            });

            return res.status(201).json({
                status: "success",
                message: "Post liked",
                data: {
                    isLiked: true,
                    likesCount
                }
            });
        }
    } catch (error) {
        console.error("Toggle like error:", error);
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