import { prisma } from "../config/prisma.js";

export const getSettings = async (userId: string) => {
  return prisma.setting.upsert({
    where: { userId },
    create: { userId },
    update: {}
  });
};

export const updateSettings = async (userId: string, input: Record<string, unknown>) => {
  return prisma.setting.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input
  });
};
