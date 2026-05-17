import { prisma } from "../config/prisma.js";

export const startCall = async (input: { callerId: string; calleeId: string; type: "VOICE" | "VIDEO"; signaling?: Record<string, unknown> }) => {
  const call = await prisma.call.create({
    data: {
      callerId: input.callerId,
      calleeId: input.calleeId,
      type: input.type,
      signaling: input.signaling ?? {}
    }
  });

  await prisma.callHistory.create({
    data: {
      userId: input.callerId,
      callId: call.id,
      status: "RINGING"
    }
  });

  return call;
};

export const updateCallStatus = async (callId: string, status: "ACTIVE" | "ENDED" | "MISSED" | "REJECTED") => {
  const call = await prisma.call.update({ where: { id: callId }, data: { status, ...(status === "ACTIVE" ? { startedAt: new Date() } : {}), ...(status !== "ACTIVE" ? { endedAt: new Date() } : {}) } });
  await prisma.callHistory.create({ data: { userId: call.callerId, callId: call.id, status } });
  return call;
};

export const listCallHistory = async (userId: string) => {
  return prisma.callHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
};
