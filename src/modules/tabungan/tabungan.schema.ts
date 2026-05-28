import { z } from 'zod';

export const CreateTabunganSchema = z.object({
  nasabahId: z.string().uuid("nasabahId harus berupa UUID yang valid"),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(['AKTIF', 'TUTUP', 'SUSPEND']),
});

export const EstimasiQuerySchema = z.object({
  kuotaTahunan: z.coerce.number().int().positive("kuotaTahunan harus angka positif").default(221_000),
  nomorPorsi: z.coerce.number().int().positive("nomorPorsi harus angka positif").default(1_000_000),
});

export type CreateTabunganInput = z.infer<typeof CreateTabunganSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
export type EstimasiQueryInput = z.infer<typeof EstimasiQuerySchema>;
