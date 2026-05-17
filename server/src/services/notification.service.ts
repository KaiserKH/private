import { prisma } from "../config/prisma.js";

export const listNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) throw Object.assign(new Error("Notification not found"), { statusCode: 404 });
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
};

export const clearNotifications = async (userId: string) => {
  return prisma.notification.deleteMany({ where: { userId } });
};
