import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }
  next();
}

export async function requireAuth2(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 1. fetch you sessionID sent by client
  const sessionID = req.cookies.sessionID;
  // 2. if no sessionID exist
  if (!sessionID) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }
  // 3. fetch session info based on given sessionID
  const session = await prisma.session.findUnique({
    where: {
      id: sessionID,
    },
    include: {
      user: true,
    },
  });

  // 4. if no session exist
  if (!session) {
    return res.status(401).json({
      message: "Invalid session",
    });
  }

  // 5. check for session expiry
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });
    return res.status(401).json({
      message: "Session expired",
    });
  }

  // 6. authenticated user
  req.user = session.user;

  // 7. call next funtion
  next();
}
