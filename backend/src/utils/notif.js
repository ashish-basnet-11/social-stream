import { prisma } from "../config/db.js";

export const createNotification = async ({ recipientId, senderId, type, postId = null }) => {
  try {
    // 1. Don't notify if I'm liking/commenting on my own stuff
    if (recipientId === senderId) return;

    // 2. Create the notification
    await prisma.notification.create({
      data: {
        recipientId,
        senderId,
        type,
        postId
      }
    });
  } catch (error) {
    console.error("Notification creation failed:", error);
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