"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../lib/prisma");
const jwt_1 = require("../../lib/jwt");
const tokenBlocklist_1 = require("../../lib/tokenBlocklist");
exports.authService = {
    login: async (data) => {
        const nasabah = await prisma_1.prisma.nasabah.findUnique({
            where: { email: data.email },
            omit: { password: false },
        });
        if (!nasabah || !nasabah.password)
            throw new Error("INVALID_CREDENTIALS");
        const valid = await bcrypt_1.default.compare(data.password, nasabah.password);
        if (!valid)
            throw new Error("INVALID_CREDENTIALS");
        const token = (0, jwt_1.signAccessToken)({ sub: nasabah.id, email: nasabah.email });
        const { password, ...safe } = nasabah;
        return { token, nasabah: safe };
    },
    logout: (jti, exp) => {
        tokenBlocklist_1.tokenBlocklist.revoke(jti, exp);
    },
};
