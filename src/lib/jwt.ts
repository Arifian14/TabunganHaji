import jwt, { type JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS ?? 86400);

export interface TokenPayload {
  sub: string;
  email: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_SECONDS,
    jwtid: randomUUID(),
  });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;
