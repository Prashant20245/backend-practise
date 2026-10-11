import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../service/token.service";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    //1. fetch auth
    const authorization = req.headers.authorization;

    // 2. if no auth data present
    if (!authorization) {
      return res.status(401).json({
        message: "Authentication needed.",
      });
    }

    //3. extract schema and token
    const [scheme, token] = authorization.split(" ");

    //4. if
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid authentication header.",
      });
    }

    //5.verify token
    const payload = verifyAccessToken(token);

    //extract user id
    //since Express req does not have user property then we need to define it
    req.user = {
      id: payload.sub,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token.",
    });
  }
}
