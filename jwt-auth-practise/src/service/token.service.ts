import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
}

export function generateAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"], // -> understand this deviation
    issuer: "jwt-auth-practise",
    audience: "jwt-auth-api",
  });
}

// jwt.verify() return the decoded payload stored in the token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "jwt-auth-practise",
    audience: "jwt-auth-api",
  }) as AccessTokenPayload;
}
