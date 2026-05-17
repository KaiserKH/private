import { prisma } from "../config/prisma.js";

const normalizePair = (userA: string, userB: string) => {
  return userA < userB ? { userOneId: userA, userTwoId: userB } : { userOneId: userB, userTwoId: userA };
};

export const sendFriendRequest = async (senderId: string, receiverId: string, message?: string) => {
  const blocked = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { blockerId: senderId, blockedUserId: receiverId },
        { blockerId: receiverId, blockedUserId: senderId }
      ]
    }
  });

  if (blocked) throw Object.assign(new Error("User is blocked"), { statusCode: 403 });

  const request = await prisma.friendRequest.upsert({
    where: { senderId_receiverId: { senderId, receiverId } },
    create: { senderId, receiverId, message },
    update: { status: "PENDING", message }
  });

  return request;
};

export const respondToFriendRequest = async (requestId: string, receiverId: string, action: "ACCEPTED" | "REJECTED") => {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.receiverId !== receiverId) throw Object.assign(new Error("Request not found"), { statusCode: 404 });

  const updated = await prisma.friendRequest.update({ where: { id: requestId }, data: { status: action } });
  if (action === "ACCEPTED") {
    const pair = normalizePair(request.senderId, request.receiverId);
    await prisma.friendship.upsert({
      where: { userOneId_userTwoId: pair },
      create: { ...pair, status: "ACCEPTED" },
      update: { status: "ACCEPTED" }
    });
  }

  return updated;
};

export const cancelFriendRequest = async (requestId: string, senderId: string) => {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.senderId !== senderId) throw Object.assign(new Error("Request not found"), { statusCode: 404 });
  return prisma.friendRequest.update({ where: { id: requestId }, data: { status: "CANCELLED" } });
};

export const removeFriend = async (userId: string, targetUserId: string) => {
  const pair = normalizePair(userId, targetUserId);
  return prisma.friendship.deleteMany({ where: pair });
};

export const blockUser = async (blockerId: string, blockedUserId: string) => {
  return prisma.blockedUser.upsert({
    where: { blockerId_blockedUserId: { blockerId, blockedUserId } },
    create: { blockerId, blockedUserId },
    update: {}
  });
};

export const unblockUser = async (blockerId: string, blockedUserId: string) => {
  return prisma.blockedUser.deleteMany({ where: { blockerId, blockedUserId } });
};

export const muteFriend = async (userId: string, friendId: string, mutedUntil?: Date | null) => {
  const pair = normalizePair(userId, friendId);
  return prisma.friendship.updateMany({ where: pair, data: { mutedUntil } });
};

export const favoriteFriend = async (userId: string, friendId: string, favorite = true) => {
  const pair = normalizePair(userId, friendId);
  const friendship = await prisma.friendship.findUnique({ where: { userOneId_userTwoId: pair } });
  if (!friendship) throw Object.assign(new Error("Friendship not found"), { statusCode: 404 });

  if (friendship.userOneId === userId) {
    return prisma.friendship.update({ where: { id: friendship.id }, data: { favoriteForOne: favorite } });
  }

  return prisma.friendship.update({ where: { id: friendship.id }, data: { favoriteForTwo: favorite } });
};

export const canUsersMessage = async (actorId: string, targetUserId: string, actorIsAdmin = false) => {
  if (actorIsAdmin) return true;

  const blocked = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { blockerId: actorId, blockedUserId: targetUserId },
        { blockerId: targetUserId, blockedUserId: actorId }
      ]
    }
  });
  if (blocked) return false;

  const pair = normalizePair(actorId, targetUserId);
  const friendship = await prisma.friendship.findUnique({ where: { userOneId_userTwoId: pair } });
  return friendship?.status === "ACCEPTED";
};
