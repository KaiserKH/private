import { prisma } from "../config/prisma.js";

export const searchUsers = async (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const exactUsername = await prisma.user.findUnique({
    where: { username: trimmed },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      profilePhotoUrl: true,
      phoneNumber: true,
      isVerified: true,
      isPremium: true,
      isBanned: true,
      isSuspended: true
    }
  });

  const phoneMatches = await prisma.user.findMany({
    where: { phoneNumber: trimmed },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      profilePhotoUrl: true,
      phoneNumber: true,
      isVerified: true,
      isPremium: true,
      isBanned: true,
      isSuspended: true
    }
  });

  if (exactUsername) {
    return { mode: "username", results: [exactUsername] };
  }

  if (phoneMatches.length > 0) {
    return { mode: "phone", results: phoneMatches };
  }

  const results = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: trimmed } },
        { displayName: { contains: trimmed } }
      ]
    },
    take: 20,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      profilePhotoUrl: true,
      phoneNumber: true,
      isVerified: true,
      isPremium: true,
      isBanned: true,
      isSuspended: true
    }
  });

  return { mode: "fuzzy", results };
};

export const getProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      setting: true,
      relationshipTags: { include: { relationshipTag: true, targetUser: true } },
      blockedUsers: true,
      blockedBy: true
    }
  });
};

export const updateProfile = async (userId: string, input: {
  displayName?: string;
  bio?: string;
  profilePhotoUrl?: string;
  wallpaperUrl?: string;
}) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      displayName: input.displayName,
      bio: input.bio,
      profilePhotoUrl: input.profilePhotoUrl,
      wallpaperUrl: input.wallpaperUrl
    }
  });
};
