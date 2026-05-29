"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarikSchema = exports.SetorSchema = void 0;
const zod_1 = require("zod");
exports.SetorSchema = zod_1.z.object({
    nominal: zod_1.z.number().int().min(100_000, "Setoran minimum Rp100.000"),
    metode: zod_1.z.string().max(20).optional(),
});
exports.TarikSchema = zod_1.z.object({
    nominal: zod_1.z.number().int().positive("Nominal harus lebih dari 0"),
    metode: zod_1.z.string().max(20).optional(),
});
