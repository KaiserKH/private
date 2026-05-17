import { prisma } from "../config/prisma.js";

export const coreFeatureKeys = [
  "canVideoCall",
  "canVoiceCall",
  "canDeleteMessages",
  "canUploadHDMedia",
  "canUseBfTag",
  "canHideLastSeen",
  "canUseStories",
  "canUseAnimatedThemes",
  "canBypassFriendRequest",
  "canEditMessages"
] as const;

export const getUserAccessContext = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { sessions: true }
  });

  if (!user) return null;

  const roles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } });
  const roleIds = roles.map((item) => item.roleId);
  const roleNames = roles.map((item) => item.role.name);
  const permissions = await prisma.rolePermission.findMany({
    where: { roleId: { in: roleIds } },
    include: { permission: true }
  });

  return {
    user,
    roles: roleNames,
    permissions: permissions.map((item) => item.permission.key)
  };
};

export const isFeatureEnabled = async (featureKey: string, userId?: string, roleNames: string[] = []) => {
  const userToggle = userId
    ? await prisma.featureToggle.findFirst({ where: { featureKey, scope: "user", userId } })
    : null;
  if (userToggle) return userToggle.enabled;

  const roleToggle = roleNames.length
    ? await prisma.featureToggle.findFirst({ where: { featureKey, scope: "role" } })
    : null;
  if (roleToggle) return roleToggle.enabled;

  const globalToggle = await prisma.featureToggle.findFirst({ where: { featureKey, scope: "global" } });
  return globalToggle ? globalToggle.enabled : true;
};

export const listFeatureState = async (userId?: string) => {
  if (!userId) {
    return prisma.featureToggle.findMany({ orderBy: { createdAt: "desc" } });
  }

  const roles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } });
  return prisma.featureToggle.findMany({
    where: {
      OR: [
        { scope: "global" },
        { scope: "user", userId },
        { scope: "role" }
      ]
    },
    orderBy: { createdAt: "desc" }
  });
};

