"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimasiQuerySchema = exports.UpdateStatusSchema = exports.CreateTabunganSchema = void 0;
const zod_1 = require("zod");
exports.CreateTabunganSchema = zod_1.z.object({
    nasabahId: zod_1.z.string().uuid("nasabahId harus berupa UUID yang valid"),
});
exports.UpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['AKTIF', 'TUTUP', 'SUSPEND']),
});
exports.EstimasiQuerySchema = zod_1.z.object({
    kuotaTahunan: zod_1.z.coerce.number().int().positive("kuotaTahunan harus angka positif").default(221_000),
    nomorPorsi: zod_1.z.coerce.number().int().positive("nomorPorsi harus angka positif").default(1_000_000),
});
