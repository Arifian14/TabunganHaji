"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../lib/jwt");
const tokenBlocklist_1 = require("../lib/tokenBlocklist");
function requireAuth(req, res, next) {
    const header = req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "UNAUTHORIZED", message: "Token tidak ditemukan" });
    }
    const token = header.slice(7).trim();
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded.jti || tokenBlocklist_1.tokenBlocklist.isRevoked(decoded.jti)) {
            return res.status(401).json({ error: "TOKEN_REVOKED", message: "Token sudah tidak berlaku, silakan login kembali" });
        }
        req.auth = {
            id: String(decoded.sub),
            email: String(decoded.email ?? ""),
            jti: decoded.jti,
            exp: Number(decoded.exp),
        };
        return next();
    }
    catch {
        return res.status(401).json({ error: "UNAUTHORIZED", message: "Token tidak valid atau kedaluwarsa" });
    }
}
