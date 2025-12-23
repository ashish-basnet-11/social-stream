import { prisma } from "../config/db.js";

// utils/notif.js
export const createNotification = async ({ recipientId, senderId, type, postId = null }) => {
  try {
    if (recipientId === senderId) return;

    await prisma.notification.create({
      data: {
        recipientId: parseInt(recipientId),
        senderId: parseInt(senderId),
        type, // Ensure this matches LIKE, COMMENT, FRIEND_REQUEST, or FRIEND_ACCEPT
        postId: postId ? parseInt(postId) : null
      }
    });
  } catch (error) {
    console.error("Notification creation failed:", error);
    throw error; // Throw so the controller knows it failed
  }
};

export const removeNotification = async ({ recipientId, senderId, type, postId = null }) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        recipientId,
        senderId,
        type,
        postId
      }
    });
  } catch (error) {
    console.error("Notification removal failed:", error);
  }
};