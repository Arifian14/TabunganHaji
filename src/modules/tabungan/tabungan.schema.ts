import { z } from 'zod';

export const CreateTabunganSchema = z.object({
  nasabahId: z.string().uuid("nasabahId harus berupa UUID yang valid"),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(['AKTIF', 'TUTUP', 'SUSPEND']),
});

export type CreateTabunganInput = z.infer<typeof CreateTabunganSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
