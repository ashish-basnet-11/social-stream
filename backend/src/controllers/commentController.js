import { prisma } from "../config/db.js";

// Create a comment on a post
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                error: "Comment content is required" 
            });
        }

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) }
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                authorId: userId,
                postId: parseInt(postId)
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            status: "success",
            data: { comment }
        });
    } catch (error) {
        console.error("Create comment error:", error);
        res.status(500).json({ error: "Failed to create comment" });
    }
};

// Get all comments for a post
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const comments = await prisma.comment.findMany({
            where: { postId: parseInt(postId) },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        const totalComments = await prisma.comment.count({
            where: { postId: parseInt(postId) }
        });

        res.status(200).json({
            status: "success",
            data: {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

// Update a comment (only by author)
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                error: "Comment content is required" 
            });
        }

        // Check if comment exists and user is the author
        const existingComment = await prisma.comment.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (existingComment.authorId !== userId) {
            return res.status(403).json({ 
                error: "You don't have permission to update this comment" 
            });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { content: content.trim() },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(200).json({
            status: "success",
            data: { comment: updatedComment }
        });
    } catch (error) {
        console.error("Update comment error:", error);
        res.status(500).json({ error: "Failed to update comment" });
    }
};

// Delete a comment (only by author or post author)
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get comment with post info
        const existingComment = await prisma.comment.findUnique({
            where: { id: parseInt(id) },
            include: {
                post: {
                    select: {
                        authorId: true
                    }
                }
            }
        });

        if (!existingComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Allow deletion if user is comment author OR post author
        if (existingComment.authorId !== userId && 
            existingComment.post.authorId !== userId) {
            return res.status(403).json({ 
                error: "You don't have permission to delete this comment" 
            });
        }

        await prisma.comment.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            status: "success",
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

export { 
    createComment, 
    getPostComments, 
    updateComment, 
    deleteComment 
};