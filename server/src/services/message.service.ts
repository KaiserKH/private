import { prisma } from "../config/prisma.js";
import { canUsersMessage } from "./friendship.service.js";

const normalizePair = (userA: string, userB: string) => (userA < userB ? [userA, userB] : [userB, userA]);

export const getOrCreateDirectConversation = async (userId: string, targetUserId: string, actorIsAdmin = false) => {
  const allowed = await canUsersMessage(userId, targetUserId, actorIsAdmin);
  if (!allowed) throw Object.assign(new Error("You cannot message this user"), { statusCode: 403 });

  const [userOneId, userTwoId] = normalizePair(userId, targetUserId);
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      participants: {
        every: { userId: { in: [userOneId, userTwoId] } }
      }
    },
    include: { participants: true }
  });

  if (existingConversation) return existingConversation;

  return prisma.conversation.create({
    data: {
      type: "DIRECT",
      participants: {
        create: [{ userId: userOneId }, { userId: userTwoId }]
      }
    },
    include: { participants: true }
  });
};

export const listConversations = async (userId: string) => {
  return prisma.conversationParticipant.findMany({
    where: { userId, archivedAt: null },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { select: { id: true, username: true, displayName: true, profilePhotoUrl: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 }
        }
      }
    },
    orderBy: { conversation: { updatedAt: "desc" } }
  });
};

export const listMessages = async (conversationId: string, cursor?: string) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: { select: { id: true, username: true, displayName: true, profilePhotoUrl: true } },
      reactions: true,
      media: true
    }
  });
};

export const sendMessage = async (input: {
  senderId: string;
  targetUserId: string;
  content: string;
  type?: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "VOICE_NOTE" | "SYSTEM";
  replyToId?: string | null;
  actorIsAdmin?: boolean;
}) => {
  const conversation = await getOrCreateDirectConversation(input.senderId, input.targetUserId, input.actorIsAdmin);
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: input.senderId,
      recipientId: input.targetUserId,
      content: input.content,
      type: input.type ?? "TEXT",
      replyToId: input.replyToId ?? null
    },
    include: {
      sender: { select: { id: true, username: true, displayName: true, profilePhotoUrl: true } }
    }
  });

  await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  return { conversation, message };
};

export const editMessage = async (messageId: string, userId: string, content: string, actorIsAdmin = false) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw Object.assign(new Error("Message not found"), { statusCode: 404 });
  if (message.senderId !== userId && !actorIsAdmin) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  return prisma.message.update({ where: { id: messageId }, data: { content, isEdited: true } });
};

export const deleteMessageForEveryone = async (messageId: string, userId: string, actorIsAdmin = false) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw Object.assign(new Error("Message not found"), { statusCode: 404 });
  if (message.senderId !== userId && !actorIsAdmin) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  return prisma.message.update({ where: { id: messageId }, data: { isDeletedForEveryone: true, content: "" } });
};

export const deleteMessageForSelf = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw Object.assign(new Error("Message not found"), { statusCode: 404 });
  if (message.senderId !== userId) throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  return prisma.message.update({ where: { id: messageId }, data: { deletedForSender: true } });
};

export const reactToMessage = async (messageId: string, userId: string, emoji: string) => {
  return prisma.messageReaction.upsert({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
    create: { messageId, userId, emoji },
    update: {}
  });
};

export const markConversationSeen = async (conversationId: string, userId: string) => {
  return prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId, userId } },
    create: { conversationId, userId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() }
  });
};
