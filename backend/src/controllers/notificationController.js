import { prisma } from "../config/db.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { recipientId: req.user.id },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 15 // Only show the most recent ones in the sidebar
        });

        res.status(200).json({ status: "success", data: { notifications } });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// Mark as read when they see the sidebar or click
export const markAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { recipientId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
};

export const markOneRead = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true }
        });
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification" });
    }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Ensure user owns the notification

    await prisma.notification.delete({
      where: {
        id: parseInt(id),
        recipientId: userId // Security check
      }
    });

    res.status(200).json({ status: "success", message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};