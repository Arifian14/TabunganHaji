import { z } from 'zod';

export const SetorSchema = z.object({
  nominal: z.number().int().positive("Nominal harus lebih dari 0"),
  metode: z.string().max(20).optional(),
});

export const TarikSchema = z.object({
  nominal: z.number().int().positive("Nominal harus lebih dari 0"),
  metode: z.string().max(20).optional(),
});

export type SetorInput = z.infer<typeof SetorSchema>;
export type TarikInput = z.infer<typeof TarikSchema>;
