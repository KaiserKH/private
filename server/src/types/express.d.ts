import type { SessionStatus } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        roles: string[];
        permissions: string[];
        isAdmin: boolean;
      };
      session?: {
        id: string;
        status: SessionStatus;
        deviceId?: string | null;
      };
      csrfToken?: string;
      requestId?: string;
    }
  }
}

export {};
