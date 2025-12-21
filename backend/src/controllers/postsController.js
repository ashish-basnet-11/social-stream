import { prisma } from "../config/db.js";

// Create a new post
const createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const userId = req.user.id;
        const imageUrl = req.file ? req.file.path : null; // Cloudinary URL

        // At least caption or image is required
        if (!caption && !imageUrl) {
            return res.status(400).json({ 
                error: "Caption or image is required" 
            });
        }

        const post = await prisma.post.create({
            data: {
                caption,
                imageUrl,
                authorId: userId
            },
            include: {
                author: {
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
            data: { post }
        });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ error: "Failed to create post" });
    }
};

// Get all posts (feed)
const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
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
                        email: true,
                        avatar: true,
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        // Add isLikedByUser flag for current user
        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            isLikedByUser: post.likes.some(like => like.userId === req.user?.id),
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            likes: undefined, // Remove the detailed likes array
            _count: undefined // Remove _count object
        }));

        const totalPosts = await prisma.post.count();

        res.status(200).json({
            status: "success",
            data: {
                posts: postsWithLikeStatus,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPosts / limit),
                    totalPosts,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

// Get single post by ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                likes: {
                    select: {
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const postWithLikeStatus = {
            ...post,
            isLikedByUser: post.likes.some(like => like.userId === req.user?.id),
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            _count: undefined
        };

        res.status(200).json({
            status: "success",
            data: { post: postWithLikeStatus }
        });
    } catch (error) {
        console.error("Get post error:", error);
        res.status(500).json({ error: "Failed to fetch post" });
    }
};

// Update post (only by author)
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { caption } = req.body;
        const userId = req.user.id;

        // Check if post exists and user is the author
        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (existingPost.authorId !== userId) {
            return res.status(403).json({ 
                error: "You don't have permission to update this post" 
            });
        }

        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: {
                ...(caption !== undefined && { caption })
            },
            include: {
                author: {
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
            data: { post: updatedPost }
        });
    } catch (error) {
        console.error("Update post error:", error);
        res.status(500).json({ error: "Failed to update post" });
    }
};

// Delete post (only by author)
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if post exists and user is the author
        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (existingPost.authorId !== userId) {
            return res.status(403).json({ 
                error: "You don't have permission to delete this post" 
            });
        }

        await prisma.post.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            status: "success",
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ error: "Failed to delete post" });
    }
};

// Get posts by specific user
// Get posts by specific user
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            where: { authorId: parseInt(userId) },
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
                        email: true,
                        avatar: true // Added avatar for profile feed consistency
                    }
                },
                // Added likes to check if current user liked them
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        // Mapping the data so the frontend receives the expected format
        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            // Check if the person viewing the profile has liked these posts
            isLikedByUser: post.likes?.some(like => like.userId === req.user?.id) || false,
            likesCount: post._count.likes || 0,
            commentsCount: post._count.comments || 0,
            likes: undefined, // Cleanup
            _count: undefined // Cleanup
        }));

        const totalPosts = await prisma.post.count({
            where: { authorId: parseInt(userId) }
        });

        res.status(200).json({
            status: "success",
            data: {
                posts: postsWithLikeStatus, // Send the flattened posts
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalPosts / limit),
                    totalPosts,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error("Get user posts error:", error);
        res.status(500).json({ error: "Failed to fetch user posts" });
    }
};

export { 
    createPost, 
    getAllPosts, 
    getPostById, 
    updatePost, 
    deletePost,
    getUserPosts
};