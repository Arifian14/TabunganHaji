"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_schema_1 = require("./auth.schema");
const auth_service_1 = require("./auth.service");
exports.authController = {
    async login(req, res) {
        const parsed = auth_schema_1.LoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
        }
        try {
            const result = await auth_service_1.authService.login(parsed.data);
            return res.status(200).json(result);
        }
        catch (err) {
            if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
                return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Email atau password salah" });
            }
            throw err;
        }
    },
    async logout(req, res) {
        const auth = req.auth;
        auth_service_1.authService.logout(auth.jti, auth.exp);
        return res.status(200).json({ message: "Logout berhasil, token dinonaktifkan" });
    },
};
