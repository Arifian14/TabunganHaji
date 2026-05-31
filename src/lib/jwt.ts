import jwt, { type JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS ?? 86400);

if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
  throw new Error(
    "JWT_SECRET tidak diset atau terlalu pendek (minimal 32 karakter). " +
      "Set env var JWT_SECRET dengan string acak yang kuat sebelum menjalankan server. " +
      "Contoh: openssl rand -hex 48"
  );
}

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
