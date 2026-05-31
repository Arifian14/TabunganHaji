"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS ?? 86400);
if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
    throw new Error("JWT_SECRET tidak diset atau terlalu pendek (minimal 32 karakter). " +
        "Set env var JWT_SECRET dengan string acak yang kuat sebelum menjalankan server. " +
        "Contoh: openssl rand -hex 48");
}
const signAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_SECONDS,
    jwtid: (0, crypto_1.randomUUID)(),
});
exports.signAccessToken = signAccessToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, JWT_SECRET);
exports.verifyAccessToken = verifyAccessToken;
