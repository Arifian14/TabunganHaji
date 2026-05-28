import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { tokenBlocklist } from "../lib/tokenBlocklist";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token tidak ditemukan" });
  }

  const token = header.slice(7).trim();
  try {
    const decoded = verifyAccessToken(token);

    if (!decoded.jti || tokenBlocklist.isRevoked(decoded.jti)) {
      return res.status(401).json({ error: "TOKEN_REVOKED", message: "Token sudah tidak berlaku, silakan login kembali" });
    }

    req.auth = {
      id: String(decoded.sub),
      email: String(decoded.email ?? ""),
      jti: decoded.jti,
      exp: Number(decoded.exp),
    };
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token tidak valid atau kedaluwarsa" });
  }
}
