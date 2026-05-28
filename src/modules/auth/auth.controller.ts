import type { Request, Response } from "express";
import { LoginSchema } from "./auth.schema";
import { authService } from "./auth.service";

export const authController = {
  async login(req: Request, res: Response) {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
    }
    try {
      const result = await authService.login(parsed.data);
      return res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Email atau password salah" });
      }
      throw err;
    }
  },

  async logout(req: Request, res: Response) {
    const auth = req.auth!;
    authService.logout(auth.jti, auth.exp);
    return res.status(200).json({ message: "Logout berhasil, token dinonaktifkan" });
  },
};
