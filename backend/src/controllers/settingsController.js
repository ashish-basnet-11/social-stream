import { prisma } from "../config/db.js";

// Update Privacy Settings (Toggle Email, etc.)
export const updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { showEmail } = req.body;

        // Ensure we only update valid privacy fields
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                ...(showEmail !== undefined && { showEmail }) 
            },
            select: {
                id: true,
                showEmail: true,
                name: true,
                email: true
            }
        });

        res.status(200).json({
            status: "success",
            message: "Privacy settings updated",
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ error: "Failed to update settings" });
    }
};

// Get current user's settings state
export const getMySettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                showEmail: true,
                // Add more setting fields here as you grow
            }
        });

        res.status(200).json({
            status: "success",
            data: { settings }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};