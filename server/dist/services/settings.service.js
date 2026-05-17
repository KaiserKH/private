import { prisma } from "../config/prisma.js";
export const getSettings = async (userId) => {
    return prisma.setting.upsert({
        where: { userId },
        create: { userId },
        update: {}
    });
};
export const updateSettings = async (userId, input) => {
    return prisma.setting.upsert({
        where: { userId },
        create: { userId, ...input },
        update: input
    });
};
