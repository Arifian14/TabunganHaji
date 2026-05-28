import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { signAccessToken } from "../../lib/jwt";
import { tokenBlocklist } from "../../lib/tokenBlocklist";
import type { LoginInput } from "./auth.schema";

export const authService = {
  login: async (data: LoginInput) => {
    const nasabah = await prisma.nasabah.findUnique({
      where: { email: data.email },
      omit: { password: false },
    });
    if (!nasabah || !nasabah.password) throw new Error("INVALID_CREDENTIALS");

    const valid = await bcrypt.compare(data.password, nasabah.password);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    const token = signAccessToken({ sub: nasabah.id, email: nasabah.email });
    const { password, ...safe } = nasabah;
    return { token, nasabah: safe };
  },

  logout: (jti: string, exp: number): void => {
    tokenBlocklist.revoke(jti, exp);
  },
};
