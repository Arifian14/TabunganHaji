"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNasabahSchema = exports.CreateNasabahSchema = void 0;
const zod_1 = require("zod");
exports.CreateNasabahSchema = zod_1.z.object({
    nik: zod_1.z
        .string()
        .length(16, "NIK harus tepat 16 digit")
        .regex(/^\d+$/, "NIK harus angka"),
    nama: zod_1.z
        .string()
        .min(3, "Nama minimal 3 karakter")
        .max(100),
    email: zod_1.z
        .string()
        .email("Format email tidak valid")
        .max(150),
    nomorHp: zod_1.z
        .string()
        .regex(/^08\d{8,11}$/, "Nomor HP harus format 08xxxxxxxxxx (10-13 digit)"),
    password: zod_1.z
        .string()
        .min(8, "Password minimal 8 karakter")
        .max(72, "Password maksimal 72 karakter"),
});
exports.UpdateNasabahSchema = zod_1.z.object({
    nama: zod_1.z
        .string()
        .min(3, "Nama minimal 3 karakter")
        .max(100)
        .optional(),
    email: zod_1.z
        .string()
        .email("Format email tidak valid")
        .max(150)
        .optional(),
    nomorHp: zod_1.z
        .string()
        .regex(/^08\d{8,11}$/, "Nomor HP harus format 08xxxxxxxxxx (10-13 digit)")
        .optional(),
});
